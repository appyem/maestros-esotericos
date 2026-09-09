# Procedimiento de Respuesta a Incidentes de Seguridad

## Fases de Respuesta

### 1. Detectar
- Monitoreo de alertas de seguridad (Firebase, Vercel, Analytics).
- Reportes de usuarios o equipos internos.
- Escaneo automático de dependencias o secretos.

### 2. Confirmar
- Validar si es un falso positivo o un incidente real.
- Clasificar severidad: CRITICAL, HIGH, MEDIUM, LOW.

### 3. Contener
- **Aislamiento**: Revocar tokens de sesión afectados (`revokeRefreshTokens` en Firebase Admin).
- **Acceso**: Deshabilitar cuentas de usuario o administradores comprometidos.
- **Red**: Si aplica, bloquear IPs maliciosas en el WAF o middleware.

### 4. Erradicar
- Rotar todas las credenciales potencialmente expuestas (API Keys, Webhook Secrets, Service Accounts).
- Aplicar parches de seguridad o correcciones de código.

### 5. Preservar Evidencia
- Exportar logs de auditoría (`auditLogs`) y registros de acceso relevantes antes de cualquier limpieza.
- Documentar la línea de tiempo del ataque.

### 6. Corregir y Verificar
- Implementar la solución en Staging y validar con pruebas de penetración defensivas.
- Desplegar en Producción.

### 7. Recuperar
- Restaurar servicios normales.
- Notificar a las partes afectadas si hubo fuga de datos personales (cumpliendo con la política de privacidad).

### 8. Documentar (Post-Mortem)
- Realizar un análisis de causa raíz (RCA).
- Actualizar este documento y las defensas del sistema para prevenir recurrencia.
