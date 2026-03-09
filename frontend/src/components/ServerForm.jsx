import { useState, useEffect } from 'react'
import { Plus, X } from 'lucide-react'
import Toast from './Toast'

export default function ServerForm({ server, onSubmit, onClose }) {
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    if (server) {
      setName(server.name || '')
      setUrl(server.url || '')
    }
  }, [server])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (name && url) {
      setLoading(true)
      try {
        // Check if token exists before making request
        const token = localStorage.getItem('token')
        if (!token) {
          setError('Session expired. Please login again.')
          setTimeout(() => {
            window.location.href = '/login'
          }, 2000)
          return
        }
        
        console.log('📤 Submitting server:', { name, url })
        console.log('🔑 Token present:', !!token)
        console.log('🔑 Token value:', token ? token.substring(0, 20) + '...' : 'NULL')
        
        // Validate URL format
        if (!url.match(/^https?:\/\/.+/)) {
          setError('URL must start with http:// or https://')
          setLoading(false)
          return
        }
        
        // Double check token before request
        const tokenCheck = localStorage.getItem('token')
        if (!tokenCheck) {
          setError('Token lost. Please login again.')
          setLoading(false)
          setTimeout(() => {
            window.location.href = '/login'
          }, 2000)
          return
        }
        
        await onSubmit(name, url)
        if (!server) {
          setName('')
          setUrl('')
        }
        // Show success toast
        setToast({ 
          message: server ? `Server "${name}" updated successfully!` : `Server "${name}" added successfully!`, 
          type: 'success' 
        })
        // Close form after toast
        setTimeout(() => {
          onClose?.()
        }, 1500)
      } catch (err) {
        console.error('❌ Server form error:', err)
        console.error('Error response:', err.response)
        
        let errorMsg = 'Failed to save server'
        
        if (err.response) {
          // Backend returned an error
          errorMsg = err.response.data?.detail || err.response.data?.message || err.response.statusText
          console.error('Backend error:', errorMsg)
        } else if (err.message) {
          // Network or other error
          errorMsg = err.message
          console.error('Network error:', errorMsg)
        }
        
        setError(errorMsg)
        
        // If it's an auth error, show helpful message
        if (err.response?.status === 401) {
          const detail = err.response?.data?.detail || ''
          console.error('🔐 Auth error details:', detail)
          
          // Check if token exists
          const currentToken = localStorage.getItem('token')
          if (!currentToken) {
            setError('Session expired. Please login again. Redirecting in 3 seconds...')
            setTimeout(() => {
              localStorage.clear()
              window.location.href = '/login'
            }, 3000)
          } else if (detail.includes('expired') || detail.includes('Invalid')) {
            setError('Token expired or invalid. Please login again. Redirecting in 3 seconds...')
            setTimeout(() => {
              localStorage.clear()
              window.location.href = '/login'
            }, 3000)
          } else if (detail.includes('missing token')) {
            setError('Token not found. Please login again. Redirecting in 3 seconds...')
            setTimeout(() => {
              localStorage.clear()
              window.location.href = '/login'
            }, 3000)
          } else {
            setError(`Authentication error: ${detail}. Please try logging in again.`)
          }
        }
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm sm:p-6">
      <div className="app-panel w-full max-w-md max-h-[90vh] overflow-y-auto rounded-xl border shadow-2xl transition-all sm:rounded-2xl">
        <div className="app-panel-header sticky top-0 flex items-center justify-between rounded-t-xl px-4 py-3 sm:rounded-t-2xl sm:px-6 sm:py-4">
          <h2 className="text-lg sm:text-xl font-bold text-white">{server ? 'Edit Server' : 'Add New Server'}</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-white/85 transition-colors hover:bg-white/15 hover:text-white">
            <X size={18} className="sm:w-5 sm:h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg shadow-sm">
              <p className="font-medium text-sm">{error}</p>
            </div>
          )}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-600 sm:text-sm">Server Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              className="app-input px-3 py-2.5 text-sm sm:px-4 sm:py-3 sm:text-base"
              placeholder="Production API" required />
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-600 sm:text-sm">Server URL</label>
            <input type="url" value={url} onChange={(e) => setUrl(e.target.value)}
              className="app-input px-3 py-2.5 text-sm sm:px-4 sm:py-3 sm:text-base"
              placeholder="https://api.example.com" required />
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="app-btn-soft flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-200 sm:rounded-xl sm:py-3 sm:text-base">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="app-btn-primary flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 sm:rounded-xl sm:py-3 sm:text-base">
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <Plus size={16} className="sm:w-[18px] sm:h-[18px]" /> <span>{server ? 'Update' : 'Add'} Server</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
