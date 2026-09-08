import type { Permission, UserRole } from '@/types/auth';
import { ROLE_PERMISSIONS } from '@/types/auth';

import { useAuth } from '../context/AuthContext';

export function usePermission() {
  const { user, status } = useAuth();

  const hasPermission = (requiredPermission: Permission): boolean => {
    if (status !== 'authenticated' || !user) {
      return false;
    }
    
    if (user.status === 'SUSPENDED' || user.status === 'DISABLED') {
      return false;
    }

    const permissions = ROLE_PERMISSIONS[user.role] || [];
    return permissions.includes(requiredPermission);
  };

  const hasRole = (requiredRole: UserRole): boolean => {
    if (status !== 'authenticated' || !user) {
      return false;
    }
    
    const roleHierarchy: Record<UserRole, number> = {
      PUBLIC: 0,
      CLIENTE: 1,
      MAESTRO: 2,
      ADMINISTRADOR: 3,
      SUPER_ADMIN: 4,
    };

    return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
  };

  return { hasPermission, hasRole, user, status };
}
