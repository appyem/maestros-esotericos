/**
 * Importa las funciones y el SDK de Admin
 */
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

// Inicializar Admin SDK (solo se ejecuta en el entorno de Cloud Functions)
admin.initializeApp();

/**
 * Ejemplo de función futura: Webhook de pagos
 * Esta función se ejecuta en el backend y NUNCA expone claves al cliente.
 */
export const onPaymentWebhook = functions.https.onRequest(async (req, res) => {
  // TODO: Implementar validación de firma del proveedor de pagos
  // TODO: Validar estado de la transacción con el proveedor
  // TODO: Actualizar Firestore de forma segura
  
  res.status(200).send({ received: true });
});

/**
 * Ejemplo de función futura: Limpieza de sesiones de IA expiradas
 */
export const cleanupExpiredAiSessions = functions.pubsub.schedule('every 24 hours').onRun(async (_context) => {
  // TODO: Consultar y eliminar documentos de aiSessions antiguos
  functions.logger.info('Limpieza de sesiones ejecutada');
  return null;
});
