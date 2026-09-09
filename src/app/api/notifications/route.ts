import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { getUserNotifications } from '@/features/notifications/services';
import { getFirebaseAdminAuth } from '@/lib/firebaseAdmin';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await getFirebaseAdminAuth().verifyIdToken(token);
    const userId = decodedToken.uid;

    const searchParams = req.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const notifications = await getUserNotifications(userId, limit);

    return NextResponse.json(notifications, { status: 200 });
  } catch (error) {
    logger.error('Error en API get notifications', { error });
    return NextResponse.json({ error: 'Error interno al obtener notificaciones' }, { status: 500 });
  }
}
