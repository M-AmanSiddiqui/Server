import { BarChart3, Eye } from 'lucide-react'

export default function PublicLayout({ children }) {
  return (
    <div className="app-shell">
      <nav className="app-nav">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <h1 className="flex items-center gap-2 text-lg font-bold text-white sm:text-xl lg:text-2xl">
            <div className="app-title-chip rounded-lg p-1.5 sm:rounded-xl sm:p-2">
              <BarChart3 className="text-white" size={18} />
            </div>
            <span className="hidden sm:inline">Server Monitor</span>
            <span className="sm:hidden">Monitor</span>
          </h1>

          <div className="flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-2.5 py-1.5 sm:px-3">
            <Eye size={14} className="text-cyan-100 sm:h-4 sm:w-4" />
            <span className="hidden text-xs font-semibold tracking-wide text-cyan-100 sm:inline sm:text-sm">
              Public View
            </span>
            <span className="text-xs font-semibold tracking-wide text-cyan-100 sm:hidden">View</span>
          </div>
        </div>
      </nav>

      <main className="relative z-10 mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
    </div>
  )
}
