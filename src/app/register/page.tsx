import Link from 'next/link';

import { RegisterForm } from '@/features/auth';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <RegisterForm />
        <p className="text-center mt-4 text-sm text-foreground/70">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-primary hover:underline font-medium">
            Inicia sesión aquí
          </Link>
        </p>
      </div>
    </div>
  );
}
