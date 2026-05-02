import { useMemo, useState } from "react"
import { useSelector } from "react-redux"
import { Link, useParams } from "react-router-dom"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { Button } from "@/components/ui/Button"
import { useAddMyFavoriteMutation, useGetMyFavoritesQuery, useGetVendorQuery, useRemoveMyFavoriteMutation } from "@/features/api/apiSlice"
import { BadgeCheck, Calendar, ChevronLeft, CheckCircle, Globe, Heart, MapPin, MessageCircle, Share2, Star } from "lucide-react"

const API_ORIGIN = (import.meta.env.VITE_API_URL ?? "http://localhost:5000/api/v1").replace("/api/v1", "")
const resolveImage = (image) => {
  if (!image?.url) return ""
  return image.url.startsWith("http") ? image.url : `${API_ORIGIN}${image.url}`
}
const resolveUrl = (url) => {
  if (!url) return ""
  return url.startsWith("http") ? url : `${API_ORIGIN}${url}`
}

export default function VendorDetailPage() {
  const { id } = useParams()
  const { data: vendor, isLoading, isError } = useGetVendorQuery(id)
  const account = useSelector((state) => state.auth.account)
  const { data: favorites = [] } = useGetMyFavoritesQuery(undefined, { skip: !account || account.role !== "user" })
  const [addFavorite] = useAddMyFavoriteMutation()
  const [removeFavorite] = useRemoveMyFavoriteMutation()
  const favoriteIds = useMemo(() => favorites.map((favorite) => Number(favorite.vendor_id)), [favorites])
  const [shareStatus, setShareStatus] = useState("")
  const services = vendor?.VendorServices ?? []
  const firstPrice = Number(services[0]?.pricing?.customerSubtotal || services[0]?.price || 0)
  const avatar = resolveUrl(vendor?.profile_image_url)
  const serviceImages = services.flatMap((service) =>
    (service.images || []).map((image) => ({ ...image, serviceTitle: service.title })),
  )

  const toggleFavorite = async () => {
    if (!vendor?.id || !account) return
    if (favoriteIds.includes(Number(vendor.id))) await removeFavorite(vendor.id)
    else await addFavorite(vendor.id)
  }

  const shareVendor = async () => {
    if (!vendor) return
    const url = window.location.href
    const title = `${vendor.business_name || vendor.name} on BookMyEvent`
    setShareStatus("")
    try {
      if (navigator.share) {
        await navigator.share({ title, text: `Check out ${vendor.business_name || vendor.name}`, url })
        setShareStatus("Shared.")
      } else {
        await navigator.clipboard.writeText(url)
        setShareStatus("Link copied.")
      }
    } catch (error) {
      if (error?.name !== "AbortError") setShareStatus("Unable to share right now.")
    }
  }

  return (
    <div className="public-white-page flex min-h-screen flex-col bg-white">
      <Header />
      <main className="flex-1 bg-white">
        <div className="border-b border-border bg-white">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <Link to="/vendors" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
              <ChevronLeft className="h-4 w-4" /> Back to Vendors
            </Link>
          </div>
        </div>

        {isLoading || isError || !vendor ? (
          <div className="mx-auto max-w-7xl px-4 py-16 text-center text-muted-foreground">{isLoading ? "Loading vendor..." : "Vendor not found or not approved yet."}</div>
        ) : (
          <div className="mx-auto max-w-7xl bg-white px-3 py-5 sm:px-6 sm:py-8 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 items-start gap-3 sm:gap-4">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full border border-border bg-primary/10 sm:h-20 sm:w-20">
                      {avatar ? <img src={avatar} alt={vendor.name} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-primary">{vendor.name.charAt(0)}</div>}
                    </div>
                    <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h1 className="truncate text-xl font-bold text-foreground sm:text-3xl">{vendor.name}</h1>
                      <BadgeCheck className="h-5 w-5 shrink-0 text-primary sm:h-6 sm:w-6" />
                    </div>
                    <p className="mt-1 text-muted-foreground">{services[0]?.Category?.name || "Vendor"} · {vendor.business_name}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-4 text-sm">
                      <div className="flex items-center gap-1"><Star className="h-4 w-4 fill-accent text-accent" /><span className="font-medium text-foreground">New</span><span className="text-muted-foreground">({vendor.Reviews?.length || 0} reviews)</span></div>
                      <div className="flex items-center gap-1 text-muted-foreground"><MapPin className="h-4 w-4" /><span>{[vendor.city, vendor.state].filter(Boolean).join(", ")}</span></div>
                    </div>
                    </div>
                  </div>
                  <div className="flex flex-row items-start gap-2 sm:flex-col sm:items-end">
                    <div className="flex gap-2"><Button variant="outline" size="icon" onClick={toggleFavorite}><Heart className={`h-4 w-4 ${favoriteIds.includes(vendor.id) ? "fill-red-500 text-red-500" : ""}`} /></Button><Button variant="outline" size="icon" onClick={shareVendor}><Share2 className="h-4 w-4" /></Button></div>
                    {shareStatus && <p className="text-xs text-muted-foreground">{shareStatus}</p>}
                  </div>
                </div>

                {serviceImages.length > 0 && <div className="mt-8">
                  <h2 className="text-lg font-semibold text-foreground">Gallery</h2>
                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
                    {serviceImages.map((image, index) => (
                      <img key={`${image.publicId || image.url}-${index}`} src={resolveImage(image)} alt={image.serviceTitle} className="aspect-square rounded-xl object-cover" />
                    ))}
                  </div>
                </div>}

                <div className="mt-8">
                  <h2 className="text-lg font-semibold text-foreground">Services & Pricing</h2>
                  <div className="mt-4 space-y-3">
                    {services.map((service) => (
                      <div key={service.id} className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <h3 className="font-medium text-foreground">{service.title}</h3>
                          <p className="break-words text-sm text-muted-foreground">{service.description || service.city}</p>
                        </div>
                        <p className="font-semibold text-foreground">₹{Number(service.pricing?.customerSubtotal || service.price).toLocaleString("en-IN")}</p>
                      </div>
                    ))}
                    {services.length === 0 && <p className="rounded-xl border border-border p-4 text-sm text-muted-foreground">This vendor has not added services yet.</p>}
                  </div>
                </div>

                <div className="mt-8">
                  <h2 className="text-lg font-semibold text-foreground">What’s Included</h2>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {["Verified business details", "Admin-approved profile", "Secure booking request", "Advance payment tracking", "Customer support", "Wallet-based vendor settlement"].map((feature) => (
                      <div key={feature} className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-primary" /><span className="text-sm text-foreground">{feature}</span></div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-1">
                <div className="space-y-6 lg:sticky lg:top-24">
                  <div className="rounded-2xl border border-border bg-card p-4 shadow-lg sm:p-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Starting from</p>
                      <p className="text-3xl font-bold text-foreground">₹{firstPrice.toLocaleString("en-IN")}</p>
                    </div>
                    <div className="mt-6 space-y-3">
                      <Link to={account ? `/booking/${vendor.id}` : "/login"}>
                        <Button className="w-full bg-primary hover:bg-primary/90"><Calendar className="mr-2 h-4 w-4" />{account ? "Book Now" : "Login to Book"}</Button>
                      </Link>
                      <Button variant="outline" className="w-full"><MessageCircle className="mr-2 h-4 w-4" />Send Message</Button>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border bg-card p-4 sm:p-6">
                    <h3 className="font-semibold text-foreground">Contact Information</h3>
                    <div className="mt-4 space-y-3">
                      <div className="flex items-center gap-3 text-sm"><MapPin className="h-4 w-4 text-muted-foreground" /><span className="text-muted-foreground">{[vendor.city, vendor.state].filter(Boolean).join(", ")}</span></div>
                      <div className="flex items-center gap-3 text-sm"><Globe className="h-4 w-4 text-muted-foreground" /><span className="text-muted-foreground">{vendor.organisation_name || vendor.business_name || "BookMyEvent vendor"}</span></div>
                      <p className="rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">Vendor phone, email, and exact address are shared in your dashboard after full payment.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
