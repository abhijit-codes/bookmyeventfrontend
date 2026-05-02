import { useMemo, useState } from "react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { CameraCapture } from "@/components/CameraCapture"
import { DashboardSettingsPanel } from "@/components/dashboard/DashboardSettingsPanel"
import {
  useAddBankAccountMutation,
  useAddVendorServiceMutation,
  useGetVendorDashboardQuery,
  useGetMyNotificationsQuery,
  useGetWalletQuery,
  useRequestWithdrawalMutation,
  useSendVendorSupportMessageMutation,
  useUpdateVendorProfileMutation,
  useUpdateVendorProfileImageMutation,
} from "@/features/api/apiSlice"
import { BarChart3, Bell, Briefcase, Camera, CreditCard, DollarSign, Save, Send, Star, TrendingUp, User, X } from "lucide-react"

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
const monthKey = (date) => new Date(date).toISOString().slice(0, 7)
const statusLabel = (status) => String(status || "unknown").replace(/_/g, " ")
const API_ORIGIN = (import.meta.env.VITE_API_URL )
const resolveUrl = (url) => {
  if (!url) return ""
  return url.startsWith("http") ? url : `${API_ORIGIN}${url}`
}

function Card({ children, className = "" }) {
  return <div className={`rounded-xl border border-border bg-card p-5 ${className}`}>{children}</div>
}

function EmptyState({ children }) {
  return <p className="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">{children}</p>
}

function useVendorDashboard() {
  return useGetVendorDashboardQuery(undefined, { pollingInterval: 30000 })
}

function getEarningSummary(bookings = []) {
  const now = new Date()
  const thisMonth = monthKey(now)
  const previous = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const previousMonth = monthKey(previous)
  const completed = bookings.filter((booking) => ["fully_paid", "completed"].includes(booking.status))

  return completed.reduce(
    (summary, booking) => {
      const earning = Number(booking.vendor_earning || 0)
      const key = monthKey(booking.createdAt || booking.created_at || booking.event_date)
      summary.total += earning
      summary.orders += 1
      if (key === thisMonth) {
        summary.thisMonth += earning
        summary.thisMonthOrders += 1
      }
      if (key === previousMonth) {
        summary.previousMonth += earning
        summary.previousMonthOrders += 1
      }
      return summary
    },
    { total: 0, orders: 0, thisMonth: 0, previousMonth: 0, thisMonthOrders: 0, previousMonthOrders: 0 },
  )
}

function getBookingStatusData(bookings = []) {
  const colors = ["#03045E", "#ED0101", "#FFD500", "#34358a", "#ff8080", "#fff3a8"]
  const counts = bookings.reduce((items, booking) => {
    const label = statusLabel(booking.status)
    items[label] = (items[label] || 0) + 1
    return items
  }, {})

  return Object.entries(counts).map(([label, value], index) => ({
    label,
    value,
    color: colors[index % colors.length],
  }))
}

function getMonthlyBookingData(bookings = []) {
  const formatter = new Intl.DateTimeFormat("en-IN", { month: "short" })
  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date()
    date.setMonth(date.getMonth() - (5 - index), 1)
    const key = monthKey(date)
    return { key, label: formatter.format(date), orders: 0, revenue: 0 }
  })
  const monthMap = Object.fromEntries(months.map((item) => [item.key, item]))

  bookings.forEach((booking) => {
    const key = monthKey(booking.createdAt || booking.created_at || booking.event_date)
    if (!monthMap[key]) return
    monthMap[key].orders += 1
    monthMap[key].revenue += Number(booking.vendor_earning || booking.service_amount || 0)
  })

  return months
}

