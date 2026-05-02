import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { logout } from "@/features/auth/authSlice";
import {
  LayoutDashboard,
  Users,
  Store,
  Calendar,
  DollarSign,
  BarChart3,
  Settings,
  Shield,
  FileText,
  Bell,
  HelpCircle,
  LogOut,
  X,
} from "lucide-react";
import logoUrl from "@/assets/bookmyevent.jpeg";
const adminNavItems = [
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "Overview" },
  { href: "/admin/dashboard/users", icon: Users, label: "Users" },
  { href: "/admin/dashboard/vendors", icon: Store, label: "Vendors" },
  { href: "/admin/dashboard/bookings", icon: Calendar, label: "Bookings" },
  {
    href: "/admin/dashboard/transactions",
    icon: DollarSign,
    label: "Transactions",
  },
  { href: "/admin/dashboard/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/admin/dashboard/reports", icon: FileText, label: "Reports" },
  { href: "/admin/dashboard/moderation", icon: Shield, label: "Moderation" },
  {
    href: "/admin/dashboard/notifications",
    icon: Bell,
    label: "Notifications",
  },
  { href: "/admin/dashboard/settings", icon: Settings, label: "Settings" },
];
export function AdminSidebar({ isOpen, onClose }) {
  const pathname = useLocation().pathname;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleLogout = () => {
    dispatch(logout());
    navigate("/admin/login", { replace: true });
  };
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
            </div>
          </Link>
          <button className="lg:hidden" onClick={onClose}>
            <X className="h-5 w-5 text-sidebar-foreground" />
          </button>
        </div>

        <div className="border-b border-sidebar-border p-4">
          <div className="rounded-lg border border-white/10 bg-white/10 px-3 py-2 shadow-lg shadow-black/10">
            <p className="text-xs text-brand-yellow">Admin Panel</p>
            <p className="font-medium text-sidebar-foreground">
              System Administrator
            </p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {adminNavItems.map((item) => {
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
                    {item.label}
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
            Help & Support
          </Link>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-soft transition-colors hover:bg-white/10 hover:text-white"
          >
            <LogOut className="h-5 w-5" />
            Log Out
          </button>
        </div>
      </aside>
    </>
  );
}
