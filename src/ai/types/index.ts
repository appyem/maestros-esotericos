/**
 * Tipos centralizados para el Motor de IA y Orquestador
 */

export type AISpecialty = 
  | 'TAROT'
  | 'ASTROLOGIA'
  | 'AMOR_RELACIONES'
  | 'PROSPERIDAD'
  | 'TRABAJO'
  | 'ORIENTACION_ESPIRITUAL'
  | 'GENERAL';

export type AIIntent = 
  | 'GREETING'
  | 'GENERAL_GUIDANCE'
  | 'SERVICE_INFORMATION'
  | 'TAROT_REQUEST'
  | 'ASTROLOGY_REQUEST'
  | 'LOVE_REQUEST'
  | 'WORK_REQUEST'
  | 'PROSPERITY_REQUEST'
  | 'HUMAN_CONSULTATION_INTEREST'
  | 'PAYMENT_INTENT'
  | 'URGENT_REQUEST'
  | 'SUPPORT_REQUEST';

export type AISafetyFlag = 
  | 'NONE' 
  | 'MENTAL_HEALTH_CRISIS' 
  | 'SELF_HARM' 
  | 'ILLEGAL_ACTIVITY' 
  | 'PROMPT_INJECTION_ATTEMPT';

export interface AIConfidence {
  specialty: number; // 0.0 a 1.0
  intent: number;    // 0.0 a 1.0
}

export interface AIContext {
  sessionId: string;
  userId?: string;
  conversationId?: string;
  specialty?: AISpecialty;
  promptVersion: string;
}

export interface AIRequest {
  requestId: string;
  context: AIContext;
  userInput: string;
  // NOTA: El cliente NUNCA envía systemPrompt, model o provider.
  // Esto lo controla exclusivamente el Orquestador en el servidor.
}

export interface AIResponse {
  requestId: string;
  text: string;
  intent: AIIntent;
  specialty: AISpecialty;
  confidence: AIConfidence;
  shouldAskQuestion: boolean;
  safetyFlag: AISafetyFlag;
  requiresHumanReview: boolean;
  metadata: {
    latencyMs: number;
    tokenUsage?: { prompt: number; completion: number };
    modelUsed: string;
  };
}

export type AIErrorCode = 
  | 'AI_PROVIDER_ERROR'
  | 'AI_TIMEOUT'
  | 'AI_RATE_LIMIT'
  | 'AI_INVALID_INPUT'
  | 'AI_INVALID_OUTPUT'
  | 'AI_SAFETY_BLOCK'
  | 'AI_COST_LIMIT'
  | 'AI_UNAUTHORIZED'
  | 'AI_CONFIGURATION_ERROR';

export interface AIError {
  code: AIErrorCode;
  message: string; // Detalle técnico para logs
  isUserFacing: boolean;
  userFacingMessage: string; // Mensaje seguro para el frontend
}

export interface AIConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  timeoutMs: number;
  maxRetries: number;
  promptVersion: string;
}

export interface AICost {
  estimatedCostUSD: number;
  tokensUsed: number;
  limitExceeded: boolean;
}

/**
 * Abstracción del Proveedor de IA.
 * El resto de la aplicación depende de esta interfaz, no de un proveedor específico.
 */
export interface AIProvider {
  generateResponse(request: AIRequest, config: AIConfig): Promise<AIResponse>;
}