function PieChart({ data }) {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  let current = 0
  const gradient = total
    ? data.map((item) => {
      const start = current
      current += (item.value / total) * 100
      return `${item.color} ${start}% ${current}%`
    }).join(", ")
    : "#fff3a8 0% 100%"

  return (
    <div className="flex flex-col gap-5 md:flex-row md:items-center">
      <div className="mx-auto h-48 w-48 rounded-full border border-border shadow-inner" style={{ background: `conic-gradient(${gradient})` }} />
      <div className="grid flex-1 gap-3">
        {(data.length ? data : [{ label: "No bookings yet", value: 0, color: "#FFD500" }]).map((item) => (
          <div key={item.label} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex min-w-0 items-center gap-2 capitalize text-muted-foreground"><span className="h-3 w-3 shrink-0 rounded-sm" style={{ backgroundColor: item.color }} />{item.label}</span>
            <span className="font-semibold text-foreground">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function BarChart({ data }) {
  const maxOrders = Math.max(...data.map((item) => item.orders), 1)
  const maxRevenue = Math.max(...data.map((item) => item.revenue), 1)

  return (
    <div className="mt-5 grid h-64 grid-cols-6 items-end gap-3">
      {data.map((item) => (
        <div key={item.key} className="flex h-full min-w-0 flex-col justify-end gap-2">
          <div className="flex flex-1 items-end justify-center gap-1 rounded-lg bg-muted/40 px-2 pb-2">
            <div className="w-4 rounded-t bg-primary" style={{ height: `${Math.max((item.orders / maxOrders) * 100, item.orders ? 8 : 0)}%` }} title={`${item.orders} orders`} />
            <div className="w-4 rounded-t bg-accent" style={{ height: `${Math.max((item.revenue / maxRevenue) * 100, item.revenue ? 8 : 0)}%` }} title={money(item.revenue)} />
          </div>
          <div className="text-center">
            <p className="text-xs font-medium text-foreground">{item.label}</p>
            <p className="text-[11px] text-muted-foreground">{item.orders} orders</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export function VendorServicesPage() {
  const { data: vendor, isLoading } = useVendorDashboard()
  const [message, setMessage] = useState("")
  const [addVendorService, addState] = useAddVendorServiceMutation()
  const services = vendor?.VendorServices ?? []

  const handleSubmit = async (event) => {
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
      event.currentTarget.reset()
      setMessage("Service saved successfully.")
    } catch (err) {
      setMessage(err?.data?.message || "Unable to save service.")
    }
  }

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-foreground">Services</h1><p className="text-muted-foreground">Add services and keep your listing active.</p></div>
      <form onSubmit={handleSubmit} className="grid gap-4 rounded-xl border border-border bg-card p-5 sm:grid-cols-2">
        <div>
          <Label>Category</Label>
          <select name="categoryId" required className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none">
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
        </div>
        <div><Label>Service title</Label><Input name="title" required className="mt-2" placeholder="Premium wedding photography" /></div>
        <div><Label>Price</Label><Input name="price" type="number" required className="mt-2" placeholder="25000" /></div>
        <div><Label>City</Label><Input name="city" required className="mt-2" defaultValue={vendor?.city || ""} /></div>
        <div className="sm:col-span-2"><Label>Description</Label><Input name="description" className="mt-2" placeholder="Package details, team size, coverage hours..." /></div>
        <div className="sm:col-span-2"><Label>Photos</Label><Input name="images" type="file" accept="image/*" multiple className="mt-2" /></div>
        {message && <p className="sm:col-span-2 text-sm text-primary">{message}</p>}
        <Button disabled={addState.isLoading} className="sm:col-span-2 bg-primary hover:bg-primary/90"><Briefcase className="mr-2 h-4 w-4" />{addState.isLoading ? "Saving..." : "Save Service"}</Button>
      </form>

      <div className="grid gap-4 md:grid-cols-2">
        {isLoading && <EmptyState>Loading services...</EmptyState>}
        {services.map((service) => (
          <Card key={service.id}>
            <div className="flex items-start justify-between gap-4">
              <div><h2 className="font-semibold text-foreground">{service.title}</h2><p className="text-sm text-muted-foreground">{service.Category?.name || "Service"} in {service.city}</p></div>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">{money(service.price)}</span>
            </div>
            <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{service.description || "No description added."}</p>
          </Card>
        ))}
        {!isLoading && services.length === 0 && <EmptyState>No services yet. Add your first service above.</EmptyState>}
      </div>
    </div>
  )
}

export function VendorProfilePage() {
  const { data: vendor, isLoading } = useVendorDashboard()
  const [message, setMessage] = useState("")
  const [cameraOpen, setCameraOpen] = useState(false)
  const [cameraSession, setCameraSession] = useState(0)
  const [capturedProfileImage, setCapturedProfileImage] = useState(null)
  const [updateProfile, updateState] = useUpdateVendorProfileMutation()
  const [updateProfileImage, imageState] = useUpdateVendorProfileImageMutation()
  const avatar = resolveUrl(vendor?.profile_image_url)

  const handleProfileImageCapture = async (_name, file) => {
    setCapturedProfileImage(file)
    setMessage("")
  }

  const handleSaveProfileImage = async () => {
    if (!capturedProfileImage) {
      setMessage("Please capture a selfie first.")
      return
    }

    setMessage("")
    try {
      await updateProfileImage({ profileImage: capturedProfileImage }).unwrap()
      setCapturedProfileImage(null)
      setCameraOpen(false)
      setMessage("Profile photo updated successfully.")
    } catch (err) {
      setMessage(err?.data?.message || "Unable to update profile photo.")
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setMessage("")
    const form = new FormData(event.currentTarget)
    try {
      await updateProfile(Object.fromEntries(form.entries())).unwrap()
      setMessage("Profile saved successfully.")
    } catch (err) {
      setMessage(err?.data?.message || "Unable to save profile.")
    }
  }

  if (isLoading) return <EmptyState>Loading profile...</EmptyState>

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button type="button" onClick={() => { setCapturedProfileImage(null); setCameraSession((current) => current + 1); setCameraOpen(true) }} className="group relative h-20 w-20 overflow-hidden rounded-full border border-border bg-primary/10">
          {avatar ? <img src={avatar} alt={vendor?.name || "Vendor"} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-primary">{(vendor?.name || "V").charAt(0)}</div>}
          <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-white opacity-0 transition-opacity group-hover:opacity-100"><Camera className="h-6 w-6" /></span>
        </button>
        <div><h1 className="text-2xl font-bold text-foreground">Profile</h1><p className="text-muted-foreground">Click your DP to capture a new live selfie.</p></div>
      </div>
      {cameraOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-xl rounded-xl border border-border bg-card p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div><h2 className="font-semibold text-foreground">Update DP</h2><p className="text-sm text-muted-foreground">Capture a live selfie. It will be saved as your profile photo.</p></div>
              <Button type="button" variant="ghost" size="icon" onClick={() => { setCapturedProfileImage(null); setCameraOpen(false) }}><X className="h-5 w-5" /></Button>
            </div>
            <CameraCapture key={cameraSession} label="Live selfie" name="profileImage" onCapture={handleProfileImageCapture} facingMode="user" />
            <div className="mt-4 flex gap-3">
              <Button type="button" variant="outline" className="flex-1" onClick={() => { setCapturedProfileImage(null); setCameraSession((current) => current + 1) }}>Retake</Button>
              <Button type="button" className="flex-[2] bg-primary hover:bg-primary/90" disabled={!capturedProfileImage || imageState.isLoading} onClick={handleSaveProfileImage}>
                {imageState.isLoading ? "Saving..." : "Save Photo"}
              </Button>
            </div>
          </div>
        </div>
      )}
      <form onSubmit={handleSubmit} className="grid gap-4 rounded-xl border border-border bg-card p-5 sm:grid-cols-2">
        <div><Label>Name</Label><Input name="name" required className="mt-2" defaultValue={vendor?.name || ""} /></div>
        <div><Label>Business name</Label><Input name="business_name" className="mt-2" defaultValue={vendor?.business_name || ""} /></div>
        <div><Label>Phone</Label><Input name="phone" required className="mt-2" defaultValue={vendor?.phone || ""} /></div>
        <div><Label>Alt phone optional</Label><Input name="alt_phone" className="mt-2" defaultValue={vendor?.alt_phone || ""} /></div>
        <div><Label>Organisation name optional</Label><Input name="organisation_name" className="mt-2" defaultValue={vendor?.organisation_name || ""} /></div>
        <div><Label>Organisation number optional</Label><Input name="organisation_number" className="mt-2" defaultValue={vendor?.organisation_number || ""} /></div>
        <div><Label>Organisation email optional</Label><Input name="organisation_email" type="email" className="mt-2" defaultValue={vendor?.organisation_email || ""} /></div>
        <div><Label>GSTIN optional</Label><Input name="gstin" className="mt-2" defaultValue={vendor?.gstin || ""} /></div>
        <div className="sm:col-span-2"><Label>Address line 1</Label><Input name="address1" required className="mt-2" defaultValue={vendor?.address1 || ""} /></div>
        <div className="sm:col-span-2"><Label>Address line 2 optional</Label><Input name="address2" className="mt-2" defaultValue={vendor?.address2 || ""} /></div>
        <div><Label>City</Label><Input name="city" required className="mt-2" defaultValue={vendor?.city || ""} /></div>
        <div><Label>State</Label><Input name="state" required className="mt-2" defaultValue={vendor?.state || ""} /></div>
        <div><Label>Pincode</Label><Input name="pincode" required className="mt-2" defaultValue={vendor?.pincode || ""} /></div>
        <div><Label>Status</Label><Input disabled className="mt-2 capitalize" value={vendor?.status || ""} /></div>
        {message && <p className="sm:col-span-2 text-sm text-primary">{message}</p>}
        <Button disabled={updateState.isLoading} className="sm:col-span-2 bg-primary hover:bg-primary/90"><Save className="mr-2 h-4 w-4" />{updateState.isLoading ? "Saving..." : "Save Profile"}</Button>
      </form>
    </div>
  )
}

export function VendorMessagesPage() {
  const [message, setMessage] = useState("")
  const [status, setStatus] = useState("")
  const [sendSupportMessage, sendState] = useSendVendorSupportMessageMutation()

  const handleSubmit = async (event) => {
    event.preventDefault()
    setStatus("")
    try {
      await sendSupportMessage({ message }).unwrap()
      setMessage("")
      setStatus("Message sent to admin.")
    } catch (err) {
      setStatus(err?.data?.message || "Unable to send message.")
    }
  }

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-foreground">Messages</h1><p className="text-muted-foreground">Send a direct support message to admin.</p></div>
      <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-5">
        <Label>Message to admin</Label>
        <textarea value={message} onChange={(event) => setMessage(event.target.value)} required rows={7} className="mt-2 w-full rounded-md border border-input bg-background p-3 text-sm outline-none" placeholder="Tell admin what problem you are facing..." />
        {status && <p className="mt-3 text-sm text-primary">{status}</p>}
        <Button disabled={sendState.isLoading} className="mt-4 bg-primary hover:bg-primary/90"><Send className="mr-2 h-4 w-4" />{sendState.isLoading ? "Sending..." : "Send Message"}</Button>
      </form>
    </div>
  )
}

export function VendorReviewsPage() {
  const { data: vendor, isLoading } = useVendorDashboard()
  const reviews = vendor?.Reviews ?? []
  const average = reviews.length ? reviews.reduce((sum, review) => sum + Number(review.rating), 0) / reviews.length : 0

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-foreground">Reviews</h1><p className="text-muted-foreground">See what customers reviewed for your services.</p></div>
      <Card><div className="flex items-center gap-3"><Star className="h-8 w-8 fill-accent text-accent" /><div><p className="text-2xl font-bold">{average.toFixed(1)}</p><p className="text-sm text-muted-foreground">{reviews.length} total reviews</p></div></div></Card>
      {isLoading && <EmptyState>Loading reviews...</EmptyState>}
      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id}>
            <div className="flex items-start justify-between gap-4"><div><p className="font-semibold text-foreground">{review.User?.name || "Customer"}</p><p className="text-sm text-muted-foreground">{review.Booking?.booking_number || "Booking review"}</p></div><span className="rounded-full bg-accent/20 px-3 py-1 text-sm font-semibold">{review.rating}/5</span></div>
            <p className="mt-3 text-sm text-muted-foreground">{review.comment || "No comment added."}</p>
          </Card>
        ))}
      </div>
      {!isLoading && reviews.length === 0 && <EmptyState>No reviews yet.</EmptyState>}
    </div>
  )
}

export function VendorWalletPage() {
  const { data: vendor } = useVendorDashboard()
  const { data: wallet } = useGetWalletQuery(undefined, { pollingInterval: 30000 })
  const [amount, setAmount] = useState("")
  const [status, setStatus] = useState("")
  const [requestWithdrawal, withdrawState] = useRequestWithdrawalMutation()
  const bookings = vendor?.Bookings ?? []
  const bankAccounts = vendor?.BankAccounts ?? []
  const verifiedBankAccounts = bankAccounts.filter((account) => account.is_verified)
  const withdrawableBalance = Math.max(Number(wallet?.available_balance || 0) - 300, 0)
  const summary = useMemo(() => getEarningSummary(bookings), [bookings])

  const handleWithdraw = async (event) => {
    event.preventDefault()
    setStatus("")
    try {
      await requestWithdrawal({ amount }).unwrap()
      setAmount("")
      setStatus("Withdrawal request sent to admin. You will get email after manual bank transfer.")
    } catch (err) {
      setStatus(err?.data?.message || "Unable to withdraw.")
    }
  }

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-foreground">Wallet</h1><p className="text-muted-foreground">Track orders, add bank details, and withdraw available wallet balance.</p></div>
      <div className="grid gap-4 md:grid-cols-4">
        <Card><p className="text-sm text-muted-foreground">This month</p><p className="mt-1 text-2xl font-bold">{money(summary.thisMonth)}</p><p className="text-xs text-muted-foreground">{summary.thisMonthOrders} orders</p></Card>
        <Card><p className="text-sm text-muted-foreground">Previous month</p><p className="mt-1 text-2xl font-bold">{money(summary.previousMonth)}</p><p className="text-xs text-muted-foreground">{summary.previousMonthOrders} orders</p></Card>
        <Card><p className="text-sm text-muted-foreground">Total paid value</p><p className="mt-1 text-2xl font-bold">{money(summary.total || wallet?.total_balance)}</p><p className="text-xs text-muted-foreground">{summary.orders} paid orders</p></Card>
        <Card><p className="text-sm text-muted-foreground">Available wallet</p><p className="mt-1 text-2xl font-bold">{money(wallet?.available_balance)}</p><p className="text-xs text-muted-foreground">Pending {money(wallet?.pending_balance)}</p></Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <BankDetailsCard bankAccounts={bankAccounts} />
        <Card>
          <h2 className="font-semibold text-foreground">Withdraw money</h2>
          <p className="mt-2 text-sm text-muted-foreground">Maximum withdrawable now: {money(withdrawableBalance)}. Wallet must keep Rs.300 minimum balance.</p>
          <form onSubmit={handleWithdraw} className="mt-4 space-y-3">
            <Input value={amount} onChange={(event) => setAmount(event.target.value)} type="number" min="1" max={withdrawableBalance} placeholder="Amount" required />
            {status && <p className="text-sm text-primary">{status}</p>}
            <Button disabled={withdrawState.isLoading || verifiedBankAccounts.length === 0 || withdrawableBalance <= 0} className="w-full bg-primary hover:bg-primary/90"><DollarSign className="mr-2 h-4 w-4" />{withdrawState.isLoading ? "Withdrawing..." : "Withdraw"}</Button>
          </form>
          {verifiedBankAccounts.length === 0 && <p className="mt-3 text-xs text-muted-foreground">Add verified bank details before withdrawing.</p>}
        </Card>
      </div>
    </div>
  )
}

function BankDetailsCard({ bankAccounts = [] }) {
  const [status, setStatus] = useState("")
  const [addBankAccount, bankState] = useAddBankAccountMutation()

  const handleSubmit = async (event) => {
    event.preventDefault()
    setStatus("")
    const form = new FormData(event.currentTarget)
    try {
      await addBankAccount({
        accountHolderName: form.get("accountHolderName"),
        accountNumber: form.get("accountNumber"),
        ifsc: form.get("ifsc"),
        bankName: form.get("bankName"),
      }).unwrap()
      event.currentTarget.reset()
      setStatus("Bank details saved.")
    } catch (err) {
      setStatus(err?.data?.message || "Unable to save bank details.")
    }
  }

  return (
    <Card>
      <h2 className="font-semibold text-foreground">Add bank details</h2>
      {bankAccounts[0] && <p className="mt-2 text-sm text-muted-foreground">Current bank: {bankAccounts[0].bank_name} ending {bankAccounts[0].account_number_last4} - {bankAccounts[0].is_verified ? "Verified" : "Verification pending"}</p>}
      <form onSubmit={handleSubmit} className="mt-4 grid gap-3">
        <Input name="accountHolderName" required placeholder="Account holder name" />
        <Input name="accountNumber" required placeholder="Account number" />
        <Input name="ifsc" required placeholder="IFSC code" />
        <Input name="bankName" required placeholder="Bank name" />
        {status && <p className="text-sm text-primary">{status}</p>}
        <Button disabled={bankState.isLoading} className="bg-primary hover:bg-primary/90"><CreditCard className="mr-2 h-4 w-4" />{bankState.isLoading ? "Saving..." : "Save Bank Details"}</Button>
      </form>
    </Card>
  )
}

export function VendorAnalyticsPage() {
  const { data: vendor } = useVendorDashboard()
  const bookings = vendor?.Bookings ?? []
  const reviews = vendor?.Reviews ?? []
  const summary = useMemo(() => getEarningSummary(bookings), [bookings])
  const statusData = useMemo(() => getBookingStatusData(bookings), [bookings])
  const monthlyData = useMemo(() => getMonthlyBookingData(bookings), [bookings])
  const paidOrders = bookings.filter((booking) => ["fully_paid", "completed"].includes(booking.status)).length

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-foreground">Analytics</h1><p className="text-muted-foreground">Live dashboard data refreshes automatically.</p></div>
      <div className="grid gap-4 md:grid-cols-4">
        <Card><TrendingUp className="h-6 w-6 text-primary" /><p className="mt-3 text-2xl font-bold">{money(summary.total)}</p><p className="text-sm text-muted-foreground">Total earning</p></Card>
        <Card><Briefcase className="h-6 w-6 text-primary" /><p className="mt-3 text-2xl font-bold">{bookings.length}</p><p className="text-sm text-muted-foreground">Total orders</p></Card>
        <Card><Star className="h-6 w-6 text-primary" /><p className="mt-3 text-2xl font-bold">{reviews.length}</p><p className="text-sm text-muted-foreground">Reviews</p></Card>
        <Card><BarChart3 className="h-6 w-6 text-primary" /><p className="mt-3 text-2xl font-bold">{paidOrders}</p><p className="text-sm text-muted-foreground">Paid orders</p></Card>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between gap-3"><h2 className="font-semibold text-foreground">Booking status</h2><span className="text-sm text-muted-foreground">{bookings.length} total</span></div>
          <div className="mt-5"><PieChart data={statusData} /></div>
        </Card>
        <Card>
          <div className="flex items-center justify-between gap-3"><h2 className="font-semibold text-foreground">Last 6 months</h2><div className="flex gap-3 text-xs text-muted-foreground"><span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-primary" />Orders</span><span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-accent" />Revenue</span></div></div>
          <BarChart data={monthlyData} />
        </Card>
      </div>
    </div>
  )
}

