import Link from 'next/link';

import { Button } from '@/components/ui/Button';

export default function PublicHome() {
  return (
    <section className="relative flex flex-col items-center justify-center px-4 py-24 sm:py-32 lg:py-40 text-center flex-1">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background -z-10" />
      <h1 className="max-w-4xl text-4xl font-serif font-bold tracking-tight sm:text-6xl mb-6">
        Claridad espiritual y <span className="text-primary">conocimiento ancestral</span> al alcance de tu mano.
      </h1>
      <p className="max-w-2xl text-lg text-muted-foreground mb-10">
        Inicia una conversación inmediata con nuestra guía de IA, sin registro. 
        Cuando estés listo, transfiere tu consulta a un maestro humano verificado.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/servicios">
          <Button variant="primary" size="lg" className="text-base px-10 py-6 text-lg shadow-lg hover:shadow-xl transition-all">
            Iniciar Orientación Gratuita
          </Button>
        </Link>
        <Link href="/maestros">
          <Button variant="outline" size="lg" className="text-base px-10 py-6 text-lg">
            Explorar Maestros
          </Button>
        </Link>
      </div>
    </section>
  );
}
