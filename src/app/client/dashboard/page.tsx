'use client';

import { AuthGuard } from '@/components/auth';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/features/auth';

function DashboardContent() {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <Card padding="lg">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Panel de Cliente
          </h1>
          <p className="text-foreground/70 mb-6">
            Bienvenido, {user?.displayName || user?.email || 'Usuario'}
          </p>
          <div className="space-y-2">
            <p>
              <strong>UID:</strong> {user?.uid}
            </p>
            <p>
              <strong>Email:</strong> {user?.email || 'No proporcionado'}
            </p>
            <p>
              <strong>Rol:</strong> {user?.role}
            </p>
            <p>
              <strong>Estado:</strong> {user?.status}
            </p>
            <p>
              <strong>Anónimo:</strong> {user?.isAnonymous ? 'Sí' : 'No'}
            </p>
          </div>
          <Button onClick={signOut} variant="outline" className="mt-6">
            Cerrar Sesión
          </Button>
        </Card>
      </div>
    </div>
  );
}

export default function ClientDashboardPage() {
  return (
    <AuthGuard requiredRole="CLIENTE">
      <DashboardContent />
    </AuthGuard>
  );
}
