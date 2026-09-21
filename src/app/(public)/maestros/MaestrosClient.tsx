'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Card } from '@/components/ui/Card';
import { Loading } from '@/components/ui/Loading';
import { getActiveMasters, type MasterSpecialty, type PublicMasterDTO } from '@/features/masters';

const SPECIALTIES: { value: MasterSpecialty | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'Todas' },
  { value: 'TAROT', label: 'Tarot' },
  { value: 'ASTROLOGIA', label: 'Astrología' },
  { value: 'AMOR_RELACIONES', label: 'Amor y Relaciones' },
  { value: 'PROSPERIDAD', label: 'Prosperidad' },
  { value: 'TRABAJO', label: 'Trabajo' },
  { value: 'ORIENTACION_ESPIRITUAL', label: 'Orientación Espiritual' },
];

export default function MaestrosClient() {
  const searchParams = useSearchParams();
  const initialSpecialty = (searchParams.get('specialty') as MasterSpecialty) || 'ALL';
  
  const [masters, setMasters] = useState<PublicMasterDTO[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [filter, setFilter] = useState<MasterSpecialty | 'ALL'>(initialSpecialty);

  useEffect(() => {
    const specialtyParam = filter === 'ALL' ? undefined : filter;
    getActiveMasters(specialtyParam)
      .then((data: PublicMasterDTO[]) => {
        setMasters(data);
        setIsFetching(false);
      })
      .catch((err: unknown) => {
        console.error(err);
        setIsFetching(false);
      });
  }, [filter]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-foreground">Nuestros Maestros</h1>
        <p className="mt-2 text-foreground/70">Profesionales verificados listos para orientarte.</p>
      </div>

      <div className="mb-8 flex flex-wrap justify-center gap-2">
        {SPECIALTIES.map((spec) => (
          <button
            key={spec.value}
            onClick={() => setFilter(spec.value)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
              filter === spec.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            {spec.label}
          </button>
        ))}
      </div>

      {isFetching ? (
        <Loading fullScreen message="Cargando maestros..." />
      ) : masters.length === 0 ? (
        <div className="text-center py-12 text-foreground/60">
          No se encontraron maestros con esta especialidad en este momento.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {masters.map((master) => (
            <Link key={master.masterId} href={`/maestros/${master.publicSlug}`} className="group">
              <Card padding="md" className="h-full transition-all hover:shadow-lg hover:border-primary/50">
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4 h-24 w-24 overflow-hidden rounded-full bg-secondary relative">
                    {master.profileImageUrl ? (
                      <Image src={master.profileImageUrl} alt={master.displayName} fill className="object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-foreground/30">
                        {master.displayName.charAt(0)}
                      </div>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                    {master.displayName}
                  </h3>
                  <p className="text-sm text-primary font-medium mb-3">{master.professionalTitle}</p>
                  <p className="text-sm text-foreground/70 line-clamp-2 mb-4">{master.shortDescription}</p>
                  <div className="flex flex-wrap justify-center gap-1.5">
                    {master.specialties.slice(0, 3).map((spec) => (
                      <span key={spec} className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                        {spec.replace('_', ' ')}
                      </span>
                    ))}
                    {master.specialties.length > 3 && (
                      <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs">
                        +{master.specialties.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
