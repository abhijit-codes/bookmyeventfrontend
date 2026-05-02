import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { useCreateAdvanceOrderMutation, useGetVendorQuery, useVerifyAdvancePaymentMutation } from "@/features/api/apiSlice"
import { BadgeCheck, ChevronLeft, CreditCard, Shield, Star } from "lucide-react"

const API_ORIGIN = (import.meta.env.VITE_API_URL ?? "http://localhost:5000/api/v1").replace("/api/v1", "")
const resolveUrl = (url) => {
  if (!url) return ""
  return url.startsWith("http") ? url : `${API_ORIGIN}${url}`
}
const calculateAdvanceAmount = (amount) => Math.min(Number(amount), Math.max(Math.round(Number(amount) * 0.1) - 1, 1))
const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true)
      return
    }

    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })

export default function BookingPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: vendor, isLoading } = useGetVendorQuery(id)
  const [selectedService, setSelectedService] = useState(null)
  const [form, setForm] = useState({ eventDate: "", eventTime: "", eventAddress: "", eventCity: "", eventState: "", eventPincode: "", notes: "" })
  const [message, setMessage] = useState("")
  const [createAdvanceOrder, advanceOrderState] = useCreateAdvanceOrderMutation()
  const [verifyAdvancePayment, verifyAdvanceState] = useVerifyAdvancePaymentMutation()
  const services = vendor?.VendorServices ?? []
  const avatar = resolveUrl(vendor?.profile_image_url)

  useEffect(() => {
    if (!selectedService && services.length) setSelectedService(services[0])
  }, [services, selectedService])

  const pricing = selectedService?.pricing || {}
  const packageAmount = Number(pricing.customerSubtotal || selectedService?.price || 0)
  const customerServiceCharge = Number(pricing.customerServiceCharge || 0)
  const serviceAmount = Number(pricing.customerPayableAmount || packageAmount + customerServiceCharge)
  const advanceAmount = serviceAmount ? calculateAdvanceAmount(serviceAmount) : 0
  const remainingAmount = Math.max(serviceAmount - advanceAmount, 0)

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }))

  const handlePayAdvance = async () => {
    setMessage("")
    if (!selectedService || !form.eventDate || !form.eventAddress) {
      setMessage("Please select a service, date, and event location.")
      return
    }

    try {
      const isLoaded = await loadRazorpay()
      if (!isLoaded) {
        setMessage("Unable to open Razorpay. Please check your connection and try again.")
        return
      }

      const orderResponse = await createAdvanceOrder({ vendorServiceId: selectedService.id, ...form }).unwrap()
      const { razorpayKeyId, razorpayOrder } = orderResponse.data

      const checkout = new window.Razorpay({
        key: razorpayKeyId,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "BookMyEvent",
        description: `${selectedService.title} advance payment`,
        order_id: razorpayOrder.id,
        method: {
          upi: true,
          card: true,
          netbanking: true,
          wallet: true,
        },
        display: {
          sequence: ["upi", "card", "netbanking", "wallet", "paylater"],
          preferences: {
            show_default_blocks: true,
          },
        },
        handler: async (response) => {
          const booking = await verifyAdvancePayment({
            serviceId: selectedService.id,
            orderId: response.razorpay_order_id,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
            ...form,
          }).unwrap()
          navigate(`/booking/success/${booking.data.id}`)
        },
        modal: {
          ondismiss: () => setMessage("Payment was cancelled before completion."),
        },
        theme: {
          color: "#03045E",
        },
      })

      checkout.open()
    } catch (err) {
      setMessage(err?.data?.message || err?.message || "Unable to start Razorpay payment.")
    }
  }

  return (
    <div className="public-white-page flex min-h-screen flex-col bg-white">
      <Header />
      <main className="flex-1 bg-white">
        <div className="border-b border-border bg-white">
          <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6 lg:px-8">
            <Link to={`/vendors/${id}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"><ChevronLeft className="h-4 w-4" />Back to Vendor</Link>
          </div>
        </div>

        <div className="mx-auto max-w-5xl bg-white px-3 py-5 sm:px-6 sm:py-8 lg:px-8">
          {isLoading || !vendor ? (
            <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">Loading booking details...</div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <div className="rounded-2xl border border-border bg-card p-4 sm:p-6">
                  <h2 className="text-xl font-semibold text-foreground">Book vendor with 10% - Rs.1 advance</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Pay securely through Razorpay. You can choose UPI inside the Razorpay gateway. Vendor must accept or cancel within 24 hours. If accepted, pay the remaining amount within 48 hours.</p>

                  <div className="mt-6 space-y-3">
                    {services.map((service) => (
                      <button key={service.id} type="button" onClick={() => setSelectedService(service)} className={`flex w-full flex-col gap-2 rounded-xl border-2 p-4 text-left transition-all sm:flex-row sm:items-center sm:justify-between ${selectedService?.id === service.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
                        <div className="min-w-0"><h3 className="font-medium text-foreground">{service.title}</h3><p className="break-words text-sm text-muted-foreground">{service.description || service.city}</p></div>
                        <p className="shrink-0 font-semibold text-foreground">Rs.{Number(service.pricing?.customerSubtotal || service.price).toLocaleString("en-IN")}</p>
                      </button>
                    ))}
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div><Label>Event Date</Label><Input type="date" value={form.eventDate} onChange={(e) => update("eventDate", e.target.value)} className="mt-2" /></div>
                    <div><Label>Preferred Time</Label><Input type="time" value={form.eventTime} onChange={(e) => update("eventTime", e.target.value)} className="mt-2" /></div>
                    <div className="sm:col-span-2"><Label>Event Location</Label><Input value={form.eventAddress} onChange={(e) => update("eventAddress", e.target.value)} placeholder="Full event address" className="mt-2" /></div>
                    <div><Label>City</Label><Input value={form.eventCity} onChange={(e) => update("eventCity", e.target.value)} className="mt-2" /></div>
                    <div><Label>State</Label><Input value={form.eventState} onChange={(e) => update("eventState", e.target.value)} className="mt-2" /></div>
                    <div><Label>Pincode</Label><Input value={form.eventPincode} onChange={(e) => update("eventPincode", e.target.value)} className="mt-2" /></div>
                    <div className="sm:col-span-2"><Label>Special Requests</Label><textarea value={form.notes} onChange={(e) => update("notes", e.target.value)} rows={3} className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary" /></div>
                  </div>

                  {message && <p className="mt-4 rounded-lg bg-muted px-3 py-2 text-sm text-foreground">{message}</p>}
                  <Button onClick={handlePayAdvance} className="mt-6 w-full bg-primary hover:bg-primary/90" disabled={advanceOrderState.isLoading || verifyAdvanceState.isLoading}>
                    <CreditCard className="mr-2 h-4 w-4" /> Pay Rs.{advanceAmount.toLocaleString("en-IN")} Advance with Razorpay
                  </Button>
                </div>
              </div>

              <div className="lg:col-span-1">
                <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 lg:sticky lg:top-24">
                  <h3 className="font-semibold text-foreground">Booking Summary</h3>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="h-12 w-12 overflow-hidden rounded-xl bg-primary/10">
                      {avatar ? <img src={avatar} alt={vendor.name} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-lg font-bold text-primary">{vendor.name.charAt(0)}</div>}
                    </div>
                    <div className="min-w-0"><div className="flex items-center gap-1"><p className="truncate font-medium text-foreground">{vendor.name}</p><BadgeCheck className="h-4 w-4 shrink-0 text-primary" /></div><div className="flex items-center gap-1 text-sm text-muted-foreground"><Star className="h-3 w-3 fill-accent text-accent" /><span>Verified</span></div></div>
                  </div>
                  <div className="my-4 h-px bg-border" />
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Service</span><span className="font-medium text-foreground">{selectedService?.title || "-"}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Package price</span><span>Rs.{packageAmount.toLocaleString("en-IN")}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Service charge</span><span>Rs.{customerServiceCharge.toLocaleString("en-IN")}</span></div>
                    <div className="flex justify-between border-t border-border pt-3 font-semibold"><span>Total amount</span><span>Rs.{serviceAmount.toLocaleString("en-IN")}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Advance now</span><span>Rs.{advanceAmount.toLocaleString("en-IN")}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Remaining after confirm</span><span>Rs.{remainingAmount.toLocaleString("en-IN")}</span></div>
                  </div>
                  <div className="mt-4 rounded-lg bg-muted/50 p-3"><div className="flex items-start gap-2"><Shield className="mt-0.5 h-4 w-4 text-primary" /><p className="text-xs text-muted-foreground">If vendor cancels, advance refund should be processed within 24 hours. If vendor accepts, remaining payment is due within 48 hours.</p></div></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
