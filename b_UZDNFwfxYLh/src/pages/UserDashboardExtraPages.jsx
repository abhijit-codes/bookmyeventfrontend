import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { CameraCapture } from "@/components/CameraCapture"
import { DashboardSettingsPanel } from "@/components/dashboard/DashboardSettingsPanel"
import { useDashboardText } from "@/hooks/useDashboardText"
import {
  useGetMeQuery,
  useGetMyFavoritesQuery,
  useGetMyNotificationsQuery,
  useGetMyBookingsQuery,
  useGetVendorsQuery,
  useRemoveMyFavoriteMutation,
  useSendUserSupportMessageMutation,
  useUpdateMeMutation,
  useUpdateMyProfileImageMutation,
} from "@/features/api/apiSlice"
import { Bell, Camera, CreditCard, Heart, MapPin, Save, Send, Star, User, X } from "lucide-react"

const API_ORIGIN = (import.meta.env.VITE_API_URL )
const resolveUrl = (url) => {
  if (!url) return ""
  return url.startsWith("http") ? url : `${API_ORIGIN}${url}`
}
const money = (value) => `Rs.${Number(value || 0).toLocaleString("en-IN")}`

function Card({ children, className = "" }) {
  return <div className={`rounded-xl border border-red-100 bg-card p-5 shadow-sm shadow-red-950/5 ${className}`}>{children}</div>
}

function EmptyState({ children }) {
  return <p className="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">{children}</p>
}

function bookingNotifications(bookings = []) {
  return bookings.flatMap((booking) => {
    const vendor = booking.Vendor?.business_name || booking.Vendor?.name || "Vendor"
    if (booking.status === "vendor_confirmed") return [`${vendor} accepted your booking. Pay ${money(booking.remaining_amount)} before the 48-hour deadline.`]
    if (booking.status === "fully_paid") return [`Your order with ${vendor} is confirmed.`]
    if (booking.status === "expired") return [`Your payment window for ${vendor} expired and the order was cancelled.`]
    if (booking.status === "rejected") return [`${vendor} cancelled your booking request. Refund should be processed within 24 hours.`]
    return [`Booking ${booking.booking_number} is ${String(booking.status).replace(/_/g, " ")}.`]
  })
}

export function UserFavoritesPage() {
  const { labels } = useDashboardText("user")
  const { data: vendors = [], isLoading: vendorsLoading } = useGetVendorsQuery()
  const { data: savedFavorites = [], isLoading: favoritesLoading } = useGetMyFavoritesQuery()
  const [removeFavorite] = useRemoveMyFavoriteMutation()
  const ids = useMemo(() => savedFavorites.map((favorite) => Number(favorite.vendor_id)), [savedFavorites])
  const favorites = vendors.filter((vendor) => ids.includes(vendor.id) || ids.includes(String(vendor.id)))
  const isLoading = vendorsLoading || favoritesLoading

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-foreground">{labels("favorites")}</h1><p className="text-muted-foreground">{labels("favoritesDescription")}</p></div>
      {isLoading && <EmptyState>{labels("loadingFavorites")}</EmptyState>}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {favorites.map((vendor) => (
          <Card key={vendor.id} className="border-primary/25">
            <Link to={`/vendors/${vendor.id}`} className="flex items-start gap-3">
              <div className="h-14 w-14 overflow-hidden rounded-xl bg-primary/10">
                {vendor.profile_image_url ? <img src={resolveUrl(vendor.profile_image_url)} alt={vendor.name} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center font-bold text-primary">{vendor.name.charAt(0)}</div>}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="truncate font-semibold text-foreground">{vendor.business_name || vendor.name}</h2>
                <p className="text-sm text-muted-foreground">{vendor.VendorServices?.[0]?.Category?.name || labels("vendor")}</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" />{[vendor.city, vendor.state].filter(Boolean).join(", ")}</p>
              </div>
            </Link>
            <Button variant="outline" className="mt-4 w-full border-primary/30 text-primary hover:bg-red-soft" onClick={() => removeFavorite(vendor.id)}><Heart className="mr-2 h-4 w-4 fill-current" />{labels("remove")}</Button>
          </Card>
        ))}
      </div>
      {!isLoading && favorites.length === 0 && <EmptyState>{labels("noFavorites")}</EmptyState>}
    </div>
  )
}

