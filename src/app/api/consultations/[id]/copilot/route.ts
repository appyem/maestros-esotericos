import { collection, doc, getDoc, getDocs, limit, orderBy, query, where } from 'firebase/firestore';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { generateCopilotSuggestions } from '@/features/consultations/copilot';
import type { Consultation, ConsultationContext, ConsultationMessage } from '@/features/consultations/types';
import { db } from '@/lib/firebase';
import { getFirebaseAdminAuth } from '@/lib/firebaseAdmin';
import { logger } from '@/lib/logger';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const consultationId = resolvedParams.id;

    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await getFirebaseAdminAuth().verifyIdToken(token);
    const masterId = decodedToken.uid;

    // 1. Validar que el usuario es el maestro asignado a esta consulta
    const consultationRef = doc(db, 'consultations', consultationId);
    const consultationDoc = await getDoc(consultationRef);

    if (!consultationDoc.exists()) {
      return NextResponse.json({ error: 'CONSULTATION_NOT_FOUND' }, { status: 404 });
    }

    const consultationData = consultationDoc.data() as Consultation;
    if (consultationData.masterId !== masterId) {
      logger.warn('Intento de acceso no autorizado al copiloto', { masterId, consultationId });
      return NextResponse.json({ error: 'UNAUTHORIZED_ACCESS' }, { status: 403 });
    }

    // 2. Obtener el contexto autorizado
    const contextId = `context_${consultationId}`;
    const contextRef = doc(db, 'consultationContexts', contextId);
    const contextDoc = await getDoc(contextRef);

    if (!contextDoc.exists() || !contextDoc.data().authorizedByClient) {
      return NextResponse.json({ error: 'CONTEXT_NOT_AVAILABLE' }, { status: 404 });
    }

    const context = contextDoc.data() as ConsultationContext;

    // 3. Obtener los últimos 10 mensajes (limitado para control de costos y seguridad)
    const messagesRef = collection(db, 'consultationMessages');
    const messagesQuery = query(
      messagesRef,
      where('consultationId', '==', consultationId),
      orderBy('sequenceNumber', 'desc'),
      limit(10)
    );
    const messagesSnapshot = await getDocs(messagesQuery);
    const recentMessages = messagesSnapshot.docs.map(doc => ({
      messageId: doc.id,
      ...doc.data()
    } as ConsultationMessage)).reverse(); // Ordenar cronológicamente

    // 4. Generar sugerencias
    const suggestions = await generateCopilotSuggestions(
      context,
      recentMessages,
      consultationData.specialty
    );

    return NextResponse.json(suggestions, { status: 200 });
  } catch (error) {
    logger.error('Error en API copilot', { error });
    return NextResponse.json({ error: 'Error interno al generar sugerencias' }, { status: 500 });
  }
}
