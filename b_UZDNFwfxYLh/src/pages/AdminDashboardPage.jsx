import { useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { useApproveVendorMutation, useGetAdminDashboardQuery, useUpdateCommissionSettingsMutation } from "@/features/api/apiSlice"
import { AlertTriangle, BarChart3, Calendar, CheckCircle, Clock, DollarSign, Store, TrendingUp, Users, XCircle } from "lucide-react"

const money = (value) => `Rs.${Number(value || 0).toLocaleString("en-IN")}`
const initials = (name = "?") => name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()
const formatDate = (date) => date ? new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(date)) : "N/A"
const statusIcon = (status) => {
  if (["completed", "fully_paid"].includes(status)) return <CheckCircle className="h-4 w-4 text-green-600" />
  if (status === "cancelled" || status === "rejected") return <XCircle className="h-4 w-4 text-red-600" />
  return <Clock className="h-4 w-4 text-yellow-600" />
}

export default function AdminDashboardPage() {
  const { data, isLoading, isError } = useGetAdminDashboardQuery(undefined, { pollingInterval: 30000 })
  const [approveVendor] = useApproveVendorMutation()
  const [updateCommission, commissionState] = useUpdateCommissionSettingsMutation()
  const [commissionMessage, setCommissionMessage] = useState("")
  const stats = data?.stats || {}
  const commissionSettings = data?.commissionSettings || {}
  const [vendorCommissionPercent, setVendorCommissionPercent] = useState("")
  const [customerServiceChargePercent, setCustomerServiceChargePercent] = useState("")
  const vendorCommissionValue = vendorCommissionPercent || commissionSettings.vendor_commission_percent || 5
  const customerChargeValue = customerServiceChargePercent || commissionSettings.customer_service_charge_percent || 2
  const statCards = [
    { label: "Total Users", value: stats.totalUsers || 0, change: stats.userGrowth || 0, icon: Users, color: "bg-blue-100 text-blue-600" },
    { label: "Active Vendors", value: stats.activeVendors || 0, change: stats.vendorGrowth || 0, icon: Store, color: "bg-red-100 text-primary" },
    { label: "Total Bookings", value: stats.totalBookings || 0, change: stats.bookingGrowth || 0, icon: Calendar, color: "bg-green-100 text-green-600" },
    { label: "Revenue", value: money(stats.revenue), change: stats.revenueGrowth || 0, icon: DollarSign, color: "bg-yellow-100 text-yellow-700" },
  ]

  const saveCommission = async (body) => {
    setCommissionMessage("")
    try {
      await updateCommission(body).unwrap()
      setCommissionMessage("Commission settings updated.")
    } catch (err) {
      setCommissionMessage(err?.data?.message || "Unable to update commission.")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1><p className="text-muted-foreground">Live platform overview from backend data.</p></div>
        <Link to="/admin/dashboard/analytics"><Button className="bg-primary hover:bg-primary/90"><BarChart3 className="mr-2 h-4 w-4" />View Analytics</Button></Link>
      </div>

      {isLoading && <p className="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">Loading dashboard...</p>}
      {isError && <p className="rounded-xl border border-border bg-card p-5 text-sm text-red-600">Unable to load dashboard data.</p>}

      <div className="space-y-2">
        {(data?.alerts || []).map((alert, index) => (
          <div key={index} className={`flex items-center gap-3 rounded-lg border p-3 ${alert.type === "warning" ? "border-yellow-200 bg-yellow-50" : alert.type === "success" ? "border-green-200 bg-green-50" : "border-blue-200 bg-blue-50"}`}>
            <AlertTriangle className={`h-4 w-4 ${alert.type === "warning" ? "text-yellow-600" : alert.type === "success" ? "text-green-600" : "text-blue-600"}`} />
            <span className="text-sm text-foreground">{alert.message}</span>
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between gap-4">
              <div><p className="text-sm text-muted-foreground">{stat.label}</p><p className="mt-1 text-2xl font-bold text-foreground">{stat.value}</p><p className="mt-1 flex items-center gap-1 text-sm text-green-600"><TrendingUp className="h-3 w-3" />{stat.change}% from last month</p></div>
              <div className={`rounded-xl p-3 ${stat.color}`}><stat.icon className="h-6 w-6" /></div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex flex-col gap-1">
          <h2 className="font-semibold text-foreground">Commission Controls</h2>
          <p className="text-sm text-muted-foreground">New bookings will use these percentages. Current platform fee is {money(commissionSettings.platform_fee || 99)}.</p>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-border p-4">
            <p className="text-sm font-medium text-foreground">Vendor-side commission</p>
            <div className="mt-3 flex gap-2">
              <Input type="number" min="0" max="100" step="0.01" value={vendorCommissionValue} onChange={(event) => setVendorCommissionPercent(event.target.value)} />
              <Button disabled={commissionState.isLoading} onClick={() => saveCommission({ vendorCommissionPercent: Number(vendorCommissionValue) })} className="bg-primary hover:bg-primary/90">Save Vendor</Button>
            </div>
          </div>
          <div className="rounded-lg border border-border p-4">
            <p className="text-sm font-medium text-foreground">Customer service charge</p>
            <div className="mt-3 flex gap-2">
              <Input type="number" min="0" max="100" step="0.01" value={customerChargeValue} onChange={(event) => setCustomerServiceChargePercent(event.target.value)} />
              <Button disabled={commissionState.isLoading} onClick={() => saveCommission({ customerServiceChargePercent: Number(customerChargeValue) })} className="bg-primary hover:bg-primary/90">Save Customer</Button>
            </div>
          </div>
        </div>
        {commissionMessage && <p className="mt-3 text-sm text-primary">{commissionMessage}</p>}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border p-5"><h2 className="font-semibold text-foreground">Recent Registrations</h2><Link to="/admin/dashboard/users" className="text-sm text-primary hover:underline">View All</Link></div>
          <div className="divide-y divide-border">
            {(data?.recentRegistrations || []).map((item) => (
              <div key={`${item.type}-${item.id}`} className="flex items-center justify-between gap-3 p-4">
                <div className="flex min-w-0 items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">{initials(item.business_name || item.name)}</div><div className="min-w-0"><p className="truncate text-sm font-medium text-foreground">{item.business_name || item.name}</p><p className="truncate text-xs text-muted-foreground">{item.email}</p></div></div>
                <div className="text-right"><span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">{item.type}</span><p className="mt-1 text-xs text-muted-foreground">{formatDate(item.createdAt)}</p></div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border p-5"><h2 className="font-semibold text-foreground">Pending Verifications</h2><span className="rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-foreground">{data?.pendingVerifications?.length || 0}</span></div>
          <div className="divide-y divide-border">
            {(data?.pendingVerifications || []).map((vendor) => (
              <div key={vendor.id} className="p-4">
                <p className="font-medium text-foreground">{vendor.business_name || vendor.name}</p><p className="text-sm text-muted-foreground">{vendor.VendorServices?.[0]?.Category?.name || "Vendor"}</p><p className="text-xs text-muted-foreground">Submitted {formatDate(vendor.createdAt)}</p>
                <div className="mt-3 flex gap-2"><Button size="sm" onClick={() => approveVendor(vendor.id)} className="bg-primary hover:bg-primary/90"><CheckCircle className="mr-1 h-3 w-3" />Approve</Button><Link to={`/admin/dashboard/vendors?id=${vendor.id}`}><Button size="sm" variant="outline">View</Button></Link></div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border p-5"><h2 className="font-semibold text-foreground">Recent Bookings</h2><Link to="/admin/dashboard/bookings" className="text-sm text-primary hover:underline">View All</Link></div>
          <div className="divide-y divide-border">
            {(data?.recentBookings || []).map((booking) => (
              <div key={booking.id} className="p-4">
                <div className="flex items-start justify-between gap-3"><div><p className="text-sm font-medium text-foreground">{booking.User?.name || "Customer"}</p><p className="text-xs text-muted-foreground">{booking.Vendor?.business_name || booking.Vendor?.name}</p></div><div className="text-right"><p className="font-semibold text-foreground">{money(booking.service_amount)}</p><div className="mt-1 flex items-center justify-end gap-1">{statusIcon(booking.status)}<span className="text-xs capitalize text-muted-foreground">{String(booking.status).replace(/_/g, " ")}</span></div></div></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
