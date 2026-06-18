import { Navigate, Outlet } from 'react-router-dom'
import { isAdminAuthenticated } from '../utils/auth'

export function ProtectedRoute() {
  return isAdminAuthenticated() ? <Outlet /> : <Navigate to="/login" replace />
}
