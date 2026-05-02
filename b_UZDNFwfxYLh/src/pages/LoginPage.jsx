import { useState } from "react"
import { useDispatch } from "react-redux"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { setCredentials } from "@/features/auth/authSlice"
import { useLoginMutation } from "@/features/api/apiSlice"
import { ArrowRight, Briefcase, Eye, EyeOff, Lock, Mail, User } from "lucide-react"

export default function LoginPage({ role = "user" }) {
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [login, { isLoading }] = useLoginMutation()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError("")
    const form = new FormData(event.currentTarget)
    try {
      const data = await login({
        email: form.get("email"),
        password: form.get("password"),
        role,
      }).unwrap()
      dispatch(setCredentials(data))
      const fallback = data.account.role === "vendor" ? "/vendor/dashboard" : data.account.role === "admin" ? "/admin/dashboard" : "/dashboard"
      navigate(location.state?.from || fallback, { replace: true })
    } catch (err) {
      setError(err?.data?.message || "Login failed. Please check your details.")
    }
  }

  const isVendorLogin = role === "vendor"
  const accessLabel = isVendorLogin ? "Partner access" : "Customer access"
  const title = isVendorLogin ? "Partner Login" : "Customer Login"
  const intro = isVendorLogin
    ? "Sign in to manage services, booking requests, and your vendor workspace."
    : "Sign in to explore trusted vendors and plan your beautiful event."
  const heroTitle = isVendorLogin ? "Welcome Back To Your Partner Workspace." : "Welcome Back To Your Event Workspace."
  const heroText = isVendorLogin
    ? "Continue vendor communication, service updates, package details, and booking operations from one secure workspace."
    : "Continue bookings, vendor discovery, package updates, and event planning from one secure workspace."

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-8 lg:px-8">
        <section className="grid min-h-[calc(100vh-7rem)] overflow-hidden rounded-2xl border border-border bg-card shadow-xl sm:rounded-[2rem] lg:grid-cols-[1.15fr_1fr]">
          <div className="relative hidden min-h-[620px] items-center justify-center overflow-hidden bg-[linear-gradient(rgba(3,4,94,0.72),rgba(237,1,1,0.54)),url('https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1400&q=80')] bg-cover bg-center p-12 text-center text-white lg:flex">
            <div className="max-w-xl">
              <span className="inline-flex rounded-full border border-white/35 bg-white/15 px-5 py-2 text-sm backdrop-blur">{accessLabel}</span>
              <h1 className="mt-8 text-5xl font-semibold leading-tight">{heroTitle}</h1>
              <p className="mt-6 text-lg leading-8 text-white/90">
                {heroText}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center bg-[radial-gradient(circle_at_bottom_right,rgba(255,213,0,0.28),transparent_34%),linear-gradient(135deg,#fffdf0,#fff3a8)] px-3 py-5 sm:px-8 sm:py-10">
            <div className="w-full max-w-xl rounded-2xl border border-border bg-white/70 p-4 shadow-2xl backdrop-blur sm:rounded-[2rem] sm:p-10">
              <span className="inline-flex rounded-full border border-border bg-white px-5 py-2 text-sm text-muted-foreground">Welcome back</span>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-4xl">{title}</h2>
              <p className="mt-4 text-muted-foreground">{location.state?.message || intro}</p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div>
                  <Label htmlFor="email">Email address</Label>
                  <div className="relative mt-2">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="email" name="email" type="email" required className="h-12 rounded-xl bg-white pl-10" placeholder="you@example.com" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <Label htmlFor="password">Password</Label>
                    <Link to={isVendorLogin ? "/vendor/forgot-password" : "/forgot-password"} className="text-xs font-medium text-primary hover:underline">Forgot password?</Link>
                  </div>
                  <div className="relative mt-2">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="password" name="password" type={showPassword ? "text" : "password"} required className="h-12 rounded-xl bg-white pl-10 pr-10" placeholder="Enter your password" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
                <Button type="submit" className="h-12 w-full rounded-xl bg-primary hover:bg-primary/90" disabled={isLoading}>
                  {isLoading ? "Signing in..." : <>Sign in <ArrowRight className="ml-2 h-4 w-4" /></>}
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                {isVendorLogin ? "New partner?" : "New here?"}{" "}
                <Link to={isVendorLogin ? "/vendor/register" : "/signup"} className="font-medium text-primary hover:text-primary/90">
                  {isVendorLogin ? "Register as partner" : "Create an account"}
                </Link>
              </p>
              <p className="mt-2 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                {isVendorLogin ? <Briefcase className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
                {isVendorLogin ? "Vendor access is separate from customer login." : "Customer login for event browsing and bookings."}
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
