/**
 * Proveedor de Pagos Mock (FASE 9)
 * SOLO para uso en entorno de desarrollo/pruebas.
 * Bloquea explícitamente su ejecución en producción.
 */

import { logger } from '@/lib/logger';

import type { Payment, PaymentStatus } from '../types';

import type { CreatePaymentIntentResult, PaymentProvider } from './PaymentProvider';

// Simulación de comportamiento basado en un "código de prueba" en la descripción
// Ej: si description incluye "DECLINE", el pago será rechazado.
function simulateProviderBehavior(description: string): PaymentStatus {
  const desc = description.toUpperCase();
  if (desc.includes('DECLINE')) return 'DECLINED';
  if (desc.includes('PENDING')) return 'PENDING';
  if (desc.includes('FAIL')) return 'FAILED';
  if (desc.includes('EXPIRE')) return 'EXPIRED';
  return 'APPROVED'; // Comportamiento por defecto exitoso
}

export class MockPaymentProvider implements PaymentProvider {
  constructor() {
    // 🔒 PROTECCIÓN DE ENTORNO: Bloqueo explícito en producción
    if (process.env.NODE_ENV === 'production') {
      throw new Error('SECURITY_VIOLATION: MockPaymentProvider no puede ser instanciado en producción.');
    }
  }

  async createPaymentIntent(
    payment: Payment,
    returnUrl: string
  ): Promise<CreatePaymentIntentResult> {
    logger.info('[MOCK PAYMENT] Creando intención de pago', { 
      paymentId: payment.paymentId,
      amount: payment.amount,
      currency: payment.currency 
    });
    
    // Simulamos un pequeño retraso de red
    await new Promise((resolve) => setTimeout(resolve, 800));

    const simulatedStatus = simulateProviderBehavior(payment.description);

    // En un proveedor real, aquí se generaría una URL de checkout o un clientSecret
    const checkoutUrl = simulatedStatus === 'APPROVED' 
      ? `${returnUrl}?mock_payment_status=APPROVED&payment_id=${payment.paymentId}`
      : `${returnUrl}?mock_payment_status=${simulatedStatus}&payment_id=${payment.paymentId}`;

    return {
      paymentId: payment.paymentId,
      status: simulatedStatus === 'APPROVED' ? 'PENDING' : simulatedStatus, // El webhook lo cambiará a APPROVED
      checkoutUrl,
    };
  }

  async getPaymentStatus(providerPaymentId: string): Promise<PaymentStatus> {
    logger.info('[MOCK PAYMENT] Consultando estado', { providerPaymentId });
    await new Promise((resolve) => setTimeout(resolve, 300));
    return 'APPROVED'; // Mock siempre aprueba en consulta directa para simplificar pruebas
  }

  async refundPayment(providerPaymentId: string, amount?: number): Promise<boolean> {
    logger.info('[MOCK PAYMENT] Reembolsando', { providerPaymentId, amount });
    await new Promise((resolve) => setTimeout(resolve, 500));
    return true;
  }

  verifyWebhookSignature(_payload: unknown, signature: string | undefined): boolean {
    // En el mock, aceptamos cualquier firma que sea "mock-secret-signature"
    // El parámetro _payload se ignora intencionalmente en esta simulación
    return signature === 'mock-secret-signature';
  }
}
