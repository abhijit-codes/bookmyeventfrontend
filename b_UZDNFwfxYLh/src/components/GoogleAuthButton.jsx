import { useEffect, useRef, useState } from "react"
import { useDispatch } from "react-redux"
import { useLocation, useNavigate } from "react-router-dom"
import { useGoogleLoginMutation } from "@/features/api/apiSlice"
import { setCredentials } from "@/features/auth/authSlice"
import { Button } from "@/components/ui/Button"

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

const loadGoogleScript = () =>
  new Promise((resolve) => {
    if (window.google?.accounts?.id) {
      resolve(true)
      return
    }

    const existing = document.querySelector("script[src='https://accounts.google.com/gsi/client']")
    if (existing) {
      existing.addEventListener("load", () => resolve(true), { once: true })
      existing.addEventListener("error", () => resolve(false), { once: true })
      return
    }

    const script = document.createElement("script")
    script.src = "https://accounts.google.com/gsi/client"
    script.async = true
    script.defer = true
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })

export function GoogleAuthButton({ label = "Continue with Google", onError }) {
  const buttonRef = useRef(null)
  const renderedRef = useRef(false)
  const [googleLogin] = useGoogleLoginMutation()
  const [status, setStatus] = useState("")
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    let cancelled = false

    const renderGoogleButton = async () => {
      if (!googleClientId) {
        setStatus("Google sign in is not configured.")
        return
      }

      const loaded = await loadGoogleScript()
      if (!loaded || cancelled || !buttonRef.current || renderedRef.current) {
        if (!loaded) setStatus("Unable to load Google sign in.")
        return
      }

      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async (response) => {
          setStatus("")
          try {
            const data = await googleLogin({ idToken: response.credential }).unwrap()
            dispatch(setCredentials(data))
            navigate(location.state?.from || "/dashboard", { replace: true })
          } catch (err) {
            const message = err?.data?.message || "Google sign in failed."
            setStatus(message)
            onError?.(message)
          }
        },
      })

      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: "outline",
        size: "large",
        text: "continue_with",
        width: buttonRef.current.clientWidth || 360,
      })
      renderedRef.current = true
    }

    renderGoogleButton()
    return () => {
      cancelled = true
    }
  }, [dispatch, googleLogin, location.state?.from, navigate, onError])

  return (
    <div>
      <div className="sr-only">{label}</div>
      {!googleClientId && (
        <Button type="button" variant="outline" className="h-12 w-full rounded-xl bg-white" onClick={() => setStatus("Add Google client id in frontend and backend .env to enable this button.")}>
          <span className="mr-2 text-base font-bold text-blue-600">G</span>{label}
        </Button>
      )}
      {googleClientId && <div ref={buttonRef} className="flex min-h-11 w-full justify-center overflow-hidden rounded-xl" />}
      {status && <p className="mt-2 text-center text-xs text-red-600">{status}</p>}
    </div>
  )
}
