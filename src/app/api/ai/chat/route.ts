import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { processAIRequest } from '@/ai/orchestrator';
import type { AIResponse, AIError } from '@/ai/types';
import { logger } from '@/lib/logger';

/**
 * Esquema de validación estricto para la solicitud entrante.
 * El cliente NO puede enviar 'model', 'systemPrompt' ni 'provider'.
 */
const RequestSchema = z.object({
  userInput: z.string().min(1).max(1000),
  context: z.object({
    sessionId: z.string().uuid().optional(),
    userId: z.string().optional(),
    conversationId: z.string().optional(),
    specialty: z.enum([
      'TAROT', 'ASTROLOGIA', 'AMOR_RELACIONES', 'PROSPERIDAD', 
      'TRABAJO', 'ORIENTACION_ESPIRITUAL', 'GENERAL'
    ]).optional(),
    promptVersion: z.string().optional(),
  }).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // 1. Validar el cuerpo de la solicitud
    const body = await request.json();
    const validationResult = RequestSchema.safeParse(body);

    if (!validationResult.success) {
      logger.warn('AI API: Solicitud inválida', { errors: validationResult.error.format() });
      return NextResponse.json(
        { error: 'Solicitud inválida. Por favor, verifica el formato de tu mensaje.' },
        { status: 400 }
      );
    }

    const { userInput, context } = validationResult.data;

    // 2. Procesar a través del Orquestador
    const result = await processAIRequest({ userInput, context });

    // 3. Manejar la respuesta o el error
    if ('isUserFacing' in result && result.isUserFacing === false) {
      // Es un error interno del orquestador
      logger.error('AI API: Error del orquestador', { code: result.code, message: result.message });
      
      return NextResponse.json(
        { error: result.userFacingMessage },
        { status: 500 }
      );
    }

    // Es una respuesta exitosa y validada
    const aiResponse = result as AIResponse;
    
    // 4. Sanitizar la respuesta antes de enviarla al cliente
    // (Aseguramos que no se filtre metadata sensible si la hubiera)
    const safeResponse = {
      requestId: aiResponse.requestId,
      text: aiResponse.text,
      intent: aiResponse.intent,
      specialty: aiResponse.specialty,
      shouldAskQuestion: aiResponse.shouldAskQuestion,
      requiresHumanReview: aiResponse.requiresHumanReview,
    };

    return NextResponse.json(safeResponse, { status: 200 });

  } catch (error) {
    logger.error('AI API: Error crítico no manejado', { error });
    return NextResponse.json(
      { error: 'Ocurrió un error inesperado al procesar tu solicitud.' },
      { status: 500 }
    );
  }
}
