import {
  addDoc,
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

import type {
  ClientConsultationDTO,
  Consultation,
  ConsultationContext,
  ConsultationMessage,
  CreateConsultationRequest,
  MasterConsultationDTO,
} from './types';

// ==========================================
// ESQUEMAS DE VALIDACIÓN ZOD
// ==========================================
const createConsultationSchema = z.object({
  appointmentId: z.string().min(1, 'El appointmentId es requerido'),
});

// ==========================================
// SERVICIOS PRINCIPALES
// ==========================================

export async function getConsultationRole(
  userId: string,
  consultationId: string
): Promise<{ role: 'CLIENT' | 'MASTER' | 'NONE'; consultation: Consultation | null }> {
  const consultationRef = doc(db, 'consultations', consultationId);
  const consultationDoc = await getDoc(consultationRef);

  if (!consultationDoc.exists()) {
    return { role: 'NONE', consultation: null };
  }

  const data = consultationDoc.data() as Consultation;

  if (data.clientUserId === userId) {
    return { role: 'CLIENT', consultation: data };
  }
  if (data.masterId === userId) {
    return { role: 'MASTER', consultation: data };
  }

  return { role: 'NONE', consultation: data };
}

export async function sendMessage(
  consultationId: string,
  userId: string,
  userRole: 'CLIENT' | 'MASTER',
  content: string,
  sequenceNumber: number
): Promise<string> {
  const messagesRef = collection(db, 'consultationMessages');
  
  const newMessage: Omit<ConsultationMessage, 'messageId'> = {
    consultationId,
    senderType: userRole,
    senderId: userId,
    content,
    createdAt: new Date().toISOString(),
    sequenceNumber,
    status: 'SENT',
  };

  const docRef = await addDoc(messagesRef, newMessage);
  logger.info('Mensaje enviado de forma segura', { messageId: docRef.id, consultationId, senderType: userRole });
  
  return docRef.id;
}

export async function createConsultation(
  userId: string,
  request: CreateConsultationRequest
): Promise<ClientConsultationDTO> {
  const validatedData = createConsultationSchema.parse(request);

  const paymentsRef = collection(db, 'payments');
  const paymentQuery = query(
    paymentsRef,
    where('appointmentId', '==', validatedData.appointmentId),
    where('userId', '==', userId),
    where('status', '==', 'APPROVED')
  );
  const paymentSnapshot = await getDocs(paymentQuery);
  
  if (paymentSnapshot.empty) {
    throw new Error('PAYMENT_NOT_APPROVED: La cita no tiene un pago aprobado.');
  }

  const consultationDocId = `consultation_${validatedData.appointmentId}`;
  const consultationRef = doc(db, 'consultations', consultationDocId);
  const now = new Date().toISOString();

  try {
    const result = await runTransaction(db, async (transaction) => {
      const consultationDoc = await transaction.get(consultationRef);
      if (consultationDoc.exists()) {
        return { existing: consultationDoc.data() as Consultation };
      }

      const appointmentRef = doc(db, 'appointments', validatedData.appointmentId);
      const appointmentDoc = await transaction.get(appointmentRef);

      if (!appointmentDoc.exists()) {
        throw new Error('APPOINTMENT_NOT_FOUND');
      }

      const appointmentData = appointmentDoc.data();
      if (appointmentData.clientUserId !== userId) {
        throw new Error('UNAUTHORIZED_APPOINTMENT');
      }

      const masterRef = doc(db, 'users', appointmentData.masterId);
      const masterDoc = await transaction.get(masterRef);
      
      if (!masterDoc.exists() || masterDoc.data()?.status !== 'ACTIVE') {
        throw new Error('MASTER_NOT_ACTIVE: El maestro asignado no está disponible.');
      }

      const newConsultation: Consultation = {
        consultationId: consultationDocId,
        appointmentId: validatedData.appointmentId,
        clientUserId: userId,
        masterId: appointmentData.masterId,
        specialty: appointmentData.specialty || 'GENERAL',
        status: 'CREATED',
        createdAt: now,
        updatedAt: now,
        contextVersion: 1,
        ratingStatus: 'PENDING',
      };

      transaction.set(consultationRef, newConsultation);

      return { 
        newConsultation, 
        masterData: masterDoc.data() 
      };
    });

    if ('existing' in result && result.existing) {
      const ex = result.existing;
      return {
        consultationId: ex.consultationId,
        masterName: 'Maestro Asignado',
        specialty: ex.specialty,
        status: ex.status,
        startedAt: ex.startedAt,
      };
    }

    const { newConsultation, masterData } = result as { 
      newConsultation: Consultation; 
      masterData: Record<string, unknown> 
    };

    await generateConsultationContext(
      newConsultation.consultationId,
      validatedData.appointmentId,
      userId,
      newConsultation.specialty
    );

    await runTransaction(db, async (transaction) => {
      transaction.update(consultationRef, {
        status: 'READY',
        updatedAt: new Date().toISOString(),
      });
    });

    logger.info('Consulta creada y contexto generado exitosamente', { 
      consultationId: newConsultation.consultationId 
    });

    return {
      consultationId: newConsultation.consultationId,
      masterName: (masterData?.displayName as string) || 'Maestro',
      specialty: newConsultation.specialty,
      status: 'READY',
    };

  } catch (error) {
    logger.error('Error al crear consulta', { error, userId, appointmentId: validatedData.appointmentId });
    throw error;
  }
}

async function generateConsultationContext(
  consultationId: string,
  _appointmentId: string,
  _userId: string,
  specialty: string
): Promise<void> {
  const contextId = `context_${consultationId}`;
  const contextRef = doc(db, 'consultationContexts', contextId);
  const now = new Date().toISOString();

  const initialContext: ConsultationContext = {
    contextId,
    consultationId,
    version: 1,
    generatedAt: now,
    updatedAt: now,
    motivoConsulta: `Consulta de ${specialty} programada y pagada.`,
    preguntasPrincipales: [],
    contextoRelevante: ['El cliente ha completado el proceso de reserva y pago.'],
    resumenIA: 'Aún no hay conversación con IA registrada para esta consulta específica.',
    puntosPendientes: [],
    sources: ['APPOINTMENT_DATA', 'PAYMENT_CONFIRMATION'],
    authorizedByClient: true,
  };

  await runTransaction(db, async (transaction) => {
    transaction.set(contextRef, initialContext);
  });

  logger.info('Contexto de consulta inicial generado', { consultationId, contextId });
}

export async function getClientConsultation(
  userId: string,
  consultationId: string
): Promise<ClientConsultationDTO> {
  const consultationRef = doc(db, 'consultations', consultationId);
  const consultationDoc = await getDoc(consultationRef);

  if (!consultationDoc.exists()) {
    throw new Error('CONSULTATION_NOT_FOUND');
  }

  const data = consultationDoc.data() as Consultation;

  if (data.clientUserId !== userId) {
    throw new Error('UNAUTHORIZED_ACCESS');
  }

  return {
    consultationId: data.consultationId,
    masterName: 'Maestro Asignado',
    specialty: data.specialty,
    status: data.status,
    startedAt: data.startedAt,
  };
}

export async function getMasterConsultation(
  masterId: string,
  consultationId: string
): Promise<MasterConsultationDTO> {
  const consultationRef = doc(db, 'consultations', consultationId);
  const consultationDoc = await getDoc(consultationRef);

  if (!consultationDoc.exists()) {
    throw new Error('CONSULTATION_NOT_FOUND');
  }

  const data = consultationDoc.data() as Consultation;

  if (data.masterId !== masterId) {
    throw new Error('UNAUTHORIZED_ACCESS');
  }

  const contextId = `context_${consultationId}`;
  const contextRef = doc(db, 'consultationContexts', contextId);
  const contextDoc = await getDoc(contextRef);

  let context: ConsultationContext | null = null;
  if (contextDoc.exists() && contextDoc.data().authorizedByClient) {
    context = contextDoc.data() as ConsultationContext;
  }

  return {
    consultationId: data.consultationId,
    clientDisplayName: 'Cliente',
    specialty: data.specialty,
    status: data.status,
    context,
  };
}
