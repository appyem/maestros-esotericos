'use client';

import { useEffect } from 'react';

import { Button } from '@/components/ui/Button';
import { ErrorState } from '@/components/ui/ErrorState';
import { logger } from '@/lib/logger';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log crítico seguro
    logger.security('Error crítico de la aplicación', {
      message: error.message,
      digest: error.digest,
    });
  }, [error]);

  return (
    <html lang="es">
      <body>
        <ErrorState
          title="Error crítico"
          message="Ha ocurrido un error grave. Por favor, recarga la página o contacta con soporte si el problema persiste."
          action={
            <Button onClick={reset} variant="primary">
              Recargar página
            </Button>
          }
        />
      </body>
    </html>
  );
}
