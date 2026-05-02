import { useEffect, useMemo, useState } from "react"
import { useSelector } from "react-redux"
import { Link, useSearchParams } from "react-router-dom"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { useAddMyFavoriteMutation, useGetMyFavoritesQuery, useGetVendorsQuery, useRemoveMyFavoriteMutation } from "@/features/api/apiSlice"
import { BadgeCheck, Heart, MapPin, Search, SlidersHorizontal, Star, X } from "lucide-react"

const categories = ["All", "Photography", "Catering", "Decoration", "DJs", "Planners", "Venues"]
const eventCategories = {
  wedding: ["Photography", "Catering", "DJs", "Venues"],
  party: ["Photography", "Decoration", "DJs", "Venues"],
}
const API_ORIGIN = (import.meta.env.VITE_API_URL )

const vendorCategory = (vendor) => vendor.VendorServices?.[0]?.Category?.name || "Vendor"
const vendorLocation = (vendor) => [vendor.city, vendor.state].filter(Boolean).join(", ")
const firstService = (vendor) => vendor.VendorServices?.[0]
const imageUrl = (service) => {
  const image = service?.images?.[0]
  if (!image?.url) return ""
  return image.url.startsWith("http") ? image.url : `${API_ORIGIN}${image.url}`
}
const eventTitle = (event) => event === "wedding" ? "Wedding Vendors" : event === "party" ? "Party Vendors" : "Find Vendors"

