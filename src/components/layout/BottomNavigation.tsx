'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const SERVICES = [
  { key: 'amor', label: 'Amor', icon: '❤️', href: '/chat?service=amor' },
  { key: 'tarot', label: 'Tarot', icon: '🔮', href: '/chat?service=tarot' },
  { key: 'prosperidad', label: 'Prosperidad', icon: '✨', href: '/chat?service=prosperidad' },
  { key: 'astrologia', label: 'Astrología', icon: '🌙', href: '/chat?service=astrologia' },
  { key: 'general', label: 'General', icon: '🕊️', href: '/chat?service=general' },
];

export default function BottomNavigation() {
  const pathname = usePathname();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-border bg-background/95 backdrop-blur-md pb-safe pt-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      {SERVICES.map((svc) => {
        // Resaltar si estamos en esa ruta o si es la activa
        const isActive = pathname.includes(`service=${svc.key}`) || (svc.key === 'general' && pathname === '/');
        
        return (
          <Link 
            key={svc.key} 
            href={svc.href}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all flex-1 ${
              isActive ? 'text-primary bg-primary/5' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span className="text-xl">{svc.icon}</span>
            <span className="text-[10px] font-medium">{svc.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
