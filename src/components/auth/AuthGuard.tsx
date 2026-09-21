'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useMemo, type ReactNode } from 'react';

import { Loading } from '@/components/ui/Loading';
import { useAuth } from '@/features/auth';
import type { UserRole } from '@/types/auth';

interface AuthGuardProps {
  children: ReactNode;
  requiredRole?: UserRole; // Mantenida para compatibilidad con código existente
  allowedRoles?: UserRole[]; // Nueva propiedad para múltiples roles
  fallback?: ReactNode;
}

export function AuthGuard({ children, requiredRole, allowedRoles, fallback }: AuthGuardProps) {
  const { user, status } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // useMemo evita que se cree un nuevo array en cada render, satisfaciendo a ESLint
  const rolesToCheck = useMemo(() => {
    return allowedRoles || (requiredRole ? [requiredRole] : undefined);
  }, [allowedRoles, requiredRole]);

  useEffect(() => {
    if (status === 'loading') return;

    // Si no está autenticado, redirigir a login
    if (status === 'unauthenticated') {
      const loginUrl = new URL('/login', window.location.origin);
      loginUrl.searchParams.set('redirect', pathname);
      router.replace(loginUrl.toString());
      return;
    }

    // Si se requiere un rol específico y el usuario no lo tiene
    if (rolesToCheck && user && !rolesToCheck.includes(user.role)) {
      router.replace('/'); // Redirigir al home si no tiene permiso
    }
  }, [status, user, rolesToCheck, router, pathname]);

  // Mientras carga, mostrar loading
  if (status === 'loading') {
    return <Loading fullScreen message="Verificando acceso..." />;
  }

  // Si no está autenticado, no renderizar nada (el useEffect redirigirá)
  if (status === 'unauthenticated') {
    return null;
  }

  // Si requiere rol y no lo tiene, mostrar fallback o mensaje por defecto
  if (rolesToCheck && user && !rolesToCheck.includes(user.role)) {
    return fallback || (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Acceso Denegado</h1>
          <p className="text-muted-foreground">No tienes permisos para ver esta página.</p>
        </div>
      </div>
    );
  }

  // Todo OK, renderizar contenido protegido
  return <>{children}</>;
}