export function UserMessagesPage() {
  const { labels } = useDashboardText("user")
  const [message, setMessage] = useState("")
  const [status, setStatus] = useState("")
  const [sendMessage, sendState] = useSendUserSupportMessageMutation()

  const handleSubmit = async (event) => {
    event.preventDefault()
    setStatus("")
    try {
      await sendMessage({ message }).unwrap()
      setMessage("")
      setStatus(labels("messageSent"))
    } catch (err) {
      setStatus(err?.data?.message || labels("unableSendMessage"))
    }
  }

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-foreground">{labels("messages")}</h1><p className="text-muted-foreground">{labels("messagesDescription")}</p></div>
      <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-5">
        <Label>{labels("messageToAdmin")}</Label>
        <textarea value={message} onChange={(event) => setMessage(event.target.value)} required rows={7} className="mt-2 w-full rounded-md border border-input bg-background p-3 text-sm outline-none" placeholder={labels("writeQuestion")} />
        {status && <p className="mt-3 text-sm text-primary">{status}</p>}
        <Button disabled={sendState.isLoading} className="mt-4 bg-primary hover:bg-primary/90"><Send className="mr-2 h-4 w-4" />{sendState.isLoading ? labels("sending") : labels("sendMessage")}</Button>
      </form>
    </div>
  )
}

export function UserNotificationsPage() {
  const { labels } = useDashboardText("user")
  const { data: bookings = [], isLoading } = useGetMyBookingsQuery(undefined, { pollingInterval: 30000 })
  const { data: adminNotifications = [] } = useGetMyNotificationsQuery(undefined, { pollingInterval: 30000 })
  const notifications = bookingNotifications(bookings)

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-foreground">{labels("notifications")}</h1><p className="text-muted-foreground">{labels("notificationsDescription")}</p></div>
      {isLoading && <EmptyState>{labels("loadingNotifications")}</EmptyState>}
      <div className="space-y-3">
        {adminNotifications.map((item) => <Card key={`admin-${item.id}`} className="flex items-center gap-3"><Bell className="h-5 w-5 text-primary" /><div><p className="text-sm font-semibold text-foreground">{item.title}</p><p className="text-sm text-muted-foreground">{item.message}</p></div></Card>)}
        {notifications.map((item, index) => <Card key={`${item}-${index}`} className="flex items-center gap-3"><Bell className="h-5 w-5 text-primary" /><p className="text-sm text-foreground">{item}</p></Card>)}
      </div>
      {!isLoading && notifications.length === 0 && adminNotifications.length === 0 && <EmptyState>{labels("noNotifications")}</EmptyState>}
    </div>
  )
}

export function UserPaymentsPage() {
  const { labels } = useDashboardText("user")
  const { data: bookings = [], isLoading } = useGetMyBookingsQuery(undefined, { pollingInterval: 30000 })
  const payments = bookings.flatMap((booking) => (booking.Payments || []).map((payment) => ({ ...payment, booking })))

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-foreground">{labels("payments")}</h1><p className="text-muted-foreground">{labels("paymentsDescription")}</p></div>
      {isLoading && <EmptyState>{labels("loadingPayments")}</EmptyState>}
      <div className="space-y-3">
        {payments.map((payment) => (
          <Card key={payment.id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-primary/10 p-3 text-primary"><CreditCard className="h-5 w-5" /></div>
              <div><p className="font-semibold capitalize text-foreground">{payment.type} payment</p><p className="text-sm text-muted-foreground">{payment.booking?.Vendor?.name} - {payment.booking?.VendorService?.title}</p></div>
            </div>
            <div className="text-left sm:text-right"><p className="font-bold text-foreground">{money(payment.amount)}</p><p className="text-xs capitalize text-muted-foreground">{payment.status} via {payment.provider}</p></div>
          </Card>
        ))}
      </div>
      {!isLoading && payments.length === 0 && <EmptyState>{labels("noPayments")}</EmptyState>}
    </div>
  )
}

