/**
 * Tipos, Permisos y Modelos para el Panel de Administración (FASE 13)
 */

// ==========================================
// PERMISOS GRANULARES
// ==========================================
export const ADMIN_PERMISSIONS = {
  // Usuarios y Clientes
  USERS_VIEW: 'users.view',
  USERS_MANAGE: 'users.manage',
  CLIENTS_VIEW: 'clients.view',
  CLIENTS_MANAGE: 'clients.manage',
  
  // Maestros y Agenda
  MASTERS_VIEW: 'masters.view',
  MASTERS_REVIEW: 'masters.review', // Para onboarding
  MASTERS_MANAGE: 'masters.manage',
  APPOINTMENTS_VIEW: 'appointments.view',
  APPOINTMENTS_MANAGE: 'appointments.manage',
  ASSIGNMENTS_MANAGE: 'assignments.manage',
  
  // Finanzas y Pedidos
  PAYMENTS_VIEW: 'payments.view',
  ORDERS_VIEW: 'orders.view',
  ORDERS_MANAGE: 'orders.manage',
  
  // Tienda e Inventario
  PRODUCTS_VIEW: 'products.view',
  PRODUCTS_MANAGE: 'products.manage',
  INVENTORY_VIEW: 'inventory.view',
  INVENTORY_ADJUST: 'inventory.adjust',
  
  // Comunicación y Contenido
  NOTIFICATIONS_VIEW: 'notifications.view',
  NOTIFICATIONS_MANAGE: 'notifications.manage',
  CONTENT_VIEW: 'content.view',
  CONTENT_MANAGE: 'content.manage',
  
  // Soporte e Incidencias
  INCIDENTS_VIEW: 'incidents.view',
  INCIDENTS_MANAGE: 'incidents.manage',
} as const;

export type AdminPermission = typeof ADMIN_PERMISSIONS[keyof typeof ADMIN_PERMISSIONS];

// ==========================================
// ROLES (Extensión de F3)
// ==========================================
export type UserRole = 'CLIENT' | 'MASTER' | 'ADMINISTRATOR' | 'SUPER_ADMIN';

// ==========================================
// MODELO DE AUDITORÍA (Inmutable)
// ==========================================
export interface AuditLog {
  auditLogId: string;
  actorUserId: string;
  actorRole: UserRole;
  action: string; // ej: 'ADMIN_APPROVE_MASTER', 'ADMIN_ADJUST_INVENTORY'
  resourceType: string; // ej: 'users', 'products', 'orders'
  resourceId: string;
  timestamp: string;
  result: 'SUCCESS' | 'FAILURE' | 'DENIED';
  reason?: string; // Motivo de la acción (requerido para acciones sensibles)
  requestId: string; // Para trazar con logs de servidor
  metadata?: Record<string, unknown>; // Datos adicionales NO sensibles
}

// ==========================================
// MODELO DE INCIDENCIAS (Soporte Operativo)
// ==========================================
export type IncidentSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type IncidentStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export interface Incident {
  incidentId: string;
  type: string; // ej: 'PAYMENT_FAILED', 'MASTER_UNAVAILABLE'
  severity: IncidentSeverity;
  status: IncidentStatus;
  description: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  assignedTo?: string; // userId del admin
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}
