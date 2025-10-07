import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'

import { useAuth } from '../auth/auth-context'
import { usePickups } from '../pickups/pickups-context'
import { useConfig } from '../config/config-context'
import { citizenUsers, collectors, collectorCompanies } from '../data/users'
import { calculatePickupPoints } from '../utils/points'
import type { Pickup, PickupKind } from '../data/pickups'
import { useNotifications } from '../notifications/notification-context'

type ReportType = 'pickups' | 'users' | 'collectors'

type PickupMetrics = {
  total: number
  completed: number
  confirmed: number
  pending: number
  rejected: number
  points: number
}

type UserSummary = {
  id: string | null
  name: string
  pickups: number
  completed: number
  points: number
}

type CollectorSummary = {
  id: string | null
  name: string
  companyId: string | null
  companyName: string | null
  pickups: number
  completed: number
  points: number
}

const reportTypeOptions: { value: ReportType; label: string; description: string }[] = [
  { value: 'pickups', label: 'Recolecciones', description: 'Detalle de recolecciones programadas y su estado.' },
  { value: 'users', label: 'Usuarios', description: 'Actividad por ciudadano y puntos acumulados.' },
  { value: 'collectors', label: 'Recolectores', description: 'Revisar desempeños del equipo operativo.' },
]

const pickupKindLabels: Record<PickupKind, string> = {
  organico: 'Orgánico',
  inorganicos: 'Inorgánicos',
  peligrosos: 'Peligrosos',
}

const pickupStatusLabels: Record<Pickup['status'], { label: string; style: string }> = {
  pending: { label: 'Pendiente', style: 'border-slate-700/70 bg-slate-900/70 text-slate-300' },
  confirmed: { label: 'Confirmada', style: 'border-cyan-400/60 bg-cyan-500/15 text-cyan-200' },
  rejected: { label: 'Rechazada', style: 'border-red-400/60 bg-red-500/15 text-red-200' },
  completed: { label: 'Realizada', style: 'border-emerald-400/60 bg-emerald-500/15 text-emerald-200' },
}

const citizenUsersById = new Map(citizenUsers.map((entry) => [entry.id, entry]))
const citizenUsersByName = new Map(citizenUsers.map((entry) => [entry.name, entry]))

const collectorsById = new Map(collectors.map((entry) => [entry.id, entry]))
const collectorsByName = new Map(collectors.map((entry) => [entry.name, entry]))

function startOfDay(date: Date) {
  const result = new Date(date)
  result.setHours(0, 0, 0, 0)
  return result
}

function endOfDay(date: Date) {
  const result = new Date(date)
  result.setHours(23, 59, 59, 999)
  return result
}

function parseDateInput(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year ?? 1970, (month ?? 1) - 1, day ?? 1)
}

