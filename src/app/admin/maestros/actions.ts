'use server';

import { revalidatePath } from 'next/cache';

import { reviewMasterApplication } from '@/features/admin/adminServices';
import type { UserRole } from '@/features/admin/types';

async function getCurrentAdminUser(): Promise<{ uid: string; role: UserRole }> {
  // TEMPORAL: Reemplace esto con su lógica real de obtención de sesión en el servidor.
  return { 
    uid: 'CURRENT_ADMIN_UID', 
    role: 'ADMINISTRATOR' as UserRole 
  };
}

export async function reviewMasterAction(
  masterId: string, 
  action: 'APPROVE' | 'REJECT', 
  reason: string
) {
  try {
    const user = await getCurrentAdminUser();
    
    await reviewMasterApplication(user.uid, user.role, masterId, action, reason);
    
    revalidatePath('/admin/maestros');
    
    return { success: true };
  } catch (error) {
    console.error('Error al revisar maestro:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido al procesar la solicitud' 
    };
  }
}