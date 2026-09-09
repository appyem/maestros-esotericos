# Manual de Operaciones (Runbook)

## Despliegue (Deployment)
1. Fusionar cambios a la rama `main` mediante Pull Request aprobada.
2. GitHub Actions ejecuta: `lint`, `typecheck`, `tests`, `build`.
3. Vercel despliega automáticamente en el entorno de Producción.
4. Ejecutar Smoke Tests manuales o automatizados.

## Rollback
1. Ir al Dashboard de Vercel → Proyecto → `Deployments`.
2. Identificar el último despliegue estable (marcado como `Production`).
3. Clic en `...` → `Rollback`.
4. Verificar que el sitio funcione correctamente.

## Solución de Problemas Comunes (Troubleshooting)
- **"Usuarios no pueden iniciar sesión"**: Verificar estado de Firebase Auth y que las credenciales de Firebase en Vercel sean correctas.
- **"Pagos fallidos"**: Revisar logs de Vercel para errores de webhook. Verificar que la clave secreta del proveedor de pagos no haya expirado.
- **"IA no responde"**: Verificar cuotas del proveedor de IA y logs de `AI_PROVIDER_ERROR`. Revisar si el Rate Limiting está bloqueando solicitudes legítimas.
- **"Sitio lento"**: Revisar métricas de Vercel Analytics. Verificar consultas de Firestore sin índices o componentes de React con renders innecesarios.

## Rotación de Secretos
1. Generar nueva credencial en el panel del proveedor.
2. Actualizar la variable de entorno en Vercel.
3. Desplegar la aplicación (Vercel reinicia los servidores con las nuevas variables).
4. Revocar la credencial antigua en el panel del proveedor.
