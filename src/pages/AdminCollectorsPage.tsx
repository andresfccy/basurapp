const mockCollectors = [
  {
    id: 'col-5001',
    name: 'Laura García',
    email: 'laura.garcia@basurapp.com',
    phone: '+57 312 555 0199',
    assignedZones: ['Chapinero', 'Fontibón'],
    activeRoutes: 8,
    status: 'Activo',
    lastCheckIn: '2025-09-10 08:45',
  },
  {
    id: 'col-5002',
    name: 'Carlos López',
    email: 'carlos.lopez@basurapp.com',
    phone: '+57 310 777 1188',
    assignedZones: ['Suba'],
    activeRoutes: 5,
    status: 'De vacaciones',
    lastCheckIn: '2025-09-01 18:05',
  },
  {
    id: 'col-5003',
    name: 'Valentina Rojas',
    email: 'valentina.rojas@basurapp.com',
    phone: '+57 301 444 3355',
    assignedZones: ['Engativá', 'Kennedy'],
    activeRoutes: 10,
    status: 'Deshabilitado',
    lastCheckIn: '2025-08-22 17:20',
  },
]

function AdminCollectorsPage() {
  return (
    <div className="flex flex-col gap-8">
      <header className="mx-auto flex w-full max-w-5xl flex-col gap-2">
        <h2 className="text-3xl font-semibold tracking-tight text-slate-100">Recolectores</h2>
        <p className="text-sm text-slate-400">
          Coordina al equipo de recolección, asigna turnos y realiza seguimiento de disponibilidad. Desde
          aquí podrás registrar nuevos recolectores o deshabilitarlos temporalmente sin perder su
          historial.
        </p>
      </header>

      <section className="mx-auto w-full max-w-5xl overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/60">
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <h3 className="text-lg font-semibold text-slate-100">Equipo operativo</h3>
          <div className="flex flex-wrap gap-2 text-xs">
            <button className="inline-flex items-center gap-2 rounded-full border border-cyan-500/60 bg-cyan-500/20 px-3 py-2 font-medium text-cyan-200 transition hover:border-cyan-400/80 hover:text-cyan-100">
              + Registrar recolector
            </button>
            <button className="inline-flex items-center gap-2 rounded-full border border-slate-700/70 bg-slate-900/70 px-3 py-2 font-medium text-slate-300 transition hover:border-slate-500/60 hover:text-slate-100">
              Sincronizar rutas
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-800 text-left text-sm text-slate-200">
            <thead className="bg-slate-900/70 text-xs uppercase tracking-[0.3em] text-slate-500">
              <tr>
                <th className="px-6 py-3">ID</th>
                <th className="px-6 py-3">Recolector</th>
                <th className="px-6 py-3">Contacto</th>
                <th className="px-6 py-3">Zonas</th>
                <th className="px-6 py-3">Rutas activas</th>
                <th className="px-6 py-3">Último check-in</th>
                <th className="px-6 py-3">Estado</th>
                <th className="px-6 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {mockCollectors.map((collector) => (
                <tr key={collector.id} className="hover:bg-slate-900/60">
                  <td className="px-6 py-3 font-mono text-xs text-slate-400">{collector.id}</td>
                  <td className="px-6 py-3 font-medium text-slate-100">{collector.name}</td>
                  <td className="px-6 py-3 text-slate-300">
                    <div className="flex flex-col">
                      <span>{collector.email}</span>
                      <span className="text-xs text-slate-500">{collector.phone}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-slate-300">
                    <span>{collector.assignedZones.join(', ')}</span>
                  </td>
                  <td className="px-6 py-3 text-slate-300">{collector.activeRoutes}</td>
                  <td className="px-6 py-3 text-slate-300">{collector.lastCheckIn}</td>
                  <td className="px-6 py-3">
                    <span className="inline-flex items-center rounded-full border border-slate-700/70 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-300">
                      {collector.status}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex justify-end gap-2">
                      <button className="rounded-md border border-slate-700/70 px-2 py-1 text-xs font-medium text-slate-200 transition hover:border-cyan-400/70 hover:text-cyan-200">
                        Editar
                      </button>
                      <button className="rounded-md border border-slate-700/70 px-2 py-1 text-xs font-medium text-slate-200 transition hover:border-cyan-400/70 hover:text-cyan-200">
                        Reasignar rutas
                      </button>
                      <button className="rounded-md border border-red-500/60 px-2 py-1 text-xs font-medium text-red-200 transition hover:border-red-400/80 hover:text-red-100">
                        Deshabilitar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <footer className="border-t border-slate-800 px-6 py-4 text-xs text-slate-500">
          Deshabilitar a un recolector lo retira de las asignaciones futuras, pero mantiene su historial de
          rutas y métricas para auditoría.
        </footer>
      </section>
    </div>
  )
}

export default AdminCollectorsPage
