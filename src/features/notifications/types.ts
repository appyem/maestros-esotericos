/**
 * Tipos y DTOs para el Sistema de Notificaciones y Seguimiento (FASE 11)
 */

export type NotificationChannel = 'IN_APP' | 'EMAIL' | 'WHATSAPP' | 'PUSH';

export type NotificationStatus = 
  | 'PENDING' | 'QUEUED' | 'PROCESSING' | 'SENT' 
  | 'DELIVERED' | 'READ' | 'FAILED' | 'CANCELLED' | 'EXPIRED';

export type NotificationType = 
  | 'USER_REGISTERED'
  | 'APPOINTMENT_REQUESTED' | 'APPOINTMENT_CONFIRMED' | 'APPOINTMENT_RESCHEDULED' | 'APPOINTMENT_CANCELLED' | 'APPOINTMENT_REMINDER'
  | 'PAYMENT_CREATED' | 'PAYMENT_APPROVED' | 'PAYMENT_FAILED' | 'PAYMENT_EXPIRED' | 'PAYMENT_REFUNDED'
  | 'CONSULTATION_READY' | 'CONSULTATION_STARTED' | 'CONSULTATION_COMPLETED'
  | 'FOLLOW_UP_AVAILABLE' | 'AI_CONVERSATION_INACTIVE'
  | 'MASTER_ASSIGNED' | 'MASTER_REASSIGNED';

export type ConsentPurpose = 'SERVICE' | 'REMINDER' | 'FOLLOW_UP' | 'MARKETING';

// ==========================================
// MODELOS DE FIRESTORE (Internos)
// ==========================================

export interface Notification {
  notificationId: string;
  userId: string;
  channel: NotificationChannel;
  type: NotificationType;
  status: NotificationStatus;
  title: string;
  message: string; // Mensaje minimizado, sin datos sensibles
  templateId?: string;
  relatedEntityType?: string; // ej: 'appointment', 'consultation', 'payment'
  relatedEntityId?: string;
  scheduledAt?: string;
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  failedAt?: string;
  failureReason?: string;
  provider?: string; // ej: 'MOCK', 'TWILIO', 'SENDGRID'
  providerMessageId?: string;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  idempotencyKey: string; // Crucial para prevenir duplicados
}

export interface NotificationPreferences {
  userId: string;
  allowInApp: boolean;
  allowEmail: boolean;
  allowWhatsApp: boolean;
  allowPush: boolean;
  allowReminders: boolean;
  allowFollowUp: boolean;
  allowMarketing: boolean;
  updatedAt: string;
}

export interface CommunicationConsent {
  consentId: string;
  userId: string;
  channel: NotificationChannel;
  purpose: ConsentPurpose;
  accepted: boolean;
  version: string;
  acceptedAt: string;
  revokedAt?: string;
  source: string; // ej: 'ONBOARDING', 'SETTINGS_PAGE', 'WHATSAPP_STOP'
}

export interface WhatsAppMessage {
  messageId: string;
  userId: string;
  direction: 'OUTBOUND' | 'INBOUND';
  templateId?: string;
  contentType: 'TEXT' | 'TEMPLATE' | 'MEDIA';
  status: NotificationStatus;
  provider: string;
  providerMessageId?: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  createdAt: string;
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  failedAt?: string;
  updatedAt: string;
}

// ==========================================
// DTOs SEGUROS (Para el Frontend)
// ==========================================

export interface ClientNotificationDTO {
  notificationId: string;
  type: NotificationType;
  title: string;
  message: string;
  status: NotificationStatus;
  createdAt: string;
  readAt?: string;
  relatedEntityId?: string;
}
