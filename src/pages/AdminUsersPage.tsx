import { useMemo } from 'react'

import { useConfig } from '../config/config-context'
import { usePickups } from '../pickups/pickups-context'
import { calculateUserPoints } from '../utils/points'

const baseCitizenUsers = [
  {
    id: 'usr-1001',
    name: 'Andrea Morales',
    email: 'andrea.morales@example.com',
    phone: '+57 300 123 4567',
    status: 'Activo',
    createdAt: '2025-03-14',
  },
  {
    id: 'usr-1002',
    name: 'Santiago Ruiz',
    email: 'santiago.ruiz@basurapp.com',
    phone: '+57 311 987 6543',
    status: 'Pendiente',
    createdAt: '2025-04-02',
  },
  {
    id: 'usr-1003',
    name: 'Laura García',
    email: 'laura.garcia@basurapp.com',
    phone: '+57 312 555 0199',
    status: 'Deshabilitado',
    createdAt: '2025-02-28',
  },
]

function AdminUsersPage() {
  const { pickups } = usePickups()
  const { pointsFormula } = useConfig()

  const users = useMemo(() =>
    baseCitizenUsers.map((user) => ({
      ...user,
      points: calculateUserPoints(pickups, user.name, pointsFormula),
    })),
    [pickups, pointsFormula],
  )

  return (
    <div className="flex flex-col gap-8">
      <header className="mx-auto flex w-full max-w-5xl flex-col gap-2">
        <h2 className="text-3xl font-semibold tracking-tight text-slate-100">Usuarios</h2>
        <p className="text-sm text-slate-400">
          Administra los ciudadanos registrados en Basurapp. Puedes crear cuentas nuevas, editar datos y
          deshabilitar usuarios para preservar la integridad de los registros asociados.
        </p>
      </header>

      <section className="mx-auto w-full max-w-5xl overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/60">
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <h3 className="text-lg font-semibold text-slate-100">Ciudadanos registrados</h3>
          <div className="flex flex-wrap gap-2 text-xs">
            <button className="inline-flex items-center gap-2 rounded-full border border-cyan-500/60 bg-cyan-500/20 px-3 py-2 font-medium text-cyan-200 transition hover:border-cyan-400/80 hover:text-cyan-100">
              + Crear usuario
            </button>
            <button className="inline-flex items-center gap-2 rounded-full border border-slate-700/70 bg-slate-900/70 px-3 py-2 font-medium text-slate-300 transition hover:border-slate-500/60 hover:text-slate-100">
              Importar CSV
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-800 text-left text-sm text-slate-200">
            <thead className="bg-slate-900/70 text-xs uppercase tracking-[0.3em] text-slate-500">
              <tr>
                <th className="px-6 py-3">ID</th>
                <th className="px-6 py-3">Nombre</th>
                <th className="px-6 py-3">Contacto</th>
                <th className="px-6 py-3">Puntos</th>
                <th className="px-6 py-3">Estado</th>
                <th className="px-6 py-3">Creado</th>
                <th className="px-6 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-900/60">
                  <td className="px-6 py-3 font-mono text-xs text-slate-400">{user.id}</td>
                  <td className="px-6 py-3 font-medium text-slate-100">{user.name}</td>
                  <td className="px-6 py-3 text-slate-300">
                    <div className="flex flex-col">
                      <span>{user.email}</span>
                      <span className="text-xs text-slate-500">{user.phone}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-slate-300">{user.points}</td>
                  <td className="px-6 py-3">
                    <span className="inline-flex items-center rounded-full border border-slate-700/70 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-300">
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-slate-300">{user.createdAt}</td>
                  <td className="px-6 py-3">
                    <div className="flex justify-end gap-2">
                      <button className="rounded-md border border-slate-700/70 px-2 py-1 text-xs font-medium text-slate-200 transition hover:border-cyan-400/70 hover:text-cyan-200">
                        Editar
                      </button>
                      <button className="rounded-md border border-amber-500/60 px-2 py-1 text-xs font-medium text-amber-200 transition hover:border-amber-400/80 hover:text-amber-100">
                        Reset clave
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
          Los usuarios deshabilitados se conservan en el sistema para mantener la trazabilidad de las
          recolecciones y reportes asociados.
        </footer>
      </section>
    </div>
  )
}

export default AdminUsersPage
