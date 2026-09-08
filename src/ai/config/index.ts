import type { AIConfig } from '@/ai/types';

/**
 * Configuración centralizada del Motor de IA.
 * Estos valores controlan el comportamiento, límites y costos.
 * NUNCA exponer esta configuración al cliente.
 */
export const AI_DEFAULT_CONFIG: AIConfig = {
  model: process.env.AI_MODEL || 'gpt-3.5-turbo', // Valor por defecto seguro
  temperature: 0.7, // Equilibrio entre creatividad y consistencia
  maxTokens: 500, // Límite estricto para controlar costos y respuestas largas
  timeoutMs: 15000, // 15 segundos máximo de espera
  maxRetries: 2, // Reintentos limitados para evitar bucles infinitos
  promptVersion: 'v1.0.0', // Versionado estricto del prompt del sistema
};

/**
 * Límites de seguridad y costos por sesión/usuario.
 * Se expandirán en fases posteriores con base de datos.
 */
export const AI_LIMITS = {
  maxInputLength: 1000, // Caracteres máximos por mensaje del usuario
  maxContextMessages: 5, // Máximo de mensajes históricos a enviar (Fase 6)
  maxRequestsPerMinute: 10, // Rate limiting básico (Fase 6+)
};
