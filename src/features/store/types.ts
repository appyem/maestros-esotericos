/**
 * Tipos y DTOs para el Sistema de Tienda, Carrito y Pedidos (FASE 12)
 */

export type ProductType = 'PHYSICAL' | 'DIGITAL' | 'SERVICE' | 'KIT';
export type ProductStatus = 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK' | 'ARCHIVED';
export type OrderStatus = 
  | 'PENDING_PAYMENT' | 'PAID' | 'PROCESSING' | 'READY_TO_SHIP' 
  | 'SHIPPED' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED' | 'FAILED';
export type CouponType = 'PERCENTAGE' | 'FIXED';

// ==========================================
// CATÁLOGO
// ==========================================

export interface Category {
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  imageUrl?: string;
  status: 'ACTIVE' | 'INACTIVE';
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariant {
  variantId: string;
  name: string;
  sku: string;
  price: number;
  stockQuantity: number;
  attributes: Record<string, string>; // ej: { color: 'rojo', tamaño: 'M' }
}

export interface Product {
  productId: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  categoryId: string;
  type: ProductType;
  status: ProductStatus;
  price: number; // Precio base (si no tiene variantes)
  compareAtPrice?: number;
  currency: string;
  images: string[];
  thumbnail?: string;
  sku: string;
  stockManaged: boolean;
  stockQuantity: number;
  lowStockThreshold: number;
  tags: string[];
  featured: boolean;
  variants?: ProductVariant[];
  bundleItems?: { productId: string; quantity: number }[]; // Para KITS
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// CARRITO
// ==========================================

export interface CartItem {
  productId: string;
  variantId?: string;
  quantity: number;
  // NO almacenamos precio aquí como fuente de verdad, se recalcula en backend
}

export interface Cart {
  cartId: string;
  userId?: string;
  anonymousSessionId?: string;
  items: CartItem[];
  currency: string;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
}

// ==========================================
// PEDIDOS (ORDERS) - SNAPSHOT CRÍTICO
// ==========================================

export interface OrderItemSnapshot {
  productId: string;
  variantId?: string;
  name: string; // Snapshot del nombre
  sku: string;  // Snapshot del SKU
  unitPrice: number; // Snapshot del precio unitario pagado
  quantity: number;
  discount: number;
  subtotal: number;
}

export interface ShippingAddress {
  name: string;
  phone: string;
  addressLine: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  additionalInstructions?: string;
}

export interface Order {
  orderId: string;
  userId?: string;
  anonymousSessionId?: string;
  customerEmail: string;
  items: OrderItemSnapshot[];
  subtotal: number;
  discount: number;
  shippingCost: number;
  tax: number;
  total: number;
  currency: string;
  status: OrderStatus;
  paymentId?: string; // Vinculación con F9
  shippingAddress: ShippingAddress;
  fulfillmentStatus: 'UNFULFILLED' | 'PARTIAL' | 'FULFILLED';
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
  cancelledAt?: string;
  completedAt?: string;
  idempotencyKey: string;
}

// ==========================================
// CUPONES
// ==========================================

export interface Coupon {
  couponId: string;
  code: string;
  type: CouponType;
  value: number;
  minimumAmount: number;
  maximumDiscount?: number;
  startAt: string;
  expiresAt: string;
  usageLimit?: number;
  usageCount: number;
  perUserLimit?: number;
  status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
}

// ==========================================
// DTOs SEGUROS (Frontend)
// ==========================================

export interface PublicProductDTO {
  productId: string;
  name: string;
  slug: string;
  shortDescription: string;
  price: number;
  compareAtPrice?: number;
  currency: string;
  thumbnail?: string;
  status: ProductStatus;
  type: ProductType;
}

export interface ClientOrderDTO {
  orderId: string;
  status: OrderStatus;
  total: number;
  currency: string;
  createdAt: string;
  items: { name: string; quantity: number; subtotal: number }[];
}