function toDateInputValue(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function ReportsPage() {
  const { user } = useAuth()
  const { pickups } = usePickups()
  const { pointsFormula } = useConfig()
  const { notifyError } = useNotifications()

  const isAdmin = user?.role === 'admin'
  const currentUserName = user?.displayName ?? ''

  const accessiblePickups = useMemo(() => {
    if (isAdmin) {
      return pickups.slice()
    }

    return pickups.filter((pickup) => pickup.requestedBy === currentUserName)
  }, [pickups, isAdmin, currentUserName])

  const [reportType, setReportType] = useState<ReportType>('pickups')
  const [selectedKinds, setSelectedKinds] = useState<Set<PickupKind>>(new Set())
  const [selectedUserId, setSelectedUserId] = useState<string>('all')
  const [selectedCollectorId, setSelectedCollectorId] = useState<string>('all')
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [hasGenerated, setHasGenerated] = useState(false)
  const generationTimeoutRef = useRef<number | null>(null)

  const selectedKindsKey = useMemo(() => Array.from(selectedKinds).sort().join(','), [selectedKinds])

  const availableCollectorOptions = useMemo(() => {
    if (selectedCompanyId === 'all') {
      return collectors
    }
    return collectors.filter((entry) => entry.companyId === selectedCompanyId)
  }, [selectedCompanyId])

  useEffect(() => {
    if (accessiblePickups.length === 0) {
      const today = toDateInputValue(new Date())
      setDateFrom((prev) => (prev ? prev : today))
      setDateTo((prev) => (prev ? prev : today))
      return
    }

    const sorted = accessiblePickups
      .map((pickup) => new Date(pickup.scheduledAt))
      .sort((a, b) => a.getTime() - b.getTime())
    const first = sorted[0]
    const last = sorted[sorted.length - 1]

    const nextFrom = toDateInputValue(first)
    const nextTo = toDateInputValue(last)

    setDateFrom((prev) => (prev === nextFrom ? prev : nextFrom))
    setDateTo((prev) => (prev === nextTo ? prev : nextTo))
  }, [accessiblePickups])

  useEffect(() => {
    setHasGenerated(false)
  }, [reportType, dateFrom, dateTo, selectedUserId, selectedCollectorId, selectedCompanyId, selectedKindsKey])

  useEffect(() => {
    if (selectedCollectorId === 'all') return
    const stillVisible = availableCollectorOptions.some((option) => option.id === selectedCollectorId)
    if (!stillVisible) {
      setSelectedCollectorId('all')
    }
  }, [availableCollectorOptions, selectedCollectorId])

  const availableReportOptions = useMemo(() => {
    if (isAdmin) {
      return reportTypeOptions
    }
    return reportTypeOptions.filter((option) => option.value === 'pickups')
  }, [isAdmin])

  useEffect(() => {
    const isCurrentOptionVisible = availableReportOptions.some((option) => option.value === reportType)
    if (!isCurrentOptionVisible && availableReportOptions.length > 0) {
      setReportType(availableReportOptions[0].value)
    }
  }, [availableReportOptions, reportType])

  useEffect(() => () => {
    if (generationTimeoutRef.current != null) {
      window.clearTimeout(generationTimeoutRef.current)
      generationTimeoutRef.current = null
    }
  }, [])

  const selectedUserName = useMemo(() => {
    if (selectedUserId === 'all') return null
    return citizenUsersById.get(selectedUserId)?.name ?? null
  }, [selectedUserId])

  const selectedCollectorName = useMemo(() => {
    if (selectedCollectorId === 'all') return null
    return collectorsById.get(selectedCollectorId)?.name ?? null
  }, [selectedCollectorId])

  const filteredPickups = useMemo(() => {
    const from = dateFrom ? startOfDay(parseDateInput(dateFrom)) : null
    const to = dateTo ? endOfDay(parseDateInput(dateTo)) : null
    const shouldFilterByKind = selectedKinds.size > 0

    return accessiblePickups.filter((pickup) => {
      const pickupDate = new Date(pickup.scheduledAt)
      const assignedName = pickup.staff ?? ''
      const assignedCollectorRecord = assignedName ? collectorsByName.get(assignedName) ?? null : null

      if (from && pickupDate < from) return false
      if (to && pickupDate > to) return false
      if (shouldFilterByKind && !selectedKinds.has(pickup.kind)) return false
      if (selectedUserName && pickup.requestedBy !== selectedUserName) return false
      if (selectedCollectorName) {
        if (assignedName !== selectedCollectorName) {
          return false
        }
      }
      if (selectedCompanyId !== 'all') {
        const assignedCompanyId = assignedCollectorRecord?.companyId ?? null
        if (assignedCompanyId !== selectedCompanyId) {
          return false
        }
      }

      if (!isAdmin && pickup.requestedBy !== currentUserName) {
        return false
      }

      return true
    })
  }, [
    accessiblePickups,
    dateFrom,
    dateTo,
    selectedKinds,
    selectedUserName,
    selectedCollectorName,
    selectedCompanyId,
    isAdmin,
    currentUserName,
  ])

  const dateTimeFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat('es-CO', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    [],
  )

  const weightFormatter = useMemo(
    () =>
      new Intl.NumberFormat('es-CO', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }),
    [],
  )

  const pickupMetrics = useMemo<PickupMetrics>(() => {
    return filteredPickups.reduce<PickupMetrics>((acc, pickup) => {
      acc.total += 1
      acc.points += calculatePickupPoints(pickup, pointsFormula)
      switch (pickup.status) {
        case 'completed':
          acc.completed += 1
          break
        case 'confirmed':
          acc.confirmed += 1
          break
        case 'pending':
          acc.pending += 1
          break
        case 'rejected':
          acc.rejected += 1
          break
        default:
          break
      }
      return acc
    }, {
      total: 0,
      completed: 0,
      confirmed: 0,
      pending: 0,
      rejected: 0,
      points: 0,
    })
  }, [filteredPickups, pointsFormula])

  const userSummaries = useMemo<UserSummary[]>(() => {
    const accumulator = new Map<string, UserSummary>()

    filteredPickups.forEach((pickup) => {
      const name = pickup.requestedBy ?? 'Sin solicitante'
      const existing = accumulator.get(name)
      const userId = citizenUsersByName.get(name)?.id ?? null
      const points = calculatePickupPoints(pickup, pointsFormula)

      if (existing) {
        existing.pickups += 1
        existing.points += points
        if (pickup.status === 'completed') {
          existing.completed += 1
        }
        return
      }

      accumulator.set(name, {
        id: userId,
        name,
        pickups: 1,
        completed: pickup.status === 'completed' ? 1 : 0,
        points,
      })
    })

    return Array.from(accumulator.values()).sort((a, b) => b.pickups - a.pickups)
  }, [filteredPickups, pointsFormula])

  const collectorSummaries = useMemo<CollectorSummary[]>(() => {
    const accumulator = new Map<string, CollectorSummary>()

    filteredPickups.forEach((pickup) => {
      const name = pickup.staff ?? 'Sin asignar'
      const existing = accumulator.get(name)
      const collectorRecord = collectorsByName.get(name) ?? null
      const collectorId = collectorRecord?.id ?? null
      const companyId = collectorRecord?.companyId ?? null
      const companyName = collectorRecord?.companyName ?? null
      const points = calculatePickupPoints(pickup, pointsFormula)

      if (existing) {
        existing.pickups += 1
        existing.points += points
        if (pickup.status === 'completed') {
          existing.completed += 1
        }
        return
      }

      accumulator.set(name, {
        id: collectorId,
        name,
        companyId,
        companyName,
        pickups: 1,
        completed: pickup.status === 'completed' ? 1 : 0,
        points,
      })
    })

    return Array.from(accumulator.values()).sort((a, b) => b.pickups - a.pickups)
  }, [filteredPickups, pointsFormula])

  const handleToggleKind = (kind: PickupKind) => {
    setSelectedKinds((prev) => {
      const next = new Set(prev)
      if (next.has(kind)) {
        next.delete(kind)
      } else {
        next.add(kind)
      }
      return next
    })
  }

  const handleGenerateReport = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isGenerating) return

    if (dateFrom && dateTo) {
      const from = parseDateInput(dateFrom)
      const to = parseDateInput(dateTo)
      if (from > to) {
        notifyError('La fecha inicial no puede ser mayor a la fecha final.')
        return
      }
    }

    setIsGenerating(true)
    setHasGenerated(false)

    if (generationTimeoutRef.current != null) {
      window.clearTimeout(generationTimeoutRef.current)
    }

    generationTimeoutRef.current = window.setTimeout(() => {
      setIsGenerating(false)
      setHasGenerated(true)
      generationTimeoutRef.current = null
    }, 700)
  }

  const renderReportPreview = () => {
    if (reportType === 'users') {
      if (userSummaries.length === 0) {
        return (
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 px-5 py-6 text-sm text-slate-400">
            Ajusta los filtros y genera el reporte para ver la actividad de los usuarios.
          </div>
        )
      }

      return (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-800 text-left text-sm text-slate-200">
            <thead className="bg-slate-900/70 text-xs uppercase tracking-[0.3em] text-slate-500">
              <tr>
                <th className="px-6 py-3">Usuario</th>
                <th className="px-6 py-3">Recolecciones</th>
                <th className="px-6 py-3">Realizadas</th>
                <th className="px-6 py-3">Puntos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {userSummaries.map((summary) => (
                <tr key={summary.name} className="hover:bg-slate-900/60">
                  <td className="px-6 py-3">
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-100">{summary.name}</span>
                      {summary.id && (
                        <span className="text-xs text-slate-500">ID: {summary.id}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-3 text-slate-300">{summary.pickups}</td>
                  <td className="px-6 py-3 text-slate-300">{summary.completed}</td>
                  <td className="px-6 py-3 text-slate-300">{summary.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }

    if (reportType === 'collectors') {
      if (collectorSummaries.length === 0) {
        return (
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 px-5 py-6 text-sm text-slate-400">
            No hay datos para los recolectores filtrados en el rango seleccionado.
          </div>
        )
      }

      return (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-800 text-left text-sm text-slate-200">
            <thead className="bg-slate-900/70 text-xs uppercase tracking-[0.3em] text-slate-500">
              <tr>
                <th className="px-6 py-3">Recolector</th>
                <th className="px-6 py-3">Empresa</th>
                <th className="px-6 py-3">Recolecciones</th>
                <th className="px-6 py-3">Realizadas</th>
                <th className="px-6 py-3">Puntos asociados</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {collectorSummaries.map((summary) => (
                <tr key={summary.name} className="hover:bg-slate-900/60">
                  <td className="px-6 py-3">
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-100">{summary.name}</span>
                      {summary.id && (
                        <span className="text-xs text-slate-500">ID: {summary.id}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-3 text-slate-300">{summary.companyName ?? '—'}</td>
                  <td className="px-6 py-3 text-slate-300">{summary.pickups}</td>
                  <td className="px-6 py-3 text-slate-300">{summary.completed}</td>
                  <td className="px-6 py-3 text-slate-300">{summary.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }

    if (filteredPickups.length === 0) {
      return (
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 px-5 py-6 text-sm text-slate-400">
          No se encontraron recolecciones que cumplan con los filtros aplicados.
        </div>
      )
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-800 text-left text-sm text-slate-200">
          <thead className="bg-slate-900/70 text-xs uppercase tracking-[0.3em] text-slate-500">
            <tr>
              <th className="px-6 py-3">ID</th>
              <th className="px-6 py-3">Fecha</th>
              <th className="px-6 py-3">Estado</th>
              <th className="px-6 py-3">Tipo</th>
              <th className="px-6 py-3">Localidad</th>
              <th className="px-6 py-3">Usuario</th>
              <th className="px-6 py-3">Recolector</th>
              <th className="px-6 py-3">Peso (kg)</th>
              <th className="px-6 py-3">Puntos</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filteredPickups.map((pickup) => {
              const statusVariant = pickupStatusLabels[pickup.status]
              const points = calculatePickupPoints(pickup, pointsFormula)
              const pickupDate = new Date(pickup.scheduledAt)
              const weightLabel =
                pickup.collectedWeightKg != null
                  ? `${weightFormatter.format(pickup.collectedWeightKg)} kg`
                  : '—'
              const collectorRecord = pickup.staff ? collectorsByName.get(pickup.staff) ?? null : null
              const collectorCompanyLabel = collectorRecord?.companyName ?? null

              return (
                <tr key={pickup.id} className="hover:bg-slate-900/60">
                  <td className="px-6 py-3 font-mono text-xs text-slate-400">{pickup.id}</td>
                  <td className="px-6 py-3 text-slate-300">{dateTimeFormatter.format(pickupDate)}</td>
                  <td className="px-6 py-3">
                    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${statusVariant.style}`}>
                      {statusVariant.label}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-slate-300">{pickupKindLabels[pickup.kind]}</td>
                  <td className="px-6 py-3 text-slate-300">{pickup.locality}</td>
                  <td className="px-6 py-3 text-slate-300">{pickup.requestedBy ?? '—'}</td>
                  <td className="px-6 py-3 text-slate-300">
                    <div className="flex flex-col">
                      <span>{pickup.staff ?? 'Sin asignar'}</span>
                      {collectorCompanyLabel && (
                        <span className="text-xs text-slate-500">{collectorCompanyLabel}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-3 text-slate-300">{weightLabel}</td>
                  <td className="px-6 py-3 text-slate-300">{points}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    )
  }

  const summaryBadges = [
    { label: 'Totales', value: pickupMetrics.total },
    { label: 'Realizadas', value: pickupMetrics.completed },
    { label: 'Confirmadas', value: pickupMetrics.confirmed },
    { label: 'Pendientes', value: pickupMetrics.pending },
    { label: 'Rechazadas', value: pickupMetrics.rejected },
    { label: 'Puntos estimados', value: pickupMetrics.points },
  ]

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h2 className="text-3xl font-semibold tracking-tight text-slate-100">Reportes</h2>
        <p className="text-sm text-slate-400">
          Diseña tus reportes seleccionando el tipo de información, el rango de fechas y los filtros
          adicionales que necesites. La descarga estará disponible una vez se genere el informe.
        </p>
      </header>

      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/60">
        <header className="border-b border-slate-800 px-6 py-5">
          <h3 className="text-xl font-semibold text-slate-100">Configuración del reporte</h3>
          <p className="mt-1 text-sm text-slate-400">Selecciona los criterios y genera el informe.</p>
        </header>

        <form onSubmit={handleGenerateReport} className="px-6 py-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <fieldset className="flex flex-col gap-3 lg:col-span-3">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Tipo de reporte</span>
              <div className="grid gap-3 sm:grid-cols-3">
                {availableReportOptions.map((option) => {
                  const isActive = reportType === option.value
                  const optionClasses = ['flex flex-col gap-1 rounded-xl border px-4 py-3 text-left transition']

                  if (isActive) {
                    optionClasses.push('border-cyan-500/70 bg-cyan-500/10 text-cyan-100')
                  } else {
                    optionClasses.push('border-slate-800 bg-slate-900/60 text-slate-300 hover:border-cyan-500/40 hover:text-cyan-200')
                  }

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setReportType(option.value)
                      }}
                      className={optionClasses.join(' ')}
                    >
                      <span className="text-sm font-semibold">{option.label}</span>
                      <span className="text-xs text-slate-400">{option.description}</span>
                    </button>
                  )
                })}
              </div>
            </fieldset>

            <div className="flex flex-col gap-2">
              <label htmlFor="report-from" className="text-sm font-medium text-slate-300">
                Desde
              </label>
              <input
                id="report-from"
                type="date"
                value={dateFrom}
                onChange={(event) => setDateFrom(event.target.value)}
                className="rounded-md border border-slate-700/60 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-cyan-500/70 focus:ring-2 focus:ring-cyan-500/20"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="report-to" className="text-sm font-medium text-slate-300">
                Hasta
              </label>
              <input
                id="report-to"
                type="date"
                value={dateTo}
                onChange={(event) => setDateTo(event.target.value)}
                className="rounded-md border border-slate-700/60 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-cyan-500/70 focus:ring-2 focus:ring-cyan-500/20"
              />
            </div>

            <div className="flex flex-col gap-3 lg:col-span-3">
              <span className="text-sm font-medium text-slate-300">Tipos de residuo</span>
              <div className="flex flex-wrap gap-3">
                {(Object.keys(pickupKindLabels) as PickupKind[]).map((kind) => {
                  const isSelected = selectedKinds.has(kind)
                  return (
                    <button
                      key={kind}
                      type="button"
                      onClick={() => handleToggleKind(kind)}
                      className={[
                        'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition',
                        isSelected
                          ? 'border-cyan-500/70 bg-cyan-500/10 text-cyan-100'
                          : 'border-slate-700/70 bg-slate-900/60 text-slate-300 hover:border-cyan-500/40 hover:text-cyan-200',
                      ].join(' ')}
                    >
                      {pickupKindLabels[kind]}
                    </button>
                  )
                })}
              </div>
              <p className="text-xs text-slate-500">
                Si no seleccionas ningún tipo, se incluirán todos los residuos disponibles en el reporte.
              </p>
            </div>

            {isAdmin && (
              <div className="flex flex-col gap-2">
                <label htmlFor="report-user" className="text-sm font-medium text-slate-300">
                  Usuario
                </label>
                <select
                  id="report-user"
                  value={selectedUserId}
                  onChange={(event) => setSelectedUserId(event.target.value)}
                  className="rounded-md border border-slate-700/60 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-cyan-500/70 focus:ring-2 focus:ring-cyan-500/20"
                >
                  <option value="all">Todos los usuarios</option>
                  {citizenUsers.map((entry) => (
                    <option key={entry.id} value={entry.id}>
                      {entry.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {isAdmin && (
              <div className="flex flex-col gap-2">
                <label htmlFor="report-company" className="text-sm font-medium text-slate-300">
                  Empresa
                </label>
                <select
                  id="report-company"
                  value={selectedCompanyId}
                  onChange={(event) => setSelectedCompanyId(event.target.value)}
                  className="rounded-md border border-slate-700/60 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-cyan-500/70 focus:ring-2 focus:ring-cyan-500/20"
                >
                  <option value="all">Todas las empresas</option>
                  {collectorCompanies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {isAdmin && (
              <div className="flex flex-col gap-2">
                <label htmlFor="report-collector" className="text-sm font-medium text-slate-300">
                  Recolector
                </label>
                <select
                  id="report-collector"
                  value={selectedCollectorId}
                  onChange={(event) => setSelectedCollectorId(event.target.value)}
                  className="rounded-md border border-slate-700/60 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-cyan-500/70 focus:ring-2 focus:ring-cyan-500/20"
                >
                  <option value="all">Todos los recolectores</option>
                  {availableCollectorOptions.map((entry) => (
                    <option key={entry.id} value={entry.id}>
                      {entry.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-end gap-3">
            {!hasGenerated && !isGenerating && (
              <span className="text-xs text-slate-500">
                Genera el reporte para habilitar la descarga.
              </span>
            )}
            {isGenerating && (
              <span className="text-xs text-cyan-200">Generando reporte…</span>
            )}
            {hasGenerated && !isGenerating && (
              <span className="text-xs text-emerald-200">Reporte listo para descargar.</span>
            )}
            <button
              type="submit"
              disabled={isGenerating}
              className={[
                'inline-flex items-center rounded-md px-4 py-2 text-sm font-semibold transition',
                isGenerating
                  ? 'cursor-wait bg-cyan-500/40 text-slate-950'
                  : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400',
              ].join(' ')}
            >
              {isGenerating ? 'Generando…' : 'Generar reporte'}
            </button>
            <button
              type="button"
              disabled={!hasGenerated || isGenerating}
              className={[
                'inline-flex items-center rounded-md border px-4 py-2 text-sm font-semibold transition',
                hasGenerated && !isGenerating
                  ? 'border-emerald-400/70 text-emerald-200 hover:border-emerald-300/80 hover:text-emerald-100'
                  : 'cursor-not-allowed border-slate-700/70 text-slate-500',
              ].join(' ')}
            >
              Descargar reporte
            </button>
          </div>
        </form>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/60">
        <header className="flex flex-col gap-3 border-b border-slate-800 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-xl font-semibold text-slate-100">Vista previa</h3>
            <p className="text-sm text-slate-400">
              Resultados obtenidos con los filtros actuales. La descarga usará la misma configuración.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            {summaryBadges.map((badge) => (
              <span
                key={badge.label}
                className="inline-flex items-center rounded-full border border-slate-700/70 bg-slate-900/60 px-3 py-1 font-medium text-slate-300"
              >
                {badge.label}: {badge.value}
              </span>
            ))}
          </div>
        </header>
        <div className="px-6 py-6">{renderReportPreview()}</div>
      </section>
    </div>
  )
}

export default ReportsPage
