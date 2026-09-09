import { cert, getApp, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { createPaymentIntent } from '@/features/payments/services';
import { logger } from '@/lib/logger';

function getFirebaseAdminApp() {
  if (getApps().length === 0) {
    if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_PRIVATE_KEY) {
      throw new Error('Faltan variables de entorno de Firebase Admin para el backend de pagos.');
    }
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
  }
  return getApp();
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await getAuth(getFirebaseAdminApp()).verifyIdToken(token);
    const userId = decodedToken.uid;

    const body = await req.json();
    const returnUrl = req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const result = await createPaymentIntent(userId, body, returnUrl);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    logger.error('Error en API create-intent', { error });
    
    if (error instanceof Error) {
      if (error.message.includes('APPOINTMENT_NOT_FOUND')) {
        return NextResponse.json({ error: 'Cita no encontrada' }, { status: 404 });
      }
      if (error.message.includes('UNAUTHORIZED')) {
        return NextResponse.json({ error: 'No autorizado para esta cita' }, { status: 403 });
      }
    }
    
    return NextResponse.json({ error: 'Error interno al procesar el pago' }, { status: 500 });
  }
}
