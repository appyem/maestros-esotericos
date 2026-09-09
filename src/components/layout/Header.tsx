'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { useAuth } from '@/features/auth';

const PUBLIC_NAV = [
  { href: '/', label: 'Inicio' },
  { href: '/servicios', label: 'Servicios' },
  { href: '/maestros', label: 'Maestros' },
  { href: '/como-funciona', label: 'Cómo funciona' },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, status, signOut } = useAuth();

  const isAuthenticated = status === 'authenticated' && user;

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-serif font-bold text-foreground text-xl tracking-wide">
          <span className="text-2xl text-accent">✦</span>
          <span className="hidden sm:inline">Maestros Esotéricos</span>
          <span className="sm:hidden">Maestros</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {PUBLIC_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-medium transition-colors hover:text-accent ${
                pathname === item.href ? 'text-accent' : 'text-muted-foreground'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-muted-foreground hover:text-foreground">
                Cerrar sesión
              </Button>
              <Button variant="primary" size="sm" onClick={() => router.push('/client/dashboard')} className="bg-accent text-background hover:bg-accent/90 font-semibold">
                Mi panel
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  Ingresar
                </Button>
              </Link>
              <Link href="/login?mode=anon">
                <Button variant="primary" size="sm" className="bg-primary hover:bg-primary/90 text-white font-semibold shadow-lg shadow-primary/20">
                  Comenzar
                </Button>
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-foreground hover:bg-muted"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {isMenuOpen && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-md">
          <nav className="flex flex-col gap-1 px-4 py-4">
            {PUBLIC_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted ${
                  pathname === item.href ? 'text-accent bg-muted' : 'text-muted-foreground'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
              {isAuthenticated ? (
                <>
                  <Button variant="ghost" size="sm" fullWidth onClick={handleSignOut}>
                    Cerrar sesión
                  </Button>
                  <Button variant="primary" size="sm" fullWidth onClick={() => { router.push('/client/dashboard'); setIsMenuOpen(false); }} className="bg-accent text-background">
                    Mi panel
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" size="sm" fullWidth>
                      Ingresar
                    </Button>
                  </Link>
                  <Link href="/login?mode=anon" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="primary" size="sm" fullWidth className="bg-primary text-white">
                      Comenzar
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
