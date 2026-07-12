import { useState, useEffect, useCallback } from "react";
import {
  Package,
  Layers,
  Wrench,
  CalendarDays,
  ArrowLeftRight,
  Clock,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import api from "../services/api.js";
import useAuthStore from "../store/authStore.js";

const KPI_CARDS = [
  {
    key: "availableAssets",
    label: "Available Assets",
    icon: Package,
    colorClass: "text-emerald-400",
    bgClass: "bg-emerald-400/10",
    borderClass: "hover:border-emerald-400/30",
  },
  {
    key: "allocatedAssets",
    label: "Allocated Assets",
    icon: Layers,
    colorClass: "text-primary-400",
    bgClass: "bg-primary-400/10",
    borderClass: "hover:border-primary-400/30",
  },
  {
    key: "maintenanceToday",
    label: "Maintenance Today",
    icon: Wrench,
    colorClass: "text-amber-400",
    bgClass: "bg-amber-400/10",
    borderClass: "hover:border-amber-400/30",
  },
  {
    key: "activeBookings",
    label: "Active Bookings",
    icon: CalendarDays,
    colorClass: "text-blue-400",
    bgClass: "bg-blue-400/10",
    borderClass: "hover:border-blue-400/30",
  },
  {
    key: "pendingTransfers",
    label: "Pending Transfers",
    icon: ArrowLeftRight,
    colorClass: "text-violet-400",
    bgClass: "bg-violet-400/10",
    borderClass: "hover:border-violet-400/30",
  },
  {
    key: "upcomingReturns",
    label: "Upcoming Returns",
    icon: Clock,
    colorClass: "text-sky-400",
    bgClass: "bg-sky-400/10",
    borderClass: "hover:border-sky-400/30",
  },
  {
    key: "overdueReturns",
    label: "Overdue Returns",
    icon: AlertTriangle,
    colorClass: "text-red-400",
    bgClass: "bg-red-400/10",
    borderClass: "hover:border-red-400/30",
  },
];

const defaultSummary = {
  availableAssets: 0,
  allocatedAssets: 0,
  maintenanceToday: 0,
  activeBookings: 0,
  pendingTransfers: 0,
  upcomingReturns: 0,
  overdueReturns: 0,
};

const Dashboard = () => {
  const { user } = useAuthStore();
  const [summary, setSummary] = useState(defaultSummary);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState("");

  const fetchSummary = useCallback(async () => {
    try {
      const res = await api.get("/dashboard/summary");
      if (res.data.success) {
        setSummary(res.data.data);
        setLastUpdated(new Date());
        setError("");
      }
    } catch (err) {
      setError("Could not load dashboard data.");
      setSummary(defaultSummary);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
    // Poll every 15 seconds when tab is active (§13)
    const interval = setInterval(() => {
      if (!document.hidden) fetchSummary();
    }, 15000);
    return () => clearInterval(interval);
  }, [fetchSummary]);

  const roleLabel = user?.role?.replace(/_/g, " ") ?? "";
  const greeting = new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title">
            {greeting}, {user?.name?.split(" ")[0] || "there"} 👋
          </h1>
          <p className="page-subtitle capitalize">
            {roleLabel} · {user?.department?.name || "No department assigned"}
          </p>
        </div>
        <button
          id="dashboard-refresh-btn"
          onClick={fetchSummary}
          disabled={isLoading}
          className="btn-secondary flex items-center gap-2 text-sm"
          title="Refresh dashboard"
        >
          <RefreshCw
            size={14}
            className={isLoading ? "animate-spin text-primary-400" : ""}
          />
          Refresh
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2.5 bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-3">
          <AlertTriangle size={16} className="text-amber-400 flex-shrink-0" />
          <p className="text-amber-300 text-sm">{error}</p>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {KPI_CARDS.map(({ key, label, icon: Icon, colorClass, bgClass, borderClass }) => (
          <div
            key={key}
            className={`kpi-card ${borderClass} group cursor-default`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${bgClass}`}>
                <Icon size={20} className={colorClass} />
              </div>
              {isLoading && (
                <div className="spinner h-4 w-4 opacity-50" />
              )}
            </div>
            <div
              className={`text-3xl font-bold mb-1 transition-all duration-500 ${colorClass}`}
            >
              {isLoading ? (
                <div className="h-8 w-12 bg-surface-50 rounded animate-pulse" />
              ) : (
                summary[key] ?? 0
              )}
            </div>
            <p className="text-sm text-slate-400">{label}</p>
          </div>
        ))}
      </div>

      {/* Integration note — shown to admin until real data flows */}
      <div className="card border-dashed">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500/10 flex-shrink-0">
            <RefreshCw size={14} className="text-primary-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-300">
              Phase 1 Dashboard — Integration in progress
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              KPI counts will update to real values after Asset, Booking, and
              Maintenance modules are merged. Data refreshes every 15 seconds.
            </p>
          </div>
        </div>
      </div>

      {/* Last updated */}
      {lastUpdated && (
        <p className="text-xs text-slate-600 text-right">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </p>
      )}
    </div>
  );
};

export default Dashboard;
