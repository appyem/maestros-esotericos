import Link from 'next/link';
import type { ReactNode } from 'react';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const menuItems = [
    { name: 'Dashboard', href: '/admin', icon: '📊' },
    { name: 'Usuarios', href: '/admin/usuarios', icon: '👥' },
    { name: 'Clientes', href: '/admin/clientes', icon: '👤' },
    { name: 'Maestros', href: '/admin/maestros', icon: '🔮' },
    { name: 'Consultas', href: '/admin/consultas', icon: '💬' },
    { name: 'Agenda', href: '/admin/agenda', icon: '📅' },
    { name: 'Pagos', href: '/admin/pagos', icon: '💳' },
    { name: 'Pedidos', href: '/admin/pedidos', icon: '📦' },
    { name: 'Productos', href: '/admin/productos', icon: '🛍️' },
    { name: 'Inventario', href: '/admin/inventario', icon: '📋' },
    { name: 'Notificaciones', href: '/admin/notificaciones', icon: '🔔' },
    { name: 'Incidencias', href: '/admin/incidencias', icon: '⚠️' },
  ];

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-col border-r border-border bg-secondary/30 md:flex">
        <div className="flex h-16 items-center border-b border-border px-6">
          <span className="text-xl font-serif font-bold text-primary">✦ Admin</span>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {menuItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-primary/10 hover:text-foreground"
                >
                  <span>{item.icon}</span>
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="border-t border-border p-4">
          <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <span>←</span> Volver a la tienda
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Mobile Header */}
        <header className="flex h-16 items-center justify-between border-b border-border bg-secondary/30 px-4 md:hidden">
          <span className="font-serif font-bold text-primary">✦ Admin</span>
          <button className="text-muted-foreground">☰</button>
        </header>
        
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
