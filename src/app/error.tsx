'use client';

import { useEffect } from 'react';

import { Button } from '@/components/ui/Button';
import { ErrorState } from '@/components/ui/ErrorState';
import { logger } from '@/lib/logger';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log seguro del error (sanitiza automáticamente datos sensibles)
    logger.error('Error de aplicación', {
      message: error.message,
      digest: error.digest,
    });
  }, [error]);

  return (
    <ErrorState
      title="Algo salió mal"
      message="Ha ocurrido un error inesperado. Por favor, intenta de nuevo."
      action={
        <Button onClick={reset} variant="primary">
          Intentar de nuevo
        </Button>
      }
    />
  );
}
