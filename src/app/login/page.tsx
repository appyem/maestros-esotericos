'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/features/auth';
import { logger } from '@/lib/logger';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, status, signInAnon } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mode = searchParams.get('mode');

  const handleAnonymousLogin = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signInAnon();
      logger.info('Login anónimo exitoso desde página de login');
    } catch (err) {
      logger.error('Error en login anónimo', { err });
      setError('No se pudo iniciar sesión como invitado. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  }, [signInAnon]);

  useEffect(() => {
    if (mode === 'anon' && status === 'unauthenticated') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      handleAnonymousLogin();
    }
  }, [mode, status, handleAnonymousLogin]);

  useEffect(() => {
    if (status === 'authenticated' && user) {
      router.push('/client/dashboard');
    }
  }, [status, user, router]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    logger.info('Login con email intentado', { email });
    setError('El login con email estará disponible próximamente. Usa "Continuar como invitado".');
    setIsLoading(false);
  };

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-foreground/70">Cargando sesión...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <Card padding="lg" className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-serif font-bold text-foreground">Bienvenido</h1>
          <p className="mt-2 text-foreground/70">
            Accede a tu espacio de orientación personal
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive" role="alert">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <Button
            variant="primary"
            fullWidth
            isLoading={isLoading}
            onClick={handleAnonymousLogin}
            disabled={status === 'authenticated'}
          >
            Continuar como invitado
          </Button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">O</span>
            </div>
          </div>

          <form onSubmit={handleEmailLogin} className="space-y-4">
            <Input
              label="Correo electrónico"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
            <Input
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
            <Button type="submit" variant="outline" fullWidth isLoading={isLoading} disabled={isLoading}>
              Ingresar con correo
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <Link href="/register" className="text-primary hover:underline">
              ¿No tienes cuenta? Regístrate
            </Link>
          </div>

          <div className="text-center">
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
              ← Volver al inicio
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-foreground/70">Cargando...</p>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
