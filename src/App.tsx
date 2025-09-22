function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <header className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-24 text-center text-slate-100">
        <span className="inline-flex items-center justify-center rounded-full bg-slate-800/60 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
          Ingeniería de Software
        </span>
        <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
          React + Vite listo para desplegar en Vercel
        </h1>
        <p className="mx-auto max-w-2xl text-balance text-base text-slate-300 md:text-lg">
          Este proyecto está configurado con TypeScript, Tailwind CSS y ESLint para un flujo de
          trabajo moderno. Ejecuta <code className="rounded bg-slate-800 px-2 py-1 font-mono text-sm">pnpm
          dev</code> para comenzar a iterar.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm font-medium text-slate-200">
          <a
            className="group inline-flex items-center gap-2 rounded-full border border-slate-700/70 bg-slate-900/70 px-5 py-2 transition hover:border-cyan-400/70 hover:text-cyan-300"
            href="https://vitejs.dev"
            target="_blank"
            rel="noreferrer"
          >
            Vite Docs
            <span className="translate-y-[1px] transition-transform group-hover:translate-x-0.5">→</span>
          </a>
          <a
            className="group inline-flex items-center gap-2 rounded-full border border-slate-700/70 bg-slate-900/70 px-5 py-2 transition hover:border-cyan-400/70 hover:text-cyan-300"
            href="https://tailwindcss.com/docs"
            target="_blank"
            rel="noreferrer"
          >
            Tailwind Docs
            <span className="translate-y-[1px] transition-transform group-hover:translate-x-0.5">→</span>
          </a>
          <a
            className="group inline-flex items-center gap-2 rounded-full border border-slate-700/70 bg-slate-900/70 px-5 py-2 transition hover:border-cyan-400/70 hover:text-cyan-300"
            href="https://eslint.org/docs/latest/"
            target="_blank"
            rel="noreferrer"
          >
            ESLint Docs
            <span className="translate-y-[1px] transition-transform group-hover:translate-x-0.5">→</span>
          </a>
        </div>
      </header>
    </div>
  )
}

export default App