export function UserProfilePage() {
  const { labels } = useDashboardText("user")
  const { data: account, isLoading } = useGetMeQuery()
  const [message, setMessage] = useState("")
  const [cameraOpen, setCameraOpen] = useState(false)
  const [cameraSession, setCameraSession] = useState(0)
  const [capturedImage, setCapturedImage] = useState(null)
  const [updateMe, updateState] = useUpdateMeMutation()
  const [updateImage, imageState] = useUpdateMyProfileImageMutation()
  const avatar = resolveUrl(account?.profile_image_url)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setMessage("")
    const form = new FormData(event.currentTarget)
    try {
      await updateMe(Object.fromEntries(form.entries())).unwrap()
      setMessage(labels("profileSaved"))
    } catch (err) {
      setMessage(err?.data?.message || labels("unableSaveProfile"))
    }
  }

  const handleSaveImage = async () => {
    if (!capturedImage) return
    setMessage("")
    try {
      await updateImage({ profileImage: capturedImage }).unwrap()
      setCapturedImage(null)
      setCameraOpen(false)
      setMessage(labels("profilePhotoUpdated"))
    } catch (err) {
      setMessage(err?.data?.message || labels("unableUpdatePhoto"))
    }
  }

  if (isLoading) return <EmptyState>{labels("loadingOrders")}</EmptyState>

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button type="button" onClick={() => { setCapturedImage(null); setCameraSession((current) => current + 1); setCameraOpen(true) }} className="group relative h-20 w-20 overflow-hidden rounded-full border border-border bg-primary/10">
          {avatar ? <img src={avatar} alt={account?.name || "Customer"} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-primary">{(account?.name || "C").charAt(0)}</div>}
          <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-white opacity-0 transition-opacity group-hover:opacity-100"><Camera className="h-6 w-6" /></span>
        </button>
        <div><h1 className="text-2xl font-bold text-foreground">{labels("profile")}</h1><p className="text-muted-foreground">{labels("updateCustomerDetails")}</p></div>
      </div>

      {cameraOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-xl rounded-xl border border-border bg-card p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between"><div><h2 className="font-semibold">{labels("updateDp")}</h2><p className="text-sm text-muted-foreground">{labels("captureProfilePhoto")}</p></div><Button type="button" variant="ghost" size="icon" onClick={() => setCameraOpen(false)}><X className="h-5 w-5" /></Button></div>
            <CameraCapture key={cameraSession} label="Live photo" name="profileImage" facingMode="user" onCapture={(_name, file) => setCapturedImage(file)} />
            <div className="mt-4 flex gap-3"><Button type="button" variant="outline" className="flex-1" onClick={() => { setCapturedImage(null); setCameraSession((current) => current + 1) }}>{labels("retake")}</Button><Button type="button" disabled={!capturedImage || imageState.isLoading} className="flex-[2] bg-primary hover:bg-primary/90" onClick={handleSaveImage}>{imageState.isLoading ? labels("saving") : labels("savePhoto")}</Button></div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-4 rounded-xl border border-border bg-card p-5 sm:grid-cols-2">
        <div><Label>{labels("name")}</Label><Input name="name" required className="mt-2" defaultValue={account?.name || ""} /></div>
        <div><Label>{labels("email")}</Label><Input disabled className="mt-2" value={account?.email || ""} /></div>
        <div><Label>{labels("phoneLabel")}</Label><Input name="phone" className="mt-2" defaultValue={account?.phone || ""} /></div>
        {message && <p className="sm:col-span-2 text-sm text-primary">{message}</p>}
        <Button disabled={updateState.isLoading} className="sm:col-span-2 bg-primary hover:bg-primary/90"><Save className="mr-2 h-4 w-4" />{updateState.isLoading ? labels("saving") : labels("saveProfile")}</Button>
      </form>
    </div>
  )
}

export function UserSettingsPage() {
  return <DashboardSettingsPanel role="user" />
}
