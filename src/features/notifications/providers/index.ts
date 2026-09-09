import { MockNotificationProvider } from './MockNotificationProvider';
import type { NotificationProvider } from './NotificationProvider';

/**
 * Fábrica de proveedores de notificaciones.
 * En el futuro, aquí se instanciarán los proveedores reales basados en variables de entorno.
 */
export function getNotificationProvider(): NotificationProvider {
  const providerType = process.env.NEXT_PUBLIC_NOTIFICATION_PROVIDER || 'MOCK';

  if (providerType === 'MOCK') {
    return new MockNotificationProvider();
  }

  // Aquí se agregarán los proveedores reales en el futuro:
  // if (providerType === 'TWILIO') return new TwilioProvider();
  // if (providerType === 'SENDGRID') return new SendGridProvider();

  throw new Error(`Proveedor de notificaciones no soportado: ${providerType}`);
}

export type { NotificationProvider, SendNotificationResult } from './NotificationProvider';
