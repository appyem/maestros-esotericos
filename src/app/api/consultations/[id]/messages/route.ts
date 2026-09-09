import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { getConsultationRole, sendMessage } from '@/features/consultations/services';
import { getFirebaseAdminAuth } from '@/lib/firebaseAdmin';
import { logger } from '@/lib/logger';

const sendMessageSchema = z.object({
  content: z.string().min(1).max(2000, 'El mensaje es demasiado largo'),
  sequenceNumber: z.number().int().positive(),
});

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
    const userId = decodedToken.uid;

    const body = await req.json();
    const validatedData = sendMessageSchema.parse(body);

    const { role, consultation } = await getConsultationRole(userId, consultationId);

    if (role === 'NONE' || !consultation) {
      return NextResponse.json({ error: 'UNAUTHORIZED_ACCESS' }, { status: 403 });
    }

    if (consultation.status === 'COMPLETED' || consultation.status === 'CANCELLED') {
      return NextResponse.json({ error: 'CONSULTATION_CLOSED' }, { status: 400 });
    }

    const messageId = await sendMessage(
      consultationId,
      userId,
      role,
      validatedData.content,
      validatedData.sequenceNumber
    );

    return NextResponse.json({ messageId }, { status: 201 });
  } catch (error) {
    logger.error('Error enviando mensaje', { error });
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Datos inválidos', details: error.message }, { status: 400 });
    }
    if (error instanceof Error && error.message === 'CONSULTATION_CLOSED') {
      return NextResponse.json({ error: 'La consulta ha finalizado' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Error interno al enviar el mensaje' }, { status: 500 });
  }
}
