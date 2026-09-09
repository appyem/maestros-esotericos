import { collection, getDocs, query, where } from 'firebase/firestore';

import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';

import type { CriticalAction, GlobalSetting, SecurityAlert } from './types';

/**
 * Regla de Protección Crítica:
 * Valida que no se pueda desactivar o eliminar el último SUPER_ADMIN activo.
 */
export async function validateLastSuperAdminProtection(targetUserId: string, action: 'SUSPEND' | 'REVOKE_SUPER_ADMIN'): Promise<boolean> {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('role', '==', 'SUPER_ADMIN'), where('status', '==', 'ACTIVE'));
    const snapshot = await getDocs(q);

    // Si solo existe 1 Super Admin activo y es el que estamos intentando modificar
    if (snapshot.size === 1 && snapshot.docs[0].id === targetUserId) {
      logger.error('PROTECCIÓN CRÍTICA ACTIVADA: Intento de desactivar el último SUPER_ADMIN', { targetUserId, action });
      return false; // Rechazar la acción
    }

    return true; // Permitir la acción
  } catch (error) {
    logger.error('Error al validar protección de último Super Admin', { error });
    return false; // Fallar de forma segura (denegar)
  }
}

/**
 * Valida y registra una Acción Crítica.
 * En un entorno real, esto se ejecutaría dentro de una transacción o como paso previo a la operación.
 */
export function validateCriticalAction(action: Omit<CriticalAction, 'actionId' | 'createdAt' | 'result'>): { valid: boolean; reason?: string } {
  // 1. Requiere reautenticación para acciones de alto riesgo
  const highRiskActions = ['SUPER_ADMIN_GRANTED', 'SUPER_ADMIN_REVOKED', 'SECURITY_SETTING_CHANGED', 'RECOVERY_EXECUTED'];
  
  if (highRiskActions.includes(action.actionType) && !action.reauthenticated) {
    return { valid: false, reason: 'Reautenticación requerida para acciones de alto riesgo.' };
  }

  // 2. Requiere confirmación explícita y motivo
  if (!action.confirmation || !action.reason.trim()) {
    return { valid: false, reason: 'Confirmación explícita y motivo son obligatorios.' };
  }

  return { valid: true };
}

/**
 * Valida que una configuración global no intente almacenar secretos.
 */
export function validateGlobalSettingSafety(setting: Partial<GlobalSetting>): boolean {
  const forbiddenPatterns = /api[_-]?key|secret|password|token|private[_-]?key|cvv/i;
  
  if (forbiddenPatterns.test(setting.key || '') || forbiddenPatterns.test(String(setting.value))) {
    logger.error('INTENTO DE ALMACENAMIENTO DE SECRETO EN CONFIGURACIÓN GLOBAL BLOQUEADO', { key: setting.key });
    return false;
  }
  
  return true;
}

/**
 * Genera una alerta de seguridad estructural.
 * (La escritura en Firestore se haría en el servicio correspondiente).
 */
export function generateSecurityAlert(
  type: SecurityAlert['type'],
  severity: SecurityAlert['severity'],
  description: string,
  source: string,
  resourceId?: string
): Omit<SecurityAlert, 'alertId' | 'createdAt' | 'updatedAt'> {
  return {
    type,
    severity,
    status: 'OPEN',
    source,
    resourceId,
    description,
  };
}
