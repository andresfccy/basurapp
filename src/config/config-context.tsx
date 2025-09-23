/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

import type { PickupKind } from '../data/pickups'

export type PointsFormula = {
  basePoints: Record<PickupKind, number>
  inorganicWeightMultiplier: number // puntos adicionales por kilogramo
}

export type FrequencyRules = {
  organico: {
    weekdayByLocality: Record<string, number> // 0 = domingo
  }
  inorganicos: {
    maxPerWeek: number
    minHoursBetween: number
  }
  peligrosos: {
    maxPerWeekPerUser: number
    capacityByLocality: Record<string, number>
  }
}

type ConfigContextValue = {
  pointsFormula: PointsFormula
  frequencyRules: FrequencyRules
  updatePointsFormula: (updater: (prev: PointsFormula) => PointsFormula) => void
  updateFrequencyRules: (updater: (prev: FrequencyRules) => FrequencyRules) => void
}

const defaultPointsFormula: PointsFormula = {
  basePoints: {
    organico: 50,
    inorganicos: 40,
    peligrosos: 120,
  },
  inorganicWeightMultiplier: 6,
}

const defaultFrequencyRules: FrequencyRules = {
  organico: {
    weekdayByLocality: {
      Suba: 3, // miércoles
      Chapinero: 2, // martes
      Kennedy: 4, // jueves
      Engativá: 1, // lunes
      Fontibón: 5, // viernes
    },
  },
  inorganicos: {
    maxPerWeek: 2,
    minHoursBetween: 24,
  },
  peligrosos: {
    maxPerWeekPerUser: 1,
    capacityByLocality: {
      Kennedy: 2,
      Chapinero: 1,
      Suba: 1,
      Engativá: 1,
      Fontibón: 1,
    },
  },
}

const ConfigContext = createContext<ConfigContextValue | undefined>(undefined)

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [pointsFormula, setPointsFormula] = useState<PointsFormula>(defaultPointsFormula)
  const [frequencyRules, setFrequencyRules] = useState<FrequencyRules>(defaultFrequencyRules)

  const value = useMemo<ConfigContextValue>(
    () => ({
      pointsFormula,
      frequencyRules,
      updatePointsFormula: (updater) => setPointsFormula((prev) => updater(prev)),
      updateFrequencyRules: (updater) => setFrequencyRules((prev) => updater(prev)),
    }),
    [pointsFormula, frequencyRules],
  )

  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>
}

export function useConfig() {
  const context = useContext(ConfigContext)
  if (!context) {
    throw new Error('useConfig debe usarse dentro de ConfigProvider')
  }
  return context
}
