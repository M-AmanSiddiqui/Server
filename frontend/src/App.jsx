import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ViewerDashboard from './pages/ViewerDashboard'
import Reports from './pages/Reports'
import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={
            <ProtectedRoute adminOnly><Dashboard /></ProtectedRoute>
          } />
          <Route path="/view" element={<ViewerDashboard />} />
          <Route path="/reports" element={
            <ProtectedRoute adminOnly><Reports /></ProtectedRoute>
          } />
          <Route path="/" element={<Navigate to="/view" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
