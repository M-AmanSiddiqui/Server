import { AlertTriangle, X } from 'lucide-react'
import { createPortal } from 'react-dom'

export default function ConfirmDialog({ title, message, onConfirm, onCancel, confirmText = 'Confirm', cancelText = 'Cancel' }) {
  if (typeof document === 'undefined') {
    return null
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm sm:p-6"
      onClick={onCancel}
    >
      <div
        className="app-panel w-full max-w-md rounded-xl border shadow-2xl transition-all sm:rounded-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between rounded-t-xl bg-gradient-to-r from-rose-600 to-red-700 px-4 py-3 sm:rounded-t-2xl sm:px-6 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <AlertTriangle className="text-white" size={20} />
            <h3 className="text-lg font-bold text-white sm:text-xl">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg p-1.5 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
            aria-label="Close delete confirmation"
          >
            <X size={18} className="sm:h-5 sm:w-5" />
          </button>
        </div>
        <div className="p-4 sm:p-6">
          <p className="mb-4 text-sm font-medium text-slate-700 sm:mb-6 sm:text-base">{message}</p>
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="app-btn-soft flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-200 sm:rounded-xl sm:py-3 sm:text-base"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="flex-1 rounded-lg bg-gradient-to-r from-rose-600 to-red-700 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:brightness-105 sm:rounded-xl sm:py-3 sm:text-base"
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
