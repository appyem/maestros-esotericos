import { Card } from '@/components/ui/Card';

export default function ComoFuncionaPage() {
  const steps = [
    { num: '1', title: 'Explora', desc: 'Conoce nuestros servicios y elige el área en la que necesitas orientación.' },
    { num: '2', title: 'Comienza anónimamente', desc: 'No necesitas registrarte de inmediato. Puedes iniciar una preconsulta con total privacidad.' },
    { num: '3', title: 'Conecta con un maestro', desc: 'Si lo deseas, puedes agendar una consulta profunda con uno de nuestros profesionales verificados.' },
    { num: '4', title: 'Recibe guía', desc: 'Obtén respuestas claras, respetuosas y profesionales para tu camino.' },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="mb-12 text-3xl font-bold text-foreground text-center">Cómo funciona</h1>
      <div className="space-y-6">
        {steps.map((step) => (
          <Card key={step.num} padding="lg" className="flex gap-6 items-start">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
              {step.num}
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-2">{step.title}</h3>
              <p className="text-foreground/70">{step.desc}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
