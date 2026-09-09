/**
 * Tipos y DTOs para el Sistema de Pagos Seguro (FASE 9)
 */

export type PaymentStatus = 
  | 'CREATED' 
  | 'PENDING' 
  | 'PROCESSING' 
  | 'APPROVED' 
  | 'DECLINED' 
  | 'CANCELLED' 
  | 'EXPIRED' 
  | 'REFUNDED' 
  | 'FAILED';

export type PaymentProviderType = 'MOCK' | 'STRIPE' | 'WOMPI' | 'PAYU';

export interface Payment {
  paymentId: string;
  userId: string;
  appointmentId: string;
  provider: PaymentProviderType;
  providerPaymentId?: string;
  status: PaymentStatus;
  amount: number;
  currency: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  paidAt?: string;
  failureReason?: string;
  metadata?: Record<string, unknown>;
  idempotencyKey: string;
  webhookEventId?: string;
}

export interface ClientPaymentDTO {
  paymentId: string;
  appointmentId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  createdAt: string;
  paidAt?: string;
  description: string;
  checkoutUrl?: string;
}

// Corregido: Usar 'type' en lugar de 'interface' vacía
export type AdminPaymentDTO = Payment;

export interface CreatePaymentIntentRequest {
  appointmentId: string;
  idempotencyKey: string;
}
