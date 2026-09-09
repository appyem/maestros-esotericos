import { collection, doc, runTransaction } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';

import type { AuditLog, UserRole } from './types';

/**
 * Registra una acción administrativa en el log de auditoría.
 * Este log es inmutable y solo debe ser escrito por el backend.
 */
export async function createAuditLog(
  actorUserId: string,
  actorRole: UserRole,
  action: string,
  resourceType: string,
  resourceId: string,
  result: 'SUCCESS' | 'FAILURE' | 'DENIED',
  requestId: string,
  reason?: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  const auditLogId = uuidv4();
  const auditRef = doc(collection(db, 'auditLogs'), auditLogId);
  
  const newLog: AuditLog = {
    auditLogId,
    actorUserId,
    actorRole,
    action,
    resourceType,
    resourceId,
    timestamp: new Date().toISOString(),
    result,
    reason,
    requestId,
    metadata,
  };

  try {
    await runTransaction(db, async (transaction) => {
      transaction.set(auditRef, newLog);
    });
    logger.info('Audit Log creado', { action, resourceType, resourceId, result });
  } catch (error) {
    // Error crítico: si no podemos auditar, debemos registrar el fallo en el logger del servidor
    logger.error('FALLO CRÍTICO AL CREAR AUDIT LOG', { error, action, resourceType });
  }
}