export function VendorNotificationsPage() {
  const { data: vendor } = useVendorDashboard()
  const { data: adminNotifications = [] } = useGetMyNotificationsQuery(undefined, { pollingInterval: 30000 })
  const bookings = vendor?.Bookings ?? []
  const notifications = [
    ...bookings.slice(0, 5).map((booking) => `${booking.User?.name || "Customer"} booking is ${booking.status}`),
    `${vendor?.VendorServices?.length || 0} services are active in your account`,
    `${vendor?.Reviews?.length || 0} customer reviews received`,
  ]

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-foreground">Notifications</h1><p className="text-muted-foreground">Important activity from bookings, services, and reviews.</p></div>
      <div className="space-y-3">
        {adminNotifications.map((item) => <Card key={`admin-${item.id}`} className="flex items-center gap-3"><Bell className="h-5 w-5 text-primary" /><div><p className="text-sm font-semibold text-foreground">{item.title}</p><p className="text-sm text-muted-foreground">{item.message}</p></div></Card>)}
        {notifications.map((item) => <Card key={item} className="flex items-center gap-3"><Bell className="h-5 w-5 text-primary" /><p className="text-sm text-foreground">{item}</p></Card>)}
      </div>
    </div>
  )
}

export function VendorSettingsPage() {
  return <DashboardSettingsPanel role="vendor" />
}
