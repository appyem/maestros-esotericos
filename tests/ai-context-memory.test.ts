import { describe, it, expect } from 'vitest';
import { v4 as uuidv4 } from 'uuid';

import { ContextBuilder } from '@/ai/context/ContextBuilder';
import { MemoryProvider } from '@/ai/providers/MemoryProvider';
import { SummaryProvider } from '@/ai/providers/SummaryProvider';
import type { Message } from '@/ai/types/conversation';

describe('AI Context & Memory System', () => {
  describe('ContextBuilder', () => {
    it('should limit recent messages to RECENT_MESSAGE_LIMIT', async () => {
      const builder = new ContextBuilder();
      const userId = uuidv4();
      const conversationId = uuidv4();
      
      // Crear 15 mensajes (supera el umbral de resumen y el límite de recientes)
      const messages: Message[] = Array.from({ length: 15 }, (_, i) => ({
        id: uuidv4(),
        conversationId,
        userId,
        senderType: i % 2 === 0 ? 'USER' : 'AI',
        content: `Mensaje ${i}`,
        createdAt: new Date().toISOString(),
        status: 'COMPLETED',
      }));

      const context = await builder.buildContext(conversationId, userId, 'GENERAL', messages);

      // Debería tener máximo 5 mensajes recientes
      expect(context.recentMessages.length).toBeLessThanOrEqual(5);
      // Debería tener un resumen generado
      expect(context.summary).toBeDefined();
      expect(context.summary).toContain('15 interacciones');
    });

    it('should not generate summary for short conversations', async () => {
      const builder = new ContextBuilder();
      const userId = uuidv4();
      const conversationId = uuidv4();
      
      const messages: Message[] = Array.from({ length: 3 }, (_, i) => ({
        id: uuidv4(),
        conversationId,
        userId,
        senderType: 'USER',
        content: `Mensaje corto ${i}`,
        createdAt: new Date().toISOString(),
        status: 'COMPLETED',
      }));

      const context = await builder.buildContext(conversationId, userId, 'GENERAL', messages);

      expect(context.recentMessages.length).toBe(3);
      expect(context.summary).toBeUndefined();
    });
  });

  describe('MemoryProvider', () => {
    it('should save and retrieve relevant memories for a user', async () => {
      const provider = new MemoryProvider();
      const userId = uuidv4();
      const otherUserId = uuidv4();

      await provider.saveMemory(userId, 'PREFERENCE', 'Prefiere ser llamado Ana', 'USER_EXPLICIT');
      await provider.saveMemory(otherUserId, 'PREFERENCE', 'Prefiere ser llamado Luis', 'USER_EXPLICIT');

      const memories = await provider.getRelevantMemories(userId);

      expect(memories.length).toBe(1);
      expect(memories[0].content).toBe('Prefiere ser llamado Ana');
      // Asegurar que no se filtran memorias de otros usuarios
      expect(memories.some(m => m.userId === otherUserId)).toBe(false);
    });

    it('should perform soft delete on memory', async () => {
      const provider = new MemoryProvider();
      const userId = uuidv4();

      const memory = await provider.saveMemory(userId, 'CONTEXT', 'Vive en Madrid', 'CONVERSATION');
      const deleted = await provider.deleteMemory(memory.id);

      expect(deleted).toBe(true);
      
      const memories = await provider.getRelevantMemories(userId);
      // La memoria eliminada no debe aparecer en las relevantes (status !== 'ACTIVE')
      expect(memories.some(m => m.id === memory.id)).toBe(false);
    });
  });

  describe('SummaryProvider', () => {
    it('should generate and retrieve summary', async () => {
      const provider = new SummaryProvider();
      const userId = uuidv4();
      const conversationId = uuidv4();

      const messages: Message[] = [
        { id: uuidv4(), conversationId, userId, senderType: 'USER', content: 'Hola', createdAt: new Date().toISOString(), status: 'COMPLETED' },
        { id: uuidv4(), conversationId, userId, senderType: 'AI', content: 'Hola, ¿en qué puedo ayudarte?', createdAt: new Date().toISOString(), status: 'COMPLETED' },
      ];

      const summary = await provider.generateSummary(userId, conversationId, messages);
      
      expect(summary.conversationId).toBe(conversationId);
      expect(summary.status).toBe('ACTIVE');
      expect(summary.summary).toContain('2 interacciones');

      const retrieved = await provider.getSummary(conversationId);
      expect(retrieved?.id).toBe(summary.id);
    });
  });
});
