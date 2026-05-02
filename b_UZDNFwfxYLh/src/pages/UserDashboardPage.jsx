import { useSelector } from "react-redux"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/Button"
import { useGetMyBookingsQuery, useGetMyFavoritesQuery, useGetVendorsQuery } from "@/features/api/apiSlice"
import { useDashboardText } from "@/hooks/useDashboardText"
import { ArrowRight, BadgeCheck, Calendar, Clock, Heart, MapPin, Star, User } from "lucide-react"

export default function UserDashboardPage() {
  const account = useSelector((state) => state.auth.account)
  const { data: bookings = [], isLoading: bookingsLoading } = useGetMyBookingsQuery()
  const { data: vendors = [] } = useGetVendorsQuery()
  const { data: favorites = [] } = useGetMyFavoritesQuery()
  const { labels } = useDashboardText("user")
  const activeStatuses = ["advance_paid", "vendor_confirmed", "remaining_due", "fully_paid"]
  const upcoming = bookings.filter((booking) => activeStatuses.includes(booking.status))

  const stats = [
    { label: labels("totalBookings"), value: bookings.length, icon: Calendar, color: "bg-primary/10 text-primary" },
    { label: labels("activeOrders"), value: upcoming.length, icon: Clock, color: "bg-accent/20 text-gold-deep" },
    { label: labels("favorites"), value: favorites.length, icon: Heart, color: "bg-primary text-primary-foreground" },
    { label: labels("reviewsGiven"), value: 0, icon: Star, color: "bg-secondary text-primary" },
  ]

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm shadow-primary/5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/20"><User className="h-7 w-7" /></div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{labels("hi")}, {account?.name || labels("customer")}</h1>
              <p className="text-muted-foreground">{account?.email}</p>
            </div>
          </div>
          <Link to="/vendors" className="w-full sm:w-auto"><Button className="w-full bg-primary shadow-md shadow-primary/20 hover:bg-primary/90 sm:w-auto">{labels("browseVendors")} <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border bg-card p-5 shadow-sm shadow-primary/5">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-muted-foreground">{stat.label}</p><p className="mt-1 text-3xl font-bold text-foreground">{stat.value}</p></div>
              <div className={`rounded-xl p-3 ${stat.color}`}><stat.icon className="h-6 w-6" /></div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-border bg-card shadow-sm shadow-primary/5">
            <div className="flex items-center justify-between border-b border-border p-5">
              <h2 className="font-semibold text-foreground">{labels("yourOrders")}</h2>
              <Link to="/dashboard/bookings" className="text-sm text-primary hover:underline">{labels("viewAll")}</Link>
            </div>
            <div className="divide-y divide-border">
              {bookingsLoading ? <p className="p-5 text-sm text-muted-foreground">{labels("loadingOrders")}</p> : upcoming.slice(0, 4).map((booking) => (
                <div key={booking.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10"><span className="text-lg font-bold text-primary">{booking.Vendor?.name?.charAt(0)}</span></div>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground">{booking.Vendor?.name}</p>
                      <p className="text-sm text-muted-foreground">{booking.VendorService?.title}</p>
                      <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground"><span>{booking.event_date}</span><span>{booking.event_time}</span></div>
                    </div>
                  </div>
                  <div className="text-right"><p className="font-semibold text-foreground">Rs.{Number(booking.service_amount).toLocaleString("en-IN")}</p><span className="mt-1 inline-block rounded-full bg-red-soft px-2 py-0.5 text-xs font-medium text-primary">{booking.status}</span></div>
                </div>
              ))}
              {!bookingsLoading && upcoming.length === 0 && <p className="p-5 text-sm text-muted-foreground">{labels("noOrdersDashboard")}</p>}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="rounded-xl border border-border bg-card shadow-sm shadow-primary/5">
            <div className="border-b border-border p-5"><h2 className="font-semibold text-foreground">{labels("recommendedVendors")}</h2></div>
            <div className="divide-y divide-border">
              {vendors.slice(0, 4).map((vendor) => (
                <Link key={vendor.id} to={`/vendors/${vendor.id}`} className="block p-4 transition-colors hover:bg-muted/50">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"><span className="text-sm font-bold text-primary">{vendor.name.charAt(0)}</span></div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1"><p className="text-sm font-medium text-foreground">{vendor.name}</p><BadgeCheck className="h-3 w-3 text-primary" /></div>
                      <p className="text-xs text-muted-foreground">{vendor.VendorServices?.[0]?.Category?.name || labels("vendor")}</p>
                      <span className="mt-1 flex items-center gap-0.5 text-xs text-muted-foreground"><MapPin className="h-3 w-3" />{[vendor.city, vendor.state].filter(Boolean).join(", ")}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
