import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { getClientConsultation } from '@/features/consultations/services';
import { getFirebaseAdminAuth } from '@/lib/firebaseAdmin';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await getFirebaseAdminAuth().verifyIdToken(token);
    const userId = decodedToken.uid;

    const result = await getClientConsultation(userId, resolvedParams.id);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    logger.error('Error en API get consultation', { error });
    
    if (error instanceof Error && error.message.includes('NOT_FOUND')) {
      return NextResponse.json({ error: 'Consulta no encontrada' }, { status: 404 });
    }
    if (error instanceof Error && error.message.includes('UNAUTHORIZED')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }
    
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
