/**
 * Sanitiza datos sensibles antes de registrarlos en logs
 * Nunca registrar: contraseñas, tokens, cookies, datos bancarios, contenido de consultas
 */

const SENSITIVE_KEYS = [
  'password',
  'token',
  'apiKey',
  'api_key',
  'secret',
  'authorization',
  'cookie',
  'creditCard',
  'credit_card',
  'cvv',
  'ssn',
  'consultation',
  'message',
  'chat',
  'conversation',
];

const SENSITIVE_PATTERNS = [
  /eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+/g, // JWT tokens
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // Emails
  /\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/g, // Credit cards
];

/**
 * Sanitiza un objeto eliminando o enmascarando datos sensibles
 */
export function sanitizeData(data: unknown, depth = 0): unknown {
  if (depth > 5) return '[MAX_DEPTH]';
  if (data === null || data === undefined) return data;
  if (typeof data === 'string') {
    let sanitized = data;
    for (const pattern of SENSITIVE_PATTERNS) {
      sanitized = sanitized.replace(pattern, '[REDACTED]');
    }
    return sanitized;
  }
  if (typeof data !== 'object') return data;

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeData(item, depth + 1));
  }

  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_KEYS.some((sk) => lowerKey.includes(sk))) {
      sanitized[key] = '[REDACTED]';
    } else {
      sanitized[key] = sanitizeData(value, depth + 1);
    }
  }
  return sanitized;
}
