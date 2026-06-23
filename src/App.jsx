import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import {
  AdminRoute,
  GuestRoute,
  ProtectedRoute,
  StudentRoute,
} from './components/ProtectedRoute'
import { AuthProvider, useAuth } from './context/AuthContext'
import AdminOpportunitiesPage from './pages/AdminOpportunitiesPage'
import AdminUsersPage from './pages/AdminUsersPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import StudentDashboardPage from './pages/StudentDashboardPage'
import TrackingPage from './pages/TrackingPage'

function RoleRedirect() {
  const { isLoading, user } = useAuth()

  if (isLoading) {
    return <div className="app-loader">Reconnecting your workspace...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return user.role === 'admin' ? (
    <Navigate to="/admin/opportunities" replace />
  ) : (
    <Navigate to="/student" replace />
  )
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RoleRedirect />} />

      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<StudentRoute />}>
          <Route element={<AppLayout role="student" />}>
            <Route path="/student" element={<StudentDashboardPage />} />
            <Route path="/student/tracking" element={<TrackingPage />} />
          </Route>
        </Route>

        <Route element={<AdminRoute />}>
          <Route element={<AppLayout role="admin" />}>
            <Route path="/admin/opportunities" element={<AdminOpportunitiesPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
