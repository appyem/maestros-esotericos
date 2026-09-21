'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, type ReactNode } from 'react';

import { AuthGuard } from '@/components/auth/AuthGuard';

const menuItems = [
  { name: 'Dashboard', href: '/admin', icon: '📊' },
  { name: 'Maestros', href: '/admin/maestros', icon: '🔮' },
  { name: 'Clientes', href: '/admin/clientes', icon: '👤' },
  { name: 'Consultas', href: '/admin/consultas', icon: '💬' },
  { name: 'Agenda', href: '/admin/agenda', icon: '📅' },
  { name: 'Pedidos', href: '/admin/pedidos', icon: '📦' },
  { name: 'Inventario', href: '/admin/inventario', icon: '📋' },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <AuthGuard allowedRoles={['ADMINISTRADOR', 'SUPER_ADMIN']}>
      <div className="flex min-h-screen bg-background text-foreground">
        {/* Sidebar Desktop */}
        <aside className="hidden w-64 flex-col border-r border-border bg-secondary/30 md:flex">
          <div className="flex h-16 items-center border-b border-border px-6">
            <span className="text-xl font-serif font-bold text-primary">✦ Admin</span>
          </div>
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-3">
              {menuItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:bg-primary/5 hover:text-foreground'
                      }`}
                    >
                      <span>{item.icon}</span>
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div className="border-t border-border p-4">
            <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <span>←</span> Volver a la plataforma
            </Link>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex flex-1 flex-col overflow-hidden">
          {/* Mobile Header */}
          <header className="flex h-16 items-center justify-between border-b border-border bg-secondary/30 px-4 md:hidden">
            <span className="font-serif font-bold text-primary">✦ Admin</span>
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="rounded p-2 text-muted-foreground hover:bg-secondary"
            >
              {isMobileMenuOpen ? '✕' : '☰'}
            </button>
          </header>

          {/* Mobile Menu Dropdown */}
          {isMobileMenuOpen && (
            <nav className="border-b border-border bg-secondary/30 px-4 py-2 md:hidden">
              <ul className="space-y-1">
                {menuItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${
                          isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
                        }`}
                      >
                        <span>{item.icon}</span>
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          )}
          
          <div className="flex-1 overflow-y-auto p-4 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}