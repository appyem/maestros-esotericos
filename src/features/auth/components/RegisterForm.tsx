'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { logger } from '@/lib/logger';

import { registerWithEmail } from '../services/authService';

export function RegisterForm() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await registerWithEmail(email, password, displayName);
      router.push('/');
      router.refresh();
    } catch (err: unknown) {
      logger.error('Error en formulario de registro', { err });
      // Mensaje genérico para evitar enumeración de usuarios
      setError('No se pudo completar el registro. Verifica que el correo no esté ya en uso.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card padding="lg" className="w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-center text-foreground mb-6">
        Crear Cuenta
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-md bg-error/10 text-error text-sm text-center" role="alert">
            {error}
          </div>
        )}

        <Input
          label="Nombre completo"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
          autoComplete="name"
          disabled={isLoading}
        />

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
          minLength={8}
          autoComplete="new-password"
          disabled={isLoading}
          helperText="Mínimo 8 caracteres"
        />

        <Button type="submit" variant="primary" fullWidth isLoading={isLoading}>
          Registrarse
        </Button>
      </form>
    </Card>
  );
}
