import { Card } from '@/components/ui/Card';

export default function ServiciosPage() {
  const services = [
    { title: 'Tarot', desc: 'Lecturas para obtener claridad sobre situaciones presentes y futuras.' },
    { title: 'Astrología', desc: 'Análisis de tu carta natal y tránsitos planetarios para entender tu camino.' },
    { title: 'Amor y relaciones', desc: 'Orientación sobre vínculos, compatibilidad y dinámicas de pareja.' },
    { title: 'Prosperidad', desc: 'Guidance para desbloquear creencias limitantes sobre el dinero y el trabajo.' },
    { title: 'Orientación espiritual', desc: 'Conexión con tu propósito y herramientas para el crecimiento interior.' },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold text-foreground text-center">Nuestros Servicios</h1>
      <div className="grid gap-6 md:grid-cols-2">
        {services.map((s) => (
          <Card key={s.title} padding="lg">
            <h2 className="text-xl font-semibold text-foreground mb-2">{s.title}</h2>
            <p className="text-foreground/70">{s.desc}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
