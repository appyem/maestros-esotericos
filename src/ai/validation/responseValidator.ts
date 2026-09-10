import { z } from 'zod';

import type { AIResponse } from '@/ai/types';

/**
 * Esquema estricto de Zod para validar la respuesta del proveedor de IA.
 * Garantiza que la estructura devuelta cumpla con el contrato esperado.
 */
const AIResponseSchema = z.object({
  requestId: z.string().uuid(),
  text: z.string().min(1).max(4000), // Límite de longitud de salida
  intent: z.enum([
    'GREETING', 'GENERAL_GUIDANCE', 'SERVICE_INFORMATION', 'TAROT_REQUEST',
    'ASTROLOGY_REQUEST', 'LOVE_REQUEST', 'WORK_REQUEST', 'PROSPERITY_REQUEST',
    'HUMAN_CONSULTATION_INTEREST', 'PAYMENT_INTENT', 'URGENT_REQUEST', 'SUPPORT_REQUEST'
  ]),
  specialty: z.enum([
    'TAROT', 'ASTROLOGIA', 'AMOR_RELACIONES', 'PROSPERIDAD', 'TRABAJO', 'ORIENTACION_ESPIRITUAL', 'GENERAL'
  ]),
  confidence: z.object({
    specialty: z.number().min(0).max(1),
    intent: z.number().min(0).max(1),
  }),
  shouldAskQuestion: z.boolean(),
  safetyFlag: z.enum(['NONE', 'MENTAL_HEALTH_CRISIS', 'SELF_HARM', 'ILLEGAL_ACTIVITY', 'PROMPT_INJECTION_ATTEMPT']),
  requiresHumanReview: z.boolean(),
  metadata: z.object({
    latencyMs: z.number().min(0),
    tokenUsage: z.object({ prompt: z.number(), completion: z.number() }).optional(),
    modelUsed: z.string(),
  }),
});

/**
 * Valida la respuesta del proveedor. Lanza un error si no cumple el esquema.
 */
export function validateAIResponse(rawResponse: unknown): AIResponse {
  try {
    return AIResponseSchema.parse(rawResponse);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`AI_INVALID_OUTPUT: La respuesta del proveedor no cumple con el esquema esperado. Detalles: ${error.message}`);
    }
    throw new Error('AI_INVALID_OUTPUT: Error desconocido al validar la respuesta de la IA.');
  }
}
