import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { LayoutDashboard, Calendar, Heart, Settings, HelpCircle, LogOut, Bell, MessageSquare, CreditCard, User, X, } from "lucide-react";
import logoUrl from "@/assets/bookmyevent.jpeg";
import { useDispatch } from "react-redux";
import { logout } from "@/features/auth/authSlice";
import { t } from "@/utils/appSettings";

const API_ORIGIN = (import.meta.env.VITE_API_URL ?? "").replace("/api/v1", "")
const resolveUrl = (url) => {
  if (!url) return ""
  return url.startsWith("http") ? url : `${API_ORIGIN}${url}`
}

const userNavItems = [
    { href: "/dashboard", icon: LayoutDashboard, labelKey: "overview" },
    { href: "/dashboard/bookings", icon: Calendar, labelKey: "myBookings" },
    { href: "/dashboard/favorites", icon: Heart, labelKey: "favorites" },
    { href: "/dashboard/messages", icon: MessageSquare, labelKey: "messages" },
    { href: "/dashboard/notifications", icon: Bell, labelKey: "notifications" },
    { href: "/dashboard/payments", icon: CreditCard, labelKey: "payments" },
    { href: "/dashboard/profile", icon: User, labelKey: "profile" },
    { href: "/dashboard/settings", icon: Settings, labelKey: "settings" },
];
export function DashboardSidebar({ isOpen, onClose, account }) {
    const pathname = useLocation().pathname;
    const dispatch = useDispatch();
    const avatar = resolveUrl(account?.profile_image_url);
    const displayName = account?.name || "Customer";
    const language = account?.app_language || "en";
    return (<>
      {/* Mobile overlay */}
      {isOpen && (<div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onClose}/>)}

      <aside className={cn("dashboard-sidebar-gradient fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-sidebar-border transition-transform lg:static lg:translate-x-0", isOpen ? "translate-x-0" : "-translate-x-full")}>
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
          <Link to="/" className="flex items-center gap-2">
            <img src={logoUrl} alt="BookMyEvent logo" className="h-15 w-64  bg-white object-contain "/>
          </Link>
          <button className="lg:hidden" onClick={onClose}>
            <X className="h-5 w-5 text-sidebar-foreground"/>
          </button>
        </div>

        <div className="border-b border-sidebar-border p-4">
          <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/10 px-3 py-2 shadow-lg shadow-black/10">
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-sidebar-primary text-sm font-semibold text-sidebar-primary-foreground">
              {avatar ? <img src={avatar} alt={displayName} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center">{displayName.charAt(0)}</div>}
            </div>
            <div className="min-w-0">
              <p className="text-xs text-sidebar-foreground/70">{t(language, "customerAccount")}</p>
              <p className="truncate font-medium text-sidebar-foreground">{displayName}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {userNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (<li key={item.href}>
                  <Link to={item.href} className={cn("flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors", isActive
                    ? "bg-white/15 text-sidebar-accent-foreground shadow-sm ring-1 ring-white/10"
                    : "text-sidebar-foreground/72 hover:bg-white/10 hover:text-sidebar-accent-foreground")} onClick={onClose}>
                    <item.icon className="h-5 w-5"/>
                    {t(language, item.labelKey)}
                  </Link>
                </li>);
        })}
          </ul>
        </nav>

        <div className="border-t border-sidebar-border p-4">
          <Link to="/help" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
            <HelpCircle className="h-5 w-5"/>
            {t(language, "helpSupport")}
          </Link>
          <button onClick={() => dispatch(logout())} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-soft transition-colors hover:bg-white/10 hover:text-white">
            <LogOut className="h-5 w-5"/>
            {t(language, "logOut")}
          </button>
        </div>
      </aside>
    </>);
}
