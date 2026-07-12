import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import useAuthStore from "./store/authStore.js";

// ── Laxminarayan-owned pages 
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import OrganizationSetup from "./pages/OrganizationSetup.jsx";

// ── Mahek-owned pages (integrated)
import BookingPage from "./pages/BookingPage.jsx";
import MaintenancePage from "./pages/MaintenancePage.jsx";

// ── Satyam-owned pages (integrated)
import AuditPage from "./pages/AuditPage.jsx";
import ReportsPage from "./pages/ReportsPage.jsx";
import NotificationsPage from "./pages/NotificationsPage.jsx";

// ── Shared layout & guards
import DashboardLayout from "./layouts/DashboardLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";


const ComingSoon = ({ module, owner }) => (
  <div className="flex flex-col items-center justify-center h-full py-24 text-center">
    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-surface-50 border border-border mb-4">
      <span className="text-2xl">🔧</span>
    </div>
    <h2 className="text-lg font-semibold text-white mb-1">{module}</h2>
    <p className="text-sm text-slate-500">
      This module is being developed by <span className="text-primary-400 font-medium">{owner}</span>.
      It will be available after branch integration.
    </p>
  </div>
);

const App = () => {
  const { initAuth, isInitialized } = useAuthStore();

  // Validate stored JWT on app load (correction 4)
  useEffect(() => {
    initAuth();
  }, [initAuth]);

  // Block render until auth is initialized to prevent flash
  if (!isInitialized) {
    return (
      <div className="flex h-screen items-center justify-center bg-dark">
        <div className="flex flex-col items-center gap-3">
          <div className="spinner h-8 w-8" />
          <p className="text-sm text-slate-500">Initializing…</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Protected routes — authenticated users */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            {/* laxminarayans's  */}
            <Route path="/dashboard" element={<Dashboard />} />

            {/* ── Admin-only: Organization Setup (correction 5) ──── */}
            <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
              <Route path="/organization" element={<OrganizationSetup />} />
            </Route>

            {/* ── JENY placeholder (replace after feat/assets-allocation merges) ── */}
            <Route path="/assets" element={<ComingSoon module="Asset Registry" owner="Jeny Bhatt" />} />
            <Route path="/allocations" element={<ComingSoon module="Allocation & Transfer" owner="Jeny Bhatt" />} />
            <Route path="/transfers" element={<ComingSoon module="Transfer Requests" owner="Jeny Bhatt" />} />

            {/* ── MAHEK pages (integrated) ── */}
            <Route path="/bookings" element={<BookingPage />} />
            <Route path="/maintenance" element={<MaintenancePage />} />

            {/* ── SATYAM pages (integrated) ── */}
            <Route path="/audits" element={<AuditPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
          </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
