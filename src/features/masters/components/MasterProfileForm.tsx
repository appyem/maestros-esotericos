'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/features/auth';
import { logger } from '@/lib/logger';

import { createMasterProfile, updateMasterProfile } from '../services';
import type { MasterOwnProfileDTO, MasterSpecialty } from '../types';

const SPECIALTIES: MasterSpecialty[] = [
  'TAROT', 'ASTROLOGIA', 'AMOR_RELACIONES', 'PROSPERIDAD', 'TRABAJO', 'ORIENTACION_ESPIRITUAL'
];

export function MasterProfileForm({ initialData }: { initialData?: MasterOwnProfileDTO }) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [displayName, setDisplayName] = useState(initialData?.displayName || '');
  const [publicSlug, setPublicSlug] = useState(initialData?.publicSlug || '');
  const [professionalTitle, setProfessionalTitle] = useState(initialData?.professionalTitle || '');
  const [shortDescription, setShortDescription] = useState(initialData?.shortDescription || '');
  const [professionalDescription, setProfessionalDescription] = useState(initialData?.professionalDescription || '');
  const [specialties, setSpecialties] = useState<MasterSpecialty[]>(initialData?.specialties || []);
  const [experienceDescription, setExperienceDescription] = useState(initialData?.experienceDescription || '');
  const [languages, setLanguages] = useState(initialData?.languages?.join(', ') || '');

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      const payload = {
        displayName,
        publicSlug,
        professionalTitle,
        shortDescription,
        professionalDescription,
        specialties,
        experienceDescription,
        languages: languages.split(',').map(l => l.trim()).filter(Boolean),
      };

      if (initialData) {
        await updateMasterProfile(user.uid, payload);
        setSuccess('Perfil actualizado correctamente. Queda pendiente de revisión.');
      } else {
        await createMasterProfile(user.uid, payload);
        setSuccess('Perfil creado correctamente. Queda pendiente de revisión administrativa.');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      logger.error('Error al guardar perfil de maestro', { err });
      setError(message.split(':')[1]?.trim() || message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSpecialty = (spec: MasterSpecialty) => {
    setSpecialties(prev => 
      prev.includes(spec) ? prev.filter(s => s !== spec) : [...prev, spec]
    );
  };

  return (
    <Card padding="lg">
      <h2 className="text-2xl font-bold mb-6 text-foreground">
        {initialData ? 'Editar Perfil Profesional' : 'Crear Perfil de Maestro'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="p-3 rounded-md bg-error/10 text-error text-sm" role="alert">{error}</div>}
        {success && <div className="p-3 rounded-md bg-success/10 text-success text-sm" role="status">{success}</div>}

        <Input label="Nombre Profesional" value={displayName} onChange={e => setDisplayName(e.target.value)} required disabled={isLoading} />
        <Input 
          label="Slug Público (URL)" 
          value={publicSlug} 
          onChange={e => setPublicSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))} 
          required 
          disabled={isLoading} 
          helperText="Ej: maria-garcia. Solo minúsculas, números y guiones." 
        />
        <Input label="Título Profesional" value={professionalTitle} onChange={e => setProfessionalTitle(e.target.value)} required disabled={isLoading} />
        
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground">Descripción Corta</label>
          <textarea 
            className="w-full min-h-[80px] rounded-md border border-border bg-surface px-4 py-2.5 text-foreground focus:outline-none focus:border-border-focus" 
            value={shortDescription} 
            onChange={e => setShortDescription(e.target.value)} 
            maxLength={200} 
            required 
            disabled={isLoading} 
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground">Especialidades</label>
          <div className="flex flex-wrap gap-2">
            {SPECIALTIES.map(spec => (
              <button
                key={spec}
                type="button"
                onClick={() => toggleSpecialty(spec)}
                className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                  specialties.includes(spec) 
                    ? 'bg-primary text-primary-foreground border-primary' 
                    : 'bg-surface border-border text-foreground/70 hover:border-primary'
                }`}
                disabled={isLoading}
              >
                {spec.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground">Descripción Profesional Completa</label>
          <textarea 
            className="w-full min-h-[120px] rounded-md border border-border bg-surface px-4 py-2.5 text-foreground focus:outline-none focus:border-border-focus" 
            value={professionalDescription} 
            onChange={e => setProfessionalDescription(e.target.value)} 
            maxLength={2000} 
            required 
            disabled={isLoading} 
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground">Experiencia</label>
          <textarea 
            className="w-full min-h-[100px] rounded-md border border-border bg-surface px-4 py-2.5 text-foreground focus:outline-none focus:border-border-focus" 
            value={experienceDescription} 
            onChange={e => setExperienceDescription(e.target.value)} 
            maxLength={1000} 
            required 
            disabled={isLoading} 
          />
        </div>

        <Input label="Idiomas (separados por coma)" value={languages} onChange={e => setLanguages(e.target.value)} required disabled={isLoading} helperText="Ej: Español, Inglés" />

        <Button type="submit" variant="primary" fullWidth isLoading={isLoading}>
          {initialData ? 'Guardar Cambios' : 'Crear Perfil y Enviar a Revisión'}
        </Button>
      </form>
    </Card>
  );
}
