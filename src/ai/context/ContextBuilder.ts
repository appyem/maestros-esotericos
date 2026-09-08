import { MemoryProvider } from '@/ai/providers/MemoryProvider';
import { SummaryProvider } from '@/ai/providers/SummaryProvider';
import type { ConversationContext, Message } from '@/ai/types/conversation';
import { logger } from '@/lib/logger';

// Límite configurable de mensajes recientes para evitar sobrecargar el contexto
const RECENT_MESSAGE_LIMIT = 5;
// Umbral de mensajes para activar la generación de resumen
const SUMMARY_THRESHOLD = 10;

export class ContextBuilder {
  private memoryProvider: MemoryProvider;
  private summaryProvider: SummaryProvider;

  constructor() {
    this.memoryProvider = new MemoryProvider();
    this.summaryProvider = new SummaryProvider();
  }

  async buildContext(
    conversationId: string,
    userId: string,
    specialty: string | undefined,
    allMessages: Message[]
  ): Promise<ConversationContext> {
    // 1. Obtener mensajes recientes (los últimos N)
    const recentMessages = allMessages.slice(-RECENT_MESSAGE_LIMIT);

    // 2. Obtener o generar resumen si la conversación supera el umbral
    let summary: string | undefined;
    if (allMessages.length > SUMMARY_THRESHOLD) {
      const existingSummary = await this.summaryProvider.getSummary(conversationId);
      if (existingSummary) {
        summary = existingSummary.summary;
      } else {
        const newSummary = await this.summaryProvider.generateSummary(userId, conversationId, allMessages);
        summary = newSummary.summary;
      }
    }

    // 3. Obtener memorias relevantes (máximo 5 para control de presupuesto)
    const relevantMemories = await this.memoryProvider.getRelevantMemories(userId);

    const context: ConversationContext = {
      conversationId,
      userId,
      specialty,
      recentMessages,
      summary,
      relevantMemories,
    };

    logger.info('ContextBuilder: Contexto construido', {
      conversationId,
      recentMessagesCount: recentMessages.length,
      hasSummary: !!summary,
      relevantMemoriesCount: relevantMemories.length,
    });

    return context;
  }

  getMemoryProvider() {
    return this.memoryProvider;
  }

  getSummaryProvider() {
    return this.summaryProvider;
  }
}
