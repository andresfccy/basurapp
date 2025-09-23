import { useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'

import { useAuth } from '../auth/auth-context'
import MonthlyCalendar from '../components/calendar/MonthlyCalendar'
import PickupForm, { type PickupFormValues } from '../components/pickups/PickupForm'
import { useConfig } from '../config/config-context'
import type { FrequencyRules } from '../config/config-context'
import { usePickups } from '../pickups/pickups-context'
import CompletePickupForm from '../components/pickups/CompletePickupForm'
import Modal from '../components/shared/Modal'
import { calculatePickupPoints } from '../utils/points'
import {
  type Pickup,
  type PickupKind,
  type PickupStatus,
  type PickupTimeSlot,
} from '../data/pickups'

const statusStyles: Record<PickupStatus, { card: string; chip: string; label: string }> = {
  pending: {
    card: 'border-slate-800 bg-slate-900/70',
    chip: 'border-slate-700/70 bg-slate-800/70 text-slate-300',
    label: 'Pendiente',
  },
  confirmed: {
    card: 'border-cyan-500/40 bg-cyan-500/10',
    chip: 'border-cyan-400/40 bg-cyan-500/15 text-cyan-200',
    label: 'Confirmada',
  },
  rejected: {
    card: 'border-red-500/40 bg-red-500/10',
    chip: 'border-red-400/40 bg-red-500/15 text-red-200',
    label: 'Rechazada',
  },
  completed: {
    card: 'border-emerald-500/60 bg-emerald-500/10',
    chip: 'border-emerald-400/60 bg-emerald-500/15 text-emerald-200',
    label: 'Realizada',
  },
}

const kindLabels: Record<PickupKind, string> = {
  organico: 'Orgánico',
  inorganicos: 'Inorgánicos',
  peligrosos: 'Peligrosos',
}

const slotStartHour: Record<PickupTimeSlot, number> = {
  '08:00 - 12:00': 8,
  '12:00 - 16:00': 12,
  '16:00 - 20:00': 16,
}

function toTitleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function formatDateLabel(isoDate: string) {
  const target = new Date(isoDate)
  const fullFormatter = new Intl.DateTimeFormat('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  })
  const shortFormatter = new Intl.DateTimeFormat('es-CO', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })

  return {
    full: toTitleCase(fullFormatter.format(target)),
    short: toTitleCase(shortFormatter.format(target)),
  }
}

function getRemainingDaysLabel(isoDate: string) {
  const now = new Date()
  const target = new Date(isoDate)
  const msPerDay = 1000 * 60 * 60 * 24
  const diff = Math.ceil((target.getTime() - now.getTime()) / msPerDay)

  if (diff > 1) return `Faltan ${diff} días`
  if (diff === 1) return 'Falta 1 día'
  if (diff === 0) return 'Es hoy'
  if (diff === -1) return 'Fue hace 1 día'
  return `Fue hace ${Math.abs(diff)} días`
}

function startOfDay(date: Date) {
  const result = new Date(date)
  result.setHours(0, 0, 0, 0)
  return result
}

function dateFromInput(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, (month ?? 1) - 1, day ?? 1)
}

function isDateInputAfter(value: string, reference: Date) {
  return startOfDay(dateFromInput(value)) > reference
}

function isDateSelectable(date: Date, reference: Date) {
  return startOfDay(date) > reference
}

