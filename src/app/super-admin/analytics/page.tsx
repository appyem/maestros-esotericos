import { Card } from '@/components/ui/Card';

export default function SuperAdminAnalyticsDashboard() {
  // El Super Admin tiene acceso a métricas globales, de seguridad y costos operativos.
  const globalKpis = [
    { title: 'Ingresos Netos Globales', value: '$12.8M', trend: '+15%', icon: '💎' },
    { title: 'MAU (Usuarios Activos Mensuales)', value: '4,521', trend: '+8%', icon: '🌍' },
    { title: 'Tasa de Retención (Día 30)', value: '22.4%', trend: '+1.2%', icon: '🔄' },
    { title: 'Costo Operativo IA (Mes)', value: '$145', trend: '-5%', icon: '⚙️' },
  ];

  const securityMetrics = [
    { label: 'Intentos de acceso denegados', value: '12', status: 'normal' },
    { label: 'Alertas de seguridad abiertas', value: '1', status: 'warning' },
    { label: 'Webhooks rechazados (replay)', value: '0', status: 'normal' },
    { label: 'Administradores sin MFA', value: '0', status: 'normal' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-foreground">Analítica Global y de Seguridad</h1>
        <p className="text-muted-foreground">Visión ejecutiva del rendimiento, costos y salud del sistema.</p>
      </div>

      {/* KPIs Globales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {globalKpis.map((kpi) => (
          <Card key={kpi.title} padding="md" className="bg-card/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{kpi.title}</p>
                <p className="mt-1 text-3xl font-bold text-foreground">{kpi.value}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-2xl">
                {kpi.icon}
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs">
              <span className={kpi.trend.startsWith('+') ? 'text-green-500' : 'text-red-500'}>
                {kpi.trend} vs mes anterior
              </span>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Métricas de Seguridad */}
        <Card padding="lg" className="bg-card/50">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Salud de Seguridad</h2>
          <div className="space-y-3">
            {securityMetrics.map((metric) => (
              <div key={metric.label} className="flex items-center justify-between rounded-lg border border-border p-3">
                <span className="text-sm text-muted-foreground">{metric.label}</span>
                <span className={`font-medium ${metric.status === 'warning' ? 'text-yellow-500' : 'text-green-500'}`}>
                  {metric.value}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Rendimiento por Especialidad (Agregado) */}
        <Card padding="lg" className="bg-card/50">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Demanda por Especialidad</h2>
          <div className="space-y-3">
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Amor y Relaciones</span>
                <span className="font-medium">42%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-secondary">
                <div className="h-2 w-[42%] rounded-full bg-purple-500" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Prosperidad y Trabajo</span>
                <span className="font-medium">28%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-secondary">
                <div className="h-2 w-[28%] rounded-full bg-blue-500" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Orientación Espiritual</span>
                <span className="font-medium">18%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-secondary">
                <div className="h-2 w-[18%] rounded-full bg-green-500" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Tarot y Astrología</span>
                <span className="font-medium">12%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-secondary">
                <div className="h-2 w-[12%] rounded-full bg-orange-500" />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
