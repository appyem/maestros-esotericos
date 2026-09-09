/**
 * Proveedor de Notificaciones Mock (FASE 11)
 * SOLO para uso en entorno de desarrollo/pruebas.
 * Bloquea explícitamente su ejecución en producción.
 */

import { logger } from '@/lib/logger';

import type { Notification, NotificationStatus } from '../types';

import type { NotificationProvider, SendNotificationResult } from './NotificationProvider';

export class MockNotificationProvider implements NotificationProvider {
  constructor() {
    // 🔒 PROTECCIÓN DE ENTORNO: Bloqueo explícito en producción
    if (process.env.NODE_ENV === 'production') {
      throw new Error('SECURITY_VIOLATION: MockNotificationProvider no puede ser instanciado en producción.');
    }
  }

  async send(notification: Notification): Promise<SendNotificationResult> {
    logger.info('[MOCK NOTIFICATION] Enviando notificación', { 
      notificationId: notification.notificationId,
      channel: notification.channel,
      type: notification.type,
      userId: notification.userId
    });
    
    // Simulamos un pequeño retraso de red
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Simulación de fallo aleatorio muy bajo para probar retries (5% de probabilidad)
    const shouldFail = Math.random() < 0.05;
    
    if (shouldFail) {
      return {
        success: false,
        errorMessage: 'MOCK_RANDOM_FAILURE: Simulando fallo de red temporal'
      };
    }

    return {
      success: true,
      providerMessageId: `mock_msg_${Date.now()}_${notification.notificationId}`
    };
  }

  async getStatus(providerMessageId: string): Promise<NotificationStatus> {
    logger.info('[MOCK NOTIFICATION] Consultando estado', { providerMessageId });
    await new Promise((resolve) => setTimeout(resolve, 200));
    return 'DELIVERED'; // Mock siempre entrega exitosamente en consulta directa
  }

  async handleWebhook(payload: unknown, signature: string | undefined): Promise<boolean> {
    const isValid = this.validateWebhookSignature(payload, signature);
    if (!isValid) {
      logger.error('[MOCK NOTIFICATION] Webhook inválido', { signature });
      return false;
    }
    
    logger.info('[MOCK NOTIFICATION] Webhook procesado exitosamente', { payload });
    return true;
  }

  validateWebhookSignature(_payload: unknown, signature: string | undefined): boolean {
    // En el mock, aceptamos cualquier firma que sea "mock-webhook-secret"
    return signature === 'mock-webhook-secret';
  }
}
