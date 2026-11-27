import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './AuthContext'

function Splash() {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center text-slate-500">
      Loading...
    </div>
  )
}

export function ProtectedRoute() {
  const { user, loading } = useAuth()
  if (loading) return <Splash />
  return user ? <Outlet /> : <Navigate to="/login" replace />
}

export function GuestRoute() {
  const { user, loading } = useAuth()
  if (loading) return <Splash />
  return user ? <Navigate to="/" replace /> : <Outlet />
}