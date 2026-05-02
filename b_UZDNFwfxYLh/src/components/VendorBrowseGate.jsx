import { useSelector } from "react-redux"
import { Navigate, useLocation } from "react-router-dom"

export function VendorBrowseGate({ children }) {
  const { account, accessToken } = useSelector((state) => state.auth)
  const location = useLocation()

  if (!accessToken || !account) {
    return (
      <Navigate
        to="/login"
        state={{
          from: `${location.pathname}${location.search}`,
          message: "Take a step and login please for your beautiful event.",
        }}
        replace
      />
    )
  }

  return children
}
