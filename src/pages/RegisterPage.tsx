import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import type { RegisterUserData } from '../services/api';
import { useNotifications } from '../notifications/notification-context';

function RegisterPage() {
  const navigate = useNavigate();
  const { notifyError, notifySuccess } = useNotifications();
  const [formData, setFormData] = useState<RegisterUserData>({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    password: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    // Validaciones
    if (formData.password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      const response = await apiService.registerUser(formData);
      notifySuccess(response.message);

      // Redirigir a la página de confirmación con el email
      void navigate('/confirm-email', {
        state: {
          email: formData.email,
          message: response.message,
        },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al registrar usuario';
      setError(message);
      notifyError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex w-full max-w-2xl flex-col justify-center px-6 py-16">
        <div className="mb-8">
          <span className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">
            Basurapp
          </span>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-100">
            Crear cuenta
          </h1>
          <p className="mt-3 text-sm text-slate-400">
            Completa el formulario para registrarte en BasurApp
          </p>
        </div>

        <form
          onSubmit={(event) => {
            void handleSubmit(event);
          }}
          className="rounded-2xl border border-slate-800 bg-slate-900/70 p-8 shadow-xl shadow-slate-950/40"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="firstName" className="text-sm font-medium text-slate-300">
                Nombre
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                value={formData.firstName}
                onChange={handleChange}
                className="mt-2 w-full rounded-md border border-slate-700/60 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-2 ring-transparent transition focus:border-cyan-500/70 focus:ring-cyan-500/20"
                placeholder="Juan"
              />
            </div>

            <div>
              <label htmlFor="lastName" className="text-sm font-medium text-slate-300">
                Apellido
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                value={formData.lastName}
                onChange={handleChange}
                className="mt-2 w-full rounded-md border border-slate-700/60 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-2 ring-transparent transition focus:border-cyan-500/70 focus:ring-cyan-500/20"
                placeholder="Pérez"
              />
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor="email" className="text-sm font-medium text-slate-300">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="mt-2 w-full rounded-md border border-slate-700/60 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-2 ring-transparent transition focus:border-cyan-500/70 focus:ring-cyan-500/20"
              placeholder="usuario@example.com"
              autoComplete="email"
            />
          </div>

          <div className="mt-4">
            <label htmlFor="phone" className="text-sm font-medium text-slate-300">
              Teléfono
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              required
              value={formData.phone}
              onChange={handleChange}
              className="mt-2 w-full rounded-md border border-slate-700/60 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-2 ring-transparent transition focus:border-cyan-500/70 focus:ring-cyan-500/20"
              placeholder="+57 300 123 4567"
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
              required
              value={formData.password}
              onChange={handleChange}
              className="mt-2 w-full rounded-md border border-slate-700/60 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-2 ring-transparent transition focus:border-cyan-500/70 focus:ring-cyan-500/20"
              placeholder="••••••••"
              autoComplete="new-password"
              minLength={6}
            />
            <p className="mt-1 text-xs text-slate-500">Mínimo 6 caracteres</p>
          </div>

          <div className="mt-4">
            <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-300">
              Confirmar contraseña
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-2 w-full rounded-md border border-slate-700/60 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-2 ring-transparent transition focus:border-cyan-500/70 focus:ring-cyan-500/20"
              placeholder="••••••••"
              autoComplete="new-password"
              minLength={6}
            />
          </div>

          {error && (
            <p className="mt-4 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-md bg-cyan-500 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Registrando...' : 'Crear cuenta'}
          </button>

          <p className="mt-4 text-center text-sm text-slate-400">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-cyan-400 hover:text-cyan-300">
              Inicia sesión
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;
