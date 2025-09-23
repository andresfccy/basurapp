import { Navigate, Route, Routes, useLocation } from 'react-router-dom'

import { useAuth } from './auth/auth-context'
import DashboardLayout from './components/layout/DashboardLayout'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import AdminCollectorsPage from './pages/AdminCollectorsPage'
import AdminOverviewPage from './pages/AdminOverviewPage'
import AdminUsersPage from './pages/AdminUsersPage'
import ReportsPage from './pages/ReportsPage'

type RequireAuthProps = {
  children: JSX.Element
}

function RequireAuth({ children }: RequireAuthProps) {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <RequireAuth>
            <DashboardLayout />
          </RequireAuth>
        }
      >
        <Route index element={<HomePage />} />
        <Route path="administracion" element={<AdminOverviewPage />} />
        <Route path="usuarios" element={<AdminUsersPage />} />
        <Route path="recolectores" element={<AdminCollectorsPage />} />
        <Route path="reportes" element={<ReportsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
