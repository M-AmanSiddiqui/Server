import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart3 } from 'lucide-react'

import Toast from '../components/Toast'
import { useAuth } from '../context/AuthContext'
import { authApi } from '../services/api'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const { login } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userStr = localStorage.getItem('user')
    if (token && userStr) {
      try {
        const userData = JSON.parse(userStr)
        const targetPath = userData.role === 'admin' ? '/dashboard' : '/view'
        navigate(targetPath, { replace: true })
      } catch {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
  }, [navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await authApi.login(email, password)
      const payload = JSON.parse(atob(data.access_token.split('.')[1]))
      const userData = { id: payload.sub, email, role: payload.role }

      localStorage.setItem('token', data.access_token)
      localStorage.setItem('user', JSON.stringify(userData))
      login(data.access_token, userData)

      setToast({ message: `Welcome back, ${email}! Redirecting...`, type: 'success' })
      setTimeout(() => {
        const targetPath = payload.role === 'admin' ? '/dashboard' : '/view'
        navigate(targetPath, { replace: true })
      }, 1500)
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password')
      setLoading(false)
    }
  }

  return (
    <div className="app-shell flex min-h-screen items-center justify-center overflow-hidden p-4 sm:p-6 md:p-8">
      <div className="pointer-events-none absolute left-0 top-0 h-64 w-64 rounded-full bg-cyan-300/35 blur-3xl animate-blob sm:h-96 sm:w-96" />
      <div className="pointer-events-none absolute right-0 top-10 h-64 w-64 rounded-full bg-sky-300/35 blur-3xl animate-blob animation-delay-2000 sm:h-96 sm:w-96" />
      <div className="pointer-events-none absolute bottom-0 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-amber-200/35 blur-3xl animate-blob animation-delay-4000 sm:h-96 sm:w-96" />

      <div className="app-panel animate-fade-rise relative z-10 w-full max-w-md rounded-2xl p-6 sm:rounded-3xl sm:p-8 md:p-10">
        <div className="mb-8 text-center">
          <div className="app-title-chip mx-auto mb-5 inline-flex h-16 w-16 items-center justify-center rounded-2xl sm:h-20 sm:w-20">
            <BarChart3 size={34} className="text-white sm:h-10 sm:w-10" />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-[var(--text-strong)] sm:text-3xl">Server Monitor</h1>
          <p className="app-muted text-sm font-medium sm:text-base">Sign in to access your operations dashboard</p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700 shadow-sm">
            <p className="text-sm font-semibold">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-600 sm:text-sm">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="app-input px-3 py-2.5 text-sm sm:px-4 sm:py-3 sm:text-base"
              autoComplete="username"
              required
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-600 sm:text-sm">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="app-input px-3 py-2.5 text-sm sm:px-4 sm:py-3 sm:text-base"
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="app-btn-primary w-full rounded-xl py-3 text-sm font-semibold transition-all disabled:opacity-60 sm:py-3.5 sm:text-base"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4 animate-spin sm:h-5 sm:w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
