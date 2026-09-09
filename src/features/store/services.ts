import {
  collection,
  doc,
  getDocs,
  query,
  where,
  runTransaction,
  orderBy,
  limit,
} from 'firebase/firestore';

import { db } from '@/lib/firebase';

import type {
  Cart,
  ClientOrderDTO,
  Order,
  Product,
  PublicProductDTO,
} from './types';

// ==========================================
// CATÁLOGO PÚBLICO
// ==========================================

export async function getPublicProducts(limitCount: number = 20): Promise<PublicProductDTO[]> {
  const productsRef = collection(db, 'products');
  const q = query(
    productsRef,
    where('status', '==', 'ACTIVE'),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  const snapshot = await getDocs(q);

  return snapshot.docs.map(docSnap => {
    const data = docSnap.data() as Product;
    return {
      productId: data.productId,
      name: data.name,
      slug: data.slug,
      shortDescription: data.shortDescription,
      price: data.price,
      compareAtPrice: data.compareAtPrice,
      currency: data.currency,
      thumbnail: data.thumbnail,
      status: data.status,
      type: data.type,
    };
  });
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const productsRef = collection(db, 'products');
  const q = query(productsRef, where('slug', '==', slug), where('status', '==', 'ACTIVE'));
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) return null;
  return snapshot.docs[0].data() as Product;
}

// ==========================================
// CARRITO
// ==========================================

export async function getOrCreateCart(userId?: string, anonymousSessionId?: string): Promise<Cart> {
  const cartsRef = collection(db, 'carts');
  let q;
  
  if (userId) {
    q = query(cartsRef, where('userId', '==', userId), orderBy('updatedAt', 'desc'), limit(1));
  } else if (anonymousSessionId) {
    q = query(cartsRef, where('anonymousSessionId', '==', anonymousSessionId), orderBy('updatedAt', 'desc'), limit(1));
  } else {
    throw new Error('Se requiere userId o anonymousSessionId');
  }

  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    return snapshot.docs[0].data() as Cart;
  }

  // Crear nuevo carrito
  const cartId = `cart_${userId || anonymousSessionId}_${Date.now()}`;
  const now = new Date().toISOString();
  const newCart: Cart = {
    cartId,
    userId,
    anonymousSessionId,
    items: [],
    currency: 'COP',
    createdAt: now,
    updatedAt: now,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 días
  };

  await runTransaction(db, async (transaction) => {
    transaction.set(doc(db, 'carts', cartId), newCart);
  });

  return newCart;
}

export async function updateCartItem(
  cartId: string,
  productId: string,
  variantId: string | undefined,
  quantity: number
): Promise<Cart> {
  if (quantity < 0) throw new Error('QUANTITY_INVALID');

  return await runTransaction(db, async (transaction) => {
    const cartRef = doc(db, 'carts', cartId);
    const cartDoc = await transaction.get(cartRef);
    
    if (!cartDoc.exists()) {
      throw new Error('CART_NOT_FOUND');
    }

    const cart = cartDoc.data() as Cart;
    
    // Validar que el producto existe y está activo (Protección básica)
    const productRef = doc(db, 'products', productId);
    const productDoc = await transaction.get(productRef);
    if (!productDoc.exists() || (productDoc.data() as Product).status !== 'ACTIVE') {
      throw new Error('PRODUCT_UNAVAILABLE');
    }

    const items = [...cart.items];
    const itemIndex = items.findIndex(
      item => item.productId === productId && item.variantId === variantId
    );

    if (quantity === 0) {
      if (itemIndex > -1) items.splice(itemIndex, 1);
    } else {
      if (itemIndex > -1) {
        items[itemIndex].quantity = quantity;
      } else {
        items.push({ productId, variantId, quantity });
      }
    }

    const updatedCart: Cart = {
      ...cart,
      items,
      updatedAt: new Date().toISOString(),
    };

    transaction.set(cartRef, updatedCart, { merge: true });
    return updatedCart;
  });
}

// ==========================================
// PEDIDOS (DTO SEGURO)
// ==========================================

export async function getClientOrders(userId: string): Promise<ClientOrderDTO[]> {
  const ordersRef = collection(db, 'orders');
  const q = query(ordersRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);

  return snapshot.docs.map(docSnap => {
    const data = docSnap.data() as Order;
    return {
      orderId: data.orderId,
      status: data.status,
      total: data.total,
      currency: data.currency,
      createdAt: data.createdAt,
      items: data.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        subtotal: item.subtotal,
      })),
    };
  });
}
