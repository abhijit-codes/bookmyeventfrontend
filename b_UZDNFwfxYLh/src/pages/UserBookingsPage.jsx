import { useEffect, useState } from "react"
import { Button } from "@/components/ui/Button"
import { useCancelMyBookingMutation, useCreateRemainingOrderMutation, useGetMyBookingsQuery, useVerifyRemainingPaymentMutation } from "@/features/api/apiSlice"
import { useDashboardText } from "@/hooks/useDashboardText"
import { Calendar, CreditCard, Mail, MapPin, Phone, XCircle } from "lucide-react"

const money = (value) => `Rs.${Number(value || 0).toLocaleString("en-IN")}`
const cancellationReasonKeys = ["bookedByMistake", "eventDateChanged", "foundAnotherVendor", "budgetIssue", "noLongerRequired"]
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
const dueCountdown = (dueAt, now) => {
  if (!dueAt) return ""
  const diff = new Date(dueAt).getTime() - now
  if (diff <= 0) return "expired"
  const hours = Math.floor(diff / 3600000)
  const minutes = Math.floor((diff % 3600000) / 60000)
  const seconds = Math.floor((diff % 60000) / 1000)
  return `${hours}h ${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`
}

export default function UserBookingsPage() {
  const { data: bookings = [], isLoading, isError, refetch } = useGetMyBookingsQuery(undefined, { pollingInterval: 30000 })
  const [createRemainingOrder, remainingOrderState] = useCreateRemainingOrderMutation()
  const [verifyRemainingPayment, verifyRemainingState] = useVerifyRemainingPaymentMutation()
  const [cancelMyBooking, cancelState] = useCancelMyBookingMutation()
  const [now, setNow] = useState(Date.now())
  const [message, setMessage] = useState("")
  const [cancelOpenId, setCancelOpenId] = useState(null)
  const [cancelReasonById, setCancelReasonById] = useState({})
  const { labels } = useDashboardText("user")

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    if (bookings.some((booking) => booking.status === "vendor_confirmed" && booking.remaining_due_at && new Date(booking.remaining_due_at).getTime() <= now)) {
      refetch()
    }
  }, [bookings, now, refetch])

  const payRemaining = async (booking) => {
    setMessage("")
    try {
      const isLoaded = await loadRazorpay()
      if (!isLoaded) {
        setMessage("Unable to open Razorpay. Please check your connection and try again.")
        return
      }

      const orderResponse = await createRemainingOrder(booking.id).unwrap()
      const { razorpayKeyId, razorpayOrder } = orderResponse.data

      const checkout = new window.Razorpay({
        key: razorpayKeyId,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "BookMyEvent",
        description: `Remaining payment ${booking.booking_number}`,
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
          await verifyRemainingPayment({
            bookingId: booking.id,
            orderId: response.razorpay_order_id,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
          }).unwrap()
          setMessage("Remaining payment verified. Your order is confirmed.")
          refetch()
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

  const cancelBooking = async (booking) => {
    const reason = cancelReasonById[booking.id]
    if (!reason) {
      setMessage(labels("selectCancellationReason"))
      return
    }

    setMessage("")
    try {
      const response = await cancelMyBooking({ id: booking.id, reason }).unwrap()
      setMessage(response.message || "Booking cancelled. Refund has been initiated.")
      setCancelOpenId(null)
      refetch()
    } catch (err) {
      setMessage(err?.data?.message || "Unable to cancel booking.")
    }
  }

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-foreground">{labels("myOrders")}</h1><p className="text-muted-foreground">{labels("ordersDescription")}</p></div>
      {message && <p className="rounded-xl border border-border bg-card p-3 text-sm text-primary">{message}</p>}
      <div className="space-y-4">
        {isLoading && <p className="rounded-xl border border-border bg-card p-5 text-muted-foreground">{labels("loadingOrders")}</p>}
        {isError && <p className="rounded-xl border border-border bg-card p-5 text-red-600">{labels("unableLoadOrders")}</p>}
        {bookings.map((booking) => (
            <div key={booking.id} className="rounded-xl border border-border bg-card p-4 sm:p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <h2 className="font-semibold text-foreground">{booking.Vendor?.name}</h2>
                  <p className="text-sm text-muted-foreground">{booking.VendorService?.title}</p>
                  <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{booking.event_date}</span>
                    <span className="flex min-w-0 items-center gap-1"><MapPin className="h-4 w-4 shrink-0" /><span className="break-words">{booking.event_address}</span></span>
                  </div>
                  {["fully_paid", "completed"].includes(booking.status) && (
                    <div className="mt-3 rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
                      <p className="font-medium text-foreground">{labels("vendorContactShared")}</p>
                      <div className="mt-2 flex flex-wrap gap-4">
                        <span className="flex items-center gap-1"><Phone className="h-4 w-4" />{booking.Vendor?.phone || "N/A"}</span>
                        <span className="flex items-center gap-1"><Mail className="h-4 w-4" />{booking.Vendor?.email || "N/A"}</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="text-left sm:text-right">
                  <p className="font-semibold text-foreground">{money(booking.service_amount)}</p>
                  <span className="mt-1 inline-block rounded-full bg-muted px-2 py-1 text-xs font-medium text-foreground">{booking.status}</span>
                </div>
              </div>
              {booking.status === "vendor_confirmed" && (
                <div className="mt-4">
                  <div className="mb-3 rounded-lg bg-primary/10 p-3 text-sm text-foreground">
                    <p className="font-semibold">{labels("remainingDue")}: {money(booking.remaining_amount)}</p>
                    <p className="text-muted-foreground">{labels("vendorAcceptedPay48")} {labels("timeLeft")}: <span className="font-medium text-foreground">{dueCountdown(booking.remaining_due_at, now) === "expired" ? labels("expired") : dueCountdown(booking.remaining_due_at, now)}</span></p>
                  </div>
                  <Button
                    disabled={dueCountdown(booking.remaining_due_at, now) === "expired" || remainingOrderState.isLoading || verifyRemainingState.isLoading}
                    onClick={() => payRemaining(booking)}
                    className="w-full bg-primary hover:bg-primary/90 sm:w-auto"
                  >
                    <CreditCard className="mr-2 h-4 w-4" />{labels("payRemaining")} {money(booking.remaining_amount)} {labels("withRazorpay")}
                  </Button>
                </div>
              )}
              {booking.status === "advance_paid" && (
                <div className="mt-4 rounded-lg bg-muted/50 p-3">
                  <p className="text-sm text-muted-foreground">{labels("cancelBeforeAccept")}</p>
                  {cancelOpenId === booking.id ? (
                    <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                      <select
                        value={cancelReasonById[booking.id] || ""}
                        onChange={(event) => setCancelReasonById((current) => ({ ...current, [booking.id]: event.target.value }))}
                        className="h-10 flex-1 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="">{labels("selectCancellationReason")}</option>
                        {cancellationReasonKeys.map((reasonKey) => <option key={reasonKey} value={labels(reasonKey)}>{labels(reasonKey)}</option>)}
                      </select>
                      <Button variant="outline" onClick={() => setCancelOpenId(null)} className="w-full sm:w-auto">{labels("close")}</Button>
                      <Button disabled={cancelState.isLoading} onClick={() => cancelBooking(booking)} className="w-full bg-primary hover:bg-primary/90 sm:w-auto">
                        {cancelState.isLoading ? labels("cancelling") : labels("confirmCancel")}
                      </Button>
                    </div>
                  ) : (
                    <Button variant="outline" onClick={() => setCancelOpenId(booking.id)} className="mt-3 w-full sm:w-auto">
                      <XCircle className="mr-2 h-4 w-4" />{labels("cancelBookingRefund")}
                    </Button>
                  )}
                </div>
              )}
            </div>
        ))}
        {!isLoading && bookings.length === 0 && <p className="rounded-xl border border-border bg-card p-5 text-muted-foreground">{labels("noOrders")}</p>}
      </div>
    </div>
  )
}
