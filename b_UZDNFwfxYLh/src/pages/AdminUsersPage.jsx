import { useMemo, useState } from "react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { useGetAdminUsersQuery } from "@/features/api/apiSlice"
import { Download, Eye, Filter, Search } from "lucide-react"

const money = (value) => `Rs.${Number(value || 0).toLocaleString("en-IN")}`
const initials = (name = "?") => name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()
const date = (value) => value ? new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value)) : "N/A"

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedUser, setSelectedUser] = useState(null)
  const { data: users = [], isLoading, isError } = useGetAdminUsersQuery(
    { search: searchQuery || undefined, status: statusFilter === "all" ? undefined : statusFilter },
    { pollingInterval: 30000 },
  )

  const enrichedUsers = useMemo(() => users.map((user) => {
    const bookings = user.Bookings || []
    const spent = bookings.flatMap((booking) => booking.Payments || []).filter((payment) => payment.status === "paid").reduce((sum, payment) => sum + Number(payment.amount || 0), 0)
    return { ...user, bookingCount: bookings.length, spent }
  }), [users])

  const exportUsers = () => {
    const rows = enrichedUsers.map((user) => [user.name, user.email, user.phone || "", user.is_active ? "active" : "inactive", user.bookingCount, user.spent, user.createdAt].join(","))
    const blob = new Blob([["Name,Email,Phone,Status,Bookings,Total Spent,Joined", ...rows].join("\n")], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "book-my-event-users.csv"
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-foreground">Users</h1><p className="text-muted-foreground">All registered customers from backend.</p></div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-sm"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Search users..." value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} className="pl-10" /></div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setStatusFilter(statusFilter === "active" ? "inactive" : statusFilter === "inactive" ? "all" : "active")}><Filter className="mr-2 h-4 w-4" />{statusFilter === "all" ? "All" : statusFilter}</Button>
          <Button variant="outline" onClick={exportUsers}><Download className="mr-2 h-4 w-4" />Export</Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border bg-muted/50"><tr><th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">User</th><th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Contact</th><th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th><th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Bookings</th><th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Total Spent</th><th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Joined</th><th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Actions</th></tr></thead>
            <tbody className="divide-y divide-border">
              {enrichedUsers.map((user) => (
                <tr key={user.id} className="hover:bg-muted/30">
                  <td className="px-4 py-4"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">{initials(user.name)}</div><div><p className="font-medium text-foreground">{user.name}</p><p className="text-sm text-muted-foreground">{user.email}</p></div></div></td>
                  <td className="px-4 py-4 text-sm text-muted-foreground">{user.phone || "N/A"}</td>
                  <td className="px-4 py-4"><span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${user.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>{user.is_active ? "Active" : "Inactive"}</span></td>
                  <td className="px-4 py-4 text-sm text-foreground">{user.bookingCount}</td>
                  <td className="px-4 py-4 text-sm font-medium text-foreground">{money(user.spent)}</td>
                  <td className="px-4 py-4 text-sm text-muted-foreground">{date(user.createdAt)}</td>
                  <td className="px-4 py-4"><Button variant="ghost" size="icon" onClick={() => setSelectedUser(user)}><Eye className="h-4 w-4 text-muted-foreground" /></Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {isLoading && <p className="p-5 text-sm text-muted-foreground">Loading users...</p>}
        {isError && <p className="p-5 text-sm text-red-600">Unable to load users.</p>}
        {!isLoading && enrichedUsers.length === 0 && <p className="p-5 text-sm text-muted-foreground">No users found.</p>}
      </div>

      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[85vh] w-full max-w-2xl overflow-auto rounded-xl border border-border bg-card p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-4"><div><h2 className="text-xl font-bold text-foreground">{selectedUser.name}</h2><p className="text-sm text-muted-foreground">{selectedUser.email} - {selectedUser.phone || "No phone"}</p></div><Button variant="outline" onClick={() => setSelectedUser(null)}>Close</Button></div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-lg bg-muted p-3"><p className="text-xs text-muted-foreground">Bookings</p><p className="text-xl font-bold">{selectedUser.bookingCount}</p></div><div className="rounded-lg bg-muted p-3"><p className="text-xs text-muted-foreground">Spent</p><p className="text-xl font-bold">{money(selectedUser.spent)}</p></div><div className="rounded-lg bg-muted p-3"><p className="text-xs text-muted-foreground">Messages</p><p className="text-xl font-bold">{selectedUser.SupportTickets?.length || 0}</p></div></div>
            <h3 className="mt-5 font-semibold">Recent bookings</h3>
            <div className="mt-2 divide-y divide-border rounded-lg border border-border">{(selectedUser.Bookings || []).map((booking) => <div key={booking.id} className="p-3 text-sm"><p className="font-medium">{booking.booking_number}</p><p className="text-muted-foreground">{booking.Vendor?.business_name || booking.Vendor?.name} - {String(booking.status).replace(/_/g, " ")}</p></div>)}</div>
          </div>
        </div>
      )}
    </div>
  )
}
