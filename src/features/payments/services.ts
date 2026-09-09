import {
  collection,
  doc,
  getDocs,
  query,
  runTransaction,
  where,
} from 'firebase/firestore';
import { z } from 'zod';

import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';

import { getPaymentProvider } from './providers';
import type { ClientPaymentDTO, CreatePaymentIntentRequest, Payment } from './types';

// ==========================================
// ESQUEMAS DE VALIDACIÓN ZOD
// ==========================================
const createPaymentIntentSchema = z.object({
  appointmentId: z.string().min(1, 'El appointmentId es requerido'),
  idempotencyKey: z.string().min(1, 'La clave de idempotencia es requerida'),
});

interface TransactionResult {
  newPayment: Payment;
  appointmentData: Record<string, unknown>;
}

// ==========================================
// SERVICIOS
// ==========================================

/**
 * Crea una intención de pago de forma segura.
 * El monto se calcula en el backend, NUNCA se confía en el frontend.
 * Usa la idempotencyKey como ID del documento para garantizar atomicidad.
 */
export async function createPaymentIntent(
  userId: string,
  request: CreatePaymentIntentRequest,
  returnUrl: string
): Promise<ClientPaymentDTO> {
  const validatedData = createPaymentIntentSchema.parse(request);
  const provider = getPaymentProvider();

  try {
    // Usamos el idempotencyKey como el ID del documento para garantizar atomicidad y evitar race conditions
    const paymentId = validatedData.idempotencyKey;
    const paymentRef = doc(db, 'payments', paymentId);

    const result = await runTransaction(db, async (transaction) => {
      // 1. Verificar idempotencia leyendo directamente por ID (válido en transaction.get)
      const paymentDoc = await transaction.get(paymentRef);

      if (paymentDoc.exists()) {
        const existingPayment = paymentDoc.data() as Payment;
        logger.info('Pago idempotente detectado, retornando existente', { paymentId: existingPayment.paymentId });
        
        return {
          paymentId: existingPayment.paymentId,
          appointmentId: existingPayment.appointmentId,
          amount: existingPayment.amount,
          currency: existingPayment.currency,
          status: existingPayment.status,
          createdAt: existingPayment.createdAt,
          paidAt: existingPayment.paidAt,
          description: existingPayment.description,
          checkoutUrl: existingPayment.metadata?.checkoutUrl as string | undefined,
        } as ClientPaymentDTO;
      }

      // 2. Validar que la cita existe y pertenece al usuario
      const appointmentRef = doc(db, 'appointments', validatedData.appointmentId);
      const appointmentDoc = await transaction.get(appointmentRef);

      if (!appointmentDoc.exists()) {
        throw new Error('APPOINTMENT_NOT_FOUND: La cita solicitada no existe.');
      }

      const appointmentData = appointmentDoc.data();
      if (appointmentData.clientUserId !== userId) {
        throw new Error('UNAUTHORIZED: No tienes permiso para pagar esta cita.');
      }

      if (appointmentData.status !== 'REQUESTED' && appointmentData.status !== 'PENDING_CONFIRMATION') {
        throw new Error('INVALID_APPOINTMENT_STATE: La cita no está en un estado pagable.');
      }

      // 3. CALCULAR EL MONTO EN EL BACKEND (Simulado para F9)
      // NUNCA usar req.body.amount
      const calculatedAmount = 50000; // Ejemplo: 50.000 COP
      const currency = 'COP';
      const description = `Consulta con maestro - ${appointmentData.masterId}`;
      const now = new Date().toISOString();

      // 4. Crear el registro de pago inicial en Firestore
      const newPayment: Payment = {
        paymentId, // Usamos el idempotencyKey como ID del documento
        userId,
        appointmentId: validatedData.appointmentId,
        provider: process.env.NEXT_PUBLIC_PAYMENT_PROVIDER === 'MOCK' ? 'MOCK' : 'STRIPE',
        status: 'CREATED',
        amount: calculatedAmount,
        currency,
        description,
        createdAt: now,
        updatedAt: now,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // Expira en 15 min
        idempotencyKey: validatedData.idempotencyKey,
        metadata: {},
      };

      transaction.set(paymentRef, newPayment);

      return { newPayment, appointmentData } as TransactionResult;
    });

    // Si ya retornamos por idempotencia, el resultado es un ClientPaymentDTO
    if ('checkoutUrl' in result) {
      return result as ClientPaymentDTO;
    }

    // 5. Fuera de la transacción, llamar al proveedor de pagos
    const { newPayment } = result as TransactionResult;
    
    logger.info('Contactando proveedor de pagos', { paymentId: newPayment.paymentId });
    const providerResult = await provider.createPaymentIntent(newPayment, returnUrl);

    // 6. Actualizar el pago con la respuesta del proveedor
    await runTransaction(db, async (transaction) => {
      const currentPaymentDoc = await transaction.get(paymentRef);
      // Solo actualizamos si sigue en estado CREATED (protección extra de concurrencia)
      if (currentPaymentDoc.exists() && currentPaymentDoc.data().status === 'CREATED') {
        transaction.update(paymentRef, {
          status: providerResult.status,
          providerPaymentId: providerResult.paymentId,
          updatedAt: new Date().toISOString(),
          'metadata.checkoutUrl': providerResult.checkoutUrl,
        });
      }
    });

    logger.info('Intención de pago creada exitosamente', { paymentId: newPayment.paymentId });

    // 7. Retornar DTO seguro al cliente
    return {
      paymentId: newPayment.paymentId,
      appointmentId: newPayment.appointmentId,
      amount: newPayment.amount,
      currency: newPayment.currency,
      status: providerResult.status,
      createdAt: newPayment.createdAt,
      description: newPayment.description,
      checkoutUrl: providerResult.checkoutUrl,
    };

  } catch (error) {
    logger.error('Error al crear intención de pago', { error, userId, appointmentId: request.appointmentId });
    throw error;
  }
}

/**
 * Obtiene los pagos del usuario autenticado (DTO seguro).
 */
export async function getUserPayments(userId: string): Promise<ClientPaymentDTO[]> {
  const paymentsRef = collection(db, 'payments');
  const q = query(paymentsRef, where('userId', '==', userId));
  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => {
    const data = doc.data() as Payment;
    return {
      paymentId: data.paymentId,
      appointmentId: data.appointmentId,
      amount: data.amount,
      currency: data.currency,
      status: data.status,
      createdAt: data.createdAt,
      paidAt: data.paidAt,
      description: data.description,
      checkoutUrl: data.metadata?.checkoutUrl as string | undefined,
    };
  });
}
