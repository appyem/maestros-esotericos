# Plan de Recuperación y Continuidad del Negocio (BCP)

## Objetivos
- **RTO (Recovery Time Objective)**: 4 horas (Tiempo máximo para restaurar el servicio crítico).
- **RPO (Recovery Point Objective)**: 24 horas (Pérdida máxima de datos aceptable, respaldado por backups diarios de Firestore).

## Escenarios de Recuperación

### 1. Caída de Firebase (Firestore/Auth/Storage)
- **Detección**: Alertas de Vercel/Firebase o monitoreo de Health Checks.
- **Contención**: Activar "Modo de Mantenimiento" en Vercel Environment Variables (`MAINTENANCE_MODE=true`).
- **Recuperación**: Verificar estado en [status.firebase.google.com](https://status.firebase.google.com). Si es incidente de Google, esperar resolución. Si es configuración, revertir últimos cambios en Firebase Console.
- **Verificación**: Ejecutar Smoke Tests de login y lectura de productos públicos.

### 2. Caída de Vercel / Frontend
- **Detección**: Monitoreo de Uptime (ej: Pingdom, UptimeRobot).
- **Contención**: No acción inmediata si es falla global de Vercel.
- **Recuperación**: Revertir a la última versión estable de producción desde el Dashboard de Vercel (`Deployments` → `...` → `Rollback`).
- **Verificación**: Acceder a la URL de producción y verificar carga de la Landing Page.

### 3. Caída del Proveedor de IA
- **Detección**: Aumento de `AI_PROVIDER_ERROR` en logs y métricas de Analytics.
- **Contención**: El sistema debe degradar elegantemente (Fallback a mensaje: "Nuestros maestros están disponibles para atenderte directamente").
- **Recuperación**: Verificar cuotas y estado del proveedor. Si es necesario, cambiar la variable de entorno `AI_PROVIDER` al proveedor secundario (si está configurado) y reiniciar funciones.

### 4. Caída del Proveedor de Pagos
- **Detección**: Aumento de `PAYMENT_PROVIDER_ERROR` o webhooks no recibidos.
- **Contención**: Desactivar temporalmente el checkout en la tienda (`NEW_ORDERS_ENABLED=false` vía Feature Flag).
- **Recuperación**: Contactar soporte del proveedor. Verificar credenciales y estado de la cuenta.

### 5. Pérdida o Corrupción de Datos
- **Detección**: Reportes de usuarios o alertas de integridad.
- **Contención**: Revocar acceso de escritura a la colección afectada mediante Security Rules temporales.
- **Recuperación**: Solicitar restauración de backup de Firestore desde la consola de Google Cloud (disponible para proyectos Blaze). **NO restaurar sobre producción sin aislar primero**.

### 6. Incidente de Seguridad / Secreto Comprometido
- **Detección**: Alertas de GitHub Secret Scanning, Firebase App Check o logs de acceso anómalo.
- **Contención**: Revocar inmediatamente la clave comprometida en el panel del proveedor.
- **Recuperación**: Generar nueva clave, actualizar variables de entorno en Vercel y realizar un nuevo despliegue. Auditar logs de acceso durante el periodo de exposición.
