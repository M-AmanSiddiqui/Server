import { useEffect } from 'react'
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react'

export default function Toast({ message, type = 'success', onClose, duration = 3000 }) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose?.()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  const styles = {
    success: {
      bg: 'bg-gradient-to-r from-emerald-600 to-green-700',
      icon: CheckCircle,
      border: 'border-emerald-500',
    },
    error: {
      bg: 'bg-gradient-to-r from-rose-600 to-red-700',
      icon: XCircle,
      border: 'border-rose-500',
    },
    warning: {
      bg: 'bg-gradient-to-r from-amber-500 to-orange-600',
      icon: AlertCircle,
      border: 'border-amber-400',
    },
    info: {
      bg: 'bg-gradient-to-r from-sky-600 to-cyan-700',
      icon: AlertCircle,
      border: 'border-sky-500',
    },
  }

  const style = styles[type] || styles.success
  const Icon = style.icon

  return (
    <div
      className={`fixed right-4 top-4 z-50 min-w-[280px] max-w-[calc(100vw-2rem)] animate-slide-in rounded-lg border-2 px-4 py-3 text-white shadow-2xl sm:right-6 sm:top-6 sm:min-w-[300px] sm:max-w-md sm:rounded-xl sm:px-6 sm:py-4 ${style.bg} ${style.border}`}
    >
      <div className="flex items-center gap-2 sm:gap-3">
        <Icon size={20} className="sm:w-6 sm:h-6 flex-shrink-0" />
        <p className="flex-1 font-semibold text-sm sm:text-base">{message}</p>
        <button
          onClick={onClose}
          className="flex-shrink-0 rounded-lg p-1 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
        >
          <X size={16} className="sm:w-[18px] sm:h-[18px]" />
        </button>
      </div>
    </div>
  )
}
