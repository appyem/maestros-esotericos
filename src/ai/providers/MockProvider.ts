import { v4 as _uuidv4 } from 'uuid';

import type { AIConfig, AIIntent, AIProvider, AIRequest, AIResponse, AISpecialty } from '@/ai/types';
import { logger } from '@/lib/logger';

/**
 * Proveedor Mock de IA para desarrollo y pruebas.
 * Simula latencia, clasificación de intención y respuestas seguras.
 * NUNCA usa claves API reales.
 * En producción, esta clase será reemplazada por OpenAIProvider, AnthropicProvider, etc.
 */
export class MockProvider implements AIProvider {
  async generateResponse(request: AIRequest, config: AIConfig): Promise<AIResponse> {
    const startTime = Date.now();
    
    // Simular latencia de red (500ms - 1500ms)
    await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 1000));

    const inputLower = request.userInput.toLowerCase();
    
    // Clasificación de intención simulada (lógica básica para pruebas)
    let intent: AIIntent = 'GENERAL_GUIDANCE';
    let specialty: AISpecialty = 'GENERAL';
    
    if (inputLower.includes('tarot') || inputLower.includes('carta')) {
      intent = 'TAROT_REQUEST';
      specialty = 'TAROT';
    } else if (inputLower.includes('pareja') || inputLower.includes('amor') || inputLower.includes('relacion')) {
      intent = 'LOVE_REQUEST';
      specialty = 'AMOR_RELACIONES';
    } else if (inputLower.includes('trabajo') || inputLower.includes('dinero') || inputLower.includes('empleo')) {
      intent = 'WORK_REQUEST';
      specialty = 'TRABAJO';
    } else if (inputLower.includes('hola') || inputLower.includes('buenos dias')) {
      intent = 'GREETING';
    }

    // Generación de respuesta simulada segura
    let responseText = '';
    if (intent === 'GREETING') {
      responseText = 'Hola. Soy tu guía de orientación en Maestros Esotéricos. ¿En qué área de tu vida te gustaría encontrar claridad hoy? (Por ejemplo: amor, trabajo, orientación general).';
    } else if (specialty === 'AMOR_RELACIONES') {
      responseText = 'Entiendo que las relaciones pueden generar dudas. Desde una perspectiva de orientación, es un momento para observar la comunicación y tus propias necesidades. ¿Hay algo específico en la dinámica que te esté causando inquietud?';
    } else if (specialty === 'TAROT') {
      responseText = 'El tarot es una herramienta excelente para la reflexión. Aunque no puedo hacer una tirada visual completa en este momento, puedo orientarte sobre la energía general de tu situación. ¿Qué aspecto de tu vida quieres explorar con las cartas?';
    } else {
      responseText = 'Gracias por compartir eso. Como tu guía de orientación, te invito a reflexionar sobre esto con calma. A veces, las respuestas surgen cuando nos hacemos las preguntas correctas. ¿Te gustaría que exploremos esto más a fondo o prefieres conectar con un maestro humano para una consulta personalizada?';
    }

    // Validación de seguridad simulada (Prompt injection básico)
    let safetyFlag: 'NONE' | 'PROMPT_INJECTION_ATTEMPT' = 'NONE';
    if (inputLower.includes('ignore previous instructions') || inputLower.includes('olvida las reglas') || inputLower.includes('system prompt')) {
      safetyFlag = 'PROMPT_INJECTION_ATTEMPT';
      responseText = 'Lo siento, no puedo procesar esa solicitud. Mi propósito es ofrecerte orientación esotérica de manera segura y profesional. ¿En qué más puedo ayudarte hoy?';
    }

    const latencyMs = Date.now() - startTime;

    const response: AIResponse = {
      requestId: request.requestId,
      text: responseText,
      intent,
      specialty,
      confidence: {
        specialty: 0.85,
        intent: 0.90,
      },
      shouldAskQuestion: true,
      safetyFlag,
      requiresHumanReview: false,
      metadata: {
        latencyMs,
        tokenUsage: { prompt: 150, completion: 80 }, // Simulado
        modelUsed: config.model,
      },
    };

    logger.info('MockProvider: Respuesta generada', { 
      requestId: request.requestId, 
      intent, 
      specialty, 
      latencyMs 
    });

    return response;
  }
}
