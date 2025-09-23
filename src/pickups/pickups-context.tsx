/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

import { upcomingPickups, type Pickup } from '../data/pickups'

type UpdatePickupFn = (pickup: Pickup) => Pickup

type PickupsContextValue = {
  pickups: Pickup[]
  addPickup: (pickup: Pickup) => void
  updatePickup: (id: string, updater: UpdatePickupFn) => void
  replacePickups: (updater: (prev: Pickup[]) => Pickup[]) => void
}

const PickupsContext = createContext<PickupsContextValue | undefined>(undefined)

export function PickupsProvider({ children }: { children: ReactNode }) {
  const [pickups, setPickups] = useState<Pickup[]>(upcomingPickups)

  const value = useMemo<PickupsContextValue>(
    () => ({
      pickups,
      addPickup: (pickup) => setPickups((prev) => [...prev, pickup]),
      updatePickup: (id, updater) =>
        setPickups((prev) => prev.map((pickup) => (pickup.id === id ? updater(pickup) : pickup))),
      replacePickups: (updater) => setPickups((prev) => updater(prev)),
    }),
    [pickups],
  )

  return <PickupsContext.Provider value={value}>{children}</PickupsContext.Provider>
}

export function usePickups() {
  const context = useContext(PickupsContext)
  if (!context) {
    throw new Error('usePickups debe usarse dentro de PickupsProvider')
  }
  return context
}
