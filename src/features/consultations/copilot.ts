import { z } from 'zod';

import { logger } from '@/lib/logger';

import type { ConsultationContext, ConsultationMessage } from './types';

// Esquema estricto para la respuesta del Copiloto
const copilotResponseSchema = z.object({
  suggestedQuestions: z.array(z.string()).max(3, 'Máximo 3 preguntas sugeridas'),
  summary: z.string().max(500, 'El resumen debe ser conciso'),
  warnings: z.array(z.string()).optional(),
});

/**
 * Genera sugerencias para el maestro basándose únicamente en el contexto autorizado
 * y los mensajes recientes de la consulta.
 * 
 * NOTA: En un entorno de producción, esto llamaría al AI Orchestrator (F5) con un
 * prompt específico de "MASTER_COPILOT". Aquí simulamos la lógica de seguridad y minimización.
 */
export async function generateCopilotSuggestions(
  context: ConsultationContext,
  recentMessages: ConsultationMessage[],
  masterSpecialty: string
): Promise<z.infer<typeof copilotResponseSchema>> {
  logger.info('Copiloto: Generando sugerencias para el maestro', { 
    contextVersion: context.version,
    messageCount: recentMessages.length 
  });

  try {
    // Simulamos un retraso de red y procesamiento de IA
    await new Promise(resolve => setTimeout(resolve, 800));

    // Lógica simulada de generación de sugerencias basada en el contexto
    const suggestedQuestions = context.preguntasPrincipales.length > 0 
      ? context.preguntasPrincipales.slice(0, 2)
      : [`Podrías explorar más a fondo el motivo de la consulta de ${masterSpecialty}.`];

    const summary = context.resumenIA !== 'Aún no hay conversación con IA registrada para esta consulta específica.'
      ? context.resumenIA
      : `El cliente ha iniciado la consulta de ${masterSpecialty}. Se recomienda establecer rapport y confirmar el motivo principal.`;

    const warnings: string[] = [];
    if (recentMessages.length > 20) {
      warnings.push('La conversación es extensa. Considera hacer un resumen verbal con el cliente.');
    }

    const response = {
      suggestedQuestions,
      summary,
      warnings,
    };

    // Validación estricta de la salida de la IA antes de enviarla al frontend del maestro
    return copilotResponseSchema.parse(response);
  } catch (error) {
    logger.error('Copiloto: Error al generar o validar sugerencias', { error });
    // Fallback seguro: nunca exponer el error interno, solo un mensaje genérico
    return {
      suggestedQuestions: ['¿Podrías contarme más sobre lo que te trae hoy?'],
      summary: 'El sistema de asistencia está procesando el contexto de la consulta.',
      warnings: ['No se pudieron generar sugerencias detalladas en este momento.'],
    };
  }
}
