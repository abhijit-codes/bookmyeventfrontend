import { useState } from "react";
import { Outlet } from "react-router-dom";
import { AdminSidebar } from "@/components/dashboard/AdminSidebar";
import { Bell, Menu, Search, Shield } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Link } from 'react-router-dom';
export default function AdminDashboardLayout({ children = <Outlet />, }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    return (<div className="dashboard-theme flex min-h-screen min-w-0 bg-background">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)}/>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top Bar */}
        <header className="dashboard-topbar sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-6 w-6 text-foreground"/>
            </button>
            <div className="hidden items-center gap-2 rounded-lg border border-border bg-white/75 px-3 py-2 shadow-sm sm:flex">
              <Search className="h-4 w-4 text-muted-foreground"/>
              <input type="text" placeholder="Search users, vendors, bookings..." className="w-64 border-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground"/>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-muted-foreground"/>
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-accent"/>
            </Button>
            <Link to="/admin/dashboard/settings">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20">
                <Shield className="h-5 w-5"/>
              </div>
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <main className="min-w-0 flex-1 overflow-auto p-3 sm:p-6">{children}</main>
      </div>
    </div>);
}
