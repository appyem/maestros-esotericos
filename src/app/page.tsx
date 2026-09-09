import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section con Degradado Místico */}
      <section className="relative flex flex-col items-center justify-center px-4 py-24 text-center sm:py-32 bg-gradient-mystic">
        {/* Efecto de brillo sutil de fondo */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="relative mx-auto max-w-4xl space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-1.5 text-sm text-accent backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
            </span>
            Orientación disponible 24/7
          </div>
          
          <h1 className="text-5xl font-serif font-bold tracking-tight text-foreground sm:text-6xl md:text-7xl text-balance">
            Encuentra claridad en <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">tu camino</span>
          </h1>
          
          <p className="text-lg text-muted-foreground sm:text-xl max-w-2xl mx-auto text-balance leading-relaxed">
            Un espacio privado, discreto y profesional para conversar, comprender y encontrar guía a través de consultas esotéricas con inteligencia artificial y maestros reales.
          </p>
          
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row pt-4">
            <Link href="/login?mode=anon">
              <button className="px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold text-lg hover:bg-primary/90 transition-all glow-primary shadow-lg shadow-primary/20">
                Comenzar mi orientación
              </button>
            </Link>
            <Link href="/como-funciona">
              <button className="px-8 py-4 border border-border bg-secondary/50 text-foreground rounded-xl font-semibold text-lg hover:bg-secondary transition-all backdrop-blur-sm">
                Cómo funciona
              </button>
            </Link>
          </div>
          
          <p className="mt-6 text-sm text-muted-foreground flex items-center justify-center gap-2">
            <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Tu conversación es 100% privada y segura.
          </p>
        </div>
      </section>

      {/* Servicios Preview */}
      <section className="py-24 px-4 bg-background">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-foreground">
              Áreas de orientación
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explora las diferentes dimensiones en las que podemos ofrecerte claridad y perspectiva.
            </p>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: 'Tarot', desc: 'Desvela los mensajes ocultos y las tendencias de tu camino a través de los arcanos.' },
              { title: 'Astrología', desc: 'Comprende tu mapa natal y los tránsitos planetarios que influyen en tu presente.' },
              { title: 'Amor y relaciones', desc: 'Encuentra armonía, comprensión y guía para los vínculos que te importan.' },
              { title: 'Prosperidad', desc: 'Desbloquea creencias limitantes y alinea tu energía con la abundancia.' },
              { title: 'Trabajo y vocación', desc: 'Claridad sobre tu propósito profesional y los próximos pasos en tu carrera.' },
              { title: 'Orientación espiritual', desc: 'Conexión profunda con tu intuición y propósito de alma.' }
            ].map((service, idx) => (
              <div key={idx} className="group relative rounded-2xl border border-border bg-card p-8 transition-all hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-4 -mt-4 transition-all group-hover:bg-primary/10" />
                <h3 className="relative text-xl font-serif font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                  {service.title}
                </h3>
                <p className="relative text-sm text-muted-foreground leading-relaxed">
                  {service.desc}
                </p>
              </div>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <Link href="/servicios">
              <button className="text-accent hover:text-accent/80 font-medium transition-colors flex items-center gap-2 mx-auto">
                Ver todos los servicios 
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Confianza / Privacidad */}
      <section className="py-24 px-4 bg-secondary/30 border-y border-border">
        <div className="mx-auto max-w-4xl text-center space-y-8">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-foreground">Tu privacidad es sagrada</h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Sabemos que las consultas personales requieren un entorno de absoluta confianza. 
            Por eso, diseñamos nuestra plataforma para que puedas explorar y comenzar tu experiencia 
            de forma anónima, compartiendo únicamente la información con la que te sientas cómodo.
          </p>
          <Link href="/privacidad">
            <button className="px-6 py-3 border border-border bg-background text-foreground rounded-lg font-medium hover:bg-muted transition-colors">
              Conocer nuestra política de privacidad
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}
