import { useMemo } from 'react'
import type { Dispatch, SetStateAction } from 'react'

type MonthlyCalendarProps = {
  month: Date
  onMonthChange: Dispatch<SetStateAction<Date>>
  onSelectDate: (date: Date) => void
  highlightedDates?: Set<string>
  isDateDisabled?: (date: Date) => boolean
}

function createMonthMatrix(month: Date) {
  const firstDayOfMonth = new Date(month.getFullYear(), month.getMonth(), 1)
  const startOffset = (firstDayOfMonth.getDay() + 6) % 7

  const gridStart = new Date(firstDayOfMonth)
  gridStart.setDate(firstDayOfMonth.getDate() - startOffset)

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart)
    date.setDate(gridStart.getDate() + index)
    const isCurrentMonth = date.getMonth() === month.getMonth()
    const today = new Date()
    const isToday =
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()

    return {
      key: `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`,
      date,
      isCurrentMonth,
      isToday,
    }
  })
}

function toTitleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function formatMonthLabel(month: Date) {
  const longFormatter = new Intl.DateTimeFormat('es-CO', {
    month: 'long',
    year: 'numeric',
  })
  const shortFormatter = new Intl.DateTimeFormat('es-CO', {
    month: 'short',
    year: 'numeric',
  })
  return {
    full: toTitleCase(longFormatter.format(month)),
    short: toTitleCase(shortFormatter.format(month)),
  }
}

function getDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const weekDayNames = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

function MonthlyCalendar({ month, onMonthChange, onSelectDate, highlightedDates, isDateDisabled }: MonthlyCalendarProps) {
  const days = useMemo(() => createMonthMatrix(month), [month])
  const label = useMemo(() => formatMonthLabel(month), [month])

  const goToPreviousMonth = () => {
    onMonthChange((current) => {
      const next = new Date(current)
      next.setMonth(current.getMonth() - 1)
      return next
    })
  }

  const goToNextMonth = () => {
    onMonthChange((current) => {
      const next = new Date(current)
      next.setMonth(current.getMonth() + 1)
      return next
    })
  }

  const goToPreviousYear = () => {
    onMonthChange((current) => {
      const next = new Date(current)
      next.setFullYear(current.getFullYear() - 1)
      return next
    })
  }

  const goToNextYear = () => {
    onMonthChange((current) => {
      const next = new Date(current)
      next.setFullYear(current.getFullYear() + 1)
      return next
    })
  }

  const goToToday = () => {
    const today = new Date()
    onMonthChange(new Date(today.getFullYear(), today.getMonth(), 1))
  }

  const formatter = useMemo(
    () =>
      new Intl.DateTimeFormat('es-CO', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
    [],
  )

  return (
    <div className="flex w-full flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2 md:gap-3">
        <div className="flex flex-shrink-0 items-center gap-1 md:gap-2">
          <button
            type="button"
            onClick={goToPreviousYear}
            className="rounded-md border border-slate-800 px-2 py-1 text-xs text-slate-300 transition hover:border-cyan-500/40 hover:text-cyan-200"
            aria-label="Año anterior"
          >
            «
          </button>
          <button
            type="button"
            onClick={goToPreviousMonth}
            className="rounded-md border border-slate-800 px-2 py-1 text-xs text-slate-300 transition hover:border-cyan-500/40 hover:text-cyan-200"
            aria-label="Mes anterior"
          >
            ‹
          </button>
        </div>

        <div className="min-w-0 flex-1 text-center">
          <p className="text-lg font-semibold text-slate-100">
            <span className="hidden md:inline-block">{label.full}</span>
            <span className="inline-block md:hidden">{label.short}</span>
          </p>
          <button
            type="button"
            onClick={goToToday}
            className="mt-1 text-xs font-medium text-cyan-300 transition hover:text-cyan-200"
          >
            Hoy
          </button>
        </div>

        <div className="flex flex-shrink-0 items-center gap-1 md:gap-2">
          <button
            type="button"
            onClick={goToNextMonth}
            className="rounded-md border border-slate-800 px-2 py-1 text-xs text-slate-300 transition hover:border-cyan-500/40 hover:text-cyan-200"
            aria-label="Mes siguiente"
          >
            ›
          </button>
          <button
            type="button"
            onClick={goToNextYear}
            className="rounded-md border border-slate-800 px-2 py-1 text-xs text-slate-300 transition hover:border-cyan-500/40 hover:text-cyan-200"
            aria-label="Año siguiente"
          >
            »
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
        {weekDayNames.map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map(({ key, date, isCurrentMonth, isToday }) => {
          const timestampKey = getDateKey(date)
          const hasPickup = highlightedDates?.has(timestampKey)
          const disabled = isDateDisabled?.(date) ?? false

          const className = [
            'flex h-16 flex-col items-center justify-center rounded-xl border px-2 py-1 text-sm transition',
            isCurrentMonth
              ? 'border-slate-800 bg-slate-900/70 text-slate-200'
              : 'border-transparent bg-slate-900/20 text-slate-600',
            isToday ? 'ring-2 ring-cyan-500/60' : '',
            'hover:border-cyan-400/50 hover:text-cyan-200',
            'disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-800 disabled:hover:text-slate-300',
          ].join(' ')

          return (
            <button
              key={key}
              type="button"
              onClick={() => {
                if (disabled) return
                onSelectDate(date)
              }}
              className={className}
              disabled={disabled}
            >
              <span className="text-base font-semibold">{date.getDate()}</span>
              {hasPickup ? <span className="mt-1 h-2 w-2 rounded-full bg-cyan-400" /> : <span className="mt-1 h-2 w-2" />}
              <span className="sr-only">{formatter.format(date)}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default MonthlyCalendar
