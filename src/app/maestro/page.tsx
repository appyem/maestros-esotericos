'use client';

import { useEffect, useState } from 'react';

import { AuthGuard } from '@/components/auth';
import { Card } from '@/components/ui/Card';
import { Loading } from '@/components/ui/Loading';
import { useAuth } from '@/features/auth';
import { getOwnMasterProfile, type MasterOwnProfileDTO } from '@/features/masters';
import { MasterProfileForm } from '@/features/masters/components/MasterProfileForm';

function MaestroDashboardContent() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<MasterOwnProfileDTO | null | undefined>(undefined);

  useEffect(() => {
    if (user) {
      getOwnMasterProfile(user.uid).then(setProfile).catch(() => setProfile(null));
    }
  }, [user]);

  if (profile === undefined) {
    return <Loading fullScreen message="Cargando perfil..." />;
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Panel de Maestro</h1>
          <p className="text-foreground/70">Gestiona tu perfil profesional y estado de verificación.</p>
        </div>

        {profile && (
          <Card padding="md" className="bg-surface-elevated">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-foreground/60">Estado del Perfil</p>
                <p className="font-semibold text-foreground capitalize">{profile.status.replace('_', ' ')}</p>
              </div>
              <div>
                <p className="text-sm text-foreground/60">Verificación</p>
                <p className="font-semibold text-foreground capitalize">{profile.verification.status.replace('_', ' ')}</p>
              </div>
            </div>
          </Card>
        )}

        <MasterProfileForm initialData={profile || undefined} />
      </div>
    </div>
  );
}

export default function MaestroDashboardPage() {
  return (
    <AuthGuard>
      <MaestroDashboardContent />
    </AuthGuard>
  );
}
