import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  runTransaction,
  where,
} from 'firebase/firestore';
import { z } from 'zod';

import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';

import type { Appointment, ClientAppointmentDTO, PublicAvailabilitySlotDTO } from './types';

// ==========================================
// ESQUEMAS DE VALIDACIÓN ZOD
// ==========================================
const createAppointmentSchema = z.object({
  masterId: z.string().min(1),
  startAt: z.string().datetime(), // ISO String UTC
  endAt: z.string().datetime(),   // ISO String UTC
  timezone: z.string().min(1),
});

// ==========================================
// SERVICIOS
// ==========================================

/**
 * Obtiene los slots de disponibilidad pública para un maestro en una fecha específica.
 */
export async function getPublicAvailability(masterId: string, date: string): Promise<PublicAvailabilitySlotDTO[]> {
  const masterRef = doc(db, 'masters', masterId);
  const masterDoc = await getDoc(masterRef);
  
  if (!masterDoc.exists() || masterDoc.data().status !== 'ACTIVE') {
    return [];
  }

  logger.info('Disponibilidad pública consultada', { masterId, date });
  
  return [
    { startAt: `${date}T09:00:00.000Z`, endAt: `${date}T10:00:00.000Z`, timezone: 'America/Bogota' },
    { startAt: `${date}T10:00:00.000Z`, endAt: `${date}T11:00:00.000Z`, timezone: 'America/Bogota' },
    { startAt: `${date}T14:00:00.000Z`, endAt: `${date}T15:00:00.000Z`, timezone: 'America/Bogota' },
  ];
}

/**
 * Crea una cita de forma segura, previniendo doble reserva.
 * Nota: Firestore v9 no permite Queries dentro de runTransaction. 
 * Se usa getDocs para validar conflictos y runTransaction para la escritura atómica.
 */
export async function createAppointment(clientUserId: string, data: z.infer<typeof createAppointmentSchema>) {
  const validatedData = createAppointmentSchema.parse(data);
  const appointmentId = crypto.randomUUID();

  // 1. Verificar conflictos de horario antes de la transacción
  const appointmentsRef = collection(db, 'appointments');
  const q = query(
    appointmentsRef,
    where('masterId', '==', validatedData.masterId),
    where('status', 'in', ['REQUESTED', 'PENDING_CONFIRMATION', 'CONFIRMED'])
  );
  
  const snapshot = await getDocs(q);
  
  const requestedStart = new Date(validatedData.startAt).getTime();
  const requestedEnd = new Date(validatedData.endAt).getTime();

  for (const docSnapshot of snapshot.docs) {
    const existing = docSnapshot.data() as Appointment;
    const existingStart = new Date(existing.startAt).getTime();
    const existingEnd = new Date(existing.endAt).getTime();

    // Lógica de superposición: (StartA < EndB) y (EndA > StartB)
    if (requestedStart < existingEnd && requestedEnd > existingStart) {
      throw new Error('SLOT_TAKEN: Este horario acaba de ser ocupado. Por favor selecciona otro horario.');
    }
  }

  try {
    // 2. Transacción para asegurar consistencia en la creación
    await runTransaction(db, async (transaction) => {
      const masterRef = doc(db, 'masters', validatedData.masterId);
      const masterDoc = await transaction.get(masterRef);
      
      if (!masterDoc.exists() || masterDoc.data().status !== 'ACTIVE') {
        throw new Error('MASTER_UNAVAILABLE: El maestro no está disponible para reservas.');
      }

      const newAppointment: Appointment = {
        appointmentId,
        clientUserId,
        masterId: validatedData.masterId,
        startAt: validatedData.startAt,
        endAt: validatedData.endAt,
        timezone: validatedData.timezone,
        status: 'REQUESTED',
        source: 'WEB',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: clientUserId,
        version: 1,
      };

      const newAppointmentRef = doc(db, 'appointments', appointmentId);
      transaction.set(newAppointmentRef, newAppointment);
    });

    logger.info('Cita creada exitosamente (Transacción)', { appointmentId, clientUserId });
    return { appointmentId, status: 'REQUESTED' };

  } catch (error) {
    if (error instanceof Error && error.message.includes('SLOT_TAKEN')) {
      throw error;
    }
    logger.error('Error al crear cita', { error });
    throw new Error('APPOINTMENT_CREATION_FAILED: No se pudo procesar la reserva. Inténtalo de nuevo.');
  }
}

/**
 * Obtiene las citas del cliente (DTO seguro).
 */
export async function getClientAppointments(clientUserId: string): Promise<ClientAppointmentDTO[]> {
  const appointmentsRef = collection(db, 'appointments');
  const q = query(appointmentsRef, where('clientUserId', '==', clientUserId));
  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => {
    const data = doc.data() as Appointment;
    return {
      appointmentId: data.appointmentId,
      masterName: 'Maestro (Nombre Denormalizado)',
      startAt: data.startAt,
      endAt: data.endAt,
      timezone: data.timezone,
      status: data.status,
      cancellationReason: data.cancellationReason,
    };
  });
}

/**
 * Cancela una cita (Soft Delete controlado).
 */
export async function cancelAppointment(appointmentId: string, userId: string, reason: string) {
  const appointmentRef = doc(db, 'appointments', appointmentId);
  
  await runTransaction(db, async (transaction) => {
    const appointmentDoc = await transaction.get(appointmentRef);
    if (!appointmentDoc.exists()) {
      throw new Error('APPOINTMENT_NOT_FOUND');
    }

    const data = appointmentDoc.data() as Appointment;

    if (data.clientUserId !== userId) {
      throw new Error('UNAUTHORIZED: No tienes permiso para cancelar esta cita.');
    }

    if (data.status === 'CANCELLED' || data.status === 'COMPLETED') {
      throw new Error('INVALID_STATE: La cita ya está cancelada o completada.');
    }

    transaction.update(appointmentRef, {
      status: 'CANCELLED',
      cancelledAt: new Date().toISOString(),
      cancelledBy: userId,
      cancellationReason: reason,
      updatedAt: new Date().toISOString(),
    });
  });

  logger.info('Cita cancelada', { appointmentId, userId, reason });
  return { success: true };
}
