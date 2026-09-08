import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rutas que requieren autenticación (verificación real se hace en el cliente con AuthGuard)
const PROTECTED_ROUTES = ['/client', '/master', '/admin', '/superadmin'];

// Rutas de autenticación
const AUTH_ROUTES = ['/login', '/register'];

// Ruta de inicio
const HOME_ROUTE = '/';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Verificar rutas protegidas (solo por estructura de URL)
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route),
  );

  // Verificar rutas de autenticación
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  // Nota: La verificación real de autenticación se hace en el cliente con AuthGuard.
  // El middleware aquí solo previene acceso directo a rutas sensibles por estructura.
  // Si hay una cookie de sesión básica, asumimos posible autenticación.
  const sessionCookie =
    request.cookies.get('__session') || request.cookies.get('firebase-auth');

  // Si es ruta protegida y NO hay indicio de sesión, redirigir a login
  if (isProtectedRoute && !sessionCookie) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Si está autenticado (hay cookie) y va a login/register, redirigir a home
  if (isAuthRoute && sessionCookie) {
    return NextResponse.redirect(new URL(HOME_ROUTE, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
