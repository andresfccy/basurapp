import { NavLink, Outlet } from 'react-router-dom'

import { getRoleLabel, useAuth } from '../../auth/auth-context'

const navigation = [{ to: '/', label: 'Inicio' }]

function DashboardLayout() {
  const { user, logout } = useAuth()

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <aside className="sticky top-0 flex h-screen w-64 flex-col overflow-y-auto border-r border-slate-800 bg-slate-900/70 px-6 py-8">
        <div className="mb-10">
          <span className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">Basurapp</span>
          <p className="mt-3 text-2xl font-semibold text-slate-100">Panel</p>
          {user && (
            <p className="mt-1 text-sm text-slate-400">
              {user.displayName} · {getRoleLabel(user.role)}
            </p>
          )}
        </div>

        <nav className="flex flex-1 flex-col gap-1 text-sm font-medium">
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end
              className={({ isActive }) =>
                [
                  'inline-flex items-center justify-between rounded-md px-3 py-2 transition',
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-200'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-slate-100',
                ].join(' ')
              }
            >
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          onClick={logout}
          className="mt-6 inline-flex items-center justify-center rounded-md border border-slate-700/70 px-3 py-2 text-sm font-medium text-slate-300 transition hover:border-red-500/70 hover:text-red-300"
        >
          Cerrar sesión
        </button>
      </aside>

      <main className="flex flex-1 flex-col overflow-hidden">
        <header className="border-b border-slate-800 bg-slate-900/60 px-10 py-6">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-100">Inicio</h1>
        </header>
        <section className="flex flex-1 flex-col overflow-y-auto px-10 py-8">
          <Outlet />
        </section>
      </main>
    </div>
  )
}

export default DashboardLayout
