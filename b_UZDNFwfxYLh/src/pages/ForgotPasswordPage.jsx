import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { useRequestUserPasswordOtpMutation, useResetUserPasswordMutation, useVerifyUserPasswordOtpMutation } from "@/features/api/apiSlice"
import { ArrowLeft, ArrowRight, KeyRound, Mail, ShieldCheck } from "lucide-react"

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [message, setMessage] = useState("")
  const [requestOtp, requestState] = useRequestUserPasswordOtpMutation()
  const [verifyOtp, verifyState] = useVerifyUserPasswordOtpMutation()
  const [resetPassword, resetState] = useResetUserPasswordMutation()
  const navigate = useNavigate()

  const submitEmail = async (event) => {
    event.preventDefault()
    setMessage("")
    try {
      const response = await requestOtp({ email }).unwrap()
      setMessage(response.message || "OTP sent to your email.")
      setStep(2)
    } catch (err) {
      setMessage(err?.data?.message || "Unable to send OTP.")
    }
  }

  const submitOtp = async (event) => {
    event.preventDefault()
    setMessage("")
    try {
      const response = await verifyOtp({ email, otp }).unwrap()
      setMessage(response.message || "OTP verified.")
      setStep(3)
    } catch (err) {
      setMessage(err?.data?.message || "Invalid OTP.")
    }
  }

  const submitPassword = async (event) => {
    event.preventDefault()
    setMessage("")
    if (password !== confirmPassword) {
      setMessage("New password and confirm password must match.")
      return
    }

    try {
      const response = await resetPassword({ email, otp, password, confirmPassword }).unwrap()
      navigate("/login", { replace: true, state: { message: response.message } })
    } catch (err) {
      setMessage(err?.data?.message || "Unable to reset password.")
    }
  }

  const isLoading = requestState.isLoading || verifyState.isLoading || resetState.isLoading

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto flex min-h-[calc(100vh-7rem)] max-w-xl items-center px-3 py-5 sm:px-6 sm:py-10">
        <div className="w-full rounded-2xl border border-border bg-card p-4 shadow-xl sm:p-8">
          <Link to="/login" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"><ArrowLeft className="h-4 w-4" />Back to login</Link>
          <div className="mt-6">
            <span className="inline-flex rounded-full border border-border bg-muted px-4 py-1.5 text-xs text-muted-foreground">Step {step} of 3</span>
            <h1 className="mt-3 text-2xl font-bold text-foreground sm:text-3xl">Reset customer password</h1>
            <p className="mt-2 text-sm text-muted-foreground">Use your registered customer email, verify OTP, then set a new password.</p>
          </div>

          {step === 1 && (
            <form onSubmit={submitEmail} className="mt-6 space-y-4">
              <div>
                <Label>Customer email</Label>
                <div className="relative mt-2">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="h-12 rounded-xl pl-10" placeholder="you@example.com" />
                </div>
              </div>
              <Button disabled={isLoading} className="h-12 w-full rounded-xl bg-primary hover:bg-primary/90">{isLoading ? "Sending..." : <>Send OTP <ArrowRight className="ml-2 h-4 w-4" /></>}</Button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={submitOtp} className="mt-6 space-y-4">
              <div>
                <Label>Enter OTP</Label>
                <div className="relative mt-2">
                  <ShieldCheck className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input required inputMode="numeric" maxLength={6} value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))} className="h-12 rounded-xl pl-10 tracking-[0.35em]" placeholder="000000" />
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button type="button" variant="outline" className="h-12 flex-1 rounded-xl" onClick={() => setStep(1)}>Back</Button>
                <Button disabled={isLoading} className="h-12 flex-[2] rounded-xl bg-primary hover:bg-primary/90">{isLoading ? "Verifying..." : "Verify OTP"}</Button>
              </div>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={submitPassword} className="mt-6 space-y-4">
              <div>
                <Label>New password</Label>
                <div className="relative mt-2">
                  <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input type="password" required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} className="h-12 rounded-xl pl-10" />
                </div>
              </div>
              <div>
                <Label>Confirm password</Label>
                <Input type="password" required minLength={8} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="mt-2 h-12 rounded-xl" />
              </div>
              <Button disabled={isLoading} className="h-12 w-full rounded-xl bg-primary hover:bg-primary/90">{isLoading ? "Resetting..." : "Reset Password"}</Button>
            </form>
          )}

          {message && <p className="mt-4 rounded-lg bg-muted px-3 py-2 text-sm text-foreground">{message}</p>}
        </div>
      </main>
      <Footer />
    </div>
  )
}
