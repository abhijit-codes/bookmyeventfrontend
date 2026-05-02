import { Button } from "@/components/ui/Button"
import { useCancelBookingMutation, useCompleteBookingMutation, useConfirmBookingMutation, useGetVendorBookingsQuery } from "@/features/api/apiSlice"
import { Calendar, CheckCircle, MapPin, Phone, XCircle } from "lucide-react"

export default function VendorBookingsPage() {
  const { data: bookings = [], isLoading, isError } = useGetVendorBookingsQuery()
  const [confirmBooking] = useConfirmBookingMutation()
  const [cancelBooking] = useCancelBookingMutation()
  const [completeBooking] = useCompleteBookingMutation()

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-foreground">Vendor Bookings</h1><p className="text-muted-foreground">Accept requests and track confirmed orders from backend data.</p></div>
      <div className="space-y-4">
        {isLoading && <p className="rounded-xl border border-border bg-card p-5 text-muted-foreground">Loading bookings...</p>}
        {isError && <p className="rounded-xl border border-border bg-card p-5 text-red-600">Unable to load bookings.</p>}
        {bookings.map((booking) => (
          <div key={booking.id} className="rounded-xl border border-border bg-card p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="font-semibold text-foreground">{booking.User?.name}</h2>
                <p className="text-sm text-muted-foreground">{booking.VendorService?.title}</p>
                <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{booking.event_date}</span>
                  <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{booking.event_address}</span>
                  <span className="flex items-center gap-1"><Phone className="h-4 w-4" />{booking.User?.phone || "N/A"}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-foreground">Rs.{Number(booking.service_amount).toLocaleString("en-IN")}</p>
                <span className="mt-1 inline-block rounded-full bg-muted px-2 py-1 text-xs font-medium text-foreground">{booking.status}</span>
              </div>
            </div>
            {booking.status === "advance_paid" && (
              <div className="mt-4 flex flex-wrap gap-3">
                <Button onClick={() => confirmBooking(booking.id)} className="bg-primary hover:bg-primary/90"><CheckCircle className="mr-2 h-4 w-4" />Accept Booking</Button>
                <Button variant="outline" onClick={() => cancelBooking(booking.id)}><XCircle className="mr-2 h-4 w-4" />Cancel & Refund</Button>
              </div>
            )}
            {booking.status === "fully_paid" && (
              <div className="mt-4 flex flex-wrap gap-3">
                <Button onClick={() => completeBooking(booking.id)} className="bg-primary hover:bg-primary/90"><CheckCircle className="mr-2 h-4 w-4" />Mark Completed</Button>
              </div>
            )}
          </div>
        ))}
        {!isLoading && bookings.length === 0 && <p className="rounded-xl border border-border bg-card p-5 text-muted-foreground">No bookings yet.</p>}
      </div>
    </div>
  )
}
