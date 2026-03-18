import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Package,
  FileText,
  Receipt,
  Calendar,
  Wallet,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

interface MenuItem {
  icon: typeof LayoutDashboard;
  label: string;
  path: string;
  roles?: ('admin' | 'owner' | 'staff' | 'calendar_only')[];
}

const allMenuItems: MenuItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Users, label: "Pelanggan", path: "/pelanggan" },
  { icon: Package, label: "Order", path: "/order" },
  { icon: Calendar, label: "Kalender", path: "/kalender" },
  { icon: FileText, label: "Invoice", path: "/invoice" },
  { icon: Receipt, label: "Pembayaran", path: "/pembayaran" },
  { icon: Wallet, label: "Gaji Karyawan", path: "/gaji", roles: ['admin', 'owner'] },
  { icon: BarChart3, label: "Laporan", path: "/laporan" },
  { icon: Briefcase, label: "Case", path: "/case" },
  { icon: Trash2, label: "Recycle Bin", path: "/recycle-bin" },
];

const bottomItems: MenuItem[] = [
  { icon: Settings, label: "Pengaturan", path: "/pengaturan", roles: ['admin'] },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut, roles, hasRole } = useAuth();

  // Check if user is calendar_only (only has calendar_only role)
  const isCalendarOnly = roles.length === 1 && hasRole('calendar_only');

  // Filter menu items based on user roles
  const menuItems = allMenuItems.filter(item => {
    // If calendar_only user, only show Kalender
    if (isCalendarOnly) {
      return item.path === '/kalender';
    }
    // If no specific roles required, show to all
    if (!item.roles) return true;
    // Otherwise check if user has any of the required roles
    return item.roles.some(role => hasRole(role));
  });

  // Filter bottom items based on roles
  const filteredBottomItems = bottomItems.filter(item => {
    if (isCalendarOnly) return false;
    if (!item.roles) return true;
    return item.roles.some(role => hasRole(role));
  });

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const getUserInitials = () => {
    if (!user?.email) return 'U';
    return user.email.substring(0, 2).toUpperCase();
  };

  const getUserRole = () => {
    if (roles.includes('admin')) return 'Admin';
    if (roles.includes('owner')) return 'Owner';
    if (roles.includes('staff')) return 'Staff';
    if (roles.includes('calendar_only')) return 'Kalender Only';
    return 'User';
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col bg-sidebar transition-all duration-300",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo Section */}
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary">
              <span className="text-lg font-bold text-sidebar-primary-foreground">CS</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-sidebar-foreground">Creative Shoot</span>
              <span className="text-xs text-sidebar-muted">CRM System</span>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary">
            <span className="text-lg font-bold text-sidebar-primary-foreground">CS</span>
          </div>
        )}
      </div>

      {/* User Info */}
      <div className={cn(
        "border-b border-sidebar-border p-4",
        collapsed && "flex justify-center"
      )}>
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sidebar-accent">
              <span className="text-sm font-medium text-sidebar-accent-foreground">{getUserInitials()}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-sidebar-foreground truncate max-w-[140px]">{user?.email || 'Guest'}</span>
              <span className="text-xs text-sidebar-muted">{getUserRole()}</span>
            </div>
          </div>
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sidebar-accent">
            <span className="text-sm font-medium text-sidebar-accent-foreground">{getUserInitials()}</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1.5 overflow-y-auto p-4">
        <div className={cn("mb-3 px-3", collapsed && "hidden")}>
          <span className="text-[10px] font-bold uppercase tracking-widest text-sidebar-muted">
            Menu Utama
          </span>
        </div>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "sidebar-item",
                isActive && "active"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive && "text-sidebar-primary-foreground")} />
              {!collapsed && <span className="flex-1">{item.label}</span>}
              {isActive && !collapsed && (
                <div className="h-2 w-2 rounded-full bg-sidebar-primary-foreground" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-sidebar-border p-4 space-y-1.5">
        {filteredBottomItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "sidebar-item",
                isActive && "active"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
        <button
          onClick={handleLogout}
          className="sidebar-item w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
          title={collapsed ? "Keluar" : undefined}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span>Keluar</span>}
        </button>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border border-sidebar-border bg-sidebar text-sidebar-foreground shadow-md transition-colors hover:bg-sidebar-accent"
      >
        {collapsed ? (
          <ChevronRight className="h-3.5 w-3.5" />
        ) : (
          <ChevronLeft className="h-3.5 w-3.5" />
        )}
      </button>
    </aside>
  );
}
