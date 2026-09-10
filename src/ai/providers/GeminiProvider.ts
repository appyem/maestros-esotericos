import { GoogleGenerativeAI } from '@google/generative-ai';

import { getSystemPrompt } from '@/ai/prompts/system';
import type { AIConfig, AIIntent, AIProvider, AIRequest, AIResponse, AISafetyFlag } from '@/ai/types';
import { logger } from '@/lib/logger';

export class GeminiProvider implements AIProvider {
  private apiKey: string;
  private modelName: string;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || '';
    this.modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  }

  async generateResponse(request: AIRequest, config: AIConfig): Promise<AIResponse> {
    if (!this.apiKey) {
      logger.error('GeminiProvider: GEMINI_API_KEY no está configurada.');
      throw new Error('CONFIGURACION_IA_FALTANTE: La clave de API de Gemini no está configurada.');
    }

    const startTime = Date.now();

    try {
      const genAI = new GoogleGenerativeAI(this.apiKey);
      
      // Inicialización explícita con el nombre de modelo verificado por curl
      const model = genAI.getGenerativeModel({ 
        model: this.modelName,
      });

      const systemPrompt = getSystemPrompt(config.promptVersion, request.context?.specialty);
      const fullPrompt = `${systemPrompt}\n\n---\nMENSAJE DEL USUARIO: "${request.userInput}"\n---\nResponde siguiendo estrictamente tus reglas de identidad y tono.`;

      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      const text = response.text().trim();
      
      const latencyMs = Date.now() - startTime;
      const tokenUsage = response.usageMetadata;

      const safetyFlag = this.detectSafetyFlag(request.userInput);
      const intent = this.inferIntent(request.userInput, request.context?.specialty);
      const specialty = request.context?.specialty || 'GENERAL';
      
      const aiResponse: AIResponse = {
        requestId: request.requestId,
        text: text,
        intent: intent,
        specialty: specialty,
        confidence: {
          specialty: safetyFlag === 'NONE' ? 0.90 : 0.50,
          intent: safetyFlag === 'NONE' ? 0.85 : 0.50,
        },
        shouldAskQuestion: text.includes('?') || text.includes('¿'),
        safetyFlag: safetyFlag,
        requiresHumanReview: safetyFlag !== 'NONE' || intent === 'HUMAN_CONSULTATION_INTEREST',
        metadata: {
          latencyMs,
          tokenUsage: tokenUsage ? { prompt: tokenUsage.promptTokenCount, completion: tokenUsage.candidatesTokenCount } : undefined,
          modelUsed: this.modelName,
        },
      };

      logger.info('GeminiProvider: Respuesta generada exitosamente', { 
        requestId: request.requestId, 
        intent, 
        specialty, 
        latencyMs,
        model: this.modelName
      });

      return aiResponse;

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('GeminiProvider: Error al generar respuesta', { 
        requestId: request.requestId, 
        error: errorMessage 
      });
      throw new Error(`GEMINI_API_ERROR: ${errorMessage}`);
    }
  }

  private detectSafetyFlag(input: string): AISafetyFlag {
    const lowerInput = input.toLowerCase();
    if (lowerInput.includes('ignore previous') || lowerInput.includes('olvida las reglas') || lowerInput.includes('system prompt') || lowerInput.includes('api key')) {
      return 'PROMPT_INJECTION_ATTEMPT';
    }
    return 'NONE';
  }

  private inferIntent(input: string, specialty?: string): AIIntent {
    const lowerInput = input.toLowerCase();

    if (lowerInput.includes('maestro') || lowerInput.includes('humano') || lowerInput.includes('persona real')) {
      return 'HUMAN_CONSULTATION_INTEREST';
    }
    if (lowerInput.includes('hola') || lowerInput.includes('buenos días') || lowerInput.includes('buenas tardes')) {
      return 'GREETING';
    }
    if (specialty === 'TAROT') return 'TAROT_REQUEST';
    if (specialty === 'ASTROLOGIA') return 'ASTROLOGY_REQUEST';
    if (specialty === 'AMOR_RELACIONES') return 'LOVE_REQUEST';
    if (specialty === 'TRABAJO') return 'WORK_REQUEST';
    if (specialty === 'PROSPERIDAD') return 'PROSPERITY_REQUEST';
    
    return 'GENERAL_GUIDANCE';
  }
}
