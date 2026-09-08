/**
 * Tipos centralizados para el sistema de autenticación y autorización
 */

// Roles del sistema (definidos en FASE 0)
export type UserRole =
  | 'PUBLIC'
  | 'CLIENTE'
  | 'MAESTRO'
  | 'ADMINISTRADOR'
  | 'SUPER_ADMIN';

// Estados del usuario
export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'DISABLED' | 'PENDING';

// Permisos granulares (extensible)
export type Permission =
  // Permisos de perfil
  | 'profile.read.self'
  | 'profile.update.self'
  | 'profile.read.others'
  
  // Permisos de clientes
  | 'client.read.self'
  | 'client.read.assigned'
  | 'client.read.all'
  | 'client.manage'
  
  // Permisos de maestros
  | 'master.read.self'
  | 'master.read.assigned'
  | 'master.read.all'
  | 'master.manage'
  
  // Permisos de conversaciones
  | 'conversation.read.self'
  | 'conversation.read.assigned'
  | 'conversation.read.all'
  
  // Permisos de consultas
  | 'consultation.read.self'
  | 'consultation.read.assigned'
  | 'consultation.read.all'
  | 'consultation.manage'
  
  // Permisos de pagos
  | 'payment.read.self'
  | 'payment.read.all'
  | 'payment.manage'
  
  // Permisos de órdenes
  | 'order.read.self'
  | 'order.read.all'
  | 'order.manage'
  
  // Permisos de auditoría
  | 'audit.read'
  
  // Permisos de sistema
  | 'system.manage'
  | 'roles.manage'
  | 'permissions.manage';

// Estructura del documento de usuario en Firestore
export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: UserRole;
  status: UserStatus;
  isAnonymous: boolean;
  emailVerified: boolean;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  lastLoginAt: string | null; // ISO string
}

// Estructura del usuario autenticado (frontend)
export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  isAnonymous: boolean;
  emailVerified: boolean;
  role: UserRole;
  status: UserStatus;
}

// Estado de la sesión
export type SessionState = 'loading' | 'authenticated' | 'unauthenticated';

// Matriz de permisos por rol
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  PUBLIC: [],
  
  CLIENTE: [
    'profile.read.self',
    'profile.update.self',
    'client.read.self',
    'conversation.read.self',
    'consultation.read.self',
    'payment.read.self',
    'order.read.self',
  ],
  
  MAESTRO: [
    'profile.read.self',
    'profile.update.self',
    'master.read.self',
    'client.read.assigned',
    'conversation.read.assigned',
    'consultation.read.assigned',
  ],
  
  ADMINISTRADOR: [
    'profile.read.self',
    'profile.update.self',
    'profile.read.others',
    'client.read.all',
    'master.read.all',
    'conversation.read.all',
    'consultation.read.all',
    'consultation.manage',
    'payment.read.all',
    'order.read.all',
    'order.manage',
  ],
  
  SUPER_ADMIN: [
    'profile.read.self',
    'profile.update.self',
    'profile.read.others',
    'client.read.all',
    'client.manage',
    'master.read.all',
    'master.manage',
    'conversation.read.all',
    'consultation.read.all',
    'consultation.manage',
    'payment.read.all',
    'payment.manage',
    'order.read.all',
    'order.manage',
    'audit.read',
    'system.manage',
    'roles.manage',
    'permissions.manage',
  ],
};
