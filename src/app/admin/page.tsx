import { Card } from '@/components/ui/Card';

export default function AdminDashboard() {
  const stats = [
    { title: 'Consultas Hoy', value: '12', trend: '+2', icon: '💬' },
    { title: 'Pagos Pendientes', value: '5', trend: '0', icon: '💳' },
    { title: 'Pedidos en Preparacion', value: '8', trend: '+3', icon: '📦' },
    { title: 'Maestros Activos', value: '24', trend: '0', icon: '🔮' },
    { title: 'Incidencias Abiertas', value: '2', trend: '-1', icon: '⚠️' },
    { title: 'Notificaciones Fallidas', value: '1', trend: '0', icon: '🔔' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-foreground">Dashboard Operativo</h1>
        <p className="text-muted-foreground">Resumen de la actividad de la plataforma.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title} padding="md" className="bg-card/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <p className="mt-1 text-3xl font-bold text-foreground">{stat.value}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-2xl">
                {stat.icon}
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs">
              <span className={stat.trend.startsWith('+') ? 'text-green-500' : stat.trend.startsWith('-') ? 'text-red-500' : 'text-muted-foreground'}>
                {stat.trend} vs ayer
              </span>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card padding="lg" className="bg-card/50">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Acciones Pendientes</h2>
          <ul className="space-y-3">
            <li className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <p className="text-sm font-medium text-foreground">Solicitud de Onboarding: Maestro Juan</p>
                <p className="text-xs text-muted-foreground">Hace 2 horas</p>
              </div>
              <button className="text-xs font-medium text-primary hover:underline">Revisar</button>
            </li>
            <li className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <p className="text-sm font-medium text-foreground">Reasignacion de Consulta #C-1024</p>
                <p className="text-xs text-muted-foreground">Maestro indisponible</p>
              </div>
              <button className="text-xs font-medium text-primary hover:underline">Asignar</button>
            </li>
          </ul>
        </Card>

        <Card padding="lg" className="bg-card/50">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Alertas del Sistema</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3 rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-3">
              <span className="text-yellow-500">⚠️</span>
              <div>
                <p className="text-sm font-medium text-foreground">Stock bajo en Kit de Proteccion</p>
                <p className="text-xs text-muted-foreground">Quedan 3 unidades. Reabastecer pronto.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border border-red-500/20 bg-red-500/10 p-3">
              <span className="text-red-500">🚨</span>
              <div>
                <p className="text-sm font-medium text-foreground">1 Notificacion de WhatsApp fallida</p>
                <p className="text-xs text-muted-foreground">ID: notif_123. Reintentar o revisar numero.</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
