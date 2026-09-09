import { doc, runTransaction } from 'firebase/firestore';
import { z } from 'zod';

import { getPaymentProvider } from '@/features/payments/providers';
import type { Payment } from '@/features/payments/types';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';

import type {
  Order,
  OrderItemSnapshot,
  Product,
} from './types';

// ==========================================
// ESQUEMAS DE VALIDACIÓN ZOD
// ==========================================
const createOrderSchema = z.object({
  cartId: z.string().min(1),
  customerEmail: z.string().email(),
  shippingAddress: z.object({
    name: z.string().min(1),
    phone: z.string().min(1),
    addressLine: z.string().min(1),
    addressLine2: z.string().optional(),
    city: z.string().min(1),
    state: z.string().min(1),
    postalCode: z.string().min(1),
    country: z.string().min(1),
    additionalInstructions: z.string().optional(),
  }),
  idempotencyKey: z.string().min(1),
});

// ==========================================
// SERVICIOS PRINCIPALES
// ==========================================

/**
 * Crea un pedido, valida precios/stock en backend, reserva inventario y crea intención de pago.
 * Fuente de verdad absoluta: Firestore. El frontend solo envía IDs y cantidades.
 */
export async function createOrderAndReserveInventory(
  userId: string | undefined,
  anonymousSessionId: string | undefined,
  requestData: z.infer<typeof createOrderSchema>,
  returnUrl: string
) {
  const validatedData = createOrderSchema.parse(requestData);
  const provider = getPaymentProvider();

  try {
    const cartRef = doc(db, 'carts', validatedData.cartId);
    
    const result = await runTransaction(db, async (transaction) => {
      // 1. Obtener y validar carrito
      const cartDoc = await transaction.get(cartRef);
      if (!cartDoc.exists()) {
        throw new Error('CART_NOT_FOUND');
      }
      const cart = cartDoc.data();

      // Protección IDOR: verificar propiedad del carrito
      if (userId && cart.userId !== userId) throw new Error('UNAUTHORIZED_CART_ACCESS');
      if (!userId && cart.anonymousSessionId !== anonymousSessionId) throw new Error('UNAUTHORIZED_CART_ACCESS');
      if (!cart.items || cart.items.length === 0) throw new Error('CART_EMPTY');

      // 2. Reconstruir carrito y validar contra Base de Datos (Source of Truth)
      const orderItems: OrderItemSnapshot[] = [];
      let subtotal = 0;
      const inventoryUpdates: { productId: string; quantity: number; currentStock: number }[] = [];

      for (const item of cart.items) {
        const productRef = doc(db, 'products', item.productId);
        const productDoc = await transaction.get(productRef);
        
        if (!productDoc.exists()) throw new Error(`PRODUCT_NOT_FOUND: ${item.productId}`);
        
        const product = productDoc.data() as Product;
        if (product.status !== 'ACTIVE') throw new Error(`PRODUCT_INACTIVE: ${item.productId}`);

        let unitPrice = product.price;
        let currentStock = product.stockQuantity;
        let sku = product.sku;
        let name = product.name;

        // Si el producto tiene variantes y se solicitó una, usar sus datos
        if (item.variantId && product.variants) {
          const variant = product.variants.find(v => v.variantId === item.variantId);
          if (!variant) throw new Error(`VARIANT_NOT_FOUND: ${item.variantId}`);
          unitPrice = variant.price;
          currentStock = variant.stockQuantity;
          sku = variant.sku;
          name = `${product.name} - ${variant.name}`;
        }

        // Validar stock suficiente
        if (product.stockManaged && currentStock < item.quantity) {
          throw new Error(`INSUFFICIENT_STOCK: ${name}`);
        }

        const itemSubtotal = unitPrice * item.quantity;
        subtotal += itemSubtotal;

        orderItems.push({
          productId: item.productId,
          variantId: item.variantId,
          name,
          sku,
          unitPrice,
          quantity: item.quantity,
          discount: 0, // Preparado para cupones
          subtotal: itemSubtotal,
        });

        if (product.stockManaged) {
          inventoryUpdates.push({ productId: item.productId, quantity: item.quantity, currentStock });
        }
      }

      // 3. Calcular totales en backend (NUNCA confiar en el frontend)
      const shippingCost = 0; // Mock: F12 Shipping Provider
      const tax = 0;          // Mock: F12 Tax Provider
      const discount = 0;     // Mock: F12 Coupon Provider
      const total = subtotal + shippingCost + tax - discount;
      const currency = cart.currency || 'COP';

      // 4. Crear el documento de Pedido (Snapshot inmutable)
      const orderId = `order_${validatedData.idempotencyKey}`;
      const orderRef = doc(db, 'orders', orderId);
      const now = new Date().toISOString();

      const newOrder: Order = {
        orderId,
        userId,
        anonymousSessionId,
        customerEmail: validatedData.customerEmail,
        items: orderItems,
        subtotal,
        discount,
        shippingCost,
        tax,
        total,
        currency,
        status: 'PENDING_PAYMENT',
        shippingAddress: validatedData.shippingAddress,
        fulfillmentStatus: 'UNFULFILLED',
        createdAt: now,
        updatedAt: now,
        idempotencyKey: validatedData.idempotencyKey,
      };

      transaction.set(orderRef, newOrder);

      // 5. Descontar inventario (Reserva atómica)
      for (const update of inventoryUpdates) {
        const prodRef = doc(db, 'products', update.productId);
        transaction.update(prodRef, {
          stockQuantity: update.currentStock - update.quantity,
          updatedAt: now,
        });
      }

      // 6. Vaciar el carrito tras crear el pedido
      transaction.update(cartRef, { items: [], updatedAt: now });

      // 7. Crear registro de Pago (Integración con F9)
      const paymentId = `pay_${validatedData.idempotencyKey}`;
      const paymentRef = doc(db, 'payments', paymentId);
      
      const newPayment: Payment = {
        paymentId,
        userId: userId || 'anonymous',
        appointmentId: orderId, // Vinculamos el pago al orderId
        provider: process.env.NEXT_PUBLIC_PAYMENT_PROVIDER === 'MOCK' ? 'MOCK' : 'STRIPE',
        status: 'CREATED',
        amount: total,
        currency,
        description: `Pago de pedido ${orderId}`,
        createdAt: now,
        updatedAt: now,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        idempotencyKey: validatedData.idempotencyKey,
        metadata: { type: 'STORE_ORDER' },
      };

      transaction.set(paymentRef, newPayment);

      return { newOrder, newPayment };
    });

    const { newOrder, newPayment } = result;
    const orderId = newOrder.orderId; // FIX: Extraer orderId del resultado de la transacción

    // 8. Fuera de la transacción, contactar al proveedor de pagos (F9)
    logger.info('Contactando proveedor de pagos para el pedido', { orderId, paymentId: newPayment.paymentId });
    const providerResult = await provider.createPaymentIntent(newPayment, returnUrl);

    // 9. Actualizar el pago con la respuesta del proveedor
    const paymentRef = doc(db, 'payments', newPayment.paymentId);
    await runTransaction(db, async (transaction) => {
      transaction.update(paymentRef, {
        status: providerResult.status,
        providerPaymentId: providerResult.paymentId,
        updatedAt: new Date().toISOString(),
        'metadata.checkoutUrl': providerResult.checkoutUrl,
      });
    });

    logger.info('Pedido creado, inventario reservado y pago iniciado', { orderId });

    return {
      orderId: newOrder.orderId,
      total: newOrder.total,
      currency: newOrder.currency,
      checkoutUrl: providerResult.checkoutUrl,
      status: newOrder.status,
    };

  } catch (error) {
    logger.error('Error crítico al crear pedido', { error, userId });
    throw error;
  }
}
