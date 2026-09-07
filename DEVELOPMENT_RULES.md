# Reglas de Desarrollo

1. **SEGURIDAD**: NUNCA commitear archivos `.env` reales ni claves privadas.
2. **TIPOS**: Prohibido usar `any` en TypeScript. Usar interfaces o tipos específicos.
3. **LOGGING**: Usar siempre `import { logger } from '@/lib/logger'`. NUNCA usar `console.log` directo.
4. **ESTILO**: Usar las variables de diseño (ej: `bg-primary`, `text-foreground`) definidas en `globals.css`.
5. **TESTS**: Todo componente nuevo debe tener su prueba básica en `tests/`.
6. **COMMITS**: Usar formato `tipo: descripción` (ej: `feat: agregar login`, `fix: corregir botón`).