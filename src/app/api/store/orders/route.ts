import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { createOrderAndReserveInventory, getClientOrders } from '@/features/store';
import { getFirebaseAdminAuth } from '@/lib/firebaseAdmin';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    let userId: string | undefined;
    let anonymousSessionId: string | undefined;

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.split('Bearer ')[1];
      const decodedToken = await getFirebaseAdminAuth().verifyIdToken(token);
      userId = decodedToken.uid;
    } else {
      // Soporte para usuarios anónimos (ej: carrito de invitado)
      anonymousSessionId = req.cookies.get('anonymous_session_id')?.value;
      if (!anonymousSessionId) {
        return NextResponse.json({ error: 'UNAUTHORIZED: Se requiere autenticación o sesión anónima' }, { status: 401 });
      }
    }

    const body = await req.json();
    const returnUrl = req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const result = await createOrderAndReserveInventory(userId, anonymousSessionId, body, returnUrl);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    logger.error('Error en API create order', { error });
    
    if (error instanceof Error) {
      if (error.message.includes('CART_NOT_FOUND') || error.message.includes('CART_EMPTY')) {
        return NextResponse.json({ error: 'Carrito inválido o vacío' }, { status: 400 });
      }
      if (error.message.includes('UNAUTHORIZED')) {
        return NextResponse.json({ error: 'No autorizado para acceder a este carrito' }, { status: 403 });
      }
      if (error.message.includes('INSUFFICIENT_STOCK')) {
        return NextResponse.json({ error: error.message }, { status: 409 }); // 409 Conflict
      }
      if (error.message.includes('PRODUCT_INACTIVE') || error.message.includes('PRODUCT_NOT_FOUND')) {
        return NextResponse.json({ error: 'Uno o más productos ya no están disponibles' }, { status: 400 });
      }
    }
    
    return NextResponse.json({ error: 'Error interno al procesar el pedido' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await getFirebaseAdminAuth().verifyIdToken(token);
    const userId = decodedToken.uid;

    const orders = await getClientOrders(userId);

    return NextResponse.json(orders, { status: 200 });
  } catch (error) {
    logger.error('Error en API get orders', { error });
    return NextResponse.json({ error: 'Error interno al obtener pedidos' }, { status: 500 });
  }
}
