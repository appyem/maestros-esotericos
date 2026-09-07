import { initializeApp, getApps, getApp } from 'firebase/app';

// Verificamos que las variables de entorno existan
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Validación de seguridad: si falta alguna variable crítica, lanzamos error en desarrollo
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('[FIREBASE] Faltan variables de entorno críticas de Firebase.');
}

// Inicializamos Firebase solo si no existe una instancia previa
// Esto evita errores de "Firebase App named '[DEFAULT]' already exists" en Next.js (Hot Reload)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export { app };
