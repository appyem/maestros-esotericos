import Link from 'next/link';

import { LoginForm } from '@/features/auth';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <LoginForm />
        <p className="text-center mt-4 text-sm text-foreground/70">
          ¿No tienes cuenta?{' '}
          <Link href="/register" className="text-primary hover:underline font-medium">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  );
}
