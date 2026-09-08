/**
 * Tipos y DTOs para el Sistema de Maestros (FASE 7)
 */

import type { AISpecialty } from '@/ai/types';

export type MasterStatus = 'PENDING' | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'DISABLED';
export type OnboardingStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
export type VerificationStatus = 'PENDING' | 'IN_REVIEW' | 'VERIFIED' | 'REJECTED';

// Especialidades permitidas para maestros (alineado con AI)
export type MasterSpecialty = Extract<AISpecialty, 'TAROT' | 'ASTROLOGIA' | 'AMOR_RELACIONES' | 'PROSPERIDAD' | 'TRABAJO' | 'ORIENTACION_ESPIRITUAL'>;

// Estructura completa del documento en Firestore (Nunca se devuelve completa al cliente)
export interface MasterProfile {
  masterId: string; // Igual al userId
  userId: string;
  status: MasterStatus;
  onboardingStatus: OnboardingStatus;
  
  // Datos Públicos
  displayName: string;
  publicSlug: string;
  professionalTitle: string;
  shortDescription: string;
  professionalDescription: string;
  specialties: MasterSpecialty[];
  experienceDescription: string;
  languages: string[];
  profileImageUrl?: string;
  
  // Datos Privados / Administrativos
  contactEmail?: string;
  contactPhone?: string;
  internalNotes?: string;
  verification: {
    status: VerificationStatus;
    reviewedAt?: string;
    reviewedBy?: string;
    notes?: string;
  };
  administrativeMetadata?: Record<string, unknown>;
  
  // Sistema
  createdAt: string;
  updatedAt: string;
}

// DTO 1: Solo para visitantes públicos (Directorio y perfil público)
export type PublicMasterDTO = Pick<MasterProfile, 
  | 'masterId' 
  | 'displayName' 
  | 'publicSlug' 
  | 'professionalTitle' 
  | 'shortDescription' 
  | 'specialties' 
  | 'profileImageUrl' 
  | 'status'
>;

// DTO 2: Para el propio maestro (Incluye datos privados de contacto y estado de verificación, excluye metadata administrativa)
export type MasterOwnProfileDTO = Omit<MasterProfile, 'administrativeMetadata'>;

// DTO 3: Para ADMINISTRADOR / SUPER_ADMIN (Acceso completo)
export type AdminMasterDTO = MasterProfile;
