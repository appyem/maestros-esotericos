import { EmptyState } from '@/components/ui/EmptyState';

export default function MaestrosPage() {
  // En FASE 5+ esto vendrá de Firestore. Por ahora, estado vacío controlado.
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold text-foreground text-center">Nuestros Maestros</h1>
      <EmptyState
        title="Próximamente"
        description="Estamos seleccionando cuidadosamente a nuestros maestros y maestras para ofrecerte la mejor orientación profesional. Vuelve pronto."
      />
    </div>
  );
}
