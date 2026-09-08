import { v4 as uuidv4 } from 'uuid';

import type { AIMemory, MemoryCategory, MemorySource } from '@/ai/types/conversation';
import { logger } from '@/lib/logger';

/**
 * Proveedor de Memoria (Mock para desarrollo).
 * En producción, esto interactuará con Firestore o una base de datos vectorial.
 */
export class MemoryProvider {
  private memories: AIMemory[] = [];

  async saveMemory(
    userId: string,
    category: MemoryCategory,
    content: string,
    source: MemorySource,
    conversationId?: string
  ): Promise<AIMemory> {
    const memory: AIMemory = {
      id: uuidv4(),
      userId,
      conversationId,
      category,
      content,
      importance: 5,
      confidence: 0.8,
      source,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'ACTIVE',
    };
    this.memories.push(memory);
    logger.info('MemoryProvider: Memoria guardada', { memoryId: memory.id, userId });
    return memory;
  }

  async getRelevantMemories(userId: string, _query?: string): Promise<AIMemory[]> {
    // Mock: devuelve memorias activas del usuario, limitadas para control de presupuesto de contexto
    const relevant = this.memories.filter((m) => m.userId === userId && m.status === 'ACTIVE');
    logger.info('MemoryProvider: Memorias relevantes recuperadas', { count: relevant.length, userId });
    return relevant.slice(0, 5); // Límite estricto de contexto
  }

  async updateMemory(memoryId: string, newContent: string): Promise<AIMemory | null> {
    const index = this.memories.findIndex((m) => m.id === memoryId);
    if (index !== -1) {
      this.memories[index].content = newContent;
      this.memories[index].updatedAt = new Date().toISOString();
      this.memories[index].status = 'ACTIVE';
      logger.info('MemoryProvider: Memoria actualizada', { memoryId });
      return this.memories[index];
    }
    return null;
  }

  async deleteMemory(memoryId: string): Promise<boolean> {
    const index = this.memories.findIndex((m) => m.id === memoryId);
    if (index !== -1) {
      this.memories[index].status = 'DELETED'; // Soft delete
      logger.info('MemoryProvider: Memoria eliminada (soft delete)', { memoryId });
      return true;
    }
    return false;
  }
}
