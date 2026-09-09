import {
  collection,
  doc,
  getDocs,
  query,
  runTransaction,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { z } from 'zod';

import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';

import { getNotificationProvider } from './providers';
import type {
  ClientNotificationDTO,
  ConsentPurpose,
  Notification,
  NotificationChannel,
  NotificationPreferences,
} from './types';

// ==========================================
// ESQUEMAS DE VALIDACIÓN ZOD
// ==========================================
const createNotificationSchema = z.object({
  userId: z.string().min(1),
  channel: z.enum(['IN_APP', 'EMAIL', 'WHATSAPP', 'PUSH']),
  type: z.enum([
    'USER_REGISTERED', 'APPOINTMENT_REQUESTED', 'APPOINTMENT_CONFIRMED', 
    'APPOINTMENT_RESCHEDULED', 'APPOINTMENT_CANCELLED', 'APPOINTMENT_REMINDER',
    'PAYMENT_CREATED', 'PAYMENT_APPROVED', 'PAYMENT_FAILED', 'PAYMENT_EXPIRED', 'PAYMENT_REFUNDED',
    'CONSULTATION_READY', 'CONSULTATION_STARTED', 'CONSULTATION_COMPLETED',
    'FOLLOW_UP_AVAILABLE', 'AI_CONVERSATION_INACTIVE', 'MASTER_ASSIGNED', 'MASTER_REASSIGNED'
  ]),
  title: z.string().min(1).max(100),
  message: z.string().min(1).max(500),
  templateId: z.string().optional(),
  relatedEntityType: z.string().optional(),
  relatedEntityId: z.string().optional(),
  idempotencyKey: z.string().min(1),
});

const updatePreferencesSchema = z.object({
  allowInApp: z.boolean(),
  allowEmail: z.boolean(),
  allowWhatsApp: z.boolean(),
  allowPush: z.boolean(),
  allowReminders: z.boolean(),
  allowFollowUp: z.boolean(),
  allowMarketing: z.boolean(),
});

// ==========================================
// SERVICIOS PRINCIPALES
// ==========================================

/**
 * Crea y envía una notificación de forma segura.
 * Valida: Preferencias, Idempotencia (nativa por ID) y Rate Limiting.
 */
export async function createAndSendNotification(
  requestData: z.infer<typeof createNotificationSchema>
): Promise<string> {
  const validatedData = createNotificationSchema.parse(requestData);
  const provider = getNotificationProvider();

  try {
    // 1. Rate Limiting (fuera de la transacción, es una protección suave contra spam)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const notificationsRef = collection(db, 'notifications');
    const recentQuery = query(
      notificationsRef,
      where('userId', '==', validatedData.userId),
      where('createdAt', '>=', oneHourAgo)
    );
    const recentSnapshot = await getDocs(recentQuery);
    
    if (recentSnapshot.size >= 5) {
      throw new Error('RATE_LIMIT_EXCEEDED');
    }

    // 2. Transacción para idempotencia y creación
    // Usamos la idempotencyKey como el ID del documento para garantizar atomicidad
    const notificationId = validatedData.idempotencyKey;
    const notifRef = doc(db, 'notifications', notificationId);

    const result = await runTransaction(db, async (transaction) => {
      // Verificar idempotencia leyendo directamente por ID (válido en transaction.get)
      const notifDoc = await transaction.get(notifRef);
      if (notifDoc.exists()) {
        const existing = notifDoc.data() as Notification;
        logger.info('Notificación idempotente detectada, omitiendo envío', { notificationId: existing.notificationId });
        return { notificationId: existing.notificationId, alreadySent: true };
      }

      // Verificar preferencias del usuario
      const prefsRef = doc(db, 'notificationPreferences', validatedData.userId);
      const prefsDoc = await transaction.get(prefsRef);
      const prefs = prefsDoc.exists() 
        ? (prefsDoc.data() as NotificationPreferences) 
        : getDefaultPreferences();

      // Validar canal
      if (validatedData.channel === 'EMAIL' && !prefs.allowEmail) throw new Error('USER_OPTED_OUT_EMAIL');
      if (validatedData.channel === 'WHATSAPP' && !prefs.allowWhatsApp) throw new Error('USER_OPTED_OUT_WHATSAPP');
      if (validatedData.channel === 'PUSH' && !prefs.allowPush) throw new Error('USER_OPTED_OUT_PUSH');

      // Validar tipo específico (ej: seguimiento)
      if ((validatedData.type === 'FOLLOW_UP_AVAILABLE' || validatedData.type === 'AI_CONVERSATION_INACTIVE') && !prefs.allowFollowUp) {
         throw new Error('USER_OPTED_OUT_FOLLOW_UP');
      }

      // Crear el registro de notificación
      const now = new Date().toISOString();
      const newNotification: Notification = {
        notificationId,
        userId: validatedData.userId,
        channel: validatedData.channel,
        type: validatedData.type,
        status: 'PENDING',
        title: validatedData.title,
        message: validatedData.message,
        templateId: validatedData.templateId,
        relatedEntityType: validatedData.relatedEntityType,
        relatedEntityId: validatedData.relatedEntityId,
        createdAt: now,
        updatedAt: now,
        idempotencyKey: validatedData.idempotencyKey,
      };

      transaction.set(notifRef, newNotification);

      return { notificationId, alreadySent: false, newNotification };
    });

    if (result.alreadySent) {
      return result.notificationId;
    }

    // 3. Fuera de la transacción, enviar la notificación
    const { newNotification } = result as { newNotification: Notification };
    
    // Actualizar estado a PROCESSING
    await runTransaction(db, async (transaction) => {
       transaction.update(notifRef, { status: 'PROCESSING', updatedAt: new Date().toISOString() });
    });

    const sendResult = await provider.send(newNotification);

    // 4. Actualizar estado final basado en el resultado del proveedor
    await runTransaction(db, async (transaction) => {
      if (sendResult.success) {
        transaction.update(notifRef, {
          status: 'SENT',
          sentAt: new Date().toISOString(),
          provider: process.env.NEXT_PUBLIC_NOTIFICATION_PROVIDER || 'MOCK',
          providerMessageId: sendResult.providerMessageId,
          updatedAt: new Date().toISOString(),
        });
      } else {
        transaction.update(notifRef, {
          status: 'FAILED',
          failedAt: new Date().toISOString(),
          failureReason: sendResult.errorMessage,
          updatedAt: new Date().toISOString(),
        });
      }
    });

    logger.info('Notificación procesada', { 
      notificationId: newNotification.notificationId, 
      success: sendResult.success 
    });

    return newNotification.notificationId;

  } catch (error) {
    logger.error('Error al crear/enviar notificación', { error, userId: validatedData.userId });
    throw error;
  }
}

function getDefaultPreferences(): NotificationPreferences {
  const now = new Date().toISOString();
  return {
    userId: '',
    allowInApp: true,
    allowEmail: true,
    allowWhatsApp: true,
    allowPush: true,
    allowReminders: true,
    allowFollowUp: true,
    allowMarketing: false,
    updatedAt: now,
  };
}

/**
 * Obtiene las notificaciones del usuario autenticado (DTO seguro).
 */
export async function getUserNotifications(userId: string, limitCount: number = 20): Promise<ClientNotificationDTO[]> {
  const notificationsRef = collection(db, 'notifications');
  const q = query(
    notificationsRef,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  const snapshot = await getDocs(q);

  return snapshot.docs.map(docSnap => {
    const data = docSnap.data() as Notification;
    return {
      notificationId: data.notificationId,
      type: data.type,
      title: data.title,
      message: data.message,
      status: data.status,
      createdAt: data.createdAt,
      readAt: data.readAt,
      relatedEntityId: data.relatedEntityId,
    };
  });
}

/**
 * Marca una notificación como leída (Protección IDOR).
 */
export async function markNotificationAsRead(userId: string, notificationId: string): Promise<void> {
  const notifRef = doc(db, 'notifications', notificationId);
  
  await runTransaction(db, async (transaction) => {
    const docSnap = await transaction.get(notifRef);
    if (!docSnap.exists()) {
      throw new Error('NOTIFICATION_NOT_FOUND');
    }
    
    const data = docSnap.data() as Notification;
    if (data.userId !== userId) {
      throw new Error('UNAUTHORIZED_ACCESS');
    }

    if (data.status !== 'READ') {
      transaction.update(notifRef, {
        status: 'READ',
        readAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  });
}

/**
 * Actualiza las preferencias de notificación del usuario.
 */
export async function updateNotificationPreferences(
  userId: string,
  preferences: z.infer<typeof updatePreferencesSchema>
): Promise<void> {
  const validatedPrefs = updatePreferencesSchema.parse(preferences);
  const prefsRef = doc(db, 'notificationPreferences', userId);

  await runTransaction(db, async (transaction) => {
    transaction.set(prefsRef, {
      userId,
      ...validatedPrefs,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  });

  logger.info('Preferencias de notificación actualizadas', { userId });
}

/**
 * Registra el consentimiento de comunicación.
 */
export async function recordCommunicationConsent(
  userId: string,
  channel: NotificationChannel,
  purpose: ConsentPurpose,
  accepted: boolean,
  source: string
): Promise<void> {
  const consentId = `consent_${userId}_${channel}_${purpose}`;
  const consentRef = doc(db, 'communicationConsents', consentId);
  const now = new Date().toISOString();

  await runTransaction(db, async (transaction) => {
    transaction.set(consentRef, {
      consentId,
      userId,
      channel,
      purpose,
      accepted,
      version: '1.0',
      acceptedAt: accepted ? now : undefined,
      revokedAt: !accepted ? now : undefined,
      source,
    }, { merge: true });
  });

  logger.info('Consentimiento de comunicación registrado', { userId, channel, purpose, accepted });
}
