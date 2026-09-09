/**
 * Tipos, Modelos y Permisos para SUPER ADMIN y Seguridad Global (FASE 14)
 */

// ==========================================
// PERMISOS GRANULARES DE SUPER ADMIN
// ==========================================
export const SUPER_ADMIN_PERMISSIONS = {
  // Gestión de Administradores
  ADMIN_VIEW: 'admin.view',
  ADMIN_CREATE: 'admin.create',
  ADMIN_SUSPEND: 'admin.suspend',
  ADMIN_PERMISSIONS_MANAGE: 'admin.permissions.manage',
  
  // Seguridad y Auditoría
  SECURITY_VIEW: 'system.security.view',
  SECURITY_MANAGE: 'system.security.manage',
  AUDIT_VIEW: 'audit.view',
  AUDIT_EXPORT: 'audit.export',
  
  // Sesiones y MFA
  SESSIONS_VIEW: 'sessions.view',
  SESSIONS_REVOKE: 'sessions.revoke',
  MFA_MANAGE: 'mfa.manage',
  
  // Configuración y Sistema
  SETTINGS_VIEW: 'settings.view',
  SETTINGS_MANAGE: 'settings.manage',
  INCIDENTS_MANAGE: 'incidents.manage',
  RECOVERY_EXECUTE: 'recovery.execute',
} as const;

export type SuperAdminPermission = typeof SUPER_ADMIN_PERMISSIONS[keyof typeof SUPER_ADMIN_PERMISSIONS];

// ==========================================
// MODELOS DE SEGURIDAD Y ALERTAS
// ==========================================
export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type AlertStatus = 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED';
export type AlertType = 
  | 'FAILED_LOGIN_SPIKE' | 'PRIVILEGE_ESCALATION_ATTEMPT' | 'WEBHOOK_ATTACK' 
  | 'RATE_LIMIT_ABUSE' | 'SUSPICIOUS_SESSION' | 'DATA_ACCESS_ANOMALY' 
  | 'PAYMENT_ANOMALY' | 'SYSTEM_ERROR' | 'ADMIN_WITHOUT_MFA';

export interface SecurityAlert {
  alertId: string;
  type: AlertType;
  severity: AlertSeverity;
  status: AlertStatus;
  source: string; // ej: 'AUTH_SERVICE', 'FIRESTORE_RULES'
  resourceType?: string;
  resourceId?: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  assignedTo?: string; // userId
}

// ==========================================
// CONFIGURACIÓN GLOBAL (NO SECRETA)
// ==========================================
export interface GlobalSetting {
  settingId: string;
  category: 'PUBLIC' | 'OPERATIONAL' | 'SECURITY' | 'AI' | 'PAYMENTS' | 'NOTIFICATIONS' | 'STORE';
  key: string;
  value: string | boolean | number;
  version: number;
  updatedBy: string; // userId
  updatedAt: string;
}

// ==========================================
// ACCIONES CRÍTICAS (CRITICAL ACTIONS)
// ==========================================
export interface CriticalAction {
  actionId: string;
  actorUserId: string;
  actorRole: string;
  actionType: string; // ej: 'SUPER_ADMIN_GRANTED', 'SYSTEM_SETTING_CHANGED'
  targetId?: string;
  reason: string;
  confirmation: boolean;
  reauthenticated: boolean;
  createdAt: string;
  result: 'SUCCESS' | 'FAILURE' | 'DENIED';
}

// ==========================================
// AUDITORÍA AVANZADA (Extensión de F13)
// ==========================================
export interface AdvancedAuditLog {
  auditLogId: string;
  actorUserId: string;
  actorRole: string;
  action: string;
  resourceType: string;
  resourceId: string;
  result: 'SUCCESS' | 'FAILURE' | 'DENIED';
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  reason?: string;
  requestId: string;
  ipHash?: string; // Hash seguro de la IP, nunca la IP en texto plano
  userAgentMinimal?: string; // Solo navegador y OS, sin fingerprinting completo
  createdAt: string;
  metadata?: Record<string, unknown>; // Datos NO sensibles
}