function toDateInputValue(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function buildScheduledIso(dateInput: string, slot: PickupTimeSlot) {
  const [year, month, day] = dateInput.split('-').map(Number)
  const hour = slotStartHour[slot]
  const date = new Date(year, (month ?? 1) - 1, day ?? 1, hour, 0, 0, 0)
  return date.toISOString()
}

function toDateTimeLocalValue(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

function isoFromDateTimeLocal(value: string) {
  return new Date(value).toISOString()
}

function getDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function extractDateKey(isoDate: string) {
  return getDateKey(new Date(isoDate))
}

function startOfWeek(date: Date) {
  const result = startOfDay(date)
  const day = result.getDay()
  const diff = (day + 6) % 7
  result.setDate(result.getDate() - diff)
  return result
}

function hoursBetween(a: Date, b: Date) {
  return Math.abs(a.getTime() - b.getTime()) / (1000 * 60 * 60)
}

const WEEKDAY_LABELS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'] as const

function getWeekdayLabel(index: number) {
  return WEEKDAY_LABELS[(index % 7 + 7) % 7]
}

type SchedulingValidationParams = {
  values: PickupFormValues
  scheduledDate: Date
  existingPickups: Pickup[]
  requestedBy: string
  rules: FrequencyRules
  ignorePickupId?: string
}

function validateSchedulingRules({ values, scheduledDate, existingPickups, requestedBy, rules, ignorePickupId }: SchedulingValidationParams) {
  const relevantPickups = existingPickups.filter((pickup) => !pickup.archived && pickup.id !== ignorePickupId)
  const weekStart = startOfWeek(scheduledDate)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 7)

  const pickupsSameWeek = relevantPickups.filter((pickup) => {
    const pickupDate = new Date(pickup.scheduledAt)
    return pickupDate >= weekStart && pickupDate < weekEnd
  })

  const userWeekPickups = pickupsSameWeek.filter(
    (pickup) => pickup.kind === values.kind && pickup.requestedBy === requestedBy,
  )

  if (values.kind === 'organico') {
    const assignedWeekday =
      rules.organico.weekdayByLocality[values.locality] ?? rules.organico.weekdayByLocality.default

    if (typeof assignedWeekday === 'number' && scheduledDate.getDay() !== assignedWeekday) {
      return {
        valid: false,
        message: `Las recolecciones orgánicas en ${values.locality} solo se programan los ${getWeekdayLabel(assignedWeekday)}.`,
      }
    }
  }

  if (values.kind === 'inorganicos') {
    if (userWeekPickups.length >= rules.inorganicos.maxPerWeek) {
      return {
        valid: false,
        message: `Solo puedes agendar ${rules.inorganicos.maxPerWeek} recolecciones de inorgánicos por semana.`,
      }
    }

    const hasConflict = userWeekPickups.some((pickup) => {
      const pickupDate = new Date(pickup.scheduledAt)
      return hoursBetween(pickupDate, scheduledDate) < rules.inorganicos.minHoursBetween
    })

    if (hasConflict) {
      return {
        valid: false,
        message: `Debes dejar al menos ${rules.inorganicos.minHoursBetween} horas entre recolecciones de inorgánicos.`,
      }
    }
  }

  if (values.kind === 'peligrosos') {
    if (userWeekPickups.length >= rules.peligrosos.maxPerWeekPerUser) {
      return {
        valid: false,
        message: 'Solo puedes programar una recolección de residuos peligrosos por semana.',
      }
    }

    const capacity =
      rules.peligrosos.capacityByLocality[values.locality] ?? rules.peligrosos.capacityByLocality.default ?? 1
    const localityCount = pickupsSameWeek.filter(
      (pickup) => pickup.kind === 'peligrosos' && pickup.locality === values.locality,
    ).length

    if (localityCount >= capacity) {
      return {
        valid: false,
        message: `Los cupos para residuos peligrosos en ${values.locality} ya están completos esta semana.`,
      }
    }
  }

  return { valid: true }
}

function HomePage() {
  const { user } = useAuth()
  const { pointsFormula, frequencyRules } = useConfig()
  const { pickups, addPickup, updatePickup } = usePickups()
  const today = useMemo(() => startOfDay(new Date()), [])
  const tomorrow = useMemo(() => {
    const next = new Date(today)
    next.setDate(next.getDate() + 1)
    return next
  }, [today])
  const minDateInput = useMemo(() => toDateInputValue(tomorrow), [tomorrow])

  const [monthCursor, setMonthCursor] = useState(() => {
    const today = new Date()
    return new Date(today.getFullYear(), today.getMonth(), 1)
  })
  const [isScheduleModalOpen, setScheduleModalOpen] = useState(false)
  const [isEditModalOpen, setEditModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [editingPickup, setEditingPickup] = useState<Pickup | null>(null)
  const [pickupToComplete, setPickupToComplete] = useState<Pickup | null>(null)
  const [completeModalDefaultDate, setCompleteModalDefaultDate] = useState<string | null>(null)
  const [adminFiltersOpen, setAdminFiltersOpen] = useState(false)
  const filterContainerRef = useRef<HTMLDivElement | null>(null)

  const userLogin = user?.username ?? ''
  const normalizedCollectorUsername = useMemo(() => userLogin.trim().toLowerCase(), [userLogin])
  const isCitizen = user?.role === 'basic'
  const isCollector = user?.role === 'collector'
  const isAdmin = user?.role === 'admin'

  const activePickups = useMemo(
    () =>
      pickups
        .filter((pickup) => !pickup.archived)
        .slice()
        .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()),
    [pickups],
  )

  const highlightedDates = useMemo(() => {
    return new Set(activePickups.map((pickup) => extractDateKey(pickup.scheduledAt)))
  }, [activePickups])

  const collectorPickups = useMemo(() => {
    if (!isCollector) return []
    return activePickups.filter((pickup) => {
      if (pickup.status === 'pending') return false
      const assignedUsername = pickup.staffUsername ?? ''
      return assignedUsername.trim().toLowerCase() === normalizedCollectorUsername
    })
  }, [activePickups, isCollector, normalizedCollectorUsername])

  const modalPickupLabel = pickupToComplete ? formatDateLabel(pickupToComplete.scheduledAt) : null

  useEffect(() => {
    if (!adminFiltersOpen) return

    const handleClick = (event: MouseEvent) => {
      if (!filterContainerRef.current) return
      if (!filterContainerRef.current.contains(event.target as Node)) {
        setAdminFiltersOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setAdminFiltersOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [adminFiltersOpen])

  useEffect(() => {
    if (!isAdmin) {
      setAdminFiltersOpen(false)
    }
  }, [isAdmin])

  const handleSelectCalendarDate = (date: Date) => {
    if (!isDateSelectable(date, today)) return
    setSelectedDate(toDateInputValue(date))
    setScheduleModalOpen(true)
  }

  const handleCreatePickup = (values: PickupFormValues) => {
    if (!isDateInputAfter(values.date, today)) {
      window.alert('Selecciona una fecha posterior a hoy.')
      return
    }

    const scheduledAt = buildScheduledIso(values.date, values.timeSlot)
    const scheduledDate = new Date(scheduledAt)

    const validation = validateSchedulingRules({
      values,
      scheduledDate,
      existingPickups: pickups,
      requestedBy: user?.displayName ?? 'Ciudadano',
      rules: frequencyRules,
    })

    if (!validation.valid) {
      window.alert(validation.message)
      return
    }

    const newPickup: Pickup = {
      id: `pk-${Date.now()}`,
      scheduledAt,
      status: 'pending',
      staff: null,
      staffUsername: null,
      requestedBy: user?.displayName ?? 'Ciudadano',
      kind: values.kind,
      locality: values.locality,
      address: values.address,
      timeSlot: values.timeSlot,
    }

    addPickup(newPickup)
    setScheduleModalOpen(false)
    setSelectedDate(null)
  }

  const handleEditPickup = (values: PickupFormValues) => {
    if (!editingPickup) return
    if (!isDateInputAfter(values.date, today)) {
      window.alert('Selecciona una fecha posterior a hoy.')
      return
    }

    const scheduledAt = buildScheduledIso(values.date, values.timeSlot)
    const scheduledDate = new Date(scheduledAt)

    const validation = validateSchedulingRules({
      values,
      scheduledDate,
      existingPickups: pickups,
      requestedBy: editingPickup.requestedBy ?? user?.displayName ?? 'Ciudadano',
      rules: frequencyRules,
      ignorePickupId: editingPickup.id,
    })

    if (!validation.valid) {
      window.alert(validation.message)
      return
    }

    updatePickup(editingPickup.id, (pickup) => ({
      ...pickup,
      scheduledAt,
      kind: values.kind,
      locality: values.locality,
      address: values.address,
      timeSlot: values.timeSlot,
    }))

    setEditModalOpen(false)
    setEditingPickup(null)
  }

  const handleEditClick = (pickup: Pickup) => {
    setEditingPickup(pickup)
    setEditModalOpen(true)
  }

  const handleDeletePickup = (pickup: Pickup) => {
    const shouldDelete = window.confirm('¿Deseas eliminar esta recolección del listado?')
    if (!shouldDelete) return

    updatePickup(pickup.id, (item) => ({ ...item, archived: true }))
  }

  const handleOpenCompleteModal = (pickup: Pickup) => {
    setPickupToComplete(pickup)
    setCompleteModalDefaultDate(toDateTimeLocalValue(new Date()))
  }

  const handleCloseCompleteModal = () => {
    setPickupToComplete(null)
    setCompleteModalDefaultDate(null)
  }

  const handleCompletePickup = (values: { completedAt: string; collectedWeightKg: number | null }) => {
    if (!pickupToComplete) return

    if (new Date(values.completedAt) > new Date()) {
      window.alert('No puedes registrar una fecha futura.')
      return
    }

    const completedAtIso = isoFromDateTimeLocal(values.completedAt)

    updatePickup(pickupToComplete.id, (pickup) => ({
      ...pickup,
      scheduledAt: completedAtIso,
      status: 'completed',
      collectedWeightKg: values.collectedWeightKg,
    }))

    handleCloseCompleteModal()
  }

  const renderPickupCard = (pickup: Pickup, options?: { showRequestedBy?: boolean }) => {
    const status = statusStyles[pickup.status]
    let staffDisplay = '—'
    if (pickup.status === 'pending') {
      staffDisplay = 'Por confirmar'
    } else if (pickup.status === 'confirmed') {
      staffDisplay = pickup.staff ?? 'Asignación pendiente'
    } else if (pickup.status === 'completed') {
      staffDisplay = pickup.staff ?? 'Equipo de recolección'
    }
    const dateLabel = formatDateLabel(pickup.scheduledAt)
    const showRequestedBy = options?.showRequestedBy ?? false
    const requesterLabel = pickup.requestedBy ?? '—'
    const points = calculatePickupPoints(pickup, pointsFormula)

    return (
      <article
        key={pickup.id}
        className={`rounded-xl border px-5 py-4 shadow-sm shadow-slate-950/30 transition hover:shadow-lg ${status.card}`}
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-2xl font-semibold tracking-tight text-slate-100">
              <span className="hidden lg:inline">{dateLabel.full}</span>
              <span className="inline lg:hidden">{dateLabel.short}</span>
            </p>
            <p className="mt-1 text-sm font-medium text-slate-300">
              {getRemainingDaysLabel(pickup.scheduledAt)}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2 text-xs">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-500/10 px-3 py-1 font-semibold uppercase tracking-[0.2em] text-amber-200">
              {points} pts
            </span>
            <span
              className={`inline-flex items-center rounded-full border px-3 py-1 font-semibold uppercase tracking-[0.2em] ${status.chip}`}
            >
              {status.label}
            </span>
          </div>
        </div>

        <dl className="mt-4 grid gap-4 text-sm text-slate-200 md:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-[0.3em] text-slate-500">Staff</dt>
            <dd className="mt-1 font-medium text-slate-100">{staffDisplay}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-[0.3em] text-slate-500">Tipo</dt>
            <dd className="mt-1 font-medium text-slate-100">{kindLabels[pickup.kind]}</dd>
          </div>
          {showRequestedBy && (
            <div>
              <dt className="text-xs uppercase tracking-[0.3em] text-slate-500">Solicitado por</dt>
              <dd className="mt-1 font-medium text-slate-100">{requesterLabel}</dd>
            </div>
          )}
          <div>
            <dt className="text-xs uppercase tracking-[0.3em] text-slate-500">Localidad</dt>
            <dd className="mt-1 font-medium text-slate-100">{pickup.locality}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-[0.3em] text-slate-500">Dirección</dt>
            <dd className="mt-1 font-medium text-slate-100">{pickup.address}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-[0.3em] text-slate-500">Horario</dt>
            <dd className="mt-1 font-medium text-slate-100">{pickup.timeSlot}</dd>
          </div>
          {pickup.collectedWeightKg != null && (
            <div>
              <dt className="text-xs uppercase tracking-[0.3em] text-slate-500">Peso registrado</dt>
              <dd className="mt-1 font-medium text-slate-100">{pickup.collectedWeightKg} kg</dd>
            </div>
          )}
        </dl>

        <div className="mt-5 flex flex-wrap justify-end gap-3 text-xs font-medium">
          <button
            type="button"
            onClick={() => handleEditClick(pickup)}
            className="inline-flex items-center rounded-md border border-slate-700/70 px-3 py-2 text-slate-200 transition hover:border-cyan-400/70 hover:text-cyan-200"
          >
            Editar
          </button>
          <button
            type="button"
            onClick={() => handleDeletePickup(pickup)}
            className="inline-flex items-center rounded-md border border-red-500/40 px-3 py-2 text-red-200 transition hover:border-red-400 hover:text-red-100"
          >
            Eliminar
          </button>
        </div>
      </article>
    )
  }

  const scheduleInitialDate = selectedDate && isDateInputAfter(selectedDate, today) ? selectedDate : minDateInput

  const scheduleInitialValues = {
    date: scheduleInitialDate,
    timeSlot: '08:00 - 12:00' as PickupTimeSlot,
    kind: 'organico' as PickupKind,
    locality: '',
    address: '',
  }

  const editInitialValues = editingPickup
    ? (() => {
        const dateString = extractDateKey(editingPickup.scheduledAt)
        const safeDate = isDateInputAfter(dateString, today) ? dateString : minDateInput
        return {
          date: safeDate,
          timeSlot: editingPickup.timeSlot,
          kind: editingPickup.kind,
          locality: editingPickup.locality,
          address: editingPickup.address,
        }
      })()
    : null

  const scheduleModals = (
    <>
      <Modal
        open={isScheduleModalOpen}
        onClose={() => {
          setScheduleModalOpen(false)
          setSelectedDate(null)
        }}
        title="Programar recolección"
      >
        <PickupForm
          mode="create"
          initialValue={scheduleInitialValues}
          minDate={minDateInput}
          onSubmit={handleCreatePickup}
          onCancel={() => {
            setScheduleModalOpen(false)
            setSelectedDate(null)
          }}
        />
      </Modal>

      <Modal
        open={isEditModalOpen && Boolean(editInitialValues)}
        onClose={() => {
          setEditModalOpen(false)
          setEditingPickup(null)
        }}
        title="Editar recolección"
      >
        {editInitialValues && (
          <PickupForm
            mode="edit"
            initialValue={editInitialValues}
            minDate={minDateInput}
            onSubmit={handleEditPickup}
            onCancel={() => {
              setEditModalOpen(false)
              setEditingPickup(null)
            }}
          />
        )}
      </Modal>
    </>
  )

  const citizenHeaderActions = (
    <>
      <button
        type="button"
        className="inline-flex items-center gap-1 rounded-full border border-slate-700/70 bg-slate-900/70 px-3 py-2 font-medium text-slate-300 transition hover:border-cyan-400/70 hover:text-cyan-200"
      >
        Filtrar por tipo
      </button>
      <button
        type="button"
        className="inline-flex items-center gap-1 rounded-full border border-slate-700/70 bg-slate-900/70 px-3 py-2 font-medium text-slate-300 transition hover:border-cyan-400/70 hover:text-cyan-200"
      >
        Ordenar por fecha
      </button>
    </>
  )

  const adminHeaderActions = (
    <>
      <button
        type="button"
        className="inline-flex items-center gap-1 rounded-full border border-slate-700/70 bg-slate-900/70 px-3 py-2 font-medium text-slate-300 transition hover:border-cyan-400/70 hover:text-cyan-200"
      >
        Ordenar por fecha
      </button>
      <div className="relative" ref={filterContainerRef}>
        <button
          type="button"
          onClick={() => setAdminFiltersOpen((value) => !value)}
          aria-haspopup="dialog"
          aria-expanded={adminFiltersOpen}
          className="inline-flex items-center gap-2 rounded-full border border-slate-700/70 bg-slate-900/70 px-3 py-2 text-slate-200 transition hover:border-cyan-400/70 hover:text-cyan-200"
        >
          <FilterIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Filtros</span>
        </button>
        {adminFiltersOpen && (
          <div className="absolute right-0 z-20 mt-2 w-64 rounded-lg border border-slate-700 bg-slate-900/95 p-4 text-sm shadow-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Filtros disponibles</p>
            <ul className="mt-3 space-y-2 text-slate-200">
              <li className="flex items-center gap-2">
                <UserFilterIcon className="h-4 w-4 text-cyan-300" />
                <span>Por usuario</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPinIcon className="h-4 w-4 text-cyan-300" />
                <span>Por localidad</span>
              </li>
              <li className="flex items-center gap-2">
                <StatusIcon className="h-4 w-4 text-cyan-300" />
                <span>Por estado</span>
              </li>
            </ul>
            <p className="mt-3 text-xs text-slate-500">La lógica de filtrado se integrará próximamente.</p>
          </div>
        )}
      </div>
    </>
  )

  const renderPlannerLayout = (actions: ReactNode, pickupsToRender: Pickup[], emptyMessage: string, options?: { showRequestedBy?: boolean }) => (
    <>
      <section className="flex w-full flex-col gap-4 lg:w-1/2 xl:w-2/3">
        <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/60">
          <header className="flex flex-col gap-4 border-b border-slate-800 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-100">Recolecciones programadas</h2>
              <p className="text-sm text-slate-400">Organizadas de la más próxima a la más lejana.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {actions}
            </div>
          </header>

          <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
            {pickupsToRender.map((pickup) => renderPickupCard(pickup, options))}

            {pickupsToRender.length === 0 && (
              <div className="rounded-xl border border-slate-800 bg-slate-900/50 px-5 py-6 text-sm text-slate-400">
                {emptyMessage}
              </div>
            )}
          </div>
        </div>
      </section>

      <aside className="flex w-full flex-1 items-start justify-center rounded-2xl border border-slate-800 bg-slate-950/30 px-2 py-4 text-slate-500 lg:w-1/2 xl:w-1/3">
        <MonthlyCalendar
          month={monthCursor}
          onMonthChange={setMonthCursor}
          onSelectDate={handleSelectCalendarDate}
          highlightedDates={highlightedDates}
          isDateDisabled={(date) => !isDateSelectable(date, today)}
        />
      </aside>
    </>
  )

  if (isCollector) {
    const completedCount = collectorPickups.filter((pickup) => pickup.status === 'completed').length
    const pendingCount = collectorPickups.length - completedCount

    return (
      <div className="flex flex-1 flex-col gap-6">
        <section className="flex flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/60">
          <header className="flex flex-col gap-4 border-b border-slate-800 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-100">Recolecciones asignadas</h2>
              <p className="text-sm text-slate-400">Gestiona y registra las recolecciones a tu cargo.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center rounded-full border border-slate-700/70 bg-slate-900/70 px-3 py-2 font-medium text-slate-300">Pendientes: {pendingCount}</span>
              <span className="inline-flex items-center rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 font-medium text-emerald-200">Realizadas: {completedCount}</span>
            </div>
          </header>

          <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
            {collectorPickups.map((pickup) => {
              const status = statusStyles[pickup.status]
              const dateLabel = formatDateLabel(pickup.scheduledAt)
              const canRegister = pickup.status !== 'completed' && pickup.status !== 'rejected'
              const weightDisplay = pickup.collectedWeightKg != null ? `${pickup.collectedWeightKg} kg` : '—'
              const points = calculatePickupPoints(pickup, pointsFormula)

              return (
                <article
                  key={pickup.id}
                  className={`rounded-xl border px-5 py-4 shadow-sm shadow-slate-950/30 transition hover:shadow-lg ${status.card}`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-2xl font-semibold tracking-tight text-slate-100">
                        <span className="hidden lg:inline">{dateLabel.full}</span>
                        <span className="inline lg:hidden">{dateLabel.short}</span>
                      </p>
                      <p className="mt-1 text-sm font-medium text-slate-300">{getRemainingDaysLabel(pickup.scheduledAt)}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2 text-xs">
                      <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-500/10 px-3 py-1 font-semibold uppercase tracking-[0.2em] text-amber-200">
                        {points} pts
                      </span>
                      <span
                        className={`inline-flex items-center rounded-full border px-3 py-1 font-semibold uppercase tracking-[0.2em] ${status.chip}`}
                      >
                        {status.label}
                      </span>
                    </div>
                  </div>

                  <dl className="mt-4 grid gap-4 text-sm text-slate-200 md:grid-cols-2">
                    <div>
                      <dt className="text-xs uppercase tracking-[0.3em] text-slate-500">Localidad</dt>
                      <dd className="mt-1 font-medium text-slate-100">{pickup.locality}</dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase tracking-[0.3em] text-slate-500">Dirección</dt>
                      <dd className="mt-1 font-medium text-slate-100">{pickup.address}</dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase tracking-[0.3em] text-slate-500">Tipo</dt>
                      <dd className="mt-1 font-medium text-slate-100">{kindLabels[pickup.kind]}</dd>
                    </div>
                    {pickup.requestedBy && (
                      <div>
                        <dt className="text-xs uppercase tracking-[0.3em] text-slate-500">Solicitado por</dt>
                        <dd className="mt-1 font-medium text-slate-100">{pickup.requestedBy}</dd>
                      </div>
                    )}
                    <div>
                      <dt className="text-xs uppercase tracking-[0.3em] text-slate-500">Horario</dt>
                      <dd className="mt-1 font-medium text-slate-100">{pickup.timeSlot}</dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase tracking-[0.3em] text-slate-500">Peso recogido</dt>
                      <dd className="mt-1 font-medium text-slate-100">{weightDisplay}</dd>
                    </div>
                  </dl>

                  <div className="mt-5 flex flex-wrap justify-end gap-3 text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => handleOpenCompleteModal(pickup)}
                      disabled={!canRegister}
                      className={[
                        'inline-flex items-center rounded-md px-3 py-2 transition',
                        canRegister
                          ? 'bg-cyan-500 text-slate-950 hover:bg-cyan-400'
                          : 'cursor-not-allowed bg-slate-800 text-slate-500',
                      ].join(' ')}
                    >
                      Registrar recolección
                    </button>
                  </div>
                </article>
              )
            })}

            {collectorPickups.length === 0 && (
              <div className="rounded-xl border border-slate-800 bg-slate-900/50 px-5 py-6 text-sm text-slate-400">
                No tienes recolecciones asignadas por ahora. Cuando recibas nuevas, aparecerán en este listado.
              </div>
            )}
          </div>
        </section>

        <Modal
          open={Boolean(pickupToComplete)}
          onClose={handleCloseCompleteModal}
          title="Registrar recolección"
        >
          {pickupToComplete && (
            <div className="space-y-5">
              {modalPickupLabel && (
                <div className="rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-3 text-sm text-slate-300">
                  <p className="font-medium text-slate-100">
                    <span className="hidden lg:inline">{modalPickupLabel.full}</span>
                    <span className="inline lg:hidden">{modalPickupLabel.short}</span>
                  </p>
                  <p className="mt-1 text-slate-400">
                    {pickupToComplete.locality} · {pickupToComplete.address}
                  </p>
                </div>
              )}
              <CompletePickupForm
                pickup={pickupToComplete}
                defaultDateTime={completeModalDefaultDate ?? toDateTimeLocalValue(new Date())}
                onSubmit={handleCompletePickup}
                onCancel={handleCloseCompleteModal}
              />
            </div>
          )}
        </Modal>
      </div>
    )
  }

  if (isAdmin) {
    return (
      <div className="flex flex-1 flex-col gap-6 lg:min-h-[calc(100vh-14rem)] lg:flex-row lg:items-stretch">
        {renderPlannerLayout(adminHeaderActions, activePickups, 'No hay recolecciones registradas en este momento.', { showRequestedBy: true })}
        {scheduleModals}
      </div>
    )
  }

  if (!isCitizen) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/60 text-center text-slate-400">
        <p className="max-w-md">
          Este panel está orientado a los roles ciudadano, administrador y recolector. Ingresa con un usuario compatible para ver su contenido.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-6 lg:min-h-[calc(100vh-14rem)] lg:flex-row lg:items-stretch">
      {renderPlannerLayout(
        citizenHeaderActions,
        activePickups,
        'No tienes recolecciones activas. Programa una nueva usando el calendario.',
      )}
      {scheduleModals}
    </div>
  )
}

function FilterIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M4 4h16l-6 7v7l-4-2v-5z" />
    </svg>
  )
}

function UserFilterIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
    </svg>
  )
}

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 10c0 6-9 13-9 13S3 16 3 10a9 9 0 1 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function StatusIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 2v20" />
      <path d="M5 6h7" />
      <path d="M5 12h7" />
      <path d="M5 18h7" />
      <path d="M15 10h4v4h-4z" />
    </svg>
  )
}

export default HomePage
