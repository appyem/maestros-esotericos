import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { createConsultation } from '@/features/consultations/services';
import { getFirebaseAdminAuth } from '@/lib/firebaseAdmin';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await getFirebaseAdminAuth().verifyIdToken(token);
    const userId = decodedToken.uid;

    const body = await req.json();
    const result = await createConsultation(userId, body);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    logger.error('Error en API create consultation', { error });
    
    if (error instanceof Error) {
      if (error.message.includes('PAYMENT_NOT_APPROVED')) {
        return NextResponse.json({ error: 'Pago no aprobado' }, { status: 403 });
      }
      if (error.message.includes('MASTER_NOT_ACTIVE')) {
        return NextResponse.json({ error: 'Maestro no disponible' }, { status: 400 });
      }
    }
    
    return NextResponse.json({ error: 'Error interno al crear la consulta' }, { status: 500 });
  }
}
