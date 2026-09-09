import { doc, runTransaction } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';

import { createAuditLog } from './auditService';
import type { UserRole } from './types';

// ==========================================
// SERVICIOS DE MAESTROS (ONBOARDING)
// ==========================================

/**
 * Aprueba o rechaza la solicitud de un maestro.
 * Solo usuarios con rol ADMINISTRATOR o SUPER_ADMIN y permiso 'masters.review' pueden ejecutar esto.
 */
export async function reviewMasterApplication(
  actorUserId: string,
  actorRole: UserRole,
  masterId: string,
  action: 'APPROVE' | 'REJECT',
  reason?: string
): Promise<void> {
  const requestId = uuidv4();
  const masterRef = doc(db, 'users', masterId);

  try {
    await runTransaction(db, async (transaction) => {
      const masterDoc = await transaction.get(masterRef);
      if (!masterDoc.exists()) {
        throw new Error('MASTER_NOT_FOUND');
      }

      const masterData = masterDoc.data();
      if (masterData.role !== 'MASTER') {
        throw new Error('USER_IS_NOT_A_MASTER');
      }

      const newStatus = action === 'APPROVE' ? 'ACTIVE' : 'REJECTED';
      const auditAction = action === 'APPROVE' ? 'ADMIN_APPROVE_MASTER' : 'ADMIN_REJECT_MASTER';

      transaction.update(masterRef, {
        status: newStatus,
        reviewedAt: new Date().toISOString(),
        reviewedBy: actorUserId,
        reviewReason: reason || '',
        updatedAt: new Date().toISOString(),
      });

      // Registrar en auditoría
      await createAuditLog(
        actorUserId,
        actorRole,
        auditAction,
        'users',
        masterId,
        'SUCCESS',
        requestId,
        reason,
        { previousStatus: masterData.status, newStatus }
      );
    });

    logger.info('Revisión de maestro completada', { masterId, action, actorUserId });
  } catch (error) {
    await createAuditLog(
      actorUserId,
      actorRole,
      'ADMIN_REVIEW_MASTER',
      'users',
      masterId,
      'FAILURE',
      requestId,
      error instanceof Error ? error.message : 'Unknown error'
    );
    logger.error('Error al revisar maestro', { error, masterId });
    throw error;
  }
}

// ==========================================
// SERVICIOS DE INVENTARIO
// ==========================================

/**
 * Ajusta el stock de un producto o variante.
 * Requiere permiso 'inventory.adjust'. Previene stock negativo.
 */
export async function adjustInventory(
  actorUserId: string,
  actorRole: UserRole,
  productId: string,
  variantId: string | undefined,
  adjustmentQuantity: number, // Positivo para entrada, negativo para salida/pérdida
  reason: string
): Promise<void> {
  if (adjustmentQuantity === 0) return;

  const requestId = uuidv4();
  const productRef = doc(db, 'products', productId);

  try {
    await runTransaction(db, async (transaction) => {
      const productDoc = await transaction.get(productRef);
      if (!productDoc.exists()) {
        throw new Error('PRODUCT_NOT_FOUND');
      }

      const productData = productDoc.data();
      let currentStock = productData.stockQuantity || 0;
      let newStock = currentStock + adjustmentQuantity;

      // Si hay variantes, ajustar el stock de la variante específica
      if (variantId && productData.variants) {
        const variantIndex = productData.variants.findIndex(
          (v: { variantId: string }) => v.variantId === variantId
        );
        if (variantIndex === -1) {
          throw new Error('VARIANT_NOT_FOUND');
        }
        currentStock = productData.variants[variantIndex].stockQuantity || 0;
        newStock = currentStock + adjustmentQuantity;

        if (newStock < 0) {
          throw new Error('INSUFFICIENT_STOCK_FOR_ADJUSTMENT');
        }

        const updatedVariants = [...productData.variants];
        updatedVariants[variantIndex] = {
          ...updatedVariants[variantIndex],
          stockQuantity: newStock,
        };

        transaction.update(productRef, {
          variants: updatedVariants,
          updatedAt: new Date().toISOString(),
        });
      } else {
        // Producto sin variantes
        if (newStock < 0) {
          throw new Error('INSUFFICIENT_STOCK_FOR_ADJUSTMENT');
        }

        transaction.update(productRef, {
          stockQuantity: newStock,
          updatedAt: new Date().toISOString(),
        });
      }

      // Registrar en auditoría
      await createAuditLog(
        actorUserId,
        actorRole,
        'ADMIN_ADJUST_INVENTORY',
        'products',
        productId,
        'SUCCESS',
        requestId,
        reason,
        { variantId, previousStock: currentStock, newStock, adjustmentQuantity }
      );
    });

    logger.info('Ajuste de inventario completado', { productId, variantId, adjustmentQuantity, actorUserId });
  } catch (error) {
    await createAuditLog(
      actorUserId,
      actorRole,
      'ADMIN_ADJUST_INVENTORY',
      'products',
      productId,
      'FAILURE',
      requestId,
      error instanceof Error ? error.message : 'Unknown error',
      { variantId, adjustmentQuantity, reason }
    );
    logger.error('Error al ajustar inventario', { error, productId });
    throw error;
  }
}

