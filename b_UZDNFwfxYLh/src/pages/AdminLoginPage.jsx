import { useState } from "react"
import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { useLoginMutation } from "@/features/api/apiSlice"
import { setCredentials } from "@/features/auth/authSlice"
import { Shield } from "lucide-react"

export default function AdminLoginPage() {
  const [error, setError] = useState("")
  const [login, { isLoading }] = useLoginMutation()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const submit = async (event) => {
    event.preventDefault()
    setError("")
    const form = new FormData(event.currentTarget)
    try {
      const data = await login({
        email: form.get("email"),
        password: form.get("password"),
        role: "admin",
      }).unwrap()
      dispatch(setCredentials(data))
      navigate("/admin/dashboard", { replace: true })
    } catch (err) {
      setError(err?.data?.message || "Admin login failed.")
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <form onSubmit={submit} className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-primary-foreground"><Shield className="h-6 w-6" /></div>
          <div><h1 className="text-xl font-bold text-foreground">Admin Login</h1><p className="text-sm text-muted-foreground">Separate admin access</p></div>
        </div>
        <div className="mt-6 space-y-4">
          <div><Label>Email</Label><Input name="email" type="email" defaultValue="pandaabhijit326@gmail.com" required className="mt-2" /></div>
          <div><Label>Password</Label><Input name="password" type="password" defaultValue="admin123" required className="mt-2" /></div>
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <Button disabled={isLoading} className="w-full bg-primary hover:bg-primary/90">{isLoading ? "Signing in..." : "Login as Admin"}</Button>
        </div>
      </form>
    </div>
  )
}
