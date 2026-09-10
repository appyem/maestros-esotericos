import { v4 as uuidv4 } from 'uuid';

import { AI_DEFAULT_CONFIG, AI_LIMITS } from '@/ai/config';
import { GroqProvider } from '@/ai/providers';
import type { AIConfig, AIErrorCode, AIError, AIRequest, AIResponse } from '@/ai/types';
import { validateAIResponse } from '@/ai/validation/responseValidator';
import { logger } from '@/lib/logger';

const aiProvider = new GroqProvider();

export async function processAIRequest(request: Partial<AIRequest>): Promise<AIResponse | AIError> {
  const requestId = request.requestId || uuidv4();
  const startTime = Date.now();

  try {
    if (!request.userInput || typeof request.userInput !== 'string') {
      return createError('AI_INVALID_INPUT', 'La entrada del usuario es requerida y debe ser texto.', 'Por favor, escribe tu consulta.');
    }

    if (request.userInput.length > AI_LIMITS.maxInputLength) {
      return createError('AI_INVALID_INPUT', `La entrada excede el límite de ${AI_LIMITS.maxInputLength} caracteres.`, 'Tu mensaje es demasiado largo. Por favor, resume tu consulta.');
    }

    const sanitizedInput = request.userInput.replace(/<[^>]*>/g, '').trim();

    const config: AIConfig = { ...AI_DEFAULT_CONFIG, promptVersion: request.context?.promptVersion || AI_DEFAULT_CONFIG.promptVersion };

    // CORRECCIÓN CRÍTICA: Ahora pasamos el messageHistory al finalRequest
    const finalRequest: AIRequest = {
      requestId,
      context: {
        sessionId: request.context?.sessionId || uuidv4(),
        userId: request.context?.userId,
        conversationId: request.context?.conversationId,
        specialty: request.context?.specialty || 'GENERAL',
        promptVersion: config.promptVersion,
        messageHistory: request.context?.messageHistory, // <-- ESTO PERMITE QUE ARIEL RECUERDE
      },
      userInput: sanitizedInput,
    };

    let lastError: Error | null = null;
    for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
      try {
        logger.info('AI Orchestrator: Llamando a Groq', { 
          requestId, 
          attempt, 
          model: config.model,
          hasHistory: !!request.context?.messageHistory
        });
        
        const rawResponse = await aiProvider.generateResponse(finalRequest, config);
        const validatedResponse = validateAIResponse(rawResponse);
        
        logger.info('AI Orchestrator: Respuesta validada exitosamente', { 
          requestId, 
          latencyMs: Date.now() - startTime 
        });
        
        return validatedResponse;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        logger.warn('AI Orchestrator: Fallo en intento', { requestId, attempt, error: lastError.message });
        
        if (attempt === config.maxRetries) {
          break;
        }
        
        await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
      }
    }

    return createError('AI_PROVIDER_ERROR', `Fallo después de ${config.maxRetries} intentos: ${lastError?.message}`, 'Lo siento, estoy teniendo dificultades para procesar tu consulta en este momento. Por favor, inténtalo de nuevo más tarde.');

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('AI Orchestrator: Error crítico no manejado', { requestId, error: errorMessage });
    
    if (errorMessage.includes('CONFIGURACION_IA_FALTANTE')) {
      return createError('AI_CONFIGURATION_ERROR', 'Falta la clave de API de Groq', 'El sistema de orientación no está configurado correctamente. Por favor, contacte a soporte.');
    }
    
    return createError('AI_CONFIGURATION_ERROR', 'Error interno del orquestador', 'Ocurrió un error inesperado. Nuestro equipo ha sido notificado.');
  }
}

function createError(code: AIErrorCode, technicalMessage: string, userMessage: string): AIError {
  return {
    code,
    message: technicalMessage,
    isUserFacing: false,
    userFacingMessage: userMessage,
  };
}
