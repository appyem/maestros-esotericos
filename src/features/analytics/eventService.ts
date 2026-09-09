import { doc, runTransaction } from 'firebase/firestore';
import { z } from 'zod';

import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';

import type { AllowedAnalyticsMetadata, AnalyticsEvent, AnalyticsEventName } from './types';

// ==========================================
// VALIDACIÓN Y SANITIZACIÓN (Privacy by Design)
// ==========================================

// Esquema válido para metadatos: claves string, valores string, number o boolean
const metadataSchema = z.record(z.string(), z.union([z.string(), z.number(), z.boolean()]));

const FORBIDDEN_METADATA_PATTERNS = /password|token|secret|cvv|card|prompt|memory|conversation|email|phone|address/i;

function sanitizeMetadata(rawMetadata?: Record<string, unknown>): AllowedAnalyticsMetadata | undefined {
  if (!rawMetadata) return undefined;

  const sanitized: AllowedAnalyticsMetadata = {};
  
  for (const [key, value] of Object.entries(rawMetadata)) {
    // 1. Rechazar claves que parezcan contener datos sensibles
    if (FORBIDDEN_METADATA_PATTERNS.test(key)) {
      logger.warn('INTENTO DE REGISTRO DE METADATA SENSIBLE BLOQUEADO', { key });
      continue;
    }
    
    // 2. Rechazar valores que parezcan secretos o PII
    if (typeof value === 'string' && FORBIDDEN_METADATA_PATTERNS.test(value)) {
      logger.warn('VALOR DE METADATA SENSIBLE BLOQUEADO', { key });
      continue;
    }

    // 3. Validar tipo y asignar
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      sanitized[key] = value;
    }
  }

  return Object.keys(sanitized).length > 0 ? sanitized : undefined;
}

const analyticsEventSchema = z.object({
  eventName: z.string(),
  actorType: z.enum(['USER', 'MASTER', 'ADMIN', 'SYSTEM', 'ANONYMOUS']),
  pseudonymousUserId: z.string().min(1),
  sessionId: z.string().optional(),
  relatedEntityType: z.enum(['consultation', 'order', 'product', 'payment', 'user']).optional(),
  relatedEntityId: z.string().optional(),
  source: z.enum(['frontend', 'backend', 'webhook', 'cron']),
  metadata: metadataSchema.optional(),
});

// ==========================================
// SERVICIO PRINCIPAL
// ==========================================

/**
 * Registra un evento de analítica de forma idempotente y segura.
 * @param eventId Debe ser único (ej: `${eventName}_${relatedEntityId}_${timestamp}`) o un UUID.
 */
export async function trackAnalyticsEvent(
  eventId: string,
  eventName: AnalyticsEventName,
  actorType: 'USER' | 'MASTER' | 'ADMIN' | 'SYSTEM' | 'ANONYMOUS',
  pseudonymousUserId: string,
  source: 'frontend' | 'backend' | 'webhook' | 'cron',
  metadata?: Record<string, unknown>,
  relatedEntityType?: 'consultation' | 'order' | 'product' | 'payment' | 'user',
  relatedEntityId?: string,
  sessionId?: string
): Promise<void> {
  try {
    // 1. Validar estructura básica
    const validatedData = analyticsEventSchema.parse({
      eventName,
      actorType,
      pseudonymousUserId,
      sessionId,
      relatedEntityType,
      relatedEntityId,
      source,
      metadata,
    });

    // 2. Sanitizar metadatos (Privacy by Design)
    const cleanMetadata = sanitizeMetadata(validatedData.metadata);

    const now = new Date();
    const newEvent: AnalyticsEvent = {
      eventId, // Clave para idempotencia
      eventName: validatedData.eventName as AnalyticsEventName,
      schemaVersion: '1.0',
      actorType: validatedData.actorType,
      pseudonymousUserId: validatedData.pseudonymousUserId,
      sessionId: validatedData.sessionId,
      relatedEntityType: validatedData.relatedEntityType,
      relatedEntityId: validatedData.relatedEntityId,
      source: validatedData.source,
      timestamp: now.toISOString(),
      metadata: cleanMetadata,
      createdAt: now.toISOString(),
    };

    const eventRef = doc(db, 'analyticsEvents', eventId);

    // 3. Escritura idempotente (si el ID ya existe, no hace nada, previene duplicados)
    await runTransaction(db, async (transaction) => {
      const eventDoc = await transaction.get(eventRef);
      if (eventDoc.exists()) {
        logger.info('Evento de analítica duplicado ignorado (idempotencia)', { eventId });
        return;
      }
      transaction.set(eventRef, newEvent);
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error('Evento de analítica rechazado por validación de esquema', { 
        eventName, 
        issues: error.issues // FIX: ZodError usa 'issues', no 'errors'
      });
    } else {
      logger.error('Error al registrar evento de analítica', { error, eventName });
    }
    // No lanzamos el error para no romper el flujo principal del usuario, 
    // pero queda registrado en los logs del servidor.
  }
}
