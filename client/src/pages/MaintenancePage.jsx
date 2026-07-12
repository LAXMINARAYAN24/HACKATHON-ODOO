import { useState } from 'react';
import MaintenanceForm from '../components/maintenance/MaintenanceForm';
import MaintenanceBoard from '../components/maintenance/MaintenanceBoard';

/**
 * MaintenancePage — Top-level page for the Maintenance module.
 * Orchestrates MaintenanceForm (modal overlay) and MaintenanceBoard (Kanban).
 * Mounted at /maintenance by Person A in App.jsx.
 */
const MaintenancePage = () => {
  const [showForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Called after a maintenance request is successfully raised
  const handleRequestCreated = () => {
    setRefreshKey((prev) => prev + 1);
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-8 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/20">
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.1-5.1a1.5 1.5 0 010-2.12l.88-.88a1.5 1.5 0 012.12 0l2.83 2.83 5.66-5.66a1.5 1.5 0 012.12 0l.88.88a1.5 1.5 0 010 2.12l-7.17 7.17a1.5 1.5 0 01-2.12 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-50">
              Maintenance Management
            </h1>
            <p className="text-sm text-gray-400">
              Track and manage asset maintenance requests
            </p>
          </div>
        </div>

        {/* Raise Request Button */}
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition-all duration-200 hover:from-orange-500 hover:to-orange-400 hover:shadow-orange-500/30 sm:self-start"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Raise Request
        </button>
      </div>

      {/* Modal Overlay for Maintenance Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 px-4 pt-20 pb-8 backdrop-blur-sm">
          {/* Backdrop click to close */}
          <div
            className="absolute inset-0"
            onClick={() => setShowForm(false)}
          />

          {/* Form Container */}
          <div className="relative w-full max-w-2xl animate-in fade-in slide-in-from-top-4 duration-300">
            <MaintenanceForm
              onSuccess={handleRequestCreated}
              onClose={() => setShowForm(false)}
            />
          </div>
        </div>
      )}

      {/* Kanban Board */}
      <div className="mx-auto max-w-full">
        <MaintenanceBoard refreshKey={refreshKey} />
      </div>

      {/* Workflow Legend */}
      <div className="mt-8 rounded-xl border border-gray-800/50 bg-gray-900/30 px-6 py-4">
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-gray-500">
          Workflow
        </p>
        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
          <span className="rounded-md bg-gray-500/10 px-2 py-1 text-gray-400">
            Pending
          </span>
          <svg className="h-3 w-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
          <span className="rounded-md bg-blue-500/10 px-2 py-1 text-blue-400">
            Approved
          </span>
          <svg className="h-3 w-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
          <span className="rounded-md bg-purple-500/10 px-2 py-1 text-purple-400">
            Tech Assigned
          </span>
          <svg className="h-3 w-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
          <span className="rounded-md bg-amber-500/10 px-2 py-1 text-amber-400">
            In Progress
          </span>
          <svg className="h-3 w-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
          <span className="rounded-md bg-emerald-500/10 px-2 py-1 text-emerald-400">
            Resolved
          </span>
        </div>
        <div className="mt-2 flex items-center gap-2 text-xs text-gray-600">
          <span className="text-gray-500">↳ Pending can also →</span>
          <span className="rounded-md bg-red-500/10 px-2 py-1 text-red-400">
            Rejected
          </span>
        </div>
      </div>
    </div>
  );
};

export default MaintenancePage;
