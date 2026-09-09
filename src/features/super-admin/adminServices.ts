import { collection, doc, runTransaction } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';

import { validateLastSuperAdminProtection, validateCriticalAction } from './securityGuards';
import type { AdvancedAuditLog, SuperAdminPermission } from './types';

/**
 * Registra un log de auditoría avanzado e inmutable.
 * Solo el backend (Admin SDK) debe tener permisos de escritura en 'auditLogs'.
 */
export async function createAdvancedAuditLog(
  logData: Omit<AdvancedAuditLog, 'auditLogId' | 'createdAt'>
): Promise<void> {
  const auditLogId = uuidv4();
  const auditRef = doc(collection(db, 'auditLogs'), auditLogId);
  
  const newLog: AdvancedAuditLog = {
    auditLogId,
    ...logData,
    createdAt: new Date().toISOString(),
  };

  try {
    await runTransaction(db, async (transaction) => {
      transaction.set(auditRef, newLog);
    });
    logger.info('Advanced Audit Log creado', { action: logData.action, severity: logData.severity });
  } catch (error) {
    logger.error('FALLO CRÍTICO AL CREAR ADVANCED AUDIT LOG', { error, action: logData.action });
  }
}

/**
 * Cambia el rol o los permisos de un usuario.
 * Requiere validación de último Super Admin y registro de acción crítica.
 */
export async function updateUserAdminStatus(
  actorUserId: string,
  actorRole: string,
  targetUserId: string,
  newRole: 'ADMINISTRATOR' | 'SUPER_ADMIN' | 'CLIENT' | 'MASTER',
  newPermissions: SuperAdminPermission[],
  reason: string,
  isReauthenticated: boolean
): Promise<void> {
  const requestId = uuidv4();
  const userRef = doc(db, 'users', targetUserId);

  // 1. Validar Acción Crítica
  const actionType = newRole === 'SUPER_ADMIN' ? 'SUPER_ADMIN_GRANTED' : 'ADMIN_PERMISSION_CHANGED';
  const criticalActionValidation = validateCriticalAction({
    actorUserId,
    actorRole,
    actionType,
    targetId: targetUserId,
    reason,
    confirmation: true,
    reauthenticated: isReauthenticated,
  });

  if (!criticalActionValidation.valid) {
    await createAdvancedAuditLog({
      actorUserId,
      actorRole,
      action: actionType,
      resourceType: 'users',
      resourceId: targetUserId,
      result: 'DENIED',
      severity: 'WARNING',
      reason: criticalActionValidation.reason || 'Unknown',
      requestId,
    });
    throw new Error(criticalActionValidation.reason || 'Validación fallida');
  }

  // 2. Validar Protección del Último Super Admin
  if (newRole !== 'SUPER_ADMIN') {
    const isSafe = await validateLastSuperAdminProtection(targetUserId, 'REVOKE_SUPER_ADMIN');
    if (!isSafe) {
      await createAdvancedAuditLog({
        actorUserId,
        actorRole,
        action: 'SUPER_ADMIN_REVOKED',
        resourceType: 'users',
        resourceId: targetUserId,
        result: 'DENIED',
        severity: 'CRITICAL',
        reason: 'No se puede desactivar al último SUPER_ADMIN activo.',
        requestId,
      });
      throw new Error('PROTECCIÓN_CRÍTICA: No se puede desactivar al último SUPER_ADMIN activo.');
    }
  }

  try {
    await runTransaction(db, async (transaction) => {
      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists()) {
        throw new Error('USER_NOT_FOUND');
      }

      const oldData = userDoc.data();
      
      transaction.update(userRef, {
        role: newRole,
        permissions: newPermissions,
        status: newRole === 'CLIENT' || newRole === 'MASTER' ? 'ACTIVE' : oldData.status,
        updatedAt: new Date().toISOString(),
        updatedBy: actorUserId,
      });

      // Registrar éxito en auditoría
      await createAdvancedAuditLog({
        actorUserId,
        actorRole,
        action: actionType,
        resourceType: 'users',
        resourceId: targetUserId,
        result: 'SUCCESS',
        severity: 'WARNING',
        reason,
        requestId,
        metadata: {
          oldRole: oldData.role,
          newRole,
          oldPermissions: oldData.permissions || [],
          newPermissions,
        },
      });
    });

    logger.info('Estado de administrador actualizado', { targetUserId, newRole, actorUserId });
  } catch (error) {
    await createAdvancedAuditLog({
      actorUserId,
      actorRole,
      action: actionType,
      resourceType: 'users',
      resourceId: targetUserId,
      result: 'FAILURE',
      severity: 'ERROR',
      reason: error instanceof Error ? error.message : 'Unknown error',
      requestId,
    });
    logger.error('Error al actualizar estado de administrador', { error, targetUserId });
    throw error;
  }
}

/**
 * Suspende o reactiva un administrador.
 */
export async function suspendAdminUser(
  actorUserId: string,
  actorRole: string,
  targetUserId: string,
  action: 'SUSPEND' | 'REACTIVATE',
  reason: string,
  isReauthenticated: boolean
): Promise<void> {
  const requestId = uuidv4();
  const userRef = doc(db, 'users', targetUserId);
  const actionType = action === 'SUSPEND' ? 'ADMIN_SUSPENDED' : 'ADMIN_REACTIVATED';

  // Validar Acción Crítica
  const criticalActionValidation = validateCriticalAction({
    actorUserId,
    actorRole,
    actionType,
    targetId: targetUserId,
    reason,
    confirmation: true,
    reauthenticated: isReauthenticated,
  });

  if (!criticalActionValidation.valid) {
    throw new Error(criticalActionValidation.reason || 'Validación fallida');
  }

  // Validar Protección del Último Super Admin si se intenta suspender
  if (action === 'SUSPEND') {
    const isSafe = await validateLastSuperAdminProtection(targetUserId, 'SUSPEND');
    if (!isSafe) {
      throw new Error('PROTECCIÓN_CRÍTICA: No se puede suspender al último SUPER_ADMIN activo.');
    }
  }

  try {
    await runTransaction(db, async (transaction) => {
      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists()) throw new Error('USER_NOT_FOUND');

      const newStatus = action === 'SUSPEND' ? 'SUSPENDED' : 'ACTIVE';
      
      transaction.update(userRef, {
        status: newStatus,
        updatedAt: new Date().toISOString(),
        updatedBy: actorUserId,
      });

      await createAdvancedAuditLog({
        actorUserId,
        actorRole,
        action: actionType,
        resourceType: 'users',
        resourceId: targetUserId,
        result: 'SUCCESS',
        severity: 'WARNING',
        reason,
        requestId,
        metadata: { newStatus },
      });
    });

    logger.info('Administrador suspendido/reactivado', { targetUserId, action, actorUserId });
  } catch (error) {
    await createAdvancedAuditLog({
      actorUserId,
      actorRole,
      action: actionType,
      resourceType: 'users',
      resourceId: targetUserId,
      result: 'FAILURE',
      severity: 'ERROR',
      reason: error instanceof Error ? error.message : 'Unknown error',
      requestId,
    });
    throw error;
  }
}
