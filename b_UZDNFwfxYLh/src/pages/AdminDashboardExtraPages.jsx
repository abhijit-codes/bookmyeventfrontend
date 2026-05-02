import { useMemo, useState } from "react"
import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { logout } from "@/features/auth/authSlice"
import {
  useApproveVendorMutation,
  useCompleteAdminWithdrawalMutation,
  useCreateAdminNotificationMutation,
  useGetAdminAnalyticsQuery,
  useGetAdminBookingsQuery,
  useGetAdminModerationQuery,
  useGetAdminNotificationsQuery,
  useGetAdminReportsQuery,
  useGetAdminSettlementsQuery,
  useGetAdminTransactionsQuery,
  useRejectVendorMutation,
  useReplyAdminReportMutation,
} from "@/features/api/apiSlice"
import { BarChart3, Bell, CheckCircle, LogOut, Send, Shield, XCircle } from "lucide-react"

const money = (value) => `Rs.${Number(value || 0).toLocaleString("en-IN")}`
const date = (value) => value ? new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value)) : "N/A"
const status = (value) => String(value || "").replace(/_/g, " ")

function Card({ children, className = "" }) {
  return <div className={`rounded-xl border border-border bg-card p-5 ${className}`}>{children}</div>
}

function Empty({ children }) {
  return <p className="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">{children}</p>
}

function BarChart({ data, keys }) {
  const max = Math.max(...data.flatMap((item) => keys.map((key) => Number(item[key] || 0))), 1)
  return (
    <div className="grid h-72 grid-cols-6 items-end gap-3">
      {data.map((item) => (
        <div key={item.key} className="flex h-full min-w-0 flex-col justify-end gap-2">
          <div className="flex flex-1 items-end justify-center gap-1 rounded-lg bg-muted/40 px-2 pb-2">
            {keys.map((key, index) => <div key={key} className={`w-4 rounded-t ${index === 0 ? "bg-primary" : index === 1 ? "bg-accent" : "bg-blue-500"}`} style={{ height: `${Math.max((Number(item[key] || 0) / max) * 100, item[key] ? 8 : 0)}%` }} title={`${key}: ${item[key]}`} />)}
          </div>
          <p className="text-center text-xs font-medium text-foreground">{item.label}</p>
        </div>
      ))}
    </div>
  )
}

