import { useRef, useState } from "react"
import { useDispatch } from "react-redux"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { setCredentials } from "@/features/auth/authSlice"
import { useSignupUserMutation, useSignupVendorMutation } from "@/features/api/apiSlice"
import { CameraCapture } from "@/components/CameraCapture"
import { ArrowLeft, ArrowRight, Check } from "lucide-react"

const initialFormValues = {
  name: "",
  email: "",
  phone: "",
  password: "",
  altPhone: "",
  category: "",
  address1: "",
  address2: "",
  city: "",
  state: "",
  pincode: "",
  businessName: "",
  organisationName: "",
  organisationNumber: "",
  organisationEmail: "",
  gstin: "",
}

const vendorSteps = [
  { id: 1, label: "Access" },
  { id: 2, label: "Business" },
  { id: 3, label: "Verify" },
]

export default function SignupPage({ accountType = "user" }) {
  const [step, setStep] = useState(1)
  const [message, setMessage] = useState("")
  const [documents, setDocuments] = useState({})
  const [formValues, setFormValues] = useState(initialFormValues)
  const formRef = useRef(null)
  const [signupUser, userState] = useSignupUserMutation()
  const [signupVendor, vendorState] = useSignupVendorMutation()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const isLoading = userState.isLoading || vendorState.isLoading
  const isVendor = accountType === "vendor"
  const pageTitle = isVendor ? (step === 1 ? "Create Vendor Access" : step === 2 ? "Business Details" : "Vendor Verification") : "Create Customer Account"
  const heroBadge = isVendor ? "Partner onboarding" : "Customer signup"
  const heroTitle = isVendor ? "Join The Marketplace As A Trusted Event Partner" : "Plan Your Event With Trusted Vendors"
  const heroText = isVendor
    ? "Complete onboarding in guided steps, publish your profile with complete business details, and start receiving qualified enquiries."
    : "Create your customer account, explore verified event vendors, manage bookings, and pay securely from one place."
  const featureList = isVendor
    ? ["Guided onboarding", "Admin verification", "Secure vendor profile"]
    : ["Email signup", "Secure booking payments", "Verified vendor discovery"]

  const errorMessage = (err) =>
    err?.data?.message ||
    err?.error ||
    err?.message ||
    "Signup failed. Please check the form."

  const updateField = (event) => {
    const { name, value } = event.target
    setFormValues((current) => ({ ...current, [name]: value }))
  }

  const goNext = () => {
    setMessage("")
    if (formRef.current?.reportValidity()) {
      setStep((current) => Math.min(current + 1, 3))
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setMessage("")

    if (isVendor && step < 3) {
      goNext()
      return
    }

    try {
      if (!isVendor) {
        const data = await signupUser({
          name: formValues.name,
          email: formValues.email,
          phone: formValues.phone,
          password: formValues.password,
        }).unwrap()
        dispatch(setCredentials(data))
        navigate("/dashboard")
        return
      }

      if (!documents.aadhaarFront || !documents.aadhaarBack || !documents.liveSelfie) {
        setMessage("Please capture Aadhaar front, Aadhaar back, and live selfie.")
        return
      }

      await signupVendor({
        name: formValues.name,
        email: formValues.email,
        phone: formValues.phone,
        altPhone: formValues.altPhone,
        address1: formValues.address1,
        address2: formValues.address2,
        city: formValues.city,
        state: formValues.state,
        pincode: formValues.pincode,
        password: formValues.password,
        category: formValues.category,
        businessName: formValues.businessName,
        organisationName: formValues.organisationName,
        organisationNumber: formValues.organisationNumber,
        organisationEmail: formValues.organisationEmail,
        gstin: formValues.gstin,
        aadhaarFront: documents.aadhaarFront,
        aadhaarBack: documents.aadhaarBack,
        liveSelfie: documents.liveSelfie,
        pan: documents.pan,
      }).unwrap()
      setMessage("Vendor registration submitted. Please wait for admin approval before login.")
      setFormValues(initialFormValues)
      setDocuments({})
      setStep(1)
    } catch (err) {
      setMessage(errorMessage(err))
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-8 lg:px-8">
        <section className="grid min-h-[calc(100vh-7rem)] overflow-hidden rounded-2xl border border-border bg-card shadow-xl sm:rounded-[2rem] lg:grid-cols-[1.15fr_1fr]">
          <div className="relative hidden min-h-[680px] items-center justify-center overflow-hidden bg-[linear-gradient(rgba(3,4,94,0.72),rgba(237,1,1,0.54)),url('https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1400&q=80')] bg-cover bg-center p-12 text-center text-white lg:flex">
            <div className="max-w-xl">
              <span className="inline-flex rounded-full border border-white/35 bg-white/15 px-5 py-2 text-sm backdrop-blur">{heroBadge}</span>
              <h1 className="mt-8 text-5xl font-semibold leading-tight">{heroTitle}</h1>
              <p className="mt-6 text-lg leading-8 text-white/90">
                {heroText}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center bg-[radial-gradient(circle_at_bottom_right,rgba(255,213,0,0.28),transparent_34%),linear-gradient(135deg,#fffdf0,#fff3a8)] px-3 py-5 sm:px-8 sm:py-10">
            <div className="w-full max-w-3xl rounded-2xl border border-border bg-white/72 p-4 shadow-2xl backdrop-blur sm:rounded-[2rem] sm:p-10">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <span className="inline-flex rounded-full border border-border bg-white px-5 py-2 text-sm text-muted-foreground">
                    {isVendor ? `Step ${step} of 3` : "Create account"}
                  </span>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-4xl">{pageTitle}</h2>
                  <p className="mt-3 text-sm text-muted-foreground">
                    Already have an account? <Link to={isVendor ? "/vendor/login" : "/login"} className="font-medium text-primary">Sign in</Link>
                  </p>
                </div>

                {isVendor && (
                  <div className="flex gap-2 pt-2">
                    {vendorSteps.map((item) => (
                      <span key={item.id} className={`h-3 w-10 rounded-full ${step >= item.id ? "bg-primary" : "bg-primary/20"}`} aria-label={item.label} />
                    ))}
                  </div>
                )}
              </div>

              <p className="mt-6 rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
                {isVendor ? "This page is only for vendor registration. Customers should use the customer signup page." : "This page is only for customer signup. Vendors should use the partner registration page."}{" "}
                <Link to={isVendor ? "/signup" : "/vendor/register"} className="font-medium text-primary hover:underline">
                  {isVendor ? "Go to customer signup" : "Register as partner"}
                </Link>
              </p>

              <form ref={formRef} onSubmit={handleSubmit} className="mt-6 grid min-w-0 gap-4 sm:grid-cols-2">
                {(!isVendor || step === 1) && (
                  <>
                    <div><Label htmlFor="name">Full name</Label><Input id="name" name="name" value={formValues.name} onChange={updateField} required className="mt-2 h-12 rounded-xl bg-white" placeholder="Enter your full name" /></div>
                    <div><Label htmlFor="email">Email</Label><Input id="email" name="email" value={formValues.email} onChange={updateField} type="email" required className="mt-2 h-12 rounded-xl bg-white" placeholder="name@company.com" /></div>
                    <div><Label htmlFor="phone">Phone</Label><Input id="phone" name="phone" value={formValues.phone} onChange={updateField} required={isVendor} className="mt-2 h-12 rounded-xl bg-white" placeholder="Enter mobile number" /></div>
                    <div><Label htmlFor="password">Password</Label><Input id="password" name="password" value={formValues.password} onChange={updateField} type="password" minLength={8} required className="mt-2 h-12 rounded-xl bg-white" placeholder="Create a strong password" /></div>
                  </>
                )}

                {isVendor && step === 2 && (
                  <>
                    <div><Label>Category</Label><Input name="category" value={formValues.category} onChange={updateField} required className="mt-2 h-12 rounded-xl bg-white" placeholder="Photography, Catering..." /></div>
                    <div><Label>Business name</Label><Input name="businessName" value={formValues.businessName} onChange={updateField} required className="mt-2 h-12 rounded-xl bg-white" /></div>
                    <div><Label>Address line 1</Label><Input name="address1" value={formValues.address1} onChange={updateField} required className="mt-2 h-12 rounded-xl bg-white" /></div>
                    <div><Label>Address line 2</Label><Input name="address2" value={formValues.address2} onChange={updateField} className="mt-2 h-12 rounded-xl bg-white" /></div>
                    <div><Label>City</Label><Input name="city" value={formValues.city} onChange={updateField} required className="mt-2 h-12 rounded-xl bg-white" /></div>
                    <div><Label>State</Label><Input name="state" value={formValues.state} onChange={updateField} required className="mt-2 h-12 rounded-xl bg-white" /></div>
                    <div><Label>Pincode</Label><Input name="pincode" value={formValues.pincode} onChange={updateField} required className="mt-2 h-12 rounded-xl bg-white" /></div>
                    <div><Label>Alt phone</Label><Input name="altPhone" value={formValues.altPhone} onChange={updateField} className="mt-2 h-12 rounded-xl bg-white" /></div>
                  </>
                )}

                {isVendor && step === 3 && (
                  <>
                    <div><Label>Organisation name</Label><Input name="organisationName" value={formValues.organisationName} onChange={updateField} className="mt-2 h-12 rounded-xl bg-white" /></div>
                    <div><Label>Organisation number</Label><Input name="organisationNumber" value={formValues.organisationNumber} onChange={updateField} className="mt-2 h-12 rounded-xl bg-white" /></div>
                    <div><Label>Organisation email</Label><Input name="organisationEmail" value={formValues.organisationEmail} onChange={updateField} type="email" className="mt-2 h-12 rounded-xl bg-white" /></div>
                    <div><Label>GSTIN</Label><Input name="gstin" value={formValues.gstin} onChange={updateField} className="mt-2 h-12 rounded-xl bg-white" /></div>
                    <CameraCapture label="Aadhaar front" name="aadhaarFront" required onCapture={(name, file) => setDocuments((current) => ({ ...current, [name]: file }))} />
                    <CameraCapture label="Aadhaar back" name="aadhaarBack" required onCapture={(name, file) => setDocuments((current) => ({ ...current, [name]: file }))} />
                    <CameraCapture label="Live selfie" name="liveSelfie" required onCapture={(name, file) => setDocuments((current) => ({ ...current, [name]: file }))} />
                    <CameraCapture label="PAN optional" name="pan" onCapture={(name, file) => setDocuments((current) => ({ ...current, [name]: file }))} />
                  </>
                )}

                {message && <p className="sm:col-span-2 rounded-lg bg-muted px-3 py-2 text-sm text-foreground">{message}</p>}

                <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row">
                  {isVendor && step > 1 && (
                    <Button type="button" variant="outline" className="h-12 flex-1 rounded-xl" onClick={() => setStep((current) => current - 1)}>
                      <ArrowLeft className="h-4 w-4" /> Back
                    </Button>
                  )}
                  <Button type={isVendor && step < 3 ? "button" : "submit"} onClick={isVendor && step < 3 ? goNext : undefined} className="h-12 flex-[2] rounded-xl bg-primary hover:bg-primary/90" disabled={isLoading}>
                    {isLoading ? "Submitting..." : isVendor && step < 3 ? <>Continue <ArrowRight className="ml-2 h-4 w-4" /></> : <>{isVendor ? "Submit for approval" : "Create account"} <ArrowRight className="ml-2 h-4 w-4" /></>}
                  </Button>
                </div>
              </form>

              <div className="mt-6 grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
                {featureList.map((feature) => (
                  <div key={feature} className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/30 text-accent-foreground"><Check className="h-3 w-3" /></span>
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
