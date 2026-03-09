import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, adminOnly }) {
  const { loading } = useAuth()

  // Wait for auth context to initialize
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  // Check localStorage DIRECTLY (most reliable, no state dependency)
  const storedToken = localStorage.getItem('token')
  const storedUserStr = localStorage.getItem('user')
  
  if (!storedToken || !storedUserStr) {
    console.log('❌ No token/user in localStorage, redirecting to login')
    return <Navigate to="/login" replace />
  }

  let storedUser = null
  try {
    storedUser = JSON.parse(storedUserStr)
  } catch (e) {
    console.error('Failed to parse user:', e)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    return <Navigate to="/login" replace />
  }

  // Check admin role if required
  if (adminOnly && storedUser?.role !== 'admin') {
    console.log('❌ Not admin, redirecting to view')
    return <Navigate to="/view" replace />
  }

  console.log('✅ ProtectedRoute: Access granted', { role: storedUser?.role })
  return <>{children}</>
}
