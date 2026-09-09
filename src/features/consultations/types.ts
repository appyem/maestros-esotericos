/**
 * Tipos y DTOs para el Sistema de Consulta Humana y Handoff (FASE 10)
 */

export type ConsultationStatus = 
  | 'CREATED' 
  | 'READY' 
  | 'IN_PROGRESS' 
  | 'PAUSED' 
  | 'COMPLETED' 
  | 'CANCELLED' 
  | 'NO_SHOW' 
  | 'EXPIRED';

export type SenderType = 'CLIENT' | 'MASTER' | 'SYSTEM';

// ==========================================
// MODELOS DE FIRESTORE (Internos)
// ==========================================

export interface Consultation {
  consultationId: string;
  appointmentId: string;
  clientUserId: string;
  masterId: string;
  specialty: string;
  status: ConsultationStatus;
  startedAt?: string;
  endedAt?: string;
  createdAt: string;
  updatedAt: string;
  contextVersion: number; // Para trazabilidad de cambios en el contexto
  ratingStatus: 'PENDING' | 'COMPLETED';
}

export interface ConsultationContext {
  contextId: string;
  consultationId: string;
  version: number;
  generatedAt: string;
  updatedAt: string;
  
  // Campos minimizados y autorizados para el maestro
  motivoConsulta: string;
  preguntasPrincipales: string[];
  contextoRelevante: string[];
  resumenIA: string; // Resumen objetivo, sin inferencias psicológicas no validadas
  puntosPendientes: string[];
  
  // Trazabilidad
  sources: string[]; // ej: ['AI_SUMMARY', 'APPOINTMENT_DATA']
  authorizedByClient: boolean;
}

export interface ConsultationMessage {
  messageId: string;
  consultationId: string;
  senderType: SenderType; // Establecido SOLO por el backend
  senderId: string; // UID del cliente o del maestro
  content: string;
  createdAt: string;
  sequenceNumber: number; // Para garantizar orden y prevenir duplicados
  status: 'PENDING' | 'SENT' | 'DELIVERED';
}

export interface ConsentRecord {
  consentId: string;
  userId: string;
  consultationId: string;
  consentType: 'CONTEXT_SHARING' | 'GENERAL';
  acceptedAt: string;
  version: string; // Versión del texto de consentimiento aceptado
}

export interface ConsultationRating {
  ratingId: string;
  consultationId: string;
  clientUserId: string;
  masterId: string;
  score: number; // 1 a 5
  comment?: string;
  createdAt: string;
}

// ==========================================
// DTOs SEGUROS (Para el Frontend)
// ==========================================

export interface ClientConsultationDTO {
  consultationId: string;
  masterName: string; // Denormalizado de forma segura
  specialty: string;
  status: ConsultationStatus;
  startedAt?: string;
}

export interface MasterConsultationDTO {
  consultationId: string;
  clientDisplayName: string; // Solo nombre o alias, nunca email/teléfono sin autorización
  specialty: string;
  status: ConsultationStatus;
  context: ConsultationContext | null; // Contexto autorizado
}

export interface CreateConsultationRequest {
  appointmentId: string;
}

export interface SendMessageRequest {
  content: string;
  sequenceNumber: number;
}
