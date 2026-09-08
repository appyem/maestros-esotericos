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
  const { user, status, signInAnon } = useAuth();

  const isAuthenticated = status === 'authenticated' && user && !user.isAnonymous;

  const handleStartExperience = async () => {
    if (isAuthenticated) {
      router.push('/client/dashboard');
    } else {
      await signInAnon();
      router.push('/client/dashboard');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-surface-elevated/95 backdrop-blur supports-[backdrop-filter]:bg-surface-elevated/80">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-foreground">
          <span className="text-xl">✦</span>
          <span className="hidden sm:inline">Maestros Esotéricos</span>
          <span className="sm:hidden">Maestros</span>
        </Link>

        {/* Nav Desktop */}
        <nav className="hidden md:flex items-center gap-6">
          {PUBLIC_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === item.href ? 'text-primary' : 'text-foreground/70'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Actions Desktop */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <Button variant="primary" size="sm" onClick={handleStartExperience}>
              Mi panel
            </Button>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Ingresar
                </Button>
              </Link>
              <Button variant="primary" size="sm" onClick={handleStartExperience}>
                Comenzar
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-foreground hover:bg-surface"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-border bg-surface-elevated">
          <nav className="flex flex-col gap-1 px-4 py-4">
            {PUBLIC_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-surface ${
                  pathname === item.href ? 'text-primary bg-surface' : 'text-foreground/80'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
              {isAuthenticated ? (
                <Button variant="primary" size="sm" onClick={handleStartExperience}>
                  Mi panel
                </Button>
              ) : (
                <>
                  <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" size="sm" fullWidth>
                      Ingresar
                    </Button>
                  </Link>
                  <Button variant="primary" size="sm" onClick={handleStartExperience}>
                    Comenzar sin registro
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
