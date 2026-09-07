import { sanitizeData } from './sanitize';

type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'SECURITY';

const LOG_LEVELS: Record<LogLevel, number> = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  SECURITY: 4,
};

const CURRENT_LEVEL: LogLevel =
  (process.env.NODE_ENV === 'production' ? 'INFO' : 'DEBUG') as LogLevel;

/**
 * Logger seguro que sanitiza automáticamente datos sensibles
 * Uso: logger.info('Usuario autenticado', { userId: '123', token: 'abc' })
 * Resultado: { userId: '123', token: '[REDACTED]' }
 */
export const logger = {
  debug(message: string, data?: unknown) {
    if (LOG_LEVELS.DEBUG >= LOG_LEVELS[CURRENT_LEVEL]) {
      console.debug(`[DEBUG] ${message}`, sanitizeData(data));
    }
  },

  info(message: string, data?: unknown) {
    if (LOG_LEVELS.INFO >= LOG_LEVELS[CURRENT_LEVEL]) {
      console.info(`[INFO] ${message}`, sanitizeData(data));
    }
  },

  warn(message: string, data?: unknown) {
    if (LOG_LEVELS.WARN >= LOG_LEVELS[CURRENT_LEVEL]) {
      console.warn(`[WARN] ${message}`, sanitizeData(data));
    }
  },

  error(message: string, data?: unknown) {
    if (LOG_LEVELS.ERROR >= LOG_LEVELS[CURRENT_LEVEL]) {
      console.error(`[ERROR] ${message}`, sanitizeData(data));
    }
  },

  security(message: string, data?: unknown) {
    if (LOG_LEVELS.SECURITY >= LOG_LEVELS[CURRENT_LEVEL]) {
      console.error(`[SECURITY] ${message}`, sanitizeData(data));
    }
  },
};
