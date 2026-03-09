import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { BarChart3, FileText, LogOut, Server, User } from 'lucide-react'

import { useAuth } from '../context/AuthContext'
import Toast from './Toast'

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [toast, setToast] = useState(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const isAdmin = user?.role === 'admin'

  const handleLogout = () => {
    setToast({ message: 'Logged out successfully!', type: 'success' })
    setTimeout(() => {
      logout()
      navigate('/login')
    }, 1200)
  }

  const navItems = [
    { path: isAdmin ? '/dashboard' : '/view', icon: Server, label: 'Servers' },
    ...(isAdmin ? [{ path: '/reports', icon: FileText, label: 'Reports' }] : []),
  ]

  return (
    <div className="app-shell">
      <nav className="app-nav sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-6 lg:gap-8">
              <h1 className="flex items-center gap-2 text-lg font-bold text-white sm:text-xl lg:text-2xl">
                <div className="app-title-chip rounded-lg p-1.5 sm:rounded-xl sm:p-2">
                  <BarChart3 className="text-white" size={18} />
                </div>
                <span className="hidden sm:inline">Server Monitor</span>
                <span className="sm:hidden">Monitor</span>
              </h1>
              <div className="hidden items-center gap-2 lg:gap-3 md:flex">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-all duration-200 lg:px-4 lg:text-sm ${
                      location.pathname === item.path
                        ? 'border border-white/30 bg-white/20 text-white shadow-md'
                        : 'text-slate-200 hover:bg-white/12 hover:text-white'
                    }`}
                  >
                    <item.icon size={16} className="lg:h-[18px] lg:w-[18px]" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 sm:flex lg:gap-3 lg:px-4 lg:py-2">
                <div className="rounded-full bg-white/15 p-1.5">
                  <User size={14} className="text-slate-100 lg:h-4 lg:w-4" />
                </div>
                <div className="hidden lg:flex lg:flex-col">
                  <span className="max-w-[140px] truncate text-xs text-slate-200">{user?.email}</span>
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-cyan-200">
                    {user?.role}
                  </span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="rounded-lg p-2 text-slate-200 transition-colors duration-200 hover:bg-rose-500/25 hover:text-white"
              >
                <LogOut size={18} className="lg:h-5 lg:w-5" />
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="rounded-lg p-2 text-slate-100 transition-colors hover:bg-white/10 md:hidden"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="mt-4 border-t border-white/15 pt-4 md:hidden">
              <div className="flex flex-col gap-2">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                      location.pathname === item.path
                        ? 'border border-white/25 bg-white/20 text-white'
                        : 'text-slate-200 hover:bg-white/12 hover:text-white'
                    }`}
                  >
                    <item.icon size={18} />
                    <span>{item.label}</span>
                  </Link>
                ))}
                <div className="mt-2 flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 py-2">
                  <div className="rounded-full bg-white/15 p-1.5">
                    <User size={16} className="text-slate-100" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-200">{user?.email}</span>
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-cyan-200">
                      {user?.role}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      <main className="relative z-10 mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
