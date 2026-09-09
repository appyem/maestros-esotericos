/**
 * Abstracción del Proveedor de Pagos (FASE 9)
 * Define el contrato que cualquier proveedor real (Stripe, Wompi, PayU) debe cumplir.
 */

import type { Payment, PaymentStatus } from '../types';

export interface CreatePaymentIntentResult {
  paymentId: string;
  status: PaymentStatus;
  checkoutUrl?: string; // URL a la que el frontend redirige al usuario
  clientSecret?: string; // Para proveedores que usan elementos embebidos
}

export interface PaymentProvider {
  /**
   * Crea una intención de pago en el proveedor externo.
   * El monto y la moneda YA deben haber sido validados por el backend.
   */
  createPaymentIntent(
    payment: Payment,
    returnUrl: string
  ): Promise<CreatePaymentIntentResult>;

  /**
   * Verifica el estado de un pago directamente con el proveedor.
   * Útil para consultas manuales o reconciliación.
   */
  getPaymentStatus(providerPaymentId: string): Promise<PaymentStatus>;

  /**
   * Procesa un reembolso (solo backend).
   */
  refundPayment(providerPaymentId: string, amount?: number): Promise<boolean>;

  /**
   * Verifica la firma de un webhook entrante.
   * Retorna true si la firma es válida y el payload no ha sido manipulado.
   */
  verifyWebhookSignature(payload: unknown, signature: string | undefined): boolean;
}
