import { Mail, Phone } from "lucide-react"
import { useSelector } from "react-redux"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/Button"
import { useGetMeQuery, useGetVendorDashboardQuery } from "@/features/api/apiSlice"
import { t } from "@/utils/appSettings"

const supportPhone = "8144273014"
const supportEmail = "bookmyevent326@gmail.com"

export default function HelpPage() {
  const role = useSelector((state) => state.auth.account?.role)
  const isVendor = role === "vendor"
  const isCustomer = role === "user"
  const userQuery = useGetMeQuery(undefined, { skip: !isCustomer })
  const vendorQuery = useGetVendorDashboardQuery(undefined, { skip: !isVendor })
  const language = (isVendor ? vendorQuery.data?.app_language : userQuery.data?.app_language) || "en"

  return (
    <main className="min-h-screen bg-background px-4 py-10 text-foreground sm:px-6">
      <div className="mx-auto max-w-3xl">
        <Link to={isVendor ? "/vendor/dashboard/settings" : "/dashboard/settings"} className="text-sm font-medium text-primary">
          BookMyEvent
        </Link>
        <div className="mt-6 rounded-xl border border-border bg-card p-6 shadow-sm">
          <h1 className="text-3xl font-bold">{t(language, "helpTitle")}</h1>
          <p className="mt-2 text-muted-foreground">{t(language, "helpDescription")}</p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <a href={`tel:${supportPhone}`} className="rounded-lg border border-border p-4 transition-colors hover:border-primary">
              <Phone className="h-5 w-5 text-primary" />
              <p className="mt-3 text-sm text-muted-foreground">{t(language, "phone")}</p>
              <p className="font-semibold">{supportPhone}</p>
            </a>
            <a href={`mailto:${supportEmail}`} className="rounded-lg border border-border p-4 transition-colors hover:border-primary">
              <Mail className="h-5 w-5 text-primary" />
              <p className="mt-3 text-sm text-muted-foreground">{t(language, "email")}</p>
              <p className="break-all font-semibold">{supportEmail}</p>
            </a>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild>
              <a href={`tel:${supportPhone}`}>{t(language, "phone")}</a>
            </Button>
            <Button asChild variant="outline">
              <a href={`mailto:${supportEmail}`}>{t(language, "email")}</a>
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}
