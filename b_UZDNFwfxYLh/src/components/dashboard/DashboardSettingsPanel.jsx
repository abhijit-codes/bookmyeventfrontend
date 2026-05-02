import { useEffect, useState } from "react"
import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { Bell, ChevronRight, CircleHelp, Languages, LogOut, Moon, Music, Volume2 } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { logout } from "@/features/auth/authSlice"
import { useGetMeQuery, useGetVendorDashboardQuery, useUpdateMeMutation, useUpdateVendorProfileMutation } from "@/features/api/apiSlice"
import {
  applyAppSettings,
  defaultAppSettings,
  languageOptions,
  playOrderAlertSound,
  soundOptions,
  t,
  toApiSettings,
  toDashboardSettings,
} from "@/utils/appSettings"

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative h-8 w-14 rounded-full transition-colors ${checked ? "bg-primary" : "bg-muted"}`}
      aria-pressed={checked}
    >
      <span className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-7" : "translate-x-1"}`} />
    </button>
  )
}

function SelectRow({ icon: Icon, label, value, onChange, options }) {
  return (
    <label className="flex items-center gap-4 border-t border-border py-4">
      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon className="h-5 w-5" /></span>
      <span className="min-w-0 flex-1 font-medium text-foreground">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="max-w-[11rem] rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
      >
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
      <ChevronRight className="hidden h-5 w-5 text-muted-foreground sm:block" />
    </label>
  )
}

export function DashboardSettingsPanel({ role = "user" }) {
  const isVendor = role === "vendor"
  const userQuery = useGetMeQuery(undefined, { skip: isVendor })
  const vendorQuery = useGetVendorDashboardQuery(undefined, { skip: !isVendor })
  const account = isVendor ? vendorQuery.data : userQuery.data
  const [updateMe] = useUpdateMeMutation()
  const [updateVendorProfile] = useUpdateVendorProfileMutation()
  const [settings, setSettings] = useState(defaultAppSettings)
  const [message, setMessage] = useState("")
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const labels = (key) => t(settings.appLanguage, key)

  useEffect(() => {
    if (!account) return
    const accountSettings = toDashboardSettings(account)
    setSettings(accountSettings)
    applyAppSettings(accountSettings)
  }, [account])

  const saveSettings = async (nextSettings, successMessage) => {
    setSettings(nextSettings)
    applyAppSettings(nextSettings)
    const payload = toApiSettings(nextSettings)
    try {
      if (isVendor) await updateVendorProfile(payload).unwrap()
      else await updateMe(payload).unwrap()
      setMessage(successMessage)
    } catch {
      setSettings(toDashboardSettings(account))
      setMessage("Could not save settings. Please try again.")
    }
  }

  const update = (key, value) => {
    saveSettings({ ...settings, [key]: value }, labels("settingsSaved"))
  }

  const reset = () => {
    saveSettings(defaultAppSettings, labels("settingsReset"))
  }

  const handleLogout = () => {
    dispatch(logout())
    navigate(role === "vendor" ? "/vendor/login" : "/login", { replace: true })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{labels("settings")}</h1>
        <p className="text-muted-foreground">{labels("settingsDescription")}</p>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="text-lg font-semibold text-foreground">{labels("appSettings")}</h2>
        <div className="mt-4 flex items-center gap-4 py-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><Moon className="h-5 w-5" /></span>
          <span className="min-w-0 flex-1 font-medium text-foreground">{labels("darkTheme")}</span>
          <Toggle checked={settings.darkTheme} onChange={(value) => update("darkTheme", value)} />
        </div>
        <SelectRow icon={Languages} label={labels("appLanguage")} value={settings.appLanguage} onChange={(value) => update("appLanguage", value)} options={languageOptions} />
        <SelectRow icon={Music} label={labels("audioLanguage")} value={settings.audioLanguage} onChange={(value) => update("audioLanguage", value)} options={languageOptions} />
        <SelectRow icon={CircleHelp} label={labels("supportLanguage")} value={settings.supportLanguage} onChange={(value) => update("supportLanguage", value)} options={languageOptions} />
        <SelectRow icon={Bell} label={labels("orderAlertSound")} value={settings.orderAlertSound} onChange={(value) => update("orderAlertSound", value)} options={soundOptions.map(({ value, label }) => ({ value, label }))} />
        <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row">
          <Button type="button" variant="outline" onClick={() => playOrderAlertSound(settings.orderAlertSound)} className="sm:w-auto">
            <Volume2 className="mr-2 h-4 w-4" /> {labels("testAlertSound")}
          </Button>
          <Button type="button" variant="outline" onClick={reset} className="sm:w-auto">{labels("resetSettings")}</Button>
        </div>
        {message && <p className="mt-3 text-sm text-primary">{message}</p>}
      </div>

      <Button type="button" variant="outline" onClick={handleLogout} className="w-full border-primary py-6 text-base font-semibold text-primary hover:bg-primary/10">
        <LogOut className="mr-2 h-5 w-5" /> {labels("logout")}
      </Button>
    </div>
  )
}
