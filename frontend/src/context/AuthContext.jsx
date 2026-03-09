import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [state, setState] = useState({
    user: null, token: null, isAuthenticated: false
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Initialize from localStorage on mount
    const initAuth = () => {
      const token = localStorage.getItem('token')
      const userStr = localStorage.getItem('user')
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr)
          setState({ token, user, isAuthenticated: true })
          console.log('✅ Auth initialized from localStorage')
        } catch (err) {
          console.error('Failed to parse user from localStorage:', err)
          localStorage.removeItem('token')
          localStorage.removeItem('user')
        }
      }
      setLoading(false)
    }
    initAuth()

    // Listen for storage changes (when login updates localStorage)
    const handleStorageChange = (e) => {
      if (e.key === 'token' || e.key === 'user') {
        const token = localStorage.getItem('token')
        const userStr = localStorage.getItem('user')
        if (token && userStr) {
          try {
            const user = JSON.parse(userStr)
            setState({ token, user, isAuthenticated: true })
          } catch (err) {
            console.error('Failed to parse user:', err)
          }
        }
      }
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const login = (token, user) => {
    // Update localStorage first (most reliable)
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    // Update state synchronously - this triggers re-render
    setState({ 
      token, 
      user, 
      isAuthenticated: true 
    })
    console.log('✅ Auth state updated:', { 
      hasToken: !!token, 
      user: user?.email, 
      role: user?.role 
    })
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setState({ user: null, token: null, isAuthenticated: false })
  }

  return (
    <AuthContext.Provider value={{ ...state, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
