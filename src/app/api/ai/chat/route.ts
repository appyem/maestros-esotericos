import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';

import { processAIRequest } from '@/ai/orchestrator';
import type { AIResponse } from '@/ai/types';
import { logger } from '@/lib/logger';

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
    messageHistory: z.array(z.object({ 
      role: z.enum(['user', 'assistant']), 
      content: z.string() 
    })).optional(),
  }).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = RequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({ error: 'Solicitud inválida.' }, { status: 400 });
    }

    const { userInput, context } = validationResult.data;
    
    // SOLUCIÓN BLINDADA: Máximo 1 mensaje de historial para evitar rate limits
    const safeHistory = context?.messageHistory ? context.messageHistory.slice(-1) : [];

    const result = await processAIRequest({ 
      userInput, 
      context: {
        ...context,
        messageHistory: safeHistory
      }
    });

    if ('isUserFacing' in result && result.isUserFacing === false) {
      logger.error('AI API: Error del orquestador', { code: result.code, message: result.message });
      return NextResponse.json({ error: result.userFacingMessage }, { status: 500 });
    }

    const aiResponse = result as AIResponse;
    
    return NextResponse.json({
      requestId: aiResponse.requestId,
      text: aiResponse.text,
      intent: aiResponse.intent,
      specialty: aiResponse.specialty,
      shouldAskQuestion: aiResponse.shouldAskQuestion,
      requiresHumanReview: aiResponse.requiresHumanReview,
    }, { status: 200 });

  } catch (error) {
    logger.error('AI API: Error crítico', { error });
    return NextResponse.json({ error: 'Ocurrió un error inesperado.' }, { status: 500 });
  }
}