export default function VendorsPage() {
  const account = useSelector((state) => state.auth.account)
  const [searchParams, setSearchParams] = useSearchParams()
  const eventParam = searchParams.get("event") || ""
  const event = eventCategories[eventParam] ? eventParam : ""
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "All")
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "")
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    city: searchParams.get("city") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
  })
  const { data: favorites = [] } = useGetMyFavoritesQuery(undefined, { skip: !account || account.role !== "user" })
  const [addFavorite] = useAddMyFavoriteMutation()
  const [removeFavorite] = useRemoveMyFavoriteMutation()
  const favoriteIds = useMemo(() => favorites.map((favorite) => Number(favorite.vendor_id)), [favorites])
  const query = {
    search: searchQuery || undefined,
    category: !event && selectedCategory !== "All" ? selectedCategory : undefined,
    city: filters.city || undefined,
    minPrice: filters.minPrice || undefined,
    maxPrice: filters.maxPrice || undefined,
  }
  const { data: vendors = [], isLoading, isError } = useGetVendorsQuery(query)
  const visibleCategories = event ? ["All", ...eventCategories[event]] : categories
  const visibleVendors = event
    ? vendors.filter((vendor) => {
      const allowed = selectedCategory !== "All" ? [selectedCategory] : eventCategories[event]
      return allowed.includes(vendorCategory(vendor))
    })
    : vendors

  useEffect(() => {
    setSelectedCategory(searchParams.get("category") || "All")
    setSearchQuery(searchParams.get("search") || "")
    setFilters({
      city: searchParams.get("city") || "",
      minPrice: searchParams.get("minPrice") || "",
      maxPrice: searchParams.get("maxPrice") || "",
    })
  }, [searchParams])

  const updateUrl = (next = {}) => {
    const params = new URLSearchParams(searchParams)
    Object.entries(next).forEach(([key, value]) => {
      if (value) params.set(key, value)
      else params.delete(key)
    })
    setSearchParams(params)
  }

  const applySearch = (value) => {
    setSearchQuery(value)
    updateUrl({ search: value.trim() })
  }

  const applyCategory = (category) => {
    setSelectedCategory(category)
    updateUrl({ category: category === "All" ? "" : category })
  }

  const clearFilters = () => {
    setFilters({ city: "", minPrice: "", maxPrice: "" })
    updateUrl({ city: "", minPrice: "", maxPrice: "" })
  }

  const toggleFavorite = async (event, vendorId) => {
    event.preventDefault()
    event.stopPropagation()
    if (!account) return
    if (favoriteIds.includes(Number(vendorId))) await removeFavorite(vendorId)
    else await addFavorite(vendorId)
  }

  return (
    <div className="public-white-page flex min-h-screen flex-col bg-white">
      <Header />
      <main className="flex-1 bg-white">
        <div className="border-b border-border bg-white">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{eventTitle(event)}</h1>
                <p className="mt-1 text-muted-foreground">{visibleVendors.length} approved vendors available</p>
              </div>
              <div className="flex gap-3">
                <div className="relative flex-1 sm:w-72 sm:flex-none">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Search name, city..." value={searchQuery} onChange={(e) => applySearch(e.target.value)} className="pl-10" />
                </div>
                <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  <span className="hidden sm:inline">Filters</span>
                </Button>
              </div>
            </div>
            <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
              {visibleCategories.map((category) => (
                <button key={category} onClick={() => applyCategory(category)} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${selectedCategory === category ? "bg-primary text-primary-foreground" : "bg-background text-foreground hover:bg-muted"}`}>
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {showFilters && (
          <div className="border-b border-border bg-white">
            <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-foreground">Filters</h3>
                <button onClick={() => setShowFilters(false)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Input placeholder="City" value={filters.city} onChange={(e) => { const value = e.target.value; setFilters((current) => ({ ...current, city: value })); updateUrl({ city: value }) }} />
                <Input placeholder="Minimum price" value={filters.minPrice} onChange={(e) => { const value = e.target.value; setFilters((current) => ({ ...current, minPrice: value })); updateUrl({ minPrice: value }) }} />
                <Input placeholder="Maximum price" value={filters.maxPrice} onChange={(e) => { const value = e.target.value; setFilters((current) => ({ ...current, maxPrice: value })); updateUrl({ maxPrice: value }) }} />
                <Button onClick={clearFilters} variant="outline">Clear Filters</Button>
              </div>
            </div>
          </div>
        )}

        <div className="mx-auto max-w-7xl bg-white px-4 py-8 sm:px-6 lg:px-8">
          {isLoading || isError ? (
            <div className="py-12 text-center text-lg text-muted-foreground">{isLoading ? "Loading vendors..." : "Unable to load vendors from backend."}</div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {visibleVendors.map((vendor) => {
                const service = firstService(vendor)
                const photo = imageUrl(service)
                return (
                  <Link key={vendor.id} to={`/vendors/${vendor.id}`} className="group overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                    <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20">
                      {photo ? <img src={photo} alt={service.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" /> : <div className="absolute inset-0 flex items-center justify-center"><span className="text-4xl font-bold text-primary/30">{vendor.name.charAt(0)}</span></div>}
                      <div className="absolute left-3 top-3 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-foreground">Approved</div>
                      <button onClick={(event) => toggleFavorite(event, vendor.id)} className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-muted-foreground transition-colors hover:text-red-500"><Heart className={`h-4 w-4 ${favoriteIds.includes(vendor.id) ? "fill-red-500 text-red-500" : ""}`} /></button>
                      <div className="absolute bottom-3 right-3 rounded-full bg-white/90 px-3 py-1 text-sm font-semibold text-foreground backdrop-blur-sm">₹{Number(service?.pricing?.customerSubtotal || service?.price || 0).toLocaleString("en-IN")} <span className="text-xs font-normal text-muted-foreground">starting</span></div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-2"><h3 className="font-semibold text-foreground group-hover:text-primary">{vendor.business_name || vendor.name}</h3><BadgeCheck className="h-4 w-4 text-primary" /></div>
                      <p className="text-sm text-muted-foreground">{vendorCategory(vendor)}</p>
                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{service?.description || "Verified event service vendor"}</p>
                      <div className="mt-3 flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1"><Star className="h-4 w-4 fill-accent text-accent" /><span className="font-medium text-foreground">New</span></div>
                        <div className="flex items-center gap-1 text-muted-foreground"><MapPin className="h-4 w-4" /><span className="truncate">{vendorLocation(vendor)}</span></div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
          {!isLoading && !isError && visibleVendors.length === 0 && <div className="py-12 text-center text-lg text-muted-foreground">No approved vendors found.</div>}
        </div>
      </main>
      <Footer />
    </div>
  )
}
