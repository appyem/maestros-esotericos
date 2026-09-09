import { doc, runTransaction } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';

import { createAdvancedAuditLog } from './adminServices';
import { validateCriticalAction, validateGlobalSettingSafety } from './securityGuards';
import type { GlobalSetting, SecurityAlert } from './types';

/**
 * Actualiza una configuración global del sistema.
 * Previene el almacenamiento de secretos y audita cada cambio.
 */
export async function updateGlobalSetting(
  actorUserId: string,
  actorRole: string,
  settingId: string,
  category: GlobalSetting['category'],
  key: string,
  value: string | boolean | number,
  reason: string,
  isReauthenticated: boolean
): Promise<void> {
  const requestId = uuidv4();
  const settingRef = doc(db, 'globalSettings', settingId);

  // 1. Validar que no sea un secreto
  if (!validateGlobalSettingSafety({ key, value: String(value) })) {
    throw new Error('SEGURIDAD: No se permite almacenar secretos en la configuración global.');
  }

  // 2. Validar Acción Crítica
  const criticalActionValidation = validateCriticalAction({
    actorUserId,
    actorRole,
    actionType: 'SYSTEM_SETTING_CHANGED',
    targetId: settingId,
    reason,
    confirmation: true,
    reauthenticated: isReauthenticated,
  });

  if (!criticalActionValidation.valid) {
    throw new Error(criticalActionValidation.reason || 'Validación fallida');
  }

  try {
    await runTransaction(db, async (transaction) => {
      const settingDoc = await transaction.get(settingRef);
      const oldVersion = settingDoc.exists() ? (settingDoc.data() as GlobalSetting).version : 0;
      const oldValue = settingDoc.exists() ? (settingDoc.data() as GlobalSetting).value : undefined;

      const newSetting: GlobalSetting = {
        settingId,
        category,
        key,
        value,
        version: oldVersion + 1,
        updatedBy: actorUserId,
        updatedAt: new Date().toISOString(),
      };

      transaction.set(settingRef, newSetting, { merge: true });

      // 3. Auditoría
      await createAdvancedAuditLog({
        actorUserId,
        actorRole,
        action: 'SYSTEM_SETTING_CHANGED',
        resourceType: 'globalSettings',
        resourceId: settingId,
        result: 'SUCCESS',
        severity: 'WARNING',
        reason,
        requestId,
        metadata: { key, oldValue, newValue: value, version: newSetting.version },
      });
    });

    logger.info('Configuración global actualizada', { settingId, key, actorUserId });
  } catch (error) {
    await createAdvancedAuditLog({
      actorUserId,
      actorRole,
      action: 'SYSTEM_SETTING_CHANGED',
      resourceType: 'globalSettings',
      resourceId: settingId,
      result: 'FAILURE',
      severity: 'ERROR',
      reason: error instanceof Error ? error.message : 'Unknown error',
      requestId,
    });
    logger.error('Error al actualizar configuración global', { error, settingId });
    throw error;
  }
}

/**
 * Crea una alerta de seguridad en el sistema.
 */
export async function createSecurityAlert(
  alertData: Omit<SecurityAlert, 'alertId' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const alertId = uuidv4();
  const alertRef = doc(db, 'securityAlerts', alertId);
  const now = new Date().toISOString();

  const newAlert: SecurityAlert = {
    alertId,
    ...alertData,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await runTransaction(db, async (transaction) => {
      transaction.set(alertRef, newAlert);
    });
    logger.warn('ALERTA DE SEGURIDAD CREADA', { type: alertData.type, severity: alertData.severity });
    return alertId;
  } catch (error) {
    logger.error('Fallo al crear alerta de seguridad', { error });
    throw error;
  }
}
