# Checklist de Preparación para Producción

## Entorno y Configuración
- [ ] Variables de entorno de Producción configuradas en Vercel (sin secretos en Git).
- [ ] `NEXT_PUBLIC_*` revisado (sin secretos expuestos).
- [ ] Validador de configuración ejecutado sin errores.

## Firebase
- [ ] Proyecto de Firebase de Producción seleccionado.
- [ ] Firestore Security Rules verificadas (DENY BY DEFAULT).
- [ ] Storage Security Rules verificadas (MIME, tamaño, ownership).
- [ ] Firebase App Check habilitado para Web.
- [ ] Índices de Firestore creados y verificados.
- [ ] Backups automáticos de Firestore habilitados (Plan Blaze).

## Autenticación y Roles
- [ ] Verificación de correo electrónico habilitada (si aplica).
- [ ] Cuentas de prueba eliminadas o aisladas.
- [ ] SUPER_ADMIN con MFA configurado y documentado.

## Despliegue y Dominio
- [ ] Dominio personalizado configurado en Vercel.
- [ ] HTTPS forzado y certificado SSL activo.
- [ ] Redirects HTTP → HTTPS y WWW ↔ No-WWW configurados.

## Integraciones
- [ ] Webhooks de pagos configurados con verificación de firma.
- [ ] Proveedor de IA con límites de tasa (Rate Limiting) y timeout.
- [ ] Notificaciones (WhatsApp/Email) con plantillas aprobadas y consentimiento.

## Monitoreo y Resiliencia
- [ ] Health checks configurados.
- [ ] Alertas de errores críticos y caídas de proveedores activas.
- [ ] Modo de Mantenimiento probado.
- [ ] Procedimiento de Rollback documentado y probado en Staging.

## Legal y Privacidad
- [ ] Páginas de Privacidad y Términos accesibles y actualizadas.
- [ ] Cookies configuradas con `Secure`, `HttpOnly`, `SameSite`.
- [ ] No indexación de rutas privadas (`/admin`, `/super-admin`, `/client`) verificada en `robots.txt`.
