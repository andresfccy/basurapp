/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { ReactNode } from 'react'

import type { Pickup } from '../data/pickups'
import { useAuth } from '../auth/auth-context'
import { apiService } from '../services/api'
import type {
  CompletePickupData,
  SchedulePickupData,
  UpdatePickupData,
} from '../services/api'
import { useNotifications } from '../notifications/notification-context'

type PickupsContextValue = {
  pickups: Pickup[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  schedulePickup: (payload: SchedulePickupData) => Promise<Pickup>
  updatePickup: (id: string, payload: UpdatePickupData) => Promise<Pickup>
  archivePickup: (id: string) => Promise<Pickup>
  completePickup: (id: string, payload: CompletePickupData) => Promise<Pickup>
}

const PickupsContext = createContext<PickupsContextValue | undefined>(undefined)

export function PickupsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const { notifyError, notifySuccess } = useNotifications()
  const [pickups, setPickups] = useState<Pickup[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const requestIdRef = useRef(0)

  const refresh = useCallback(async () => {
    if (!user) {
      setPickups([])
      setError(null)
      setLoading(false)
      return
    }

    const requestId = Date.now()
    requestIdRef.current = requestId
    setLoading(true)

    try {
      const data = await apiService.getPickups()
      if (requestIdRef.current !== requestId) return
      setPickups(data)
      setError(null)
    } catch (err) {
      if (requestIdRef.current !== requestId) return
      const message = err instanceof Error ? err.message : 'Error al cargar las recolecciones'
      setError(message)
      setPickups([])
      notifyError(message, { title: 'Error al cargar recolecciones' })
    } finally {
      if (requestIdRef.current === requestId) {
        setLoading(false)
      }
    }
  }, [notifyError, user])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const schedulePickup = useCallback(
    async (payload: SchedulePickupData) => {
      if (!user) {
        const message = 'Debes iniciar sesión para programar recolecciones.'
        notifyError(message)
        throw new Error(message)
      }
      try {
        const created = await apiService.createPickup(payload)
        setPickups((prev) => [...prev, created])
        setError(null)
        notifySuccess('Recolección programada correctamente.')
        return created
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'No se pudo programar la recolección.'
        notifyError(message)
        throw error instanceof Error ? error : new Error(message)
      }
    },
    [notifyError, notifySuccess, user],
  )

  const updatePickup = useCallback(
    async (id: string, payload: UpdatePickupData) => {
      if (!user) {
        const message = 'Debes iniciar sesión para actualizar recolecciones.'
        notifyError(message)
        throw new Error(message)
      }
      try {
        const updated = await apiService.updatePickup(id, payload)
        setPickups((prev) => prev.map((pickup) => (pickup.id === updated.id ? updated : pickup)))
        setError(null)
        notifySuccess('Recolección actualizada correctamente.')
        return updated
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'No se pudo actualizar la recolección.'
        notifyError(message)
        throw error instanceof Error ? error : new Error(message)
      }
    },
    [notifyError, notifySuccess, user],
  )

  const archivePickup = useCallback(
    async (id: string) => {
      if (!user) {
        const message = 'Debes iniciar sesión para eliminar recolecciones.'
        notifyError(message)
        throw new Error(message)
      }
      try {
        const archived = await apiService.archivePickup(id)
        setPickups((prev) => prev.map((pickup) => (pickup.id === archived.id ? archived : pickup)))
        setError(null)
        notifySuccess('Recolección eliminada del listado.')
        return archived
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'No se pudo eliminar la recolección.'
        notifyError(message)
        throw error instanceof Error ? error : new Error(message)
      }
    },
    [notifyError, notifySuccess, user],
  )

  const completePickup = useCallback(
    async (id: string, payload: CompletePickupData) => {
      if (!user) {
        const message = 'Debes iniciar sesión para registrar recolecciones.'
        notifyError(message)
        throw new Error(message)
      }
      try {
        const completed = await apiService.completePickup(id, payload)
        setPickups((prev) => prev.map((pickup) => (pickup.id === completed.id ? completed : pickup)))
        setError(null)
        notifySuccess('Recolección registrada como completada.')
        return completed
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'No se pudo registrar la recolección.'
        notifyError(message)
        throw error instanceof Error ? error : new Error(message)
      }
    },
    [notifyError, notifySuccess, user],
  )

  const value = useMemo<PickupsContextValue>(
    () => ({
      pickups,
      loading,
      error,
      refresh,
      schedulePickup,
      updatePickup,
      archivePickup,
      completePickup,
    }),
    [archivePickup, completePickup, error, loading, pickups, refresh, schedulePickup, updatePickup],
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
