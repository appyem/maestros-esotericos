import Link from 'next/link';

import { getMastersForAdmin } from '@/features/admin/adminServices';

import { reviewMasterAction } from './actions';

function MasterActionButtons({ masterId, status }: { masterId: string; status: string }) {
  if (status !== 'PENDING') {
    return <span className="text-xs text-muted-foreground">Sin acciones pendientes</span>;
  }

  return (
    <form className="flex gap-2">
      <button
        formAction={async (_formData: FormData) => {
          'use server';
          await reviewMasterAction(masterId, 'APPROVE', 'Aprobado por administrador');
        }}
        className="rounded bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 transition-colors"
      >
        Aprobar
      </button>
      <button
        formAction={async (_formData: FormData) => {
          'use server';
          await reviewMasterAction(masterId, 'REJECT', 'Rechazado por administrador');
        }}
        className="rounded bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 transition-colors"
      >
        Rechazar
      </button>
    </form>
  );
}

export default async function AdminMastersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const masters = await getMastersForAdmin(status);

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    ACTIVE: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    SUSPENDED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    INACTIVE: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
    REJECTED: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground">Gestión de Maestros</h1>
          <p className="text-muted-foreground">Revise, apruebe y administre los perfiles de los maestros.</p>
        </div>
        <div className="flex gap-2">
          <Link 
            href="/admin/maestros" 
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${!status ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}
          >
            Todos
          </Link>
          <Link 
            href="/admin/maestros?status=PENDING" 
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${status === 'PENDING' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}
          >
            Pendientes
          </Link>
        </div>
      </div>

      {/* Vista Desktop: Tabla */}
      <div className="hidden overflow-hidden rounded-lg border border-border md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-secondary/50 text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">Especialidades</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium">Onboarding</th>
              <th className="px-4 py-3 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-card">
            {masters.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  No se encontraron maestros con los filtros actuales.
                </td>
              </tr>
            ) : (
              masters.map((master) => (
                <tr key={master.masterId} className="hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{master.displayName}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {master.specialties.slice(0, 2).map((spec) => (
                        <span key={spec} className="rounded bg-primary/10 px-2 py-0.5 text-xs text-primary">
                          {spec.replace('_', ' ')}
                        </span>
                      ))}
                      {master.specialties.length > 2 && (
                        <span className="rounded bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                          +{master.specialties.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[master.status] || 'bg-gray-100 text-gray-800'}`}>
                      {master.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{master.onboardingStatus.replace('_', ' ')}</td>
                  <td className="px-4 py-3 text-right">
                    <MasterActionButtons masterId={master.masterId} status={master.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Vista Mobile: Tarjetas */}
      <div className="space-y-4 md:hidden">
        {masters.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No se encontraron maestros.</p>
        ) : (
          masters.map((master) => (
            <div key={master.masterId} className="rounded-lg border border-border bg-card p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">{master.displayName}</h3>
                  <p className="text-xs text-muted-foreground">{master.onboardingStatus.replace('_', ' ')}</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[master.status] || 'bg-gray-100 text-gray-800'}`}>
                  {master.status}
                </span>
              </div>
              
              <div className="flex flex-wrap gap-1">
                {master.specialties.map((spec) => (
                  <span key={spec} className="rounded bg-primary/10 px-2 py-0.5 text-xs text-primary">
                    {spec.replace('_', ' ')}
                  </span>
                ))}
              </div>

              <div className="pt-2 border-t border-border">
                <MasterActionButtons masterId={master.masterId} status={master.status} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}