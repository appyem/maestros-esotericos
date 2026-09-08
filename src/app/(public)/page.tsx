import Link from 'next/link';

import { Button } from '@/components/ui/Button';

export const metadata = {
  title: 'Maestros Esotéricos | Consultas Profesionales y Orientación',
  description: 'Encuentra orientación profesional y discreta. Consultas de tarot, astrología y guía espiritual con inteligencia artificial y maestros reales. Comienza sin registro.',
  openGraph: {
    title: 'Maestros Esotéricos | Consultas Profesionales',
    description: 'Un espacio privado para encontrar orientación, comprensión y guía.',
    type: 'website',
    locale: 'es_ES',
  },
};

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center px-4 py-20 text-center sm:py-32">
        <div className="mx-auto max-w-3xl space-y-6">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            Encuentra orientación para lo que hoy te preocupa.
          </h1>
          <p className="text-lg text-foreground/70 sm:text-xl">
            Un espacio privado, discreto y profesional para conversar, comprender y encontrar guía a través de consultas esotéricas con inteligencia artificial y maestros reales.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/servicios">
              <Button variant="primary" size="lg">
                Conocer las consultas
              </Button>
            </Link>
            <Link href="/como-funciona">
              <Button variant="outline" size="lg">
                Cómo funciona
              </Button>
            </Link>
          </div>
          <p className="mt-4 text-sm text-foreground/50">
            ✦ Tu conversación es privada. Comienza sin registro.
          </p>
        </div>
      </section>

      {/* Servicios Preview */}
      <section className="bg-surface py-16 px-4">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-10 text-center text-3xl font-bold text-foreground">
            Áreas de orientación
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {['Tarot', 'Astrología', 'Amor y relaciones', 'Prosperidad', 'Trabajo', 'Orientación espiritual'].map((service) => (
              <div key={service} className="rounded-lg border border-border bg-surface-elevated p-6 shadow-sm transition-shadow hover:shadow-md">
                <h3 className="mb-2 text-xl font-semibold text-foreground">{service}</h3>
                <p className="text-sm text-foreground/60">
                  Obtén claridad y perspectiva sobre tu camino en esta área de tu vida.
                </p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/servicios">
              <Button variant="ghost">Ver todos los servicios →</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Confianza / Privacidad */}
      <section className="py-16 px-4">
        <div className="mx-auto max-w-4xl text-center space-y-6">
          <h2 className="text-3xl font-bold text-foreground">Tu privacidad es nuestra prioridad</h2>
          <p className="text-lg text-foreground/70">
            Sabemos que las consultas personales requieren un entorno de absoluta confianza. 
            Por eso, diseñamos nuestra plataforma para que puedas explorar y comenzar tu experiencia 
            de forma anónima, compartiendo únicamente la información con la que te sientas cómodo.
          </p>
          <Link href="/privacidad">
            <Button variant="outline">Conocer nuestra política de privacidad</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
