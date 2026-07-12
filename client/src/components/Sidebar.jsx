import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  Package,
  ArrowLeftRight,
  CalendarDays,
  Wrench,
  ClipboardCheck,
  BarChart3,
  Bell,
  LogOut,
  ChevronRight,
} from "lucide-react";
import useAuthStore from "../store/authStore.js";

const navItems = [
  {
    label: "Dashboard",
    to: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Organization Setup",
    to: "/organization",
    icon: Building2,
    adminOnly: true,
  },
  {
    label: "Assets",
    to: "/assets",
    icon: Package,
  },
  {
    label: "Allocation & Transfer",
    to: "/allocations",
    icon: ArrowLeftRight,
  },
  {
    label: "Resource Booking",
    to: "/bookings",
    icon: CalendarDays,
  },
  {
    label: "Maintenance",
    to: "/maintenance",
    icon: Wrench,
  },
  {
    label: "Audit",
    to: "/audits",
    icon: ClipboardCheck,
  },
  {
    label: "Reports",
    to: "/reports",
    icon: BarChart3,
  },
  {
    label: "Notifications",
    to: "/notifications",
    icon: Bell,
  },
];

const Sidebar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const visibleItems = navItems.filter(
    (item) => !item.adminOnly || user?.role === "admin"
  );

  return (
    <aside className="flex h-screen w-60 flex-col border-r border-border bg-surface-100 flex-shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-border">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500">
          <Package size={16} className="text-white" />
        </div>
        <span className="text-base font-bold text-white tracking-tight">
          AssetFlow
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
        {visibleItems.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-primary-500/15 text-primary-400 border border-primary-500/20"
                  : "text-slate-400 hover:bg-surface-50 hover:text-slate-200 border border-transparent"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={16}
                  className={
                    isActive
                      ? "text-primary-400"
                      : "text-slate-500 group-hover:text-slate-300"
                  }
                />
                <span className="flex-1">{label}</span>
                {isActive && (
                  <ChevronRight size={12} className="text-primary-400" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User profile + logout */}
      <div className="border-t border-border px-3 py-4 space-y-2">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-surface-50">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-500/20 text-primary-400 text-sm font-semibold flex-shrink-0">
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-200 truncate">
              {user?.name || "User"}
            </p>
            <p className="text-xs text-slate-500 capitalize">
              {user?.role?.replace("_", " ") || ""}
            </p>
          </div>
        </div>
        <button
          id="sidebar-logout-btn"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 border border-transparent hover:border-red-500/20"
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
