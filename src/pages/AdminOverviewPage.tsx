import { useMemo } from 'react'

import { useConfig } from '../config/config-context'
import type { PickupKind } from '../data/pickups'

const pickupKindLabels: Record<PickupKind, string> = {
  organico: 'Orgánicos',
  inorganicos: 'Inorgánicos',
  peligrosos: 'Peligrosos',
}

const weekdayOptions = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
]

function AdminOverviewPage() {
  const { pointsFormula, frequencyRules, updatePointsFormula, updateFrequencyRules } = useConfig()

  const organicoLocalities = useMemo(() => Object.keys(frequencyRules.organico.weekdayByLocality), [frequencyRules])
  const peligrosoLocalities = useMemo(
    () => Object.keys(frequencyRules.peligrosos.capacityByLocality),
    [frequencyRules],
  )

  const handleBasePointsChange = (kind: PickupKind, value: number) => {
    updatePointsFormula((prev) => ({
      ...prev,
      basePoints: {
        ...prev.basePoints,
        [kind]: value,
      },
    }))
  }

  const handleWeightMultiplierChange = (value: number) => {
    updatePointsFormula((prev) => ({
      ...prev,
      inorganicWeightMultiplier: value,
    }))
  }

  const handleOrganicoWeekdayChange = (locality: string, value: number) => {
    updateFrequencyRules((prev) => ({
      ...prev,
      organico: {
        ...prev.organico,
        weekdayByLocality: {
          ...prev.organico.weekdayByLocality,
          [locality]: value,
        },
      },
    }))
  }

  const handleInorganicRuleChange = (key: 'maxPerWeek' | 'minHoursBetween', value: number) => {
    updateFrequencyRules((prev) => ({
      ...prev,
      inorganicos: {
        ...prev.inorganicos,
        [key]: value,
      },
    }))
  }

  const handleHazardousCapacityChange = (locality: string, value: number) => {
    updateFrequencyRules((prev) => ({
      ...prev,
      peligrosos: {
        ...prev.peligrosos,
        capacityByLocality: {
          ...prev.peligrosos.capacityByLocality,
          [locality]: value,
        },
      },
    }))
  }

  const handleHazardousUserLimitChange = (value: number) => {
    updateFrequencyRules((prev) => ({
      ...prev,
      peligrosos: {
        ...prev.peligrosos,
        maxPerWeekPerUser: value,
      },
    }))
  }

  return (
    <div className="flex flex-col gap-10">
      <section className="mx-auto w-full max-w-5xl overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/60">
        <header className="border-b border-slate-800 px-6 py-5">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-100">Fórmula de puntos</h2>
          <p className="mt-2 text-sm text-slate-400">
            Ajusta la cantidad de puntos que recibe un usuario según el tipo de recolección realizada. Los
            cambios aplican inmediatamente a las nuevas recolecciones y a los cálculos visibles en la
            plataforma.
          </p>
        </header>

        <div className="overflow-x-auto px-6 py-5 text-sm text-slate-200">
          <table className="min-w-full divide-y divide-slate-800">
            <thead className="bg-slate-900/70 text-xs uppercase tracking-[0.3em] text-slate-500">
              <tr>
                <th className="px-4 py-2 text-left">Tipo de recolección</th>
                <th className="px-4 py-2 text-left">Puntos base</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {Object.entries(pointsFormula.basePoints).map(([kind, points]) => (
                <tr key={kind} className="hover:bg-slate-900/60">
                  <td className="px-4 py-3 font-medium text-slate-100">{pickupKindLabels[kind as PickupKind]}</td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min={0}
                      className="w-28 rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-cyan-500/70 focus:outline-none"
                      value={points}
                      onChange={(event) => handleBasePointsChange(kind as PickupKind, Number(event.target.value))}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-6 flex flex-col gap-2 rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-4">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
              Inorgánicos · peso recogido
            </span>
            <label className="flex items-center gap-3 text-sm text-slate-300">
              <span>Puntos adicionales por kilogramo:</span>
              <input
                type="number"
                min={0}
                step={0.5}
                className="w-28 rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-cyan-500/70 focus:outline-none"
                value={pointsFormula.inorganicWeightMultiplier}
                onChange={(event) => handleWeightMultiplierChange(Number(event.target.value))}
              />
            </label>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/60">
        <header className="border-b border-slate-800 px-6 py-5">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-100">Reglas de programación</h2>
          <p className="mt-2 text-sm text-slate-400">
            Define la periodicidad de cada tipo de recolección para garantizar una operación ordenada y
            equitativa por localidad.
          </p>
        </header>

        <div className="flex flex-col gap-8 px-6 py-6 text-sm text-slate-200">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-slate-100">Orgánicos · día asignado</h3>
            <p className="text-xs text-slate-400">
              Cada localidad tiene un día designado a la semana. Solo se permitirán programaciones en ese
              día específico.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {organicoLocalities.map((locality) => (
                <label key={locality} className="flex flex-col gap-2 rounded-lg border border-slate-800 bg-slate-900/60 p-3">
                  <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">{locality}</span>
                  <select
                    className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-cyan-500/70 focus:outline-none"
                    value={frequencyRules.organico.weekdayByLocality[locality] ?? frequencyRules.organico.weekdayByLocality.default ?? 0}
                    onChange={(event) => handleOrganicoWeekdayChange(locality, Number(event.target.value))}
                  >
                    {weekdayOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-slate-100">Inorgánicos · frecuencia</h3>
            <div className="flex flex-wrap gap-4">
              <label className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Máximo por semana</span>
                <input
                  type="number"
                  min={1}
                  className="w-24 rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-cyan-500/70 focus:outline-none"
                  value={frequencyRules.inorganicos.maxPerWeek}
                  onChange={(event) => handleInorganicRuleChange('maxPerWeek', Number(event.target.value))}
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Mínimo de horas entre turnos</span>
                <input
                  type="number"
                  min={1}
                  className="w-28 rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-cyan-500/70 focus:outline-none"
                  value={frequencyRules.inorganicos.minHoursBetween}
                  onChange={(event) => handleInorganicRuleChange('minHoursBetween', Number(event.target.value))}
                />
              </label>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-slate-100">Peligrosos · cupos</h3>
            <div className="flex flex-wrap gap-4">
              <label className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Máximo por usuario y semana</span>
                <input
                  type="number"
                  min={1}
                  className="w-24 rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-cyan-500/70 focus:outline-none"
                  value={frequencyRules.peligrosos.maxPerWeekPerUser}
                  onChange={(event) => handleHazardousUserLimitChange(Number(event.target.value))}
                />
              </label>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {peligrosoLocalities.map((locality) => (
                <label key={locality} className="flex flex-col gap-2 rounded-lg border border-slate-800 bg-slate-900/60 p-3">
                  <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Cupo en {locality}</span>
                  <input
                    type="number"
                    min={1}
                    className="w-24 rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-cyan-500/70 focus:outline-none"
                    value={frequencyRules.peligrosos.capacityByLocality[locality] ?? frequencyRules.peligrosos.capacityByLocality.default ?? 1}
                    onChange={(event) => handleHazardousCapacityChange(locality, Number(event.target.value))}
                  />
                </label>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AdminOverviewPage
