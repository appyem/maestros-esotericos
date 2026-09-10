import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';

import { processAIRequest } from '@/ai/orchestrator';
import { ContextBuilder } from '@/ai/context/ContextBuilder';
import type { AIResponse, Message } from '@/ai/types';
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
      logger.warn('AI API: Solicitud inválida', { errors: validationResult.error.format() });
      return NextResponse.json(
        { error: 'Solicitud inválida. Por favor, verifica el formato de tu mensaje.' },
        { status: 400 }
      );
    }

    const { userInput, context } = validationResult.data;
    
    // SOLUCIÓN ESCALABLE: Optimizar el contexto para evitar límites de tokens
    let finalUserInput = userInput;
    let finalContext = context;

    if (context?.conversationId && context?.userId && context?.messageHistory) {
      try {
        const contextBuilder = new ContextBuilder();
        
        // Mapear el historial al formato esperado por su ContextBuilder existente
        const messagesForBuilder: Message[] = context.messageHistory.map((m, idx) => ({
          id: `msg_${idx}`,
          conversationId: context.conversationId!,
          userId: context.userId!,
          senderType: m.role === 'user' ? 'USER' : 'AI',
          content: m.content,
          createdAt: new Date().toISOString(),
          status: 'COMPLETED'
        }));

        const builtContext = await contextBuilder.buildContext(
          context.conversationId,
          context.userId,
          context.specialty,
          messagesForBuilder
        );

        // Si hay un resumen, lo anteponemos al mensaje actual. 
        // Esto le da a la IA "memoria perfecta" sin gastar tokens en historial crudo.
        if (builtContext.summary) {
          finalUserInput = `[CONTEXTO DE LA CONVERSACIÓN: ${builtContext.summary}]\n\nConsulta actual: ${userInput}`;
        }

        // Limitamos el historial crudo a máximo 2 mensajes para no saturar tokens
        finalContext = {
          ...context,
          messageHistory: context.messageHistory.slice(-2),
        };

      } catch (error) {
        logger.warn('ContextBuilder: Fallo al construir contexto, usando fallback seguro', { error });
        // Fallback seguro: si falla el builder, limitamos el historial a 2 mensajes para evitar el colapso
        finalContext = {
          ...context,
          messageHistory: context.messageHistory.slice(-2),
        };
      }
    }

    const result = await processAIRequest({ userInput: finalUserInput, context: finalContext });

    if ('isUserFacing' in result && result.isUserFacing === false) {
      logger.error('AI API: Error del orquestador', { code: result.code, message: result.message });
      return NextResponse.json(
        { error: result.userFacingMessage },
        { status: 500 }
      );
    }

    const aiResponse = result as AIResponse;
    
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
