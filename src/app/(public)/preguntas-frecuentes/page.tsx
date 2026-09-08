import { Card } from '@/components/ui/Card';

export default function FAQPage() {
  const faqs = [
    { q: '¿Necesito registrarme para empezar?', a: 'No. Puedes iniciar una experiencia de orientación inicial de forma anónima. El registro solo es necesario si deseas agendar con un maestro o guardar tu historial.' },
    { q: '¿Mis consultas son privadas?', a: 'Absolutamente. Tu privacidad es nuestra prioridad. Las conversaciones están protegidas y no son compartidas con terceros.' },
    { q: '¿Las consultas sustituyen a un profesional de la salud?', a: 'No. Nuestros servicios son de orientación espiritual y entretenimiento. No sustituyen el diagnóstico o tratamiento médico, psicológico o legal profesional.' },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold text-foreground text-center">Preguntas Frecuentes</h1>
      <div className="space-y-4">
        {faqs.map((faq, i) => (
          <Card key={i} padding="lg">
            <h3 className="font-semibold text-foreground mb-2">{faq.q}</h3>
            <p className="text-foreground/70">{faq.a}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
