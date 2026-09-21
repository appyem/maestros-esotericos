import { Card } from '@/components/ui/Card';
import { getAdminDashboardStats } from '@/features/admin/adminServices';

// Evita que Next.js intente prerenderizar esta página estáticamente durante el build,
// lo cual causaba el error de permisos de Firebase al no haber sesión autenticada.
export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const stats = await getAdminDashboardStats();

  const kpis = [
    { title: 'Maestros Activos', value: stats.activeMasters.toString(), icon: '🔮', color: 'text-green-500' },
    { title: 'Maestros Pendientes', value: stats.pendingMasters.toString(), icon: '⏳', color: 'text-yellow-500' },
    { title: 'Consultas Pendientes', value: stats.pendingConsultations.toString(), icon: '💬', color: 'text-blue-500' },
    { title: 'Pedidos en Proceso', value: stats.pendingOrders.toString(), icon: '📦', color: 'text-purple-500' },
    { title: 'Incidencias Abiertas', value: stats.openIncidents.toString(), icon: '⚠️', color: 'text-red-500' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-foreground">Dashboard Operativo</h1>
        <p className="text-muted-foreground">Resumen en tiempo real de la actividad de la plataforma.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {kpis.map((kpi) => (
          <Card key={kpi.title} padding="md" className="bg-card/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{kpi.title}</p>
                <p className={`mt-1 text-3xl font-bold ${kpi.color}`}>{kpi.value}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-2xl">
                {kpi.icon}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card padding="lg" className="bg-card/50">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Acciones Pendientes</h2>
          <div className="space-y-3">
            {stats.pendingMasters > 0 ? (
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <p className="text-sm font-medium text-foreground">Revisar solicitudes de Maestros</p>
                  <p className="text-xs text-muted-foreground">{stats.pendingMasters} maestro(s) pendiente(s) de aprobación</p>
                </div>
                <a href="/admin/maestros" className="text-xs font-medium text-primary hover:underline">
                  Ir a Maestros →
                </a>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No hay solicitudes de maestros pendientes.</p>
            )}
            
            {stats.pendingConsultations > 0 && (
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <p className="text-sm font-medium text-foreground">Consultas por asignar o iniciar</p>
                  <p className="text-xs text-muted-foreground">{stats.pendingConsultations} consulta(s) en estado pendiente</p>
                </div>
                <a href="/admin/consultas" className="text-xs font-medium text-primary hover:underline">
                  Ir a Consultas →
                </a>
              </div>
            )}

            {stats.pendingMasters === 0 && stats.pendingConsultations === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">✅ Todo al día. No hay acciones pendientes.</p>
            )}
          </div>
        </Card>

        <Card padding="lg" className="bg-card/50">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Estado del Sistema</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3 rounded-lg border border-green-500/20 bg-green-500/10 p-3">
              <span className="text-green-500">✅</span>
              <div>
                <p className="text-sm font-medium text-foreground">Base de datos operativa</p>
                <p className="text-xs text-muted-foreground">Conexión estable con Firestore.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border border-blue-500/20 bg-blue-500/10 p-3">
              <span className="text-blue-500">ℹ️</span>
              <div>
                <p className="text-sm font-medium text-foreground">Sincronización de pagos</p>
                <p className="text-xs text-muted-foreground">Webhooks de pasarela de pago activos.</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}