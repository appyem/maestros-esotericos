import { MockPaymentProvider } from './MockPaymentProvider';
import type { PaymentProvider } from './PaymentProvider';

/**
 * Fábrica de proveedores de pago.
 * En el futuro, aquí se instanciará el proveedor real basado en variables de entorno.
 */
export function getPaymentProvider(): PaymentProvider {
  const providerType = process.env.NEXT_PUBLIC_PAYMENT_PROVIDER || 'MOCK';

  if (providerType === 'MOCK') {
    return new MockPaymentProvider();
  }

  // Aquí se agregarán los proveedores reales en el futuro:
  // if (providerType === 'STRIPE') return new StripePaymentProvider();
  // if (providerType === 'WOMPI') return new WompiPaymentProvider();

  throw new Error(`Proveedor de pagos no soportado: ${providerType}`);
}

export type { PaymentProvider, CreatePaymentIntentResult } from './PaymentProvider';
