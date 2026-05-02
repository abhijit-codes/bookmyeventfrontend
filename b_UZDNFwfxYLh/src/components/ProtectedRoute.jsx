import { useSelector } from "react-redux"
import { Navigate, useLocation } from "react-router-dom"

export function ProtectedRoute({ role, children }) {
  const { account, accessToken } = useSelector((state) => state.auth)
  const location = useLocation()

  if (!accessToken || !account) {
    const loginPath = role === "vendor" ? "/vendor/login" : role === "admin" ? "/admin/login" : "/login"
    return <Navigate to={loginPath} state={{ from: `${location.pathname}${location.search}` }} replace />
  }

  if (role && account.role !== role) {
    return <Navigate to={account.role === "vendor" ? "/vendor/dashboard" : "/dashboard"} replace />
  }

  return children
}
