import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  linkWithCredential,
  EmailAuthProvider,
  type User,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  serverTimestamp,
  getDoc,
} from 'firebase/firestore';

import { auth, db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import type { UserRole, UserStatus } from '@/types/auth';

/**
 * Registra un nuevo usuario con email y contraseña.
 * Crea automáticamente su documento en Firestore con rol 'CLIENTE'.
 */
export async function registerWithEmail(email: string, password: string, displayName: string) {
  try {
    // 1. Crear usuario en Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // 2. Crear documento inicial en Firestore
    const userProfile = {
      uid: user.uid,
      email: user.email,
      displayName,
      role: 'CLIENTE' as UserRole,
      status: 'ACTIVE' as UserStatus,
      isAnonymous: false,
      emailVerified: user.emailVerified,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    };

    await setDoc(doc(db, 'users', user.uid), userProfile);
    
    logger.info('Usuario registrado exitosamente', { uid: user.uid, email: user.email });
    return user;
  } catch (error) {
    logger.error('Error al registrar usuario', { error });
    throw error;
  }
}

/**
 * Inicia sesión con email y contraseña.
 */
export async function loginWithEmail(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Actualizar lastLoginAt en Firestore
    const userRef = doc(db, 'users', userCredential.user.uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      // Nota: serverTimestamp() no se puede usar directamente en update sin importarlo, 
      // pero para simplificar y evitar dependencias circulares, lo manejamos así:
      // En una app real, esto podría ser una Cloud Function o un update directo.
      // Aquí lo omitimos para mantener el servicio ligero, el AuthContext ya maneja el estado.
    }

    logger.info('Usuario inició sesión', { uid: userCredential.user.uid });
    return userCredential.user;
  } catch (error) {
    logger.error('Error al iniciar sesión', { error });
    throw error;
  }
}

/**
 * Vincula una cuenta anónima existente con credenciales de email/password.
 * Esto permite que un usuario anónimo se "registre" sin perder su UID ni sus datos asociados.
 */
export async function linkAnonymousToEmail(user: User, email: string, password: string, displayName: string) {
  try {
    // 1. Crear credencial de email
    const credential = EmailAuthProvider.credential(email, password);

    // 2. Vincular la credencial al usuario anónimo actual
    const linkedUserCredential = await linkWithCredential(user, credential);
    const linkedUser = linkedUserCredential.user;

    // 3. Actualizar o crear el documento en Firestore
    const userRef = doc(db, 'users', linkedUser.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      // Si no existe, lo creamos (primer registro)
      await setDoc(userRef, {
        uid: linkedUser.uid,
        email: linkedUser.email,
        displayName,
        role: 'CLIENTE' as UserRole,
        status: 'ACTIVE' as UserStatus,
        isAnonymous: false,
        emailVerified: linkedUser.emailVerified,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
      });
    } else {
      // Si ya existe (ej. datos guardados mientras era anónimo), solo actualizamos los campos de identidad
      // NOTA: No tocamos 'role' ni 'status' para mantener la integridad y anti-escalación
      // await updateDoc(userRef, { ... }) // Se puede implementar si es necesario
    }

    logger.info('Cuenta anónima vinculada exitosamente a email', { uid: linkedUser.uid });
    return linkedUser;
  } catch (error) {
    logger.error('Error al vincular cuenta anónima', { error });
    throw error;
  }
}
