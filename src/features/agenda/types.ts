/**
 * Tipos y DTOs para el Sistema de Agenda y Citas (FASE 8)
 */

export type AppointmentStatus = 
  | 'REQUESTED' 
  | 'PENDING_CONFIRMATION' 
  | 'CONFIRMED' 
  | 'RESCHEDULED' 
  | 'CANCELLED' 
  | 'COMPLETED' 
  | 'NO_SHOW' 
  | 'EXPIRED';

export type ExceptionType = 'UNAVAILABLE' | 'CUSTOM_HOURS';
export type AssignmentType = 'DIRECT' | 'ADMIN' | 'SYSTEM';

// ==========================================
// MODELOS DE DATOS (Firestore)
// ==========================================

export interface AvailabilitySchedule {
  id: string;
  masterId: string;
  dayOfWeek: number; // 0 (Domingo) a 6 (Sábado)
  startTime: string; // "09:00"
  endTime: string;   // "18:00"
  enabled: boolean;
  durationMinutes: number; // ej: 60
  bufferBeforeMinutes: number; // ej: 15
  bufferAfterMinutes: number;  // ej: 15
  createdAt: string;
  updatedAt: string;
}

export interface AvailabilityException {
  id: string;
  masterId: string;
  date: string; // "YYYY-MM-DD"
  type: ExceptionType;
  customStartTime?: string;
  customEndTime?: string;
  reason?: string; // Interno, no público
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  appointmentId: string;
  clientUserId: string;
  masterId: string;
  startAt: string; // ISO String (UTC)
  endAt: string;   // ISO String (UTC)
  timezone: string; // ej: "America/Bogota"
  status: AppointmentStatus;
  source: 'WEB' | 'ADMIN';
  createdAt: string;
  updatedAt: string;
  createdBy: string; // userId quien creó la cita
  confirmedAt?: string;
  cancelledAt?: string;
  cancelledBy?: string;
  cancellationReason?: string;
  version: number; // Para control de concurrencia optimista
}

export interface AssignmentEvent {
  eventId: string;
  appointmentId: string;
  previousMasterId?: string;
  newMasterId: string;
  assignmentType: AssignmentType;
  reason: string;
  changedBy: string; // userId
  changedAt: string;
}

// ==========================================
// DTOs (Data Transfer Objects)
// ==========================================

// DTO 1: Para clientes (solo muestra slots disponibles, sin motivos internos)
export interface PublicAvailabilitySlotDTO {
  startAt: string; // ISO String
  endAt: string;   // ISO String
  timezone: string;
}

// DTO 2: Para el maestro (ve sus excepciones y bloqueos con motivos)
export interface MasterExceptionDTO {
  id: string;
  date: string;
  type: ExceptionType;
  customStartTime?: string;
  customEndTime?: string;
  reason?: string;
}

// DTO 3: Para el cliente sobre su propia cita
export interface ClientAppointmentDTO {
  appointmentId: string;
  masterName: string; // Join o dato denormalizado seguro
  masterProfileImageUrl?: string;
  startAt: string;
  endAt: string;
  timezone: string;
  status: AppointmentStatus;
  cancellationReason?: string;
}

// DTO 4: Para el maestro sobre una cita
export interface MasterAppointmentDTO extends Omit<Appointment, 'clientUserId'> {
  clientDisplayName: string; // Solo nombre público/alias, nunca email/teléfono
  clientUserId: string; // Necesario para el maestro identificar al cliente en su sistema
}
