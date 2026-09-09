/**
 * Validador de Configuración de Producción
 * Se ejecuta al iniciar el servidor para asegurar que todas las variables críticas estén presentes.
 * NUNCA imprime los valores de las variables, solo sus nombres.
 */
import { logger } from '@/lib/logger';

const REQUIRED_ENV_VARS = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_APP_URL',
];

const REQUIRED_SERVER_ENV_VARS = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_PRIVATE_KEY',
];

export function validateProductionConfig() {
  const missingPublicVars = REQUIRED_ENV_VARS.filter(
    (key) => !process.env[key]
  );
  
  const missingServerVars = REQUIRED_SERVER_ENV_VARS.filter(
    (key) => !process.env[key]
  );

  if (missingPublicVars.length > 0 || missingServerVars.length > 0) {
    logger.error('ERROR CRÍTICO DE CONFIGURACIÓN: Faltan variables de entorno requeridas.');
    if (missingPublicVars.length > 0) {
      logger.error('Variables públicas faltantes: ' + missingPublicVars.join(', '));
    }
    if (missingServerVars.length > 0) {
      logger.error('Variables de servidor faltantes: ' + missingServerVars.join(', '));
    }
    logger.error('Por favor, configure estas variables en su entorno de despliegue (ej: Vercel).');
    
    // En producción, esto debería detener el inicio del servidor para evitar comportamientos inesperados.
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  } else {
    logger.info('Configuración de entorno validada correctamente.');
  }
}

// Ejecutar validación al importar el módulo en el servidor
if (typeof window === 'undefined') {
  validateProductionConfig();
}
