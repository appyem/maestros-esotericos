/**
 * Tipos para el sistema de conversaciones, mensajes y memoria (FASE 6)
 */

export type ConversationStatus = 'ACTIVE' | 'PAUSED' | 'ARCHIVED' | 'DELETED';
export type MessageStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
export type SenderType = 'USER' | 'AI' | 'SYSTEM';
export type MemoryStatus = 'ACTIVE' | 'EXPIRED' | 'DELETED' | 'SUPERSEDED';
export type MemorySource = 'USER_EXPLICIT' | 'CONVERSATION' | 'SYSTEM' | 'ADMIN';
export type MemoryCategory = 'PREFERENCE' | 'CONTEXT' | 'GOAL' | 'TOPIC' | 'RELATIONSHIP_CONTEXT' | 'CONSULTATION_CONTEXT';

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  status: ConversationStatus;
  specialty?: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  lastMessageAt: string; // ISO string
  messageCount: number;
  summaryVersion: number;
  memoryVersion: number;
}

export interface Message {
  id: string;
  conversationId: string;
  userId: string;
  senderType: SenderType;
  content: string;
  createdAt: string; // ISO string
  status: MessageStatus;
  metadata?: Record<string, unknown>;
}

export interface AIMemory {
  id: string;
  userId: string;
  conversationId?: string;
  category: MemoryCategory;
  content: string;
  importance: number; // 1-10
  confidence: number; // 0.0-1.0
  source: MemorySource;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string; // ISO string opcional
  status: MemoryStatus;
}

export interface AISummary {
  id: string;
  conversationId: string;
  userId: string;
  summary: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  generatedBy: 'AI' | 'SYSTEM';
  status: 'ACTIVE' | 'ARCHIVED';
}

export interface ConversationContext {
  conversationId: string;
  userId: string;
  specialty?: string;
  recentMessages: Message[];
  summary?: string;
  relevantMemories: AIMemory[];
  currentIntent?: string;
}
