import { Link, useParams } from "react-router-dom"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { Button } from "@/components/ui/Button"
import { CheckCircle, Clock } from "lucide-react"

export default function BookingSuccessPage() {
  const { id } = useParams()

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-muted/30">
        <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-16 text-center sm:px-6 lg:px-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle className="h-9 w-9 text-primary" />
          </div>
          <h1 className="mt-6 text-3xl font-bold text-foreground">Booking request sent</h1>
          <p className="mt-3 text-muted-foreground">Your advance payment has been recorded and the vendor has received your booking request.</p>
          <div className="mt-6 w-full rounded-xl border border-border bg-card p-5 text-left">
            <p className="font-medium text-foreground">Order #{id}</p>
            <div className="mt-3 flex items-start gap-3 text-sm text-muted-foreground">
              <Clock className="mt-0.5 h-4 w-4" />
              <p>The vendor must accept or cancel within 24 hours. If the vendor cancels, the advance refund should be processed within 24 hours. If accepted, you must pay the remaining amount within 48 hours.</p>
            </div>
          </div>
          <Link to="/dashboard/bookings" className="mt-6 w-full sm:w-auto">
            <Button className="w-full bg-primary hover:bg-primary/90">View My Orders</Button>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  )
}
