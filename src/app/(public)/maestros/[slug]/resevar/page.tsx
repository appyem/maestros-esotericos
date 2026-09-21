'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Card } from '@/components/ui/Card';
import { Loading } from '@/components/ui/Loading';
import { getPublicAvailability, type PublicAvailabilitySlotDTO } from '@/features/agenda';
import { useAuth } from '@/features/auth';
import { getPublicMasterProfile, type PublicMasterDTO } from '@/features/masters';

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('es-CO', { weekday: 'short', day: 'numeric' }).format(date);
};

const formatTime = (isoString: string) => {
  return new Date(isoString).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: false });
};

const formatFullDate = (date: Date) => {
  return new Intl.DateTimeFormat('es-CO', { weekday: 'long', day: 'numeric', month: 'long' }).format(date);
};

export default function ReservarPage() {
  const params = useParams();
  const router = useRouter();
  const { user, status } = useAuth();
  const isAuthLoading = status === 'loading';
  const slug = params.slug as string;

  const [master, setMaster] = useState<PublicMasterDTO | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [slots, setSlots] = useState<PublicAvailabilitySlotDTO[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<PublicAvailabilitySlotDTO | null>(null);
  
  const [isFetchingMaster, setIsFetchingMaster] = useState(true);
  const [isFetchingSlots, setIsFetchingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });

  // Un solo useEffect para la carga inicial del maestro
  useEffect(() => {
    getPublicMasterProfile(slug)
      .then((data) => {
        if (!data) {
          router.push('/maestros');
        } else {
          setMaster(data);
          
          // Carga inicial de slots dentro del mismo flujo, evitando un segundo useEffect
          setIsFetchingSlots(true);
          const dateStr = new Date().toISOString().split('T')[0];
          getPublicAvailability(data.masterId, dateStr)
            .then((slotsData) => {
              setSlots(slotsData);
              setIsFetchingSlots(false);
            })
            .catch((err: unknown) => {
              console.error(err);
              setIsFetchingSlots(false);
            });
        }
      })
      .catch(console.error)
      .finally(() => setIsFetchingMaster(false));
  }, [slug, router]);

  // Manejador de evento para cambiar la fecha (EXENTO de la regla set-state-in-effect)
  const handleDateSelect = (day: Date) => {
    setSelectedDate(day);
    setSelectedSlot(null);
    setError(null);
    
    if (master) {
      setIsFetchingSlots(true);
      const dateStr = day.toISOString().split('T')[0];
      getPublicAvailability(master.masterId, dateStr)
        .then((slotsData) => {
          setSlots(slotsData);
          setIsFetchingSlots(false);
        })
        .catch((err: unknown) => {
          console.error(err);
          setIsFetchingSlots(false);
        });
    }
  };

  const handleConfirm = async () => {
    if (!user) {
      router.push(`/login?redirect=/maestros/${slug}/reservar`);
      return;
    }
    if (!selectedSlot || !master) return;

    setSubmitting(true);
    setError(null);

    try {
      const { createAppointment } = await import('@/features/agenda');
      await createAppointment(user.uid, {
        masterId: master.masterId,
        startAt: selectedSlot.startAt,
        endAt: selectedSlot.endAt,
        timezone: selectedSlot.timezone,
      });
      router.push('/client/dashboard?booking=success');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      if (errorMessage.includes('SLOT_TAKEN')) {
        setError('Ese horario acaba de ser ocupado. Por favor selecciona otro horario.');
        setSelectedSlot(null);
        if (master) {
          const dateStr = selectedDate.toISOString().split('T')[0];
          getPublicAvailability(master.masterId, dateStr).then(setSlots);
        }
      } else {
        setError('No se pudo procesar la reserva. Inténtalo de nuevo más tarde.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (isFetchingMaster || isAuthLoading) {
    return <Loading fullScreen message="Cargando..." />;
  }

  if (!master) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6">
        <button onClick={() => router.back()} className="text-sm text-foreground/60 hover:text-foreground mb-4">
          ← Volver al perfil
        </button>
        <h1 className="text-2xl font-bold text-foreground">Reservar con {master.displayName}</h1>
        <p className="text-foreground/70">{master.professionalTitle}</p>
      </div>

      <div className="space-y-6">
        <Card padding="md">
          <h2 className="text-lg font-semibold mb-4">1. Selecciona una fecha</h2>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {days.map((day) => {
              const isSelected = day.toDateString() === selectedDate.toDateString();
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => handleDateSelect(day)}
                  className={`flex-shrink-0 w-16 h-20 rounded-lg flex flex-col items-center justify-center border transition-all ${
                    isSelected
                      ? 'bg-primary border-primary text-primary-foreground'
                      : 'bg-secondary border-border text-foreground hover:border-primary/50'
                  }`}
                >
                  <span className="text-xs font-medium uppercase">{formatDate(day).split(' ')[0]}</span>
                  <span className="text-xl font-bold">{formatDate(day).split(' ')[1]}</span>
                </button>
              );
            })}
          </div>
        </Card>

        <Card padding="md">
          <h2 className="text-lg font-semibold mb-4">2. Selecciona un horario</h2>
          {isFetchingSlots ? (
            <Loading message="Cargando horarios..." />
          ) : slots.length === 0 ? (
            <p className="text-foreground/60 text-center py-4">No hay disponibilidad para esta fecha.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {slots.map((slot, idx) => {
                const time = formatTime(slot.startAt);
                const isSelected = selectedSlot?.startAt === slot.startAt;
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedSlot(slot)}
                    className={`py-3 px-4 rounded-lg border text-sm font-medium transition-all ${
                      isSelected
                        ? 'bg-primary border-primary text-primary-foreground'
                        : 'bg-card border-border text-foreground hover:border-primary/50 hover:bg-primary/5'
                    }`}
                  >
                    {time}
                  </button>
                );
              })}
            </div>
          )}
        </Card>

        {selectedSlot && (
          <Card padding="md" className="border-primary/30 bg-primary/5">
            <h2 className="text-lg font-semibold mb-4">3. Resumen de la reserva</h2>
            <div className="space-y-2 text-sm mb-6">
              <div className="flex justify-between">
                <span className="text-foreground/70">Maestro:</span>
                <span className="font-medium text-foreground">{master.displayName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground/70">Fecha:</span>
                <span className="font-medium text-foreground capitalize">{formatFullDate(selectedDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground/70">Hora:</span>
                <span className="font-medium text-foreground">
                  {formatTime(selectedSlot.startAt)} - {formatTime(selectedSlot.endAt)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground/70">Zona horaria:</span>
                <span className="font-medium text-foreground">{selectedSlot.timezone}</span>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm rounded-lg text-center">
                {error}
              </div>
            )}

            <button
              onClick={handleConfirm}
              disabled={submitting || !user}
              className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Procesando...' : !user ? 'Inicia sesión para reservar' : 'Confirmar Reserva'}
            </button>
            
            {!user && (
              <p className="text-xs text-center text-foreground/60 mt-3">
                Necesitas una cuenta para garantizar tu espacio.
              </p>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}