import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'

import { authPresets, getRoleLabel, useAuth } from '../auth/auth-context'

function LoginPage() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? '/'

  if (user) {
    return <Navigate to={from} replace />
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const result = login({ username, password })

    if (!result.success) {
      setError(result.message ?? 'Error al iniciar sesión')
      return
    }

    setError(null)
    void navigate(from, { replace: true })
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex w-full max-w-6xl flex-col justify-center gap-10 px-6 py-16 lg:flex-row">
        <div className="flex flex-1 flex-col justify-center">
          <span className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">Basurapp</span>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-100">Bienvenido</h1>
          <p className="mt-3 max-w-md text-sm text-slate-400">
            Inicia sesión con tu usuario y contraseña para acceder al panel. Por ahora puedes usar los
            accesos de ejemplo para probar los diferentes roles.
          </p>
          <div className="mt-8 rounded-lg border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-300">
            <p className="text-slate-400">Usuarios de prueba:</p>
            <ul className="mt-3 space-y-2">
              {authPresets.map((preset) => (
                <li key={preset.username}>
                  <button
                    type="button"
                    onClick={() => {
                      setUsername(preset.username)
                      setPassword(preset.password)
                      setError(null)
                    }}
                    className="flex w-full justify-between rounded-md bg-slate-800/70 px-3 py-2 text-left font-mono text-xs text-slate-200 transition hover:bg-slate-700/80"
                  >
                    <span>{preset.username}</span>
                    <span>{preset.password}</span>
                    <span className="text-[10px] uppercase tracking-widest text-slate-400">
                      {getRoleLabel(preset.role)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-1 flex-col justify-center">
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-slate-800 bg-slate-900/70 p-8 shadow-xl shadow-slate-950/40"
          >
            <div>
              <label htmlFor="username" className="text-sm font-medium text-slate-300">
                Usuario
              </label>
              <input
                id="username"
                name="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="mt-2 w-full rounded-md border border-slate-700/60 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-2 ring-transparent transition focus:border-cyan-500/70 focus:ring-cyan-500/20"
                placeholder="Ingresa tu usuario"
                autoComplete="username"
              />
            </div>

            <div className="mt-4">
              <label htmlFor="password" className="text-sm font-medium text-slate-300">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 w-full rounded-md border border-slate-700/60 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-2 ring-transparent transition focus:border-cyan-500/70 focus:ring-cyan-500/20"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            {error && (
              <p className="mt-4 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="mt-6 w-full rounded-md bg-cyan-500 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
            >
              Iniciar sesión
            </button>

            <p className="mt-4 text-center text-sm text-slate-400">
              ¿No tienes cuenta?{' '}
              <Link to="/register" className="text-cyan-400 hover:text-cyan-300">
                Regístrate aquí
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
