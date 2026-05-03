import { useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { useAddVendorServiceMutation, useCancelBookingMutation, useConfirmBookingMutation, useDeleteVendorServiceMutation, useGetVendorDashboardQuery } from "@/features/api/apiSlice"
import { BankDetailsCard } from "@/pages/VendorDashboardExtraPages"
import { Calendar, CheckCircle, CreditCard, DollarSign, Plus, Star, TrendingUp, User, Wallet, XCircle } from "lucide-react"

const categories = [
  { id: 1, name: "Photography" },
  { id: 2, name: "Catering" },
  { id: 3, name: "Decoration" },
  { id: 4, name: "Entertainment" },
  { id: 5, name: "DJs" },
  { id: 6, name: "Venues" },
  { id: 7, name: "Florists" },
]

const money = (value) => `Rs.${Number(value || 0).toLocaleString("en-IN")}`

export default function VendorDashboardPage() {
  const { data: vendor, isLoading, isError } = useGetVendorDashboardQuery(undefined, { pollingInterval: 30000 })
  const [showServiceForm, setShowServiceForm] = useState(false)
  const [showBankDetailsForm, setShowBankDetailsForm] = useState(false)
  const [message, setMessage] = useState("")
  const [addVendorService, addState] = useAddVendorServiceMutation()
  const [deleteVendorService, deleteServiceState] = useDeleteVendorServiceMutation()
  const [confirmBooking] = useConfirmBookingMutation()
  const [cancelBooking] = useCancelBookingMutation()

  const services = vendor?.VendorServices ?? []
  const bookings = vendor?.Bookings ?? []
  const bankAccounts = vendor?.BankAccounts ?? []
  const wallet = vendor?.Wallet
  const pendingBookings = bookings.filter((booking) => booking.status === "advance_paid")
  const upcomingBookings = bookings.filter((booking) => ["vendor_confirmed", "fully_paid"].includes(booking.status))

  const handleAddService = async (event) => {
    event.preventDefault()
    setMessage("")
    const form = new FormData(event.currentTarget)
    try {
      await addVendorService({
        categoryId: form.get("categoryId"),
        title: form.get("title"),
        description: form.get("description"),
        price: form.get("price"),
        city: form.get("city"),
        images: Array.from(form.getAll("images")).filter((file) => file?.size),
      }).unwrap()
      setShowServiceForm(false)
      event.currentTarget.reset()
    } catch (err) {
      setMessage(err?.data?.message || "Unable to add service.")
    }
  }

  const handleDeleteService = async (service) => {
    setMessage("")
    const confirmed = window.confirm(`Delete ${service.title}? If it has active bookings, it will be hidden instead.`)
    if (!confirmed) return

    try {
      const response = await deleteVendorService(service.id).unwrap()
      setMessage(response.message || "Service deleted successfully.")
    } catch (err) {
      setMessage(err?.data?.message || "Unable to delete service.")
    }
  }

  if (isLoading) return <div className="rounded-xl border border-border bg-card p-6 text-muted-foreground">Loading vendor dashboard...</div>
  if (isError) return <div className="rounded-xl border border-border bg-card p-6 text-red-600">Unable to load vendor dashboard. Please login again.</div>

  const stats = [
    { label: "Available Balance", value: money(wallet?.available_balance), icon: DollarSign, color: "bg-green-100 text-green-600" },
    { label: "Pending Balance", value: money(wallet?.pending_balance), icon: TrendingUp, color: "bg-primary/10 text-primary" },
    { label: "Services", value: services.length, icon: Star, color: "bg-accent/20 text-accent" },
    { label: "Bookings", value: bookings.length, icon: Calendar, color: "bg-blue-100 text-blue-600" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Welcome, {vendor?.business_name || vendor?.name}</h1>
          <p className="text-muted-foreground">Manage services, booking requests, profile, and wallet from live backend data.</p>
        </div>
        <Button onClick={() => setShowServiceForm(!showServiceForm)} className="bg-primary hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" /> Add New Service
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Link to="/vendor/dashboard/profile"><Button variant="outline" className="w-full justify-start"><User className="mr-2 h-4 w-4" />Profile</Button></Link>
        <Link to="/vendor/dashboard/wallet"><Button variant="outline" className="w-full justify-start"><Wallet className="mr-2 h-4 w-4" />Wallet</Button></Link>
        <Button type="button" variant="outline" className="w-full justify-start" onClick={() => setShowBankDetailsForm((current) => !current)}>
          <CreditCard className="mr-2 h-4 w-4" />Bank Details
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-muted-foreground">{stat.label}</p><p className="mt-1 text-2xl font-bold text-foreground">{stat.value}</p></div>
              <div className={`rounded-xl p-3 ${stat.color}`}><stat.icon className="h-6 w-6" /></div>
            </div>
          </div>
        ))}
      </div>

      {showServiceForm && (
        <form onSubmit={handleAddService} className="grid gap-4 rounded-xl border border-border bg-card p-5 sm:grid-cols-2">
          <div>
            <Label>Category</Label>
            <select name="categoryId" required className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none">
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
          </div>
          <div><Label>Service title</Label><Input name="title" required className="mt-2" /></div>
          <div><Label>Price</Label><Input name="price" type="number" required className="mt-2" /></div>
          <div><Label>City</Label><Input name="city" required className="mt-2" defaultValue={vendor?.city || ""} /></div>
          <div className="sm:col-span-2"><Label>Description</Label><Input name="description" className="mt-2" /></div>
          <div className="sm:col-span-2"><Label>Images</Label><Input name="images" type="file" accept="image/*" multiple className="mt-2" /></div>
          {message && <p className="sm:col-span-2 text-sm text-red-600">{message}</p>}
          <Button disabled={addState.isLoading} className="sm:col-span-2 bg-primary hover:bg-primary/90">{addState.isLoading ? "Saving..." : "Save Service"}</Button>
        </form>
      )}

      {showBankDetailsForm && <BankDetailsCard bankAccounts={bankAccounts} />}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border p-5">
            <h2 className="font-semibold text-foreground">Pending Requests</h2>
            <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-foreground">{pendingBookings.length} new</span>
          </div>
          <div className="divide-y divide-border">
            {pendingBookings.map((booking) => (
              <div key={booking.id} className="p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">{booking.User?.name}</p>
                    <p className="text-sm text-muted-foreground">{booking.VendorService?.title}</p>
                    <p className="break-words text-xs text-muted-foreground">{booking.event_date} - {booking.event_address}</p>
                  </div>
                  <p className="font-semibold text-foreground">{money(booking.service_amount)}</p>
                </div>
                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <Button size="sm" onClick={() => confirmBooking(booking.id)} className="w-full bg-primary hover:bg-primary/90 sm:w-auto"><CheckCircle className="mr-1 h-3 w-3" />Accept</Button>
                  <Button size="sm" variant="outline" onClick={() => cancelBooking(booking.id)} className="w-full sm:w-auto"><XCircle className="mr-1 h-3 w-3" />Decline</Button>
                </div>
              </div>
            ))}
            {pendingBookings.length === 0 && <p className="p-5 text-sm text-muted-foreground">No pending booking requests.</p>}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card">
          <div className="border-b border-border p-5"><h2 className="font-semibold text-foreground">Your Services</h2></div>
          <div className="divide-y divide-border">
            {services.map((service) => (
              <div key={service.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0"><p className="break-words font-medium text-foreground">{service.title}</p><p className="text-sm text-muted-foreground">{service.city}</p></div>
                <div className="flex flex-col gap-2 text-left sm:items-end sm:text-right">
                  <div><p className="font-semibold text-foreground">{money(service.price)}</p><p className="text-xs text-muted-foreground">{service.is_active ? "Active" : "Hidden"}</p></div>
                  <div className="grid w-full gap-2 sm:w-auto sm:grid-cols-2">
                    <Link to="/vendor/dashboard/services"><Button type="button" variant="outline" size="sm" className="w-full">Update</Button></Link>
                    <Button type="button" variant="outline" size="sm" disabled={deleteServiceState.isLoading} onClick={() => handleDeleteService(service)} className="w-full text-red-600 hover:bg-red-50">Delete</Button>
                  </div>
                </div>
              </div>
            ))}
            {services.length === 0 && <p className="p-5 text-sm text-muted-foreground">No services yet. Add your first service to appear in vendor listing.</p>}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border p-5"><h2 className="font-semibold text-foreground">Upcoming Bookings</h2></div>
        <div className="divide-y divide-border">
          {upcomingBookings.map((booking) => (
            <div key={booking.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0"><p className="font-medium text-foreground">{booking.User?.name}</p><p className="break-words text-sm text-muted-foreground">{booking.VendorService?.title}</p></div>
              <div className="text-left text-sm sm:text-right"><p className="font-medium text-foreground">{booking.event_date}</p><p className="text-muted-foreground">{booking.status}</p></div>
            </div>
          ))}
          {upcomingBookings.length === 0 && <p className="p-5 text-sm text-muted-foreground">No upcoming bookings.</p>}
        </div>
      </div>
    </div>
  )
}
