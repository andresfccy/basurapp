import { useEffect, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'

import { bogotaLocalities, pickupTimeSlots } from '../../data/pickups'
import type { PickupKind, PickupTimeSlot } from '../../data/pickups'

type PickupFormValues = {
  date: string
  timeSlot: PickupTimeSlot
  kind: PickupKind
  locality: string
  address: string
}

type PickupFormProps = {
  mode: 'create' | 'edit'
  initialValue: PickupFormValues
  minDate: string
  onSubmit: (values: PickupFormValues) => void
  onCancel: () => void
}

function clampDate(value: string, minDate: string) {
  if (!value) return minDate
  return value < minDate ? minDate : value
}

function PickupForm({ mode, initialValue, minDate, onSubmit, onCancel }: PickupFormProps) {
  const [formValues, setFormValues] = useState<PickupFormValues>({
    ...initialValue,
    date: clampDate(initialValue.date, minDate),
  })

  useEffect(() => {
    setFormValues({
      ...initialValue,
      date: clampDate(initialValue.date, minDate),
    })
  }, [initialValue, minDate])

  const handleChange = (field: keyof PickupFormValues) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = event.target.value
    setFormValues((current) => ({
      ...current,
      [field]: field === 'date' ? clampDate(value, minDate) : value,
    }))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void onSubmit(formValues)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="pickup-date" className="text-sm font-medium text-slate-300">
          Fecha programada
        </label>
        <input
          id="pickup-date"
          name="date"
          type="date"
          value={formValues.date}
          min={minDate}
          onChange={handleChange('date')}
          className="mt-2 w-full rounded-md border border-slate-700/60 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-2 ring-transparent transition focus:border-cyan-500/70 focus:ring-cyan-500/20"
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="pickup-kind" className="text-sm font-medium text-slate-300">
            Tipo de recolección
          </label>
          <select
            id="pickup-kind"
            name="kind"
            value={formValues.kind}
            onChange={handleChange('kind')}
            className="mt-2 w-full rounded-md border border-slate-700/60 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-2 ring-transparent transition focus:border-cyan-500/70 focus:ring-cyan-500/20"
            required
          >
            <option value="organico">Orgánico</option>
            <option value="inorganicos">Inorgánicos</option>
            <option value="peligrosos">Peligrosos</option>
          </select>
        </div>
        <div>
          <label htmlFor="pickup-time-slot" className="text-sm font-medium text-slate-300">
            Horario
          </label>
          <select
            id="pickup-time-slot"
            name="timeSlot"
            value={formValues.timeSlot}
            onChange={handleChange('timeSlot')}
            className="mt-2 w-full rounded-md border border-slate-700/60 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-2 ring-transparent transition focus:border-cyan-500/70 focus:ring-cyan-500/20"
            required
          >
            {pickupTimeSlots.map((slot) => (
              <option key={slot} value={slot}>
                {slot}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="pickup-locality" className="text-sm font-medium text-slate-300">
          Localidad
        </label>
        <select
          id="pickup-locality"
          name="locality"
          value={formValues.locality}
          onChange={handleChange('locality')}
          className="mt-2 w-full rounded-md border border-slate-700/60 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-2 ring-transparent transition focus:border-cyan-500/70 focus:ring-cyan-500/20"
          required
        >
          <option value="" disabled>
            Selecciona una localidad
          </option>
          {bogotaLocalities.map((locality) => (
            <option key={locality} value={locality}>
              {locality}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="pickup-address" className="text-sm font-medium text-slate-300">
          Dirección de recogida
        </label>
        <input
          id="pickup-address"
          name="address"
          value={formValues.address}
          onChange={handleChange('address')}
          placeholder="Ej. Carrera 15 #45-10"
          className="mt-2 w-full rounded-md border border-slate-700/60 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-2 ring-transparent transition focus:border-cyan-500/70 focus:ring-cyan-500/20"
          required
        />
      </div>

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
          className="inline-flex items-center rounded-md bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
        >
          {mode === 'create' ? 'Programar recolección' : 'Actualizar recolección'}
        </button>
      </div>
    </form>
  )
}

export type { PickupFormValues }
export default PickupForm
