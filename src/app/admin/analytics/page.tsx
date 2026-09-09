import { Card } from '@/components/ui/Card';

export default function AdminAnalyticsDashboard() {
  // En un entorno real, estos datos vendrían de una Server Action que consulte
  // la colección 'dailyAnalyticsAggregations' validando los permisos del usuario.
  const kpis = [
    { title: 'Usuarios Activos (Hoy)', value: '142', trend: '+12%', icon: '👥' },
    { title: 'Consultas Completadas', value: '38', trend: '+5%', icon: '🔮' },
    { title: 'Ingresos Brutos (Mes)', value: '$4.2M', trend: '+8%', icon: '💰' },
    { title: 'Conversión IA → Pago', value: '14.5%', trend: '-2%', icon: '🤖' },
  ];

  const funnelData = [
    { stage: 'Visitas a Maestros', count: 1250, percentage: 100 },
    { stage: 'Sesiones de IA Iniciadas', count: 840, percentage: 67 },
    { stage: 'Consultas Reservadas', count: 120, percentage: 9.6 },
    { stage: 'Pagos Aprobados', count: 98, percentage: 7.8 },
    { stage: 'Consultas Completadas', count: 85, percentage: 6.8 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-foreground">Analítica Operativa</h1>
        <p className="text-muted-foreground">Métricas de rendimiento, conversión y crecimiento.</p>
      </div>

      {/* KPIs Principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
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
        {/* Embudo de Conversión */}
        <Card padding="lg" className="bg-card/50">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Embudo de Conversión (IA → Consulta)</h2>
          <div className="space-y-4">
            {funnelData.map((step, _index) => (
              <div key={step.stage} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-foreground">{step.stage}</span>
                  <span className="text-muted-foreground">{step.count} ({step.percentage}%)</span>
                </div>
                <div className="h-2 w-full rounded-full bg-secondary">
                  <div 
                    className="h-2 rounded-full bg-primary transition-all duration-500" 
                    style={{ width: `${step.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Resumen de Tienda */}
        <Card padding="lg" className="bg-card/50">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Rendimiento de Tienda</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <span className="text-sm text-muted-foreground">Productos más vistos</span>
              <span className="font-medium text-foreground">Kit de Protección (142)</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <span className="text-sm text-muted-foreground">Carritos abandonados</span>
              <span className="font-medium text-foreground">24 (Tasa: 32%)</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <span className="text-sm text-muted-foreground">Pedidos completados</span>
              <span className="font-medium text-foreground">51</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <span className="text-sm text-muted-foreground">Notificaciones fallidas</span>
              <span className="font-medium text-red-500">3 (Requiere atención)</span>
            </div>
          </div>
        </Card>
      </div>

      <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-4">
        <p className="text-sm text-yellow-700 dark:text-yellow-400">
          <strong>Nota de Privacidad:</strong> Este dashboard muestra únicamente datos agregados y pseudonimizados. 
          No se almacena ni se visualiza información de identificación personal (PII), contenido de conversaciones o datos financieros sensibles.
        </p>
      </div>
    </div>
  );
}
