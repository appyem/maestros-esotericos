import { doc, runTransaction } from 'firebase/firestore';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { getPaymentProvider } from '@/features/payments/providers';
import type { Payment } from '@/features/payments/types';
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
      logger.error('Webhook: Payload JSON inválido');
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const provider = getPaymentProvider();

    // 1. Verificación de firma (Protección contra webhooks falsos)
    if (!provider.verifyWebhookSignature(payload, signature)) {
      logger.error('Webhook: Firma inválida', { signature });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Extracción y validación de datos del evento
    const eventId = payload.eventId || payload.id || 'mock-event';
    const paymentId = payload.paymentId || payload.object?.id;
    const status = payload.status || payload.object?.status;
    const amount = payload.amount || payload.object?.amount;

    if (!paymentId || !status) {
      logger.error('Webhook: Datos incompletos', { payload });
      return NextResponse.json({ error: 'Bad Request' }, { status: 400 });
    }

    // 3. Procesamiento idempotente y actualización segura con Transacción
    const paymentRef = doc(db, 'payments', paymentId);

    await runTransaction(db, async (transaction) => {
      const paymentDoc = await transaction.get(paymentRef);
      if (!paymentDoc.exists()) {
        throw new Error('Webhook: Pago no encontrado en Firestore');
      }

      const currentData = paymentDoc.data() as Payment;

      // Prevenir Replay Attacks: si ya procesamos este eventId, ignorar
      if (currentData.webhookEventId === eventId) {
        logger.info('Webhook: Evento ya procesado (idempotente)', { eventId, paymentId });
        return;
      }

      // Validación Antifraude: el monto del webhook debe coincidir con el registrado
      if (amount && currentData.amount !== amount) {
        logger.error('Webhook: Monto inconsistente (Posible fraude)', { 
          expected: currentData.amount, 
          received: amount 
        });
        throw new Error('SECURITY_VIOLATION: Monto inconsistente en webhook');
      }

      // Máquina de estados: solo permitir transiciones válidas
      let newStatus = currentData.status;
      if (status === 'APPROVED' || status === 'succeeded') {
        if (['CREATED', 'PENDING', 'PROCESSING'].includes(currentData.status)) {
          newStatus = 'APPROVED';
        }
      } else if (['DECLINED', 'FAILED', 'expired', 'EXPIRED'].includes(status)) {
        newStatus = status === 'expired' ? 'EXPIRED' : (status === 'DECLINED' ? 'DECLINED' : 'FAILED');
      }

      // Actualizar solo si el estado cambia
      if (newStatus !== currentData.status) {
        const updateData: Partial<Payment> = {
          status: newStatus,
          updatedAt: new Date().toISOString(),
          webhookEventId: eventId,
        };

        if (newStatus === 'APPROVED') {
          updateData.paidAt = new Date().toISOString();
          // NOTA F10: Aquí se dispararía la lógica para confirmar la cita (Appointment -> CONFIRMED)
        }

        transaction.update(paymentRef, updateData);
        logger.info('Webhook: Pago actualizado exitosamente', { paymentId, newStatus });
      }
    });

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    logger.error('Error crítico procesando webhook', { error });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
