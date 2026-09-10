import Groq from 'groq-sdk';

import { getSystemPrompt } from '@/ai/prompts/system';
import type { AIConfig, AIIntent, AIProvider, AIRequest, AIResponse, AISafetyFlag } from '@/ai/types';
import { logger } from '@/lib/logger';

export class GroqProvider implements AIProvider {
  private modelName: string;

  constructor() {
    this.modelName = process.env.GROQ_MODEL || 'openai/gpt-oss-20b';
  }

  async generateResponse(request: AIRequest, config: AIConfig): Promise<AIResponse> {
    const apiKey = process.env.GROQ_API_KEY;
    
    if (!apiKey) {
      logger.error('GroqProvider: GROQ_API_KEY no está configurada en runtime.');
      throw new Error('CONFIGURACION_IA_FALTANTE: La clave de API de Groq no está configurada en las variables de entorno de Vercel.');
    }
    
    const client = new Groq({ apiKey });
    const startTime = Date.now();

    try {
      const systemPrompt = getSystemPrompt(config.promptVersion, request.context?.specialty);
      
      // Usamos 'as const' para que TypeScript infiera los tipos literales exactos 
      // y coincidan con lo que espera groq-sdk, evitando el uso de 'any'.
      const messagesForAPI = [
        { role: 'system' as const, content: systemPrompt },
        ...(request.context?.messageHistory || []),
        { role: 'user' as const, content: request.userInput }
      ];

      const completion = await client.chat.completions.create({
        model: this.modelName,
        messages: messagesForAPI,
        temperature: config.temperature,
        max_tokens: config.maxTokens,
      });

      let text = completion.choices[0]?.message?.content?.trim() || '';
      
      // Limpieza técnica obligatoria
      text = text.replace(/<think>[\s\S]*?(<\/think>|$)/gi, '').trim();
      text = text.replace(/<thinking>[\s\S]*?(<\/thinking>|$)/gi, '').trim();
      
      if (text.length < 20) {
        text = "Te escucho con atención. Cuéntame un poco más sobre lo que sientes.";
      }

      const latencyMs = Date.now() - startTime;
      const tokenUsage = completion.usage;

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
          tokenUsage: tokenUsage ? { prompt: tokenUsage.prompt_tokens, completion: tokenUsage.completion_tokens } : undefined,
          modelUsed: this.modelName,
        },
      };

      logger.info('GroqProvider: Respuesta generada exitosamente', { 
        requestId: request.requestId, 
        intent, 
        specialty, 
        latencyMs
      });

      return aiResponse;

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('GroqProvider: Error al generar respuesta', { 
        requestId: request.requestId, 
        error: errorMessage 
      });
      throw new Error(`GROQ_API_ERROR: ${errorMessage}`);
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
