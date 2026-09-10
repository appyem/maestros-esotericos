'use client';

import { useRouter } from 'next/navigation';

const services = [
  { 
    id: 'tarot', 
    title: 'Lectura de Tarot', 
    description: 'Obtén claridad sobre tu presente y futuras posibilidades a través de los arcanos.',
    color: 'bg-purple-600',
    textColor: 'text-purple-600 dark:text-purple-400',
    icon: '🃏'
  },
  { 
    id: 'amor', 
    title: 'Amor y Relaciones', 
    description: 'Orientación sobre vínculos, compatibilidad, sanación emocional y caminos del corazón.',
    color: 'bg-rose-600',
    textColor: 'text-rose-600 dark:text-rose-400',
    icon: '❤️'
  },
  { 
    id: 'prosperidad', 
    title: 'Prosperidad y Trabajo', 
    description: 'Desbloquea tu potencial financiero, orienta tu carrera y atrae la abundancia.',
    color: 'bg-emerald-600',
    textColor: 'text-emerald-600 dark:text-emerald-400',
    icon: '🌿'
  },
  { 
    id: 'astrologia', 
    title: 'Astrología', 
    description: 'Comprende las influencias cósmicas en tu vida a través de tu carta natal y tránsitos.',
    color: 'bg-indigo-600',
    textColor: 'text-indigo-600 dark:text-indigo-400',
    icon: '✨'
  },
  { 
    id: 'general', 
    title: 'Orientación General', 
    description: '¿No estás seguro por dónde empezar? Inicia una conversación abierta y te guiaremos.',
    color: 'bg-primary',
    textColor: 'text-primary',
    icon: '🧭'
  },
];

export default function ServicesPage() {
  const router = useRouter();

  const handleServiceClick = (serviceId: string) => {
    router.push(`/chat?service=${serviceId}`);
  };

  return (
    <div className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-3xl md:text-5xl font-serif font-bold mb-6">
          Elige tu camino de <span className="text-primary">orientación</span>
        </h1>
        <p className="text-lg text-muted-foreground">
          Selecciona el área en la que necesitas claridad. Iniciarás una conversación inmediata 
          con nuestra guía de IA, totalmente gratis y sin necesidad de registrarte. 
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <div
            key={service.id}
            onClick={() => handleServiceClick(service.id)}
            className="group relative flex flex-col p-6 bg-card border-2 border-border rounded-2xl hover:shadow-2xl hover:border-primary cursor-pointer transition-all duration-300 transform hover:scale-105"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleServiceClick(service.id);
              }
            }}
            aria-label={`Iniciar conversación de ${service.title}`}
          >
            <div className={`h-16 w-16 rounded-xl ${service.color} bg-opacity-20 flex items-center justify-center text-4xl mb-4 group-hover:scale-110 transition-transform`}>
              {service.icon}
            </div>
            <h3 className={`text-2xl font-bold mb-3 ${service.textColor}`}>
              {service.title}
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6 flex-1">
              {service.description}
            </p>
            <div className={`flex items-center gap-2 text-base font-bold ${service.textColor} group-hover:gap-4 transition-all`}>
              Iniciar conversación gratuita <span className="text-2xl">→</span>
            </div>
            
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className={`w-3 h-3 rounded-full ${service.color} animate-pulse`}></div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 text-center">
        <p className="text-sm text-muted-foreground mb-4">
          ¿Ya sabes con quién quieres hablar?
        </p>
        <button 
          onClick={() => router.push('/maestros')}
          className="inline-flex items-center justify-center px-8 py-4 border-2 border-border rounded-lg text-base font-medium hover:bg-secondary hover:border-primary transition-all cursor-pointer"
        >
          Ver directorio de Maestros
        </button>
      </div>
    </div>
  );
}