// ==========================================
// SERVICIOS DE PEDIDOS (OPERATIVOS)
// ==========================================

/**
 * Actualiza el estado de un pedido de forma controlada.
 * Valida que la transición de estado sea permitida.
 */
export async function updateOrderStatus(
  actorUserId: string,
  actorRole: UserRole,
  orderId: string,
  newStatus: string,
  reason?: string
): Promise<void> {
  const requestId = uuidv4();
  const orderRef = doc(db, 'orders', orderId);

  const validTransitions: Record<string, string[]> = {
    'PENDING_PAYMENT': ['PAID', 'CANCELLED', 'FAILED'],
    'PAID': ['PROCESSING', 'CANCELLED', 'REFUNDED'],
    'PROCESSING': ['READY_TO_SHIP', 'CANCELLED'],
    'READY_TO_SHIP': ['SHIPPED', 'CANCELLED'],
    'SHIPPED': ['DELIVERED'],
    'DELIVERED': ['COMPLETED'],
    'COMPLETED': ['REFUNDED'], // Solo reembolsos posteriores
    'CANCELLED': [],
    'REFUNDED': [],
    'FAILED': ['PENDING_PAYMENT'], // Permitir reintento
  };

  try {
    await runTransaction(db, async (transaction) => {
      const orderDoc = await transaction.get(orderRef);
      if (!orderDoc.exists()) {
        throw new Error('ORDER_NOT_FOUND');
      }

      const orderData = orderDoc.data();
      const currentStatus = orderData.status;

      if (!validTransitions[currentStatus]?.includes(newStatus)) {
        throw new Error(`INVALID_STATUS_TRANSITION: De ${currentStatus} a ${newStatus} no está permitido.`);
      }

      const updateData: Record<string, string> = {
        status: newStatus,
        updatedAt: new Date().toISOString(),
      };

      if (newStatus === 'COMPLETED') updateData.completedAt = new Date().toISOString();
      if (newStatus === 'CANCELLED') updateData.cancelledAt = new Date().toISOString();

      transaction.update(orderRef, updateData);

      // Registrar en auditoría
      await createAuditLog(
        actorUserId,
        actorRole,
        'ADMIN_UPDATE_ORDER_STATUS',
        'orders',
        orderId,
        'SUCCESS',
        requestId,
        reason,
        { previousStatus: currentStatus, newStatus }
      );
    });

    logger.info('Estado de pedido actualizado', { orderId, newStatus, actorUserId });
  } catch (error) {
    await createAuditLog(
      actorUserId,
      actorRole,
      'ADMIN_UPDATE_ORDER_STATUS',
      'orders',
      orderId,
      'FAILURE',
      requestId,
      error instanceof Error ? error.message : 'Unknown error',
      { newStatus, reason }
    );
    logger.error('Error al actualizar estado de pedido', { error, orderId });
    throw error;
  }
}
