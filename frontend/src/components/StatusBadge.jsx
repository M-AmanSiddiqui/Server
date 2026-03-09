export default function StatusBadge({ status }) {
  const styles = {
    up: 'bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-md',
    slow: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md',
    down: 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-md',
    unknown: 'bg-gradient-to-r from-slate-500 to-slate-600 text-white shadow-md',
  }

  return (
    <span
      className={`inline-block rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wide transition-transform hover:scale-105 sm:px-3 sm:py-1.5 sm:text-xs ${
        styles[status] || styles.unknown
      }`}
    >
      {status || 'unknown'}
    </span>
  )
}
