import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { updateNotificationPreferences } from '@/features/notifications/services';
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
    await updateNotificationPreferences(userId, body);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    logger.error('Error en API update preferences', { error });
    return NextResponse.json({ error: 'Error interno al actualizar preferencias' }, { status: 500 });
  }
}
