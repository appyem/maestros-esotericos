import type { AIConfig } from '@/ai/types';

export const AI_DEFAULT_CONFIG: AIConfig = {
  model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
  temperature: 0.7,
  maxTokens: 800,
  timeoutMs: 15000,
  maxRetries: 2,
  promptVersion: 'v1.0.0',
};

export const AI_LIMITS = {
  maxInputLength: 1000,
  maxContextMessages: 5,
  maxRequestsPerMinute: 10,
};
