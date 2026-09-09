import {
  collection,
  doc,
  getDocs,
  query,
  where,
  runTransaction,
} from 'firebase/firestore';

import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';

import type { DailyAnalyticsAggregation } from './types';

/**
 * Agrega las métricas diarias a partir de los eventos crudos.
 * Esta función está diseñada para ser ejecutada por un Job programado (Cron) 
 * o manualmente por un administrador, NUNCA desde el cliente.
 * 
 * @param targetDate Fecha en formato 'YYYY-MM-DD' (UTC)
 */
export async function aggregateDailyAnalytics(targetDate: string): Promise<void> {
  try {
    // 1. Definir el rango de tiempo para el día objetivo (UTC)
    const startOfDay = new Date(`${targetDate}T00:00:00.000Z`);
    const endOfDay = new Date(`${targetDate}T23:59:59.999Z`);
    
    // Usar directamente strings ISO ya que el campo timestamp se guarda como string
    const startTimestamp = startOfDay.toISOString();
    const endTimestamp = endOfDay.toISOString();

    const eventsRef = collection(db, 'analyticsEvents');
    const q = query(
      eventsRef,
      where('timestamp', '>=', startTimestamp),
      where('timestamp', '<=', endTimestamp)
    );

    const snapshot = await getDocs(q);
    
    // 2. Inicializar contadores
    const aggregation: DailyAnalyticsAggregation = {
      date: targetDate,
      totalEvents: 0,
      uniqueUsers: 0,
      newUsers: 0,
      aiSessions: 0,
      consultationsBooked: 0,
      consultationsCompleted: 0,
      paymentsApproved: 0,
      ordersCompleted: 0,
      grossRevenue: 0,
      notificationFailed: 0,
      systemErrors: 0,
      updatedAt: new Date().toISOString(),
    };

    const uniqueUserIds = new Set<string>();

    // 3. Procesar eventos
    snapshot.docs.forEach((docSnap) => {
      const event = docSnap.data();
      aggregation.totalEvents += 1;

      if (event.pseudonymousUserId) {
        uniqueUserIds.add(event.pseudonymousUserId);
      }

      // Conteos específicos por tipo de evento
      switch (event.eventName) {
        case 'user_registered':
          aggregation.newUsers += 1;
          break;
        case 'ai_session_started':
          aggregation.aiSessions += 1;
          break;
        case 'consultation_booked':
          aggregation.consultationsBooked += 1;
          break;
        case 'consultation_completed':
          aggregation.consultationsCompleted += 1;
          break;
        case 'payment_approved':
          aggregation.paymentsApproved += 1;
          break;
        case 'order_completed':
          aggregation.ordersCompleted += 1;
          if (event.metadata?.orderValue && typeof event.metadata.orderValue === 'number') {
            aggregation.grossRevenue += event.metadata.orderValue;
          }
          break;
        case 'notification_failed':
          aggregation.notificationFailed += 1;
          break;
        case 'system_error':
          aggregation.systemErrors += 1;
          break;
      }
    });

    aggregation.uniqueUsers = uniqueUserIds.size;

    // 4. Guardar la agregación en Firestore (Upsert)
    const aggRef = doc(db, 'dailyAnalyticsAggregations', targetDate);
    
    await runTransaction(db, async (transaction) => {
      transaction.set(aggRef, aggregation, { merge: true });
    });

    logger.info('Agregación diaria de analítica completada', { 
      targetDate, 
      totalEvents: aggregation.totalEvents,
      uniqueUsers: aggregation.uniqueUsers 
    });

  } catch (error) {
    logger.error('Error al ejecutar la agregación diaria de analítica', { error, targetDate });
    throw error;
  }
}
