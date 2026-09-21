'use client';

import { 
  onAuthStateChanged, 
  signInAnonymously, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  type User 
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { auth, db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import type { AuthUser, SessionState, UserRole, UserStatus } from '@/types/auth';

interface AuthContextType {
  user: AuthUser | null;
  status: SessionState;
  signInAnon: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function mapFirebaseUserToAuthUser(firebaseUser: User): Promise<AuthUser> {
  let role: UserRole = firebaseUser.isAnonymous ? 'PUBLIC' : 'CLIENTE';
  let status: UserStatus = 'ACTIVE';

  if (!firebaseUser.isAnonymous) {
    try {
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        role = (data.role as UserRole) || 'CLIENTE';
        status = (data.status as UserStatus) || 'ACTIVE';
      }
    } catch (_error) {
      logger.error('Error al obtener perfil de usuario de Firestore', { uid: firebaseUser.uid });
    }
  }

  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    isAnonymous: firebaseUser.isAnonymous,
    emailVerified: firebaseUser.emailVerified,
    role,
    status,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<SessionState>('loading');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const mappedUser = await mapFirebaseUserToAuthUser(firebaseUser);
          setUser(mappedUser);
          setStatus('authenticated');
        } catch (_error) {
          logger.error('Error mapeando usuario de Firebase', { error: _error });
          setStatus('unauthenticated');
        }
      } else {
        setUser(null);
        setStatus('unauthenticated');
      }
    });

    return () => unsubscribe();
  }, []);

  const signInAnon = async () => {
    try {
      setStatus('loading');
      await signInAnonymously(auth);
      logger.info('Usuario autenticado de forma anónima');
    } catch (_error) {
      logger.error('Error en autenticación anónima', { error: _error });
      setStatus('unauthenticated');
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setStatus('loading');
      await signInWithEmailAndPassword(auth, email, password);
      logger.info('Usuario autenticado con email', { email });
    } catch (_error: unknown) {
      logger.error('Error en autenticación con email', { error: _error });
      setStatus('unauthenticated');
      throw _error;
    }
  };

  const signOut = async () => {
    try {
      setStatus('loading');
      await firebaseSignOut(auth);
      logger.info('Usuario cerró sesión');
    } catch (_error) {
      logger.error('Error al cerrar sesión', { error: _error });
    } finally {
      setStatus('unauthenticated');
    }
  };

  return (
    <AuthContext.Provider value={{ user, status, signInAnon, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}