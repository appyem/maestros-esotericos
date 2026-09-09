/**
 * Abstracción del Proveedor de Notificaciones (FASE 11)
 * Define el contrato que cualquier proveedor real (Twilio, SendGrid, Firebase Cloud Messaging) debe cumplir.
 */

import type { Notification, NotificationStatus } from '../types';

export interface SendNotificationResult {
  success: boolean;
  providerMessageId?: string;
  errorMessage?: string;
}

export interface NotificationProvider {
  /**
   * Envía una notificación a través del canal configurado.
   * El contenido YA debe haber sido minimizado y validado por el backend.
   */
  send(notification: Notification): Promise<SendNotificationResult>;

  /**
   * Verifica el estado de un mensaje enviado (ej: delivered, read).
   */
  getStatus(providerMessageId: string): Promise<NotificationStatus>;

  /**
   * Procesa un webhook entrante del proveedor (ej: cambio de estado de WhatsApp).
   * Retorna true si el webhook fue procesado exitosamente (idempotente).
   */
  handleWebhook(payload: unknown, signature: string | undefined): Promise<boolean>;

  /**
   * Verifica la firma criptográfica de un webhook entrante.
   */
  validateWebhookSignature(payload: unknown, signature: string | undefined): boolean;
}
