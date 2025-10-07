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

type NotificationKind = 'success' | 'error' | 'info' | 'warning'

type Notification = {
  id: string
  kind: NotificationKind
  message: string
  title?: string
  duration: number
}

type ShowNotificationInput = {
  kind: NotificationKind
  message: string
  title?: string
  duration?: number
}

type NotificationContextValue = {
  notifications: Notification[]
  showNotification: (input: ShowNotificationInput) => string
  notifySuccess: (message: string, options?: Omit<ShowNotificationInput, 'kind' | 'message'>) => string
  notifyError: (message: string, options?: Omit<ShowNotificationInput, 'kind' | 'message'>) => string
  notifyInfo: (message: string, options?: Omit<ShowNotificationInput, 'kind' | 'message'>) => string
  notifyWarning: (message: string, options?: Omit<ShowNotificationInput, 'kind' | 'message'>) => string
  dismiss: (id: string) => void
  clear: () => void
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined)

const DEFAULT_DURATION = 5000

function createId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const timeoutsRef = useRef<Map<string, number>>(new Map())

  const dismiss = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id))
    const timeoutId = timeoutsRef.current.get(id)
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutsRef.current.delete(id)
    }
  }, [])

  const clear = useCallback(() => {
    setNotifications([])
    timeoutsRef.current.forEach((timeoutId) => clearTimeout(timeoutId))
    timeoutsRef.current.clear()
  }, [])

  const showNotification = useCallback(
    (input: ShowNotificationInput) => {
      const id = createId()
      const duration = input.duration ?? DEFAULT_DURATION
      const next: Notification = {
        id,
        kind: input.kind,
        message: input.message,
        title: input.title,
        duration,
      }

      setNotifications((prev) => [...prev, next])

      if (duration > 0 && typeof window !== 'undefined') {
        const timeoutId = window.setTimeout(() => {
          dismiss(id)
        }, duration)
        timeoutsRef.current.set(id, timeoutId)
      }

      return id
    },
    [dismiss],
  )

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((timeoutId) => clearTimeout(timeoutId))
      timeoutsRef.current.clear()
    }
  }, [])

  const notifySuccess = useCallback(
    (message: string, options?: Omit<ShowNotificationInput, 'kind' | 'message'>) =>
      showNotification({
        kind: 'success',
        message,
        ...options,
      }),
    [showNotification],
  )

  const notifyError = useCallback(
    (message: string, options?: Omit<ShowNotificationInput, 'kind' | 'message'>) =>
      showNotification({
        kind: 'error',
        message,
        ...options,
      }),
    [showNotification],
  )

  const notifyInfo = useCallback(
    (message: string, options?: Omit<ShowNotificationInput, 'kind' | 'message'>) =>
      showNotification({
        kind: 'info',
        message,
        ...options,
      }),
    [showNotification],
  )

  const notifyWarning = useCallback(
    (message: string, options?: Omit<ShowNotificationInput, 'kind' | 'message'>) =>
      showNotification({
        kind: 'warning',
        message,
        ...options,
      }),
    [showNotification],
  )

  const value = useMemo<NotificationContextValue>(
    () => ({
      notifications,
      showNotification,
      notifySuccess,
      notifyError,
      notifyInfo,
      notifyWarning,
      dismiss,
      clear,
    }),
    [clear, dismiss, notifications, notifyError, notifyInfo, notifySuccess, notifyWarning, showNotification],
  )

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationViewport notifications={notifications} onDismiss={dismiss} />
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications debe usarse dentro de NotificationProvider')
  }
  return context
}

function NotificationViewport({
  notifications,
  onDismiss,
}: {
  notifications: Notification[]
  onDismiss: (id: string) => void
}) {
  if (notifications.length === 0) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-[1000] flex flex-col items-end gap-3 px-4 py-6 sm:px-6">
      {notifications.map((notification) => (
        <NotificationToast key={notification.id} notification={notification} onDismiss={onDismiss} />
      ))}
    </div>
  )
}

function NotificationToast({
  notification,
  onDismiss,
}: {
  notification: Notification
  onDismiss: (id: string) => void
}) {
  const variantStyles: Record<NotificationKind, string> = {
    success: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-100',
    error: 'border-red-500/40 bg-red-500/10 text-red-100',
    info: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-100',
    warning: 'border-amber-500/40 bg-amber-500/10 text-amber-100',
  }

  const icon: Record<NotificationKind, JSX.Element> = {
    success: (
      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-7.778 7.778a1 1 0 01-1.414 0L3.293 10.263a1 1 0 011.414-1.414l3.1 3.1 7.071-7.071a1 1 0 011.414 0z"
          clipRule="evenodd"
        />
      </svg>
    ),
    error: (
      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-10.707a1 1 0 00-1.414-1.414L10 8.586 7.707 6.293A1 1 0 006.293 7.707L8.586 10l-2.293 2.293a1 1 0 101.414 1.414L10 11.414l2.293 2.293a1 1 0 001.414-1.414L11.414 10l2.293-2.293z"
          clipRule="evenodd"
        />
      </svg>
    ),
    info: (
      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M18 10A8 8 0 11.001 9.999 8 8 0 0118 10zm-8-6a1 1 0 10.001 1.999A1 1 0 0010 4zm1 4a1 1 0 00-2 0v6a1 1 0 102 0V8z" />
      </svg>
    ),
    warning: (
      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M8.257 3.099c.765-1.36 2.72-1.36 3.486 0l6.518 11.597c.75 1.335-.213 3.004-1.742 3.004H3.48c-1.53 0-2.492-1.67-1.742-3.004L8.257 3.1zM11 14a1 1 0 10-2 0 1 1 0 002 0zm-1-2a1 1 0 01-1-1V8a1 1 0 112 0v3a1 1 0 01-1 1z"
          clipRule="evenodd"
        />
      </svg>
    ),
  }

  return (
    <div
      className={`pointer-events-auto w-full max-w-sm overflow-hidden rounded-xl border px-4 py-3 shadow-lg shadow-slate-950/40 backdrop-blur transition ${variantStyles[notification.kind]}`}
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5">{icon[notification.kind]}</span>
        <div className="flex-1">
          {notification.title && <p className="text-sm font-semibold">{notification.title}</p>}
          <p className="text-sm leading-relaxed text-slate-100">{notification.message}</p>
        </div>
        <button
          type="button"
          onClick={() => onDismiss(notification.id)}
          className="rounded-md p-1 text-slate-300 transition hover:text-white focus:outline-none focus:ring-2 focus:ring-white/40"
        >
          <span className="sr-only">Cerrar</span>
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}
