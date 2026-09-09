import { doc, runTransaction } from 'firebase/firestore';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { getNotificationProvider } from '@/features/notifications/providers';
import type { Notification } from '@/features/notifications/types';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get('x-webhook-signature') || req.headers.get('signature') || undefined;
    const rawBody = await req.text();
    
    let payload;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      logger.error('Webhook Notificaciones: Payload JSON inválido');
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const provider = getNotificationProvider();

    // 1. Verificación de firma (Protección contra webhooks falsos)
    if (!provider.validateWebhookSignature(payload, signature)) {
      logger.error('Webhook Notificaciones: Firma inválida', { signature });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Extracción de datos (Estructura adaptable según el proveedor real futuro)
    const providerMessageId = payload.messageId || payload.object?.id;
    const status = payload.status || payload.object?.status; // ej: 'delivered', 'read', 'failed'
    const notificationId = payload.metadata?.notificationId;

    if (!providerMessageId || !notificationId) {
      logger.error('Webhook Notificaciones: Datos incompletos', { payload });
      return NextResponse.json({ error: 'Bad Request' }, { status: 400 });
    }

    // Mapeo de estados del proveedor a estados internos
    const statusMap: Record<string, string> = {
      'delivered': 'DELIVERED',
      'read': 'READ',
      'failed': 'FAILED',
      'sent': 'SENT'
    };

    const newStatus = statusMap[status.toLowerCase()];
    if (!newStatus) {
      logger.info('Webhook Notificaciones: Estado no reconocido o no requiere acción', { status });
      return NextResponse.json({ received: true }, { status: 200 });
    }

    // 3. Procesamiento idempotente y actualización segura con Transacción
    const notifRef = doc(db, 'notifications', notificationId);

    await runTransaction(db, async (transaction) => {
      const notifDoc = await transaction.get(notifRef);
      if (!notifDoc.exists()) {
        throw new Error('Webhook: Notificación no encontrada en Firestore');
      }

      const currentData = notifDoc.data() as Notification;

      // Prevenir Replay Attacks: si el estado ya es igual o superior, ignorar
      if (currentData.status === 'READ' || (currentData.status === 'DELIVERED' && newStatus === 'DELIVERED')) {
        logger.info('Webhook Notificaciones: Evento ya procesado o estado superior', { notificationId });
        return;
      }

      const updateData: Partial<Notification> = {
        updatedAt: new Date().toISOString(),
      };

      if (newStatus === 'DELIVERED') updateData.deliveredAt = new Date().toISOString();
      if (newStatus === 'READ') updateData.readAt = new Date().toISOString();
      if (newStatus === 'FAILED') {
        updateData.failedAt = new Date().toISOString();
        updateData.failureReason = payload.error || 'Unknown provider error';
      }

      updateData.status = newStatus as Notification['status'];

      transaction.update(notifRef, updateData);
      logger.info('Webhook Notificaciones: Estado actualizado exitosamente', { notificationId, newStatus });
    });

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    logger.error('Error crítico procesando webhook de notificaciones', { error });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
