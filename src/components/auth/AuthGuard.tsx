'use client';

import { useRouter, usePathname } from 'next/navigation';
import type { ReactNode} from 'react';
import { useEffect } from 'react';

import { Loading } from '@/components/ui/Loading';
import { useAuth } from '@/features/auth';
import type { UserRole } from '@/types/auth';

interface AuthGuardProps {
  children: ReactNode;
  requiredRole?: UserRole;
  fallback?: ReactNode;
}

export function AuthGuard({ children, requiredRole, fallback }: AuthGuardProps) {
  const { user, status } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === 'loading') return;

    // Si no está autenticado, redirigir a login
    if (status === 'unauthenticated') {
      const loginUrl = new URL('/login', window.location.origin);
      loginUrl.searchParams.set('redirect', pathname);
      router.push(loginUrl.toString());
      return;
    }

    // Si se requiere un rol específico y el usuario no lo tiene
    if (requiredRole && user && user.role !== requiredRole) {
      // Podríamos mostrar un error 403 o redirigir. Aquí redirigimos a home.
      router.push('/');
    }
  }, [status, user, requiredRole, router, pathname]);

  // Mientras carga, mostrar loading
  if (status === 'loading') {
    return <Loading fullScreen message="Verificando acceso..." />;
  }

  // Si no está autenticado, no renderizar nada (el useEffect redirigirá)
  if (status === 'unauthenticated') {
    return null;
  }

  // Si requiere rol y no lo tiene, mostrar fallback o nada
  if (requiredRole && user && user.role !== requiredRole) {
    return fallback || null;
  }

  // Todo OK, renderizar contenido protegido
  return <>{children}</>;
}
