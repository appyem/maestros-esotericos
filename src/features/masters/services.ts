import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { z } from 'zod';

import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';

import type { MasterOwnProfileDTO, MasterProfile, PublicMasterDTO } from './types';

// ==========================================
// ESQUEMAS DE VALIDACIÓN ZOD
// ==========================================
const specialtySchema = z.enum([
  'TAROT', 'ASTROLOGIA', 'AMOR_RELACIONES', 'PROSPERIDAD', 'TRABAJO', 'ORIENTACION_ESPIRITUAL'
]);

const createMasterSchema = z.object({
  displayName: z.string().min(2).max(50),
  publicSlug: z.string().min(3).max(50).regex(/^[a-z0-9-]+$/, 'El slug solo puede contener letras minúsculas, números y guiones'),
  professionalTitle: z.string().min(2).max(100),
  shortDescription: z.string().max(200),
  professionalDescription: z.string().max(2000),
  specialties: z.array(specialtySchema).min(1).max(6),
  experienceDescription: z.string().max(1000),
  languages: z.array(z.string().min(2).max(50)).min(1),
  profileImageUrl: z.string().url().optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
});

const updateMasterSchema = createMasterSchema.partial();

// ==========================================
// SERVICIOS
// ==========================================

/**
 * Crea un perfil de maestro inicial para un usuario.
 * El estado inicial es siempre PENDING y NOT_STARTED.
 */
export async function createMasterProfile(userId: string, data: z.infer<typeof createMasterSchema>) {
  const validatedData = createMasterSchema.parse(data);
  const masterRef = doc(db, 'masters', userId);

  const existingDoc = await getDoc(masterRef);
  if (existingDoc.exists()) {
    throw new Error('MASTER_EXISTS: El perfil de maestro ya existe para este usuario.');
  }

  const slugQuery = query(collection(db, 'masters'), where('publicSlug', '==', validatedData.publicSlug));
  const slugSnapshot = await getDocs(slugQuery);
  if (!slugSnapshot.empty) {
    throw new Error('SLUG_TAKEN: El nombre profesional o slug ya está en uso.');
  }

  const newMaster: MasterProfile = {
    masterId: userId,
    userId,
    status: 'PENDING',
    onboardingStatus: 'IN_PROGRESS',
    ...validatedData,
    verification: {
      status: 'PENDING',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await setDoc(masterRef, newMaster);
  logger.info('MasterProfile creado', { userId, slug: validatedData.publicSlug });

  const { administrativeMetadata: _, ...ownProfile } = newMaster;
  return ownProfile as MasterOwnProfileDTO;
}

/**
 * Actualiza el perfil de un maestro.
 * Bloquea estrictamente la modificación de campos protegidos.
 */
export async function updateMasterProfile(userId: string, data: z.infer<typeof updateMasterSchema>) {
  const validatedData = updateMasterSchema.parse(data);
  const masterRef = doc(db, 'masters', userId);
  const masterDoc = await getDoc(masterRef);

  if (!masterDoc.exists()) {
    throw new Error('MASTER_NOT_FOUND: No se encontró el perfil de maestro.');
  }

  if (validatedData.publicSlug && validatedData.publicSlug !== masterDoc.data().publicSlug) {
    const slugQuery = query(collection(db, 'masters'), where('publicSlug', '==', validatedData.publicSlug));
    const slugSnapshot = await getDocs(slugQuery);
    if (!slugSnapshot.empty) {
      throw new Error('SLUG_TAKEN: El nuevo slug ya está en uso.');
    }
  }

  const updatePayload = {
    ...validatedData,
    updatedAt: new Date().toISOString(),
    onboardingStatus: 'SUBMITTED', 
  };

  await updateDoc(masterRef, updatePayload);
  logger.info('MasterProfile actualizado', { userId });

  const updatedDoc = await getDoc(masterRef);
  const updatedData = updatedDoc.data() as MasterProfile;
  
  const { administrativeMetadata: _, ...ownProfile } = updatedData;
  return ownProfile as MasterOwnProfileDTO;
}

/**
 * Obtiene el perfil público de un maestro por su slug.
 * Solo devuelve datos si el estado es ACTIVE.
 */
export async function getPublicMasterProfile(slug: string): Promise<PublicMasterDTO | null> {
  const q = query(collection(db, 'masters'), where('publicSlug', '==', slug));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return null;
  }

  const data = snapshot.docs[0].data() as MasterProfile;

  if (data.status !== 'ACTIVE') {
    return null;
  }

  return {
    masterId: data.masterId,
    displayName: data.displayName,
    publicSlug: data.publicSlug,
    professionalTitle: data.professionalTitle,
    shortDescription: data.shortDescription,
    specialties: data.specialties,
    profileImageUrl: data.profileImageUrl,
    status: data.status,
  };
}

/**
 * Obtiene el perfil completo (propio) de un maestro.
 */
export async function getOwnMasterProfile(userId: string): Promise<MasterOwnProfileDTO | null> {
  const masterRef = doc(db, 'masters', userId);
  const masterDoc = await getDoc(masterRef);

  if (!masterDoc.exists()) {
    return null;
  }

  const data = masterDoc.data() as MasterProfile;
  const { administrativeMetadata: _, ...ownProfile } = data;
  
  return ownProfile as MasterOwnProfileDTO;
}