export function AdminBookingsPage() {
  const { data: bookings = [], isLoading } = useGetAdminBookingsQuery(undefined, { pollingInterval: 30000 })
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-foreground">Bookings</h1><p className="text-muted-foreground">All booking requests coming through the platform.</p></div>
      {isLoading && <Empty>Loading bookings...</Empty>}
      <div className="space-y-3">{bookings.map((booking) => <Card key={booking.id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold">{booking.booking_number}</p><p className="text-sm text-muted-foreground">{booking.User?.name} booked {booking.Vendor?.business_name || booking.Vendor?.name}</p><p className="text-xs text-muted-foreground">{date(booking.event_date)} - {booking.event_city || booking.event_address}</p></div><div className="text-left sm:text-right"><p className="font-bold">{money(booking.service_amount)}</p><p className="text-xs capitalize text-muted-foreground">{status(booking.status)}</p></div></Card>)}</div>
      {!isLoading && bookings.length === 0 && <Empty>No bookings yet.</Empty>}
    </div>
  )
}

export function AdminTransactionsPage() {
  const { data: transactions = [], isLoading } = useGetAdminTransactionsQuery(undefined, { pollingInterval: 30000 })
  const { data: settlementData, isLoading: settlementsLoading } = useGetAdminSettlementsQuery(undefined, { pollingInterval: 30000 })
  const [referenceById, setReferenceById] = useState({})
  const [message, setMessage] = useState("")
  const [completeWithdrawal, completeState] = useCompleteAdminWithdrawalMutation()
  const settlements = settlementData?.settlements || []
  const withdrawalRequests = settlementData?.withdrawalRequests || []
  const totals = settlementData?.totals || {}

  const markPaid = async (id) => {
    setMessage("")
    try {
      await completeWithdrawal({ id, referenceNumber: referenceById[id] }).unwrap()
      setReferenceById((current) => ({ ...current, [id]: "" }))
      setMessage("Withdrawal marked completed and vendor email sent.")
    } catch (err) {
      setMessage(err?.data?.message || "Unable to complete withdrawal.")
    }
  }

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-foreground">Transactions</h1><p className="text-muted-foreground">Customer payments, vendor settlement breakup, and manual withdrawal queue.</p></div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card><p className="text-sm text-muted-foreground">Pending withdrawal</p><p className="mt-1 text-2xl font-bold">{money(totals.pendingWithdrawalAmount)}</p><p className="text-xs text-muted-foreground">{withdrawalRequests.length} vendor requests</p></Card>
        <Card><p className="text-sm text-muted-foreground">Pending stage release</p><p className="mt-1 text-2xl font-bold">{money(totals.pendingBookingStageAmount)}</p><p className="text-xs text-muted-foreground">Across 30/40/30 booking stages</p></Card>
        <Card><p className="text-sm text-muted-foreground">Paid transactions</p><p className="mt-1 text-2xl font-bold">{transactions.length}</p><p className="text-xs text-muted-foreground">Payment records</p></Card>
      </div>

      <Card>
        <h2 className="font-semibold text-foreground">Manual withdrawal requests</h2>
        {message && <p className="mt-3 text-sm text-primary">{message}</p>}
        {settlementsLoading && <p className="mt-3 text-sm text-muted-foreground">Loading withdrawal requests...</p>}
        <div className="mt-4 space-y-3">
          {withdrawalRequests.map((request) => {
            const vendor = request.Wallet?.Vendor
            const bank = vendor?.BankAccounts?.[0]
            return (
              <div key={request.id} className="rounded-lg border border-border p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="font-semibold">{vendor?.business_name || vendor?.name || `Vendor #${request.vendor_id}`}</p>
                    <p className="text-sm text-muted-foreground">{vendor?.email || "No email"} - {vendor?.phone || "No phone"}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{bank ? `${bank.bank_name} ending ${bank.account_number_last4}, IFSC ${bank.ifsc}` : "Verified bank details not found"}</p>
                    <p className="mt-1 text-xs text-muted-foreground">Request id: {request.reference_id}</p>
                  </div>
                  <div className="min-w-0 lg:w-80">
                    <p className="mb-2 text-left font-bold lg:text-right">{money(request.amount)}</p>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Input value={referenceById[request.id] || ""} onChange={(event) => setReferenceById((current) => ({ ...current, [request.id]: event.target.value }))} placeholder="Bank reference number" />
                      <Button disabled={completeState.isLoading} onClick={() => markPaid(request.id)} className="bg-primary hover:bg-primary/90">Mark Paid</Button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
          {!settlementsLoading && withdrawalRequests.length === 0 && <p className="text-sm text-muted-foreground">No pending manual withdrawal requests.</p>}
        </div>
      </Card>

      <Card>
        <h2 className="font-semibold text-foreground">Vendor settlement breakup</h2>
        <div className="mt-4 space-y-3">
          {settlements.map((item) => (
            <div key={item.id} className="rounded-lg border border-border p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="font-semibold">{item.bookingNumber} - {item.vendor?.business_name || item.vendor?.name}</p>
                  <p className="text-sm text-muted-foreground">{item.customer?.name} booked {item.service?.title || "service"} for {date(item.eventDate)}</p>
                  <p className="mt-1 text-sm font-medium">Customer paid {money(item.serviceAmount)}</p>
                  <p className="text-xs text-muted-foreground">Vendor payout {money(item.vendorEarning)} - Admin revenue {money(item.adminRevenue)}</p>
                </div>
                <div className="grid gap-2 sm:grid-cols-3 lg:w-[520px]">
                  {item.steps.map((step) => (
                    <div key={step.key} className="rounded-md bg-muted/50 p-3">
                      <p className="text-xs text-muted-foreground">{step.label}</p>
                      <p className="font-semibold">{step.percent}% - {money(step.amount)}</p>
                      <p className="text-xs capitalize text-muted-foreground">{step.status}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
          {!settlementsLoading && settlements.length === 0 && <p className="text-sm text-muted-foreground">No fully paid booking settlements yet.</p>}
        </div>
      </Card>

      {isLoading && <Empty>Loading transactions...</Empty>}
      <div className="space-y-3">{transactions.map((payment) => <Card key={payment.id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold capitalize">{payment.type} payment</p><p className="text-sm text-muted-foreground">{payment.Booking?.User?.name} - {payment.Booking?.Vendor?.business_name || payment.Booking?.Vendor?.name}</p><p className="text-xs text-muted-foreground">{payment.provider_payment_id || payment.provider_order_id || "Provider id pending"}</p></div><div className="text-left sm:text-right"><p className="font-bold">{money(payment.amount)}</p><p className="text-xs capitalize text-muted-foreground">{payment.status} via {payment.provider}</p></div></Card>)}</div>
      {!isLoading && transactions.length === 0 && <Empty>No transactions yet.</Empty>}
    </div>
  )
}

export function AdminAnalyticsPage() {
  const { data, isLoading } = useGetAdminAnalyticsQuery(undefined, { pollingInterval: 30000 })
  const totals = data?.totals || {}
  const vendorPercent = totals.vendors ? Math.round((totals.approvedVendors / totals.vendors) * 100) : 0
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-foreground">Analytics</h1><p className="text-muted-foreground">AI-style monthly analysis based on live platform data.</p></div>
      {isLoading && <Empty>Loading analytics...</Empty>}
      <div className="grid gap-4 md:grid-cols-4"><Card><p className="text-sm text-muted-foreground">Users</p><p className="text-2xl font-bold">{totals.users || 0}</p></Card><Card><p className="text-sm text-muted-foreground">Vendors</p><p className="text-2xl font-bold">{totals.vendors || 0}</p></Card><Card><p className="text-sm text-muted-foreground">Revenue</p><p className="text-2xl font-bold">{money(totals.revenue)}</p></Card><Card><p className="text-sm text-muted-foreground">Approved vendors</p><p className="text-2xl font-bold">{vendorPercent}%</p></Card></div>
      <Card><div className="flex items-center justify-between gap-3"><h2 className="font-semibold">Monthly growth</h2><div className="flex gap-3 text-xs text-muted-foreground"><span>Red users</span><span>Gold vendors</span><span>Blue bookings</span></div></div><BarChart data={data?.months || []} keys={["users", "vendors", "bookings"]} /></Card>
      <Card><div className="flex items-center gap-3"><BarChart3 className="h-6 w-6 text-primary" /><p className="text-sm text-muted-foreground">This view compares monthly users, vendors, bookings, and revenue so admin can see which month brought more customers, earning, and vendor growth.</p></div></Card>
    </div>
  )
}

export function AdminReportsPage() {
  const [senderRole, setSenderRole] = useState("user")
  const [replyById, setReplyById] = useState({})
  const { data: reports = [], isLoading } = useGetAdminReportsQuery({ senderRole }, { pollingInterval: 30000 })
  const [replyReport] = useReplyAdminReportMutation()

  const submitReply = async (id) => {
    await replyReport({ id, reply: replyById[id] }).unwrap()
    setReplyById((current) => ({ ...current, [id]: "" }))
  }

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-foreground">Reports</h1><p className="text-muted-foreground">Customer and vendor problem messages, with admin reply.</p></div>
      <div className="flex gap-2"><Button variant={senderRole === "user" ? "default" : "outline"} onClick={() => setSenderRole("user")}>Users</Button><Button variant={senderRole === "vendor" ? "default" : "outline"} onClick={() => setSenderRole("vendor")}>Vendors</Button></div>
      {isLoading && <Empty>Loading messages...</Empty>}
      <div className="space-y-4">{reports.map((ticket) => <Card key={ticket.id}><div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"><div><p className="font-semibold">{ticket.User?.name || ticket.Vendor?.business_name || ticket.Vendor?.name}</p><p className="text-sm text-muted-foreground">{ticket.User?.email || ticket.Vendor?.email} - {date(ticket.createdAt)}</p></div><span className="w-fit rounded-full bg-muted px-3 py-1 text-xs capitalize">{ticket.status}</span></div><p className="mt-3 text-sm text-foreground">{ticket.message}</p>{ticket.admin_reply && <p className="mt-3 rounded-lg bg-green-50 p-3 text-sm text-green-800">Reply: {ticket.admin_reply}</p>}<div className="mt-4 flex flex-col gap-2 sm:flex-row"><Input value={replyById[ticket.id] || ""} onChange={(event) => setReplyById((current) => ({ ...current, [ticket.id]: event.target.value }))} placeholder="Type admin reply..." /><Button onClick={() => submitReply(ticket.id)} className="bg-primary hover:bg-primary/90"><Send className="mr-2 h-4 w-4" />Reply</Button></div></Card>)}</div>
      {!isLoading && reports.length === 0 && <Empty>No {senderRole} reports yet.</Empty>}
    </div>
  )
}

export function AdminModerationPage() {
  const { data, isLoading } = useGetAdminModerationQuery(undefined, { pollingInterval: 30000 })
  const [approveVendor] = useApproveVendorMutation()
  const [rejectVendor] = useRejectVendorMutation()
  const vendors = data?.vendors || []
  const documents = data?.documents || []
  const tickets = data?.tickets || []
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-foreground">Moderation</h1><p className="text-muted-foreground">Pending vendors, documents, and open support issues.</p></div>
      {isLoading && <Empty>Loading moderation queue...</Empty>}
      <div className="grid gap-4 md:grid-cols-3"><Card><Shield className="h-6 w-6 text-primary" /><p className="mt-2 text-2xl font-bold">{vendors.length}</p><p className="text-sm text-muted-foreground">Pending vendors</p></Card><Card><CheckCircle className="h-6 w-6 text-primary" /><p className="mt-2 text-2xl font-bold">{documents.length}</p><p className="text-sm text-muted-foreground">Pending documents</p></Card><Card><Bell className="h-6 w-6 text-primary" /><p className="mt-2 text-2xl font-bold">{tickets.length}</p><p className="text-sm text-muted-foreground">Open reports</p></Card></div>
      <div className="space-y-3">{vendors.map((vendor) => <Card key={vendor.id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold">{vendor.business_name || vendor.name}</p><p className="text-sm text-muted-foreground">{vendor.email} - {vendor.phone}</p></div><div className="flex gap-2"><Button onClick={() => approveVendor(vendor.id)} className="bg-primary hover:bg-primary/90"><CheckCircle className="mr-2 h-4 w-4" />Approve</Button><Button variant="outline" onClick={() => rejectVendor(vendor.id)}><XCircle className="mr-2 h-4 w-4" />Reject</Button></div></Card>)}</div>
    </div>
  )
}

export function AdminNotificationsPage() {
  const [message, setMessage] = useState("")
  const [createNotification, createState] = useCreateAdminNotificationMutation()
  const { data: notifications = [] } = useGetAdminNotificationsQuery(undefined, { pollingInterval: 30000 })

  const submit = async (event) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    await createNotification(Object.fromEntries(form.entries())).unwrap()
    event.currentTarget.reset()
    setMessage("Notification sent.")
  }

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-foreground">Notifications</h1><p className="text-muted-foreground">Send common, customer-only, or vendor-only notices.</p></div>
      <form onSubmit={submit} className="grid gap-4 rounded-xl border border-border bg-card p-5">
        <div><Label>Audience</Label><select name="audience" className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none"><option value="all">All</option><option value="users">Customers</option><option value="vendors">Vendors</option></select></div>
        <div><Label>Title</Label><Input name="title" required className="mt-2" /></div>
        <div><Label>Message</Label><textarea name="message" required rows={5} className="mt-2 w-full rounded-md border border-input bg-background p-3 text-sm outline-none" /></div>
        {message && <p className="text-sm text-primary">{message}</p>}
        <Button disabled={createState.isLoading} className="bg-primary hover:bg-primary/90"><Send className="mr-2 h-4 w-4" />Send Notification</Button>
      </form>
      <div className="space-y-3">{notifications.map((item) => <Card key={item.id}><p className="font-semibold">{item.title}</p><p className="text-sm text-muted-foreground">{item.message}</p><p className="mt-2 text-xs capitalize text-muted-foreground">Audience: {item.audience} - {date(item.createdAt)}</p></Card>)}</div>
    </div>
  )
}

export function AdminSettingsPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const doLogout = () => {
    dispatch(logout())
    navigate("/admin/login", { replace: true })
  }
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-foreground">Settings</h1><p className="text-muted-foreground">Admin account and platform controls.</p></div>
      <Card><p className="font-semibold">System Administrator</p><p className="text-sm text-muted-foreground">Use this dashboard to manage users, vendors, bookings, reports, moderation, and notifications.</p></Card>
      <Button onClick={doLogout} variant="outline" className="text-red-600 hover:bg-red-50"><LogOut className="mr-2 h-4 w-4" />Log Out</Button>
    </div>
  )
}
