import { v4 as uuidv4 } from 'uuid';

import type { AISummary, Message } from '@/ai/types/conversation';
import { logger } from '@/lib/logger';

/**
 * Proveedor de Resúmenes (Mock para desarrollo).
 * En producción, esto podría invocar al AI Orchestrator con un prompt específico de resumen.
 */
export class SummaryProvider {
  private summaries: Map<string, AISummary> = new Map();

  async getSummary(conversationId: string): Promise<AISummary | null> {
    const summary = this.summaries.get(conversationId);
    if (summary && summary.status === 'ACTIVE') {
      logger.info('SummaryProvider: Resumen recuperado', { conversationId });
      return summary;
    }
    return null;
  }

  async generateSummary(userId: string, conversationId: string, messages: Message[]): Promise<AISummary> {
    // Mock: Genera un resumen ficticio basado en la cantidad de mensajes
    const summaryText = `Resumen de la conversación: El usuario ha realizado ${messages.length} interacciones, explorando temas de orientación general.`;
    
    const newSummary: AISummary = {
      id: uuidv4(),
      conversationId,
      userId,
      summary: summaryText,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      generatedBy: 'AI',
      status: 'ACTIVE',
    };

    this.summaries.set(conversationId, newSummary);
    logger.info('SummaryProvider: Resumen generado', { conversationId, messageCount: messages.length });
    return newSummary;
  }
}
