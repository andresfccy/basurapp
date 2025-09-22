import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import type { MouseEvent, ReactNode } from 'react'

type ModalProps = {
  open: boolean
  title?: string
  onClose: () => void
  children: ReactNode
}

const modalRoot = typeof document !== 'undefined' ? document.body : null

function Modal({ open, title, onClose, children }: ModalProps) {
  useEffect(() => {
    if (!open) return undefined

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open || !modalRoot) {
    return null
  }

  const handleBackdropClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 py-10 backdrop-blur"
      role="dialog"
      aria-modal
      aria-label={title}
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl shadow-slate-950/60">
        <header className="flex items-start justify-between gap-6 border-b border-slate-800 px-6 py-4">
          {title ? <h2 className="text-lg font-semibold text-slate-100">{title}</h2> : <span />}
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-transparent p-2 text-slate-500 transition hover:border-slate-700 hover:text-slate-300"
            aria-label="Cerrar"
          >
            ×
          </button>
        </header>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>,
    modalRoot,
  )
}

export default Modal
