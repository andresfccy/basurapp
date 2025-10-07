import { useMemo, useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'

import { getRoleLabel, useAuth } from '../../auth/auth-context'
import { useConfig } from '../../config/config-context'
import { usePickups } from '../../pickups/pickups-context'
import { calculateUserPoints } from '../../utils/points'

type IconProps = {
  className?: string
}

type NavItem = {
  to: string
  label: string
  icon: (props: IconProps) => JSX.Element
}

const homeNavItem: NavItem = { to: '/', label: 'Inicio', icon: HomeIcon }
const adminNavItems: NavItem[] = [
  homeNavItem,
  { to: '/administracion', label: 'Administración', icon: SettingsIcon },
  { to: '/usuarios', label: 'Usuarios', icon: UsersIcon },
  { to: '/recolectores', label: 'Recolectores', icon: TruckIcon },
  { to: '/reportes', label: 'Reportes', icon: ReportsIcon },
]
const basicNavItems: NavItem[] = [homeNavItem, { to: '/reportes', label: 'Reportes', icon: ReportsIcon }]
const collectorNavItems: NavItem[] = [homeNavItem]

function DashboardLayout() {
  const { user, logout } = useAuth()
  const { pickups } = usePickups()
  const { pointsFormula } = useConfig()
  const [collapsed, setCollapsed] = useState(false)

  const userPoints = useMemo(() => (
    user ? calculateUserPoints(pickups, user.displayName, pointsFormula) : 0
  ), [pickups, pointsFormula, user])

  const navItems = useMemo<NavItem[]>(() => {
    if (!user) return [homeNavItem]
    if (user.role === 'admin') return adminNavItems
    if (user.role === 'basic') return basicNavItems
    if (user.role === 'collector') return collectorNavItems
    return [homeNavItem]
  }, [user])

  const asideClassName = useMemo(
    () =>
      [
        'sticky top-0 flex h-screen flex-col overflow-hidden border-r border-slate-800 bg-slate-900/70 px-4 py-8 transition-[width] duration-300 ease-in-out',
        collapsed ? 'w-20' : 'w-64',
      ].join(' '),
    [collapsed],
  )

  const navLinkClassName = (isActive: boolean) =>
    [
      'inline-flex w-full items-center rounded-md py-2 text-sm font-medium transition',
      collapsed ? 'justify-center gap-0 px-2' : 'justify-start gap-3 px-3',
      isActive
        ? 'bg-cyan-500/10 text-cyan-200'
        : 'text-slate-300 hover:bg-slate-800/70 hover:text-slate-100',
    ].join(' ')

  const userInitials = useMemo(() => {
    if (!user) return 'B'
    const parts = [user.firstName, user.lastName]
      .filter(Boolean)
      .map((part) => part.trim())
    if (parts.length === 0 && user.displayName) {
      parts.push(...user.displayName.split(' '))
    }
    const initials = parts
      .filter(Boolean)
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
    return initials.toUpperCase() || 'B'
  }, [user])

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <aside className={asideClassName}>
        <div className="mb-10 flex h-16 items-center justify-between gap-2">
          {collapsed ? (
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-500/15 text-sm font-semibold text-cyan-200">
              B
            </span>
          ) : (
            <div className="flex flex-col">
              <span className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">Basurapp</span>
              <p className="mt-2 text-2xl font-semibold text-slate-100">Panel</p>
            </div>
          )}
          <button
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            aria-label={collapsed ? 'Expandir menú lateral' : 'Colapsar menú lateral'}
            aria-expanded={!collapsed}
            className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md border border-slate-700/70 text-slate-300 transition hover:border-cyan-500/60 hover:text-cyan-200"
          >
            {collapsed ? <ChevronRightIcon className="h-4 w-4" /> : <ChevronLeftIcon className="h-4 w-4" />}
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink key={item.to} to={item.to} end className={({ isActive }) => navLinkClassName(isActive)}>
                <Icon className="h-5 w-5 flex-shrink-0" />
                {collapsed ? <span className="sr-only">{item.label}</span> : <span className="truncate">{item.label}</span>}
              </NavLink>
            )
          })}
        </nav>

        <button
          type="button"
          onClick={() => void logout()}
          className={[
            'mt-6 inline-flex items-center rounded-md border text-sm font-medium transition hover:border-red-500/70 hover:text-red-300',
            'border-slate-700/70 text-slate-300',
            collapsed ? 'justify-center px-2 py-2' : 'justify-center px-3 py-2',
          ].join(' ')}
        >
          <LogoutIcon className="h-5 w-5" />
          {collapsed ? <span className="sr-only">Cerrar sesión</span> : <span className="ml-2">Cerrar sesión</span>}
        </button>
      </aside>

      <main className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between gap-6 border-b border-slate-800 bg-slate-900/60 px-6 py-4 sm:px-10 sm:py-6">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-100">Inicio</h1>
          {user && (
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-2 rounded-full border border-amber-400/60 bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-200">
                <TrophyIcon className="h-4 w-4 text-amber-300" />
                <span>{userPoints} pts</span>
              </div>
              <div className="hidden min-w-0 text-right sm:flex sm:flex-col">
                <span className="truncate text-sm font-semibold text-slate-100">{user.displayName}</span>
                <span className="text-xs text-slate-400">{getRoleLabel(user.role)}</span>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500/15 text-sm font-semibold text-cyan-200 sm:h-11 sm:w-11">
                {userInitials}
              </div>
            </div>
          )}
        </header>
        <section className="flex flex-1 flex-col overflow-y-auto px-10 py-8">
          <Outlet />
        </section>
      </main>
    </div>
  )
}

function HomeIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 12v8a1 1 0 0 0 1 1h4v-5h4v5h4a1 1 0 0 0 1-1v-8" />
    </svg>
  )
}

function SettingsIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.65 1.65 0 0 0 15 19.4a1.65 1.65 0 0 0-1 .6 1.65 1.65 0 0 0-.33 1.82l.02.07a2 2 0 1 1-3.38 0l.02-.07a1.65 1.65 0 0 0-.33-1.82 1.65 1.65 0 0 0-1-.6 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1-.6 1.65 1.65 0 0 0-1.82.33l-.07.06a2 2 0 1 1 0-3.38l.07.02a1.65 1.65 0 0 0 1.82-.33 1.65 1.65 0 0 0 .6-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-.6 1.65 1.65 0 0 0 .33-1.82l-.02-.07a2 2 0 1 1 3.38 0l-.02.07a1.65 1.65 0 0 0 .33 1.82 1.65 1.65 0 0 0 1 .6 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82 1.65 1.65 0 0 0 .6 1z" />
    </svg>
  )
}

function UsersIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function TruckIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M1 3h15v13H1z" />
      <path d="M16 8h4l3 3v5h-7z" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  )
}

function ReportsIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M16 2H8a2 2 0 0 0-2 2v16l6-3 6 3V4a2 2 0 0 0-2-2z" />
    </svg>
  )
}

function ChevronLeftIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M15 6 9 12l6 6" />
    </svg>
  )
}

function ChevronRightIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="m9 6 6 6-6 6" />
    </svg>
  )
}

function TrophyIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M8 21h8" />
      <path d="M12 17a4 4 0 0 0 4-4V3H8v10a4 4 0 0 0 4 4z" />
      <path d="M5 5H3a2 2 0 0 0 2 2h1V5z" />
      <path d="M19 5h2a2 2 0 0 1-2 2h-1V5z" />
    </svg>
  )
}

function LogoutIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
      <path d="M12 19H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5" />
    </svg>
  )
}

export default DashboardLayout
