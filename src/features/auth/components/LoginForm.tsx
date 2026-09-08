'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { logger } from '@/lib/logger';

import { loginWithEmail } from '../services/authService';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await loginWithEmail(email, password);
      // Redirección controlada post-login (se puede ajustar según el rol en el futuro)
      router.push('/');
      router.refresh();
    } catch (err: unknown) {
      logger.error('Error en formulario de login', { err });
      // Mensaje genérico por seguridad: no revelar si el email existe o no
      setError('Credenciales inválidas. Por favor, verifica tu correo y contraseña.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card padding="lg" className="w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-center text-foreground mb-6">
        Iniciar Sesión
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-md bg-error/10 text-error text-sm text-center" role="alert">
            {error}
          </div>
        )}

        <Input
          label="Correo electrónico"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          disabled={isLoading}
        />

        <Input
          label="Contraseña"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          disabled={isLoading}
        />

        <Button type="submit" variant="primary" fullWidth isLoading={isLoading}>
          Ingresar
        </Button>
      </form>
    </Card>
  );
}
