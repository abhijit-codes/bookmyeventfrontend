import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { useApproveVendorMutation, useGetAdminVendorsQuery, useRejectVendorMutation, useSuspendVendorMutation } from "@/features/api/apiSlice"
import { BadgeCheck, CheckCircle, Eye, Search, Store, XCircle } from "lucide-react"

const tabs = ["all", "approved", "pending", "rejected", "suspended"]
const API_ORIGIN = (import.meta.env.VITE_API_URL ?? "").replace("/api/v1", "")
const resolveUrl = (url) => !url ? "" : url.startsWith("http") ? url : `${API_ORIGIN}${url}`
const date = (value) => value ? new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value)) : "N/A"

export default function AdminVendorsPage() {
  const [params] = useSearchParams()
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedVendor, setSelectedVendor] = useState(null)
  const { data: vendors = [], isLoading, isError } = useGetAdminVendorsQuery({ search: searchQuery || undefined, status: activeTab }, { pollingInterval: 30000 })
  const [approveVendor] = useApproveVendorMutation()
  const [rejectVendor] = useRejectVendorMutation()
  const [suspendVendor] = useSuspendVendorMutation()

  useEffect(() => {
    const id = params.get("id")
    if (id && vendors.length) setSelectedVendor(vendors.find((vendor) => String(vendor.id) === id) || null)
  }, [params, vendors])

  const color = (status) => {
    if (status === "approved") return "bg-green-100 text-green-700"
    if (status === "pending") return "bg-yellow-100 text-yellow-700"
    if (status === "rejected" || status === "suspended") return "bg-red-100 text-red-700"
    return "bg-gray-100 text-gray-700"
  }

  const act = async (action, id) => {
    await action(id)
    setSelectedVendor(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">Vendors</h1><p className="text-muted-foreground">View registration details, documents, approve, or reject.</p></div>
        <Button className="bg-primary hover:bg-primary/90"><Store className="mr-2 h-4 w-4" />Vendor Approval Queue</Button>
      </div>

      <div className="flex gap-2 overflow-x-auto">{tabs.map((tab) => <button key={tab} onClick={() => setActiveTab(tab)} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium capitalize transition-colors ${activeTab === tab ? "bg-primary text-primary-foreground" : "bg-muted text-foreground hover:bg-muted/80"}`}>{tab}</button>)}</div>
      <div className="relative max-w-md"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Search vendors..." value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} className="pl-10" /></div>

      <div className="rounded-xl border border-border bg-card">
        <div className="divide-y divide-border">
          {isLoading && <p className="p-5 text-sm text-muted-foreground">Loading vendors...</p>}
          {isError && <p className="p-5 text-sm text-red-600">Unable to load vendors.</p>}
          {vendors.map((vendor) => (
            <div key={vendor.id} className="p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 items-center gap-4">
                  <div className="h-12 w-12 overflow-hidden rounded-xl bg-primary/10">{vendor.profile_image_url ? <img src={resolveUrl(vendor.profile_image_url)} alt={vendor.name} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-lg font-bold text-primary">{vendor.name.charAt(0)}</div>}</div>
                  <div className="min-w-0"><div className="flex items-center gap-2"><h3 className="truncate font-semibold text-foreground">{vendor.business_name || vendor.name}</h3>{vendor.status === "approved" && <BadgeCheck className="h-4 w-4 text-primary" />}</div><p className="truncate text-sm text-muted-foreground">{vendor.name} - {vendor.email} - {vendor.phone}</p><p className="truncate text-xs text-muted-foreground">{vendor.address1}, {vendor.city}, {vendor.state} {vendor.pincode}</p></div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${color(vendor.status)}`}>{vendor.status}</span>
                  <Button size="sm" variant="outline" onClick={() => setSelectedVendor(vendor)}><Eye className="mr-1 h-3 w-3" />View</Button>
                  {vendor.status === "pending" && <><Button size="sm" onClick={() => act(approveVendor, vendor.id)} className="bg-primary hover:bg-primary/90"><CheckCircle className="mr-1 h-3 w-3" />Approve</Button><Button size="sm" variant="outline" onClick={() => act(rejectVendor, vendor.id)}><XCircle className="mr-1 h-3 w-3" />Reject</Button></>}
                  {vendor.status === "approved" && <Button size="sm" variant="outline" onClick={() => act(suspendVendor, vendor.id)}><XCircle className="mr-1 h-3 w-3" />Suspend</Button>}
                  {vendor.status === "suspended" && <Button size="sm" onClick={() => act(approveVendor, vendor.id)} className="bg-primary hover:bg-primary/90"><CheckCircle className="mr-1 h-3 w-3" />Reactivate</Button>}
                </div>
              </div>
            </div>
          ))}
          {!isLoading && vendors.length === 0 && <p className="p-5 text-sm text-muted-foreground">No vendors found.</p>}
        </div>
      </div>

      {selectedVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-5xl overflow-auto rounded-xl border border-border bg-card p-5 shadow-2xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div><h2 className="text-xl font-bold text-foreground">{selectedVendor.business_name || selectedVendor.name}</h2><p className="text-sm text-muted-foreground">{selectedVendor.name} - {selectedVendor.email} - {selectedVendor.phone}</p><p className="text-sm text-muted-foreground">{selectedVendor.address1}, {selectedVendor.address2} {selectedVendor.city}, {selectedVendor.state} {selectedVendor.pincode}</p></div>
              <div className="flex flex-wrap gap-2"><Button variant="outline" onClick={() => setSelectedVendor(null)}>Close</Button>{selectedVendor.status === "pending" && <><Button onClick={() => act(approveVendor, selectedVendor.id)} className="bg-primary hover:bg-primary/90">Approve</Button><Button variant="outline" onClick={() => act(rejectVendor, selectedVendor.id)}>Reject</Button></>}</div>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <Info label="Organisation" value={selectedVendor.organisation_name || "N/A"} />
              <Info label="Organisation No." value={selectedVendor.organisation_number || "N/A"} />
              <Info label="GSTIN" value={selectedVendor.gstin || "N/A"} />
              <Info label="Alt Phone" value={selectedVendor.alt_phone || "N/A"} />
              <Info label="Joined" value={date(selectedVendor.createdAt)} />
              <Info label="Services" value={selectedVendor.VendorServices?.length || 0} />
            </div>
            <h3 className="mt-6 font-semibold text-foreground">Documents</h3>
            <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {(selectedVendor.VendorDocuments || []).map((doc) => (
                <a key={doc.id} href={resolveUrl(doc.url)} target="_blank" rel="noreferrer" className="overflow-hidden rounded-xl border border-border bg-muted/30">
                  <div className="aspect-[4/3] bg-muted">{doc.url ? <img src={resolveUrl(doc.url)} alt={doc.type} className="h-full w-full object-cover" /> : null}</div>
                  <div className="p-3"><p className="text-sm font-medium capitalize text-foreground">{doc.type.replace(/_/g, " ")}</p><p className="text-xs capitalize text-muted-foreground">{doc.status}</p></div>
                </a>
              ))}
              {(!selectedVendor.VendorDocuments || selectedVendor.VendorDocuments.length === 0) && <p className="text-sm text-muted-foreground">No documents uploaded.</p>}
            </div>
            <h3 className="mt-6 font-semibold text-foreground">Business services</h3>
            <div className="mt-3 divide-y divide-border rounded-xl border border-border">{(selectedVendor.VendorServices || []).map((service) => <div key={service.id} className="p-3 text-sm"><p className="font-medium">{service.title}</p><p className="text-muted-foreground">{service.Category?.name || "Service"} - Rs.{Number(service.price || 0).toLocaleString("en-IN")}</p></div>)}</div>
          </div>
        </div>
      )}
    </div>
  )
}

function Info({ label, value }) {
  return <div className="rounded-lg bg-muted p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 font-semibold text-foreground">{value}</p></div>
}
