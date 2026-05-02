import { useGetMeQuery, useGetVendorDashboardQuery } from "@/features/api/apiSlice"
import { t, toDashboardSettings } from "@/utils/appSettings"

export function useDashboardText(role = "user") {
  const isVendor = role === "vendor"
  const userQuery = useGetMeQuery(undefined, { skip: isVendor })
  const vendorQuery = useGetVendorDashboardQuery(undefined, { skip: !isVendor })
  const account = isVendor ? vendorQuery.data : userQuery.data
  const language = toDashboardSettings(account).appLanguage

  return {
    language,
    labels: (key) => t(language, key),
  }
}
