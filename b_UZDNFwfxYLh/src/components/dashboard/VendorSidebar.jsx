import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { cn } from "@/lib/utils";
import { logout } from "@/features/auth/authSlice";
import {
  LayoutDashboard,
  Calendar,
  Settings,
  HelpCircle,
  LogOut,
  Bell,
  MessageSquare,
  Star,
  User,
  Briefcase,
  BarChart3,
  X,
  Wallet,
} from "lucide-react";
import logoUrl from "@/assets/bookmyevent.jpeg";
import { t } from "@/utils/appSettings";
const API_ORIGIN = "https://bookmyeventbackend.onrender.com";
const resolveUrl = (url) => {
  if (!url) return "";
  return url.startsWith("http") ? url : `${API_ORIGIN}${url}`;
};

const vendorNavItems = [
  { href: "/vendor/dashboard", icon: LayoutDashboard, labelKey: "overview" },
  { href: "/vendor/dashboard/bookings", icon: Calendar, labelKey: "bookings" },
  { href: "/vendor/dashboard/services", icon: Briefcase, labelKey: "services" },
  { href: "/vendor/dashboard/profile", icon: User, labelKey: "profile" },
  {
    href: "/vendor/dashboard/messages",
    icon: MessageSquare,
    labelKey: "messages",
  },
  { href: "/vendor/dashboard/reviews", icon: Star, labelKey: "reviews" },
  { href: "/vendor/dashboard/wallet", icon: Wallet, labelKey: "wallet" },
  {
    href: "/vendor/dashboard/analytics",
    icon: BarChart3,
    labelKey: "analytics",
  },
  {
    href: "/vendor/dashboard/notifications",
    icon: Bell,
    labelKey: "notifications",
  },
  { href: "/vendor/dashboard/settings", icon: Settings, labelKey: "settings" },
];
export function VendorSidebar({ isOpen, onClose, vendor }) {
  const pathname = useLocation().pathname;
  const dispatch = useDispatch();
  const avatar = resolveUrl(vendor?.profile_image_url);
  const displayName = vendor?.business_name || vendor?.name || "Vendor Account";
  const language = vendor?.app_language || "en";
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "dashboard-sidebar-gradient fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-sidebar-border transition-transform lg:static lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-20 w-44 bg-gradient-to-r from-[#2D1B4E] via-[#D6336C] to-[#FF4D6D] flex items-center justify-center rounded-lg">
              <img
                src={logoUrl}
                alt="BookMyEvent logo"
                className="h-16 w-auto object-contain"
              />
            </div>{" "}
          </Link>
          <button className="lg:hidden" onClick={onClose}>
            <X className="h-5 w-5 text-sidebar-foreground" />
          </button>
        </div>

        <div className="border-b border-sidebar-border p-4">
          <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/10 px-3 py-2 shadow-lg shadow-black/10">
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-sidebar-primary text-sm font-semibold text-sidebar-primary-foreground">
              {avatar ? (
                <img
                  src={avatar}
                  alt={displayName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  {displayName.charAt(0)}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs text-sidebar-foreground/70">
                {t(language, "vendorAccount")}
              </p>
              <p className="truncate font-medium text-sidebar-foreground">
                {displayName}
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {vendorNavItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-white/15 text-sidebar-accent-foreground shadow-sm ring-1 ring-white/10"
                        : "text-sidebar-foreground/72 hover:bg-white/10 hover:text-sidebar-accent-foreground",
                    )}
                    onClick={onClose}
                  >
                    <item.icon className="h-5 w-5" />
                    {t(language, item.labelKey)}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-sidebar-border p-4">
          <Link
            to="/help"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <HelpCircle className="h-5 w-5" />
            {t(language, "helpSupport")}
          </Link>
          <button
            onClick={() => dispatch(logout())}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-soft transition-colors hover:bg-white/10 hover:text-white"
          >
            <LogOut className="h-5 w-5" />
            {t(language, "logOut")}
          </button>
        </div>
      </aside>
    </>
  );
}
