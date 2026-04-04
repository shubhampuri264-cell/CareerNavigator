import { Navigate, useLocation } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext'

/**
 * Wraps a route and redirects unauthenticated users to /login.
 * Preserves the intended destination so users are redirected back after login.
 */
export default function ProtectedRoute({ children }) {
  const { user } = useAuthContext()
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}
