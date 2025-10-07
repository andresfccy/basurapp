import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'

import { useAuth } from '../auth/auth-context'
import { apiService } from '../services/api'

function LoginPage() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showResendOption, setShowResendOption] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [isResending, setIsResending] = useState(false)

  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? '/'

  if (user) {
    return <Navigate to={from} replace />
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setShowResendOption(false)
    setResendSuccess(false)
    setIsLoading(true)

    try {
      const result = await login({ email, password })

      if (!result.success) {
        const errorMessage = result.message ?? 'Error al iniciar sesión'
        setError(errorMessage)

        // Mostrar opción de reenvío si el usuario no está verificado
        if (errorMessage.includes('verificad') || errorMessage.includes('verifica')) {
          setShowResendOption(true)
        }
        return
      }

      void navigate(from, { replace: true })
    } catch (error) {
      setError('Error al iniciar sesión. Por favor intenta de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    setIsResending(true)
    setResendSuccess(false)
    setError(null)

    try {
      await apiService.resendVerification({ email })
      setResendSuccess(true)
      setShowResendOption(false)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al reenviar el código')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex w-full max-w-6xl flex-col justify-center gap-10 px-6 py-16 lg:flex-row">
        <div className="flex flex-1 flex-col justify-center">
          <span className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">Basurapp</span>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-100">Bienvenido</h1>
          <p className="mt-3 max-w-md text-sm text-slate-400">
            Inicia sesión con tu email y contraseña para acceder al panel.
          </p>
        </div>

        <div className="flex flex-1 flex-col justify-center">
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-slate-800 bg-slate-900/70 p-8 shadow-xl shadow-slate-950/40"
          >
            <div>
              <label htmlFor="email" className="text-sm font-medium text-slate-300">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 w-full rounded-md border border-slate-700/60 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-2 ring-transparent transition focus:border-cyan-500/70 focus:ring-cyan-500/20"
                placeholder="tu@email.com"
                autoComplete="email"
                required
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
              <div className="mt-4 space-y-2">
                <p className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                  {error}
                </p>
                {showResendOption && (
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={isResending}
                    className="w-full rounded-md border border-cyan-500/40 bg-cyan-500/10 px-3 py-2 text-sm font-medium text-cyan-200 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isResending ? 'Reenviando código...' : 'Reenviar código de verificación'}
                  </button>
                )}
              </div>
            )}

            {resendSuccess && (
              <div className="mt-4 rounded-md border border-green-500/40 bg-green-500/10 px-3 py-2 text-sm text-green-200">
                <p>Código de verificación reenviado exitosamente. Revisa tu correo.</p>
                <Link
                  to="/confirm-email"
                  className="mt-2 inline-block font-medium text-green-300 underline hover:text-green-200"
                >
                  Ir a verificar mi email →
                </Link>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="mt-6 w-full rounded-md bg-cyan-500 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
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
