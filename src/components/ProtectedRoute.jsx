import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function BlockingScreen({ message }) {
  return <div className="app-loader">{message}</div>
}

export function GuestRoute() {
  const { isLoading, user } = useAuth()

  if (isLoading) {
    return <BlockingScreen message="Checking for an existing session..." />
  }

  if (user) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

export function ProtectedRoute() {
  const { isLoading, user } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <BlockingScreen message="Restoring your secured workspace..." />
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}

export function AdminRoute() {
  const { user } = useAuth()

  if (user?.role !== 'admin') {
    return <Navigate to="/student" replace />
  }

  return <Outlet />
}

export function StudentRoute() {
  const { user } = useAuth()

  if (user?.role !== 'student') {
    return <Navigate to="/admin/opportunities" replace />
  }

  return <Outlet />
}
