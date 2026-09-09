/**
 * Tipos, Taxonomía y Modelos para Analítica y BI (FASE 15)
 * Privacy by Design: Sin PII, sin secretos, sin contenido de conversaciones.
 */

// ==========================================
// TAXONOMÍA DE EVENTOS (Catálogo Centralizado)
// ==========================================
export const ANALYTICS_EVENTS = {
  // Usuarios
  USER_REGISTERED: 'user_registered',
  USER_LOGIN: 'user_login',
  ANONYMOUS_SESSION_CONVERTED: 'anonymous_session_converted',
  
  // IA
  AI_SESSION_STARTED: 'ai_session_started',
  AI_MESSAGE_SENT: 'ai_message_sent',
  AI_RESPONSE_COMPLETED: 'ai_response_completed',
  AI_RESPONSE_FAILED: 'ai_response_failed',
  AI_HANDOFF_REQUESTED: 'ai_handoff_requested',
  
  // Consultas
  CONSULTATION_BOOKED: 'consultation_booked',
  CONSULTATION_PAID: 'consultation_paid',
  CONSULTATION_STARTED: 'consultation_started',
  CONSULTATION_COMPLETED: 'consultation_completed',
  CONSULTATION_CANCELLED: 'consultation_cancelled',
  
  // Maestros
  MASTER_ASSIGNED: 'master_assigned',
  MASTER_UNAVAILABLE: 'master_unavailable',
  
  // Pagos y Tienda (F9 y F12)
  PAYMENT_CREATED: 'payment_created',
  PAYMENT_APPROVED: 'payment_approved',
  PAYMENT_DECLINED: 'payment_declined',
  PAYMENT_REFUNDED: 'payment_refunded',
  PRODUCT_VIEWED: 'product_viewed',
  CART_ABANDONED: 'cart_abandoned',
  ORDER_CREATED: 'order_created',
  ORDER_PAID: 'order_paid',
  ORDER_COMPLETED: 'order_completed',
  
  // Notificaciones (F11)
  NOTIFICATION_SENT: 'notification_sent',
  NOTIFICATION_DELIVERED: 'notification_delivered',
  NOTIFICATION_FAILED: 'notification_failed',
  
  // Seguridad y Sistema
  SECURITY_ACCESS_DENIED: 'security_access_denied',
  SECURITY_RATE_LIMIT: 'security_rate_limit',
  SYSTEM_ERROR: 'system_error',
} as const;

export type AnalyticsEventName = typeof ANALYTICS_EVENTS[keyof typeof ANALYTICS_EVENTS];

// ==========================================
// MODELOS DE DATOS
// ==========================================

// Metadatos permitidos (estrictamente tipados para evitar PII)
export type AllowedAnalyticsMetadata = {
  specialty?: string;
  productCategory?: string;
  orderValue?: number; // Solo montos, nunca datos de tarjeta
  responseTimeMs?: number;
  errorCode?: string;
  provider?: string;
  [key: string]: string | number | boolean | undefined; // Extendible pero validado por Zod
};

export interface AnalyticsEvent {
  eventId: string; // Actúa como idempotencyKey
  eventName: AnalyticsEventName;
  schemaVersion: string;
  actorType: 'USER' | 'MASTER' | 'ADMIN' | 'SYSTEM' | 'ANONYMOUS';
  pseudonymousUserId: string; // Hash o ID interno, NUNCA email/teléfono
  sessionId?: string;
  relatedEntityType?: 'consultation' | 'order' | 'product' | 'payment' | 'user';
  relatedEntityId?: string;
  source: 'frontend' | 'backend' | 'webhook' | 'cron';
  timestamp: string; // ISO 8601 UTC
  metadata?: AllowedAnalyticsMetadata;
  createdAt: string;
}

// ==========================================
// AGREGACIÓN DIARIA (Para evitar queries costosas)
// ==========================================
export interface DailyAnalyticsAggregation {
  date: string; // Formato YYYY-MM-DD (UTC)
  totalEvents: number;
  uniqueUsers: number;
  newUsers: number;
  aiSessions: number;
  consultationsBooked: number;
  consultationsCompleted: number;
  paymentsApproved: number;
  ordersCompleted: number;
  grossRevenue: number; // Suma de orderValue de eventos aprobados
  notificationFailed: number;
  systemErrors: number;
  updatedAt: string;
}
