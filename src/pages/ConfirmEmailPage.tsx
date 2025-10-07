import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { useNotifications } from '../notifications/notification-context';

function ConfirmEmailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { email?: string; message?: string } | null;
  const { notifyError, notifySuccess } = useNotifications();

  const [email, setEmail] = useState(state?.email || '');
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (verificationCode.length !== 6) {
      setError('El código debe tener 6 dígitos');
      return;
    }

    setLoading(true);

    try {
      const response = await apiService.confirmEmail({
        email,
        verificationCode,
      });

      setSuccess(true);
      notifySuccess(response.message);

      // Redirigir al login después de 2 segundos
      setTimeout(() => {
        void navigate('/login', {
          state: { message: response.message },
        });
      }, 2000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al verificar el código';
      setError(message);
      notifyError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex w-full max-w-md flex-col justify-center px-6 py-16">
        <div className="mb-8">
          <span className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">
            Basurapp
          </span>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-100">
            Verificar email
          </h1>
          <p className="mt-3 text-sm text-slate-400">
            {state?.message ||
              'Ingresa el código de 6 dígitos que enviamos a tu correo electrónico'}
          </p>
        </div>

        {success ? (
          <div className="rounded-2xl border border-green-500/40 bg-green-500/10 p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
              <svg
                className="h-8 w-8 text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-green-300">
              ¡Email verificado!
            </h2>
            <p className="mt-2 text-sm text-green-200">
              Redirigiendo a la página de inicio de sesión...
            </p>
          </div>
        ) : (
          <form
            onSubmit={(event) => {
              void handleSubmit(event);
            }}
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
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full rounded-md border border-slate-700/60 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-2 ring-transparent transition focus:border-cyan-500/70 focus:ring-cyan-500/20"
                placeholder="usuario@example.com"
                readOnly={!!state?.email}
              />
            </div>

            <div className="mt-4">
              <label
                htmlFor="verificationCode"
                className="text-sm font-medium text-slate-300"
              >
                Código de verificación
              </label>
              <input
                id="verificationCode"
                name="verificationCode"
                type="text"
                required
                value={verificationCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setVerificationCode(value);
                }}
                className="mt-2 w-full rounded-md border border-slate-700/60 bg-slate-950 px-3 py-2 text-center text-2xl font-mono tracking-widest text-slate-100 outline-none ring-2 ring-transparent transition focus:border-cyan-500/70 focus:ring-cyan-500/20"
                placeholder="000000"
                maxLength={6}
                autoComplete="off"
                autoFocus
              />
              <p className="mt-1 text-xs text-slate-500">Código de 6 dígitos</p>
            </div>

            {error && (
              <p className="mt-4 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || verificationCode.length !== 6}
              className="mt-6 w-full rounded-md bg-cyan-500 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Verificando...' : 'Verificar email'}
            </button>

            <p className="mt-4 text-center text-sm text-slate-400">
              ¿No recibiste el código?{' '}
              <Link to="/register" className="text-cyan-400 hover:text-cyan-300">
                Volver a registrarse
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

export default ConfirmEmailPage;
