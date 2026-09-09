import Link from 'next/link';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Hero Section */}
      <main className="flex-1 pt-24">
        <section className="relative flex flex-col items-center justify-center px-4 py-24 sm:py-32 lg:py-40 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background -z-10" />
          <h1 className="max-w-4xl text-4xl font-serif font-bold tracking-tight sm:text-6xl mb-6">
            Orientación espiritual y <span className="text-primary">conocimiento ancestral</span> al alcance de tu mano.
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground mb-10">
            Conecta con maestros verificados, agenda consultas personalizadas y descubre herramientas para tu camino interior. Todo en una plataforma segura, privada y profesional.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/register">
              <Button variant="primary" size="lg" className="text-base px-8">
                Comenzar mi camino
              </Button>
            </Link>
            <Link href="/maestros">
              <Button variant="outline" size="lg" className="text-base px-8">
                Explorar maestros
              </Button>
            </Link>
          </div>
        </section>

        {/* Características Principales */}
        <section className="border-t border-border bg-secondary/30 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-serif font-bold text-center mb-12">Una experiencia integral</h2>
            <div className="grid gap-8 md:grid-cols-3">
              <Card padding="lg" className="text-center bg-card/50">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-2xl text-primary">🔮</div>
                <h3 className="text-xl font-semibold mb-2">Consultas con IA y Humanos</h3>
                <p className="text-muted-foreground">
                  Inicia con nuestra IA para clarificar tus dudas y, si lo deseas, transfiere tu consulta a un maestro experto con todo el contexto preservado.
                </p>
              </Card>
              <Card padding="lg" className="text-center bg-card/50">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-2xl text-primary">🛡️</div>
                <h3 className="text-xl font-semibold mb-2">Privacidad y Seguridad</h3>
                <p className="text-muted-foreground">
                  Tus conversaciones y datos están protegidos con encriptación de nivel empresarial. Tú controlas qué información se comparte.
                </p>
              </Card>
              <Card padding="lg" className="text-center bg-card/50">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-2xl text-primary">🛍️</div>
                <h3 className="text-xl font-semibold mb-2">Tienda Esotérica</h3>
                <p className="text-muted-foreground">
                  Adquiere kits, productos digitales y servicios complementarios recomendados éticamente para acompañar tu proceso.
                </p>
              </Card>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-12 bg-secondary/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-xl text-primary">✦</span>
            <span className="font-serif font-bold">Maestros Esotéricos</span>
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="/privacidad" className="hover:text-foreground">Privacidad</Link>
            <Link href="/terminos" className="hover:text-foreground">Términos</Link>
            <Link href="/contacto" className="hover:text-foreground">Contacto</Link>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Maestros Esotéricos. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
