import { Link } from "react-router-dom"
import { Button } from "@/components/ui/Button"
import { useGetVendorsQuery } from "@/features/api/apiSlice"
import { Star, MapPin, Heart, ArrowRight, BadgeCheck, BriefcaseBusiness } from "lucide-react"

const API_ORIGIN = (import.meta.env.VITE_API_URL ?? "").replace("/api/v1", "")
const resolveUrl = (url) => {
  if (!url) return ""
  return url.startsWith("http") ? url : `${API_ORIGIN}${url}`
}
const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`
const reviewStats = (vendor) => {
  const reviews = vendor.Reviews ?? []
  const average = reviews.length
    ? reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviews.length
    : 0

  return { average, count: reviews.length }
}
const featuredScore = (vendor, index) => {
  const { average, count } = reviewStats(vendor)
  const serviceCount = vendor.VendorServices?.length ?? 0
  return average * 1000 + count * 10 + serviceCount - index / 100
}
const primaryService = (vendor) => vendor.VendorServices?.[0]
const serviceImage = (service) => {
  const images = Array.isArray(service?.images) ? service.images : []
  return resolveUrl(images[0]?.url || images[0])
}

export function FeaturedVendors() {
  const { data: vendors = [], isLoading, isError } = useGetVendorsQuery()
  const featuredVendors = vendors
    .map((vendor, index) => ({ ...vendor, _originalIndex: index }))
    .sort((a, b) => featuredScore(b, b._originalIndex) - featuredScore(a, a._originalIndex))
    .slice(0, 6)

  return (
    <section className="bg-gradient-to-b from-white via-yellow-soft/45 to-blue-soft/35 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Featured Vendors
            </h2>
            <p className="mt-2 text-lg text-muted-foreground">
              Real approved vendors now, ranked by customer ratings as reviews grow
            </p>
          </div>
          <Link to="/vendors">
            <Button variant="outline" className="group border-brand-yellow/45 bg-white text-primary hover:bg-yellow-soft">
              View All Vendors
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>

        {isLoading && (
          <div className="mt-12 rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
            Loading featured vendors...
          </div>
        )}

        {isError && (
          <div className="mt-12 rounded-2xl border border-border bg-card p-8 text-center text-red-600">
            Unable to load featured vendors.
          </div>
        )}

        {!isLoading && !isError && featuredVendors.length === 0 && (
          <div className="mt-12 rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
            No approved vendors available yet.
          </div>
        )}

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredVendors.map((vendor) => {
            const service = primaryService(vendor)
            const image = serviceImage(service) || resolveUrl(vendor.profile_image_url)
            const { average, count } = reviewStats(vendor)
            const serviceCount = vendor.VendorServices?.length ?? 0
            const title = vendor.business_name || vendor.name
            const category = service?.Category?.name || "Vendor"
            const city = service?.city || vendor.city
            const state = vendor.state
            const location = [city, state].filter(Boolean).join(", ") || "Location not added"

            return (
              <Link key={vendor.id} to={`/vendors/${vendor.id}`} className="group overflow-hidden rounded-2xl border border-brand-yellow/25 bg-card shadow-[0_18px_55px_rgba(16,24,40,0.10)] transition-all duration-300 hover:-translate-y-1 hover:border-brand-yellow/60 hover:shadow-xl">
                <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-yellow-soft to-blue-soft">
                  {image ? (
                    <img src={image} alt={title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-4xl font-bold text-primary/30">{title.charAt(0)}</span>
                    </div>
                  )}
                  <div className="absolute left-3 top-3 rounded-full bg-brand-blue px-3 py-1 text-xs font-semibold text-brand-yellow shadow-md shadow-black/15">
                    Featured
                  </div>
                  <button type="button" className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-muted-foreground transition-colors hover:text-primary">
                    <Heart className="h-4 w-4" />
                  </button>
                  {service?.price && (
                    <div className="absolute bottom-3 right-3 rounded-full border border-brand-yellow/35 bg-white/90 px-3 py-1 text-sm font-semibold text-foreground backdrop-blur-sm">
                      {money(service.pricing?.customerSubtotal || service.price)}{" "}
                      <span className="text-xs font-normal text-muted-foreground">starting</span>
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground group-hover:text-primary">{title}</h3>
                        <BadgeCheck className="h-4 w-4 text-primary" />
                      </div>
                      <p className="text-sm text-muted-foreground">{category}</p>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-accent text-accent" />
                      <span className="font-medium text-foreground">{count ? average.toFixed(1) : "New"}</span>
                      <span className="text-muted-foreground">({count} reviews)</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <BriefcaseBusiness className="h-4 w-4" />
                      <span>{serviceCount} services</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{location}</span>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
