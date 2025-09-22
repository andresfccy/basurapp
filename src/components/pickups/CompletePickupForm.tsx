import { useState } from 'react'
import type { FormEvent } from 'react'

import type { Pickup } from '../../data/pickups'

type CompletePickupFormProps = {
  pickup: Pickup
  defaultDateTime: string
  onSubmit: (values: { completedAt: string; collectedWeightKg: number | null }) => void
  onCancel: () => void
}

function CompletePickupForm({ pickup, defaultDateTime, onSubmit, onCancel }: CompletePickupFormProps) {
  const isInorganic = pickup.kind === 'inorganicos'
  const [completedAt, setCompletedAt] = useState(defaultDateTime)
  const [weight, setWeight] = useState(() =>
    pickup.collectedWeightKg ? pickup.collectedWeightKg.toString() : '',
  )
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!completedAt) {
      setError('Selecciona la fecha y hora de finalización.')
      return
    }

    if (isInorganic) {
      const weightValue = Number(weight)
      if (!weight || Number.isNaN(weightValue) || weightValue <= 0) {
        setError('Registra un peso válido mayor a 0 kg.')
        return
      }
      setError(null)
      onSubmit({ completedAt, collectedWeightKg: weightValue })
      return
    }

    setError(null)
    onSubmit({ completedAt, collectedWeightKg: null })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="completed-at" className="text-sm font-medium text-slate-300">
          Fecha y hora de realización
        </label>
        <input
          id="completed-at"
          type="datetime-local"
          value={completedAt}
          max={defaultDateTime}
          onChange={(event) => setCompletedAt(event.target.value)}
          className="mt-2 w-full rounded-md border border-slate-700/60 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-2 ring-transparent transition focus:border-cyan-500/70 focus:ring-cyan-500/20"
          required
        />
      </div>

      {isInorganic && (
        <div>
          <label htmlFor="collected-weight" className="text-sm font-medium text-slate-300">
            Peso recogido (kg)
          </label>
          <input
            id="collected-weight"
            type="number"
            min="0"
            step="0.1"
            value={weight}
            onChange={(event) => setWeight(event.target.value)}
            placeholder="Ej. 125.5"
            className="mt-2 w-full rounded-md border border-slate-700/60 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-2 ring-transparent transition focus:border-cyan-500/70 focus:ring-cyan-500/20"
            required
          />
        </div>
      )}

      {error && (
        <p className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      )}

      <div className="flex flex-wrap justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center rounded-md border border-slate-700/70 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-slate-500/60 hover:text-slate-100"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="inline-flex items-center rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
        >
          Registrar recolección
        </button>
      </div>
    </form>
  )
}

export default CompletePickupForm
