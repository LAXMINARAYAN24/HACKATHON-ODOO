import { useState, useEffect, useCallback } from 'react';
import {
  getAllRequests,
  approveRequest,
  rejectRequest,
  assignTechnician,
  startProgress,
  resolveRequest,
} from '../../services/maintenanceService';
import MaintenanceCard from './MaintenanceCard';

// ------------------------------------------------------------------
// Kanban column definitions (frozen status enum order)
// ------------------------------------------------------------------
const COLUMNS = [
  {
    key: 'pending',
    label: 'Pending',
    accent: 'border-gray-500/50',
    headerBg: 'bg-gray-500/10',
    headerText: 'text-gray-400',
    countBg: 'bg-gray-500/20',
    countText: 'text-gray-400',
  },
  {
    key: 'approved',
    label: 'Approved',
    accent: 'border-blue-500/50',
    headerBg: 'bg-blue-500/10',
    headerText: 'text-blue-400',
    countBg: 'bg-blue-500/20',
    countText: 'text-blue-400',
  },
  {
    key: 'technician_assigned',
    label: 'Technician Assigned',
    accent: 'border-purple-500/50',
    headerBg: 'bg-purple-500/10',
    headerText: 'text-purple-400',
    countBg: 'bg-purple-500/20',
    countText: 'text-purple-400',
  },
  {
    key: 'in_progress',
    label: 'In Progress',
    accent: 'border-amber-500/50',
    headerBg: 'bg-amber-500/10',
    headerText: 'text-amber-400',
    countBg: 'bg-amber-500/20',
    countText: 'text-amber-400',
  },
  {
    key: 'resolved',
    label: 'Resolved',
    accent: 'border-emerald-500/50',
    headerBg: 'bg-emerald-500/10',
    headerText: 'text-emerald-400',
    countBg: 'bg-emerald-500/20',
    countText: 'text-emerald-400',
  },
];

// Rejected shown separately
const REJECTED_COLUMN = {
  key: 'rejected',
  label: 'Rejected',
  accent: 'border-red-500/50',
  headerBg: 'bg-red-500/10',
  headerText: 'text-red-400',
  countBg: 'bg-red-500/20',
  countText: 'text-red-400',
};

/**
 * MaintenanceBoard — Kanban board for maintenance requests.
 * Groups requests by status into columns. Provides action handlers
 * that call the maintenance service and auto-refresh.
 *
 * @param {Object} props
 * @param {number} [props.refreshKey] - Increment to trigger re-fetch (from parent)
 */
const MaintenanceBoard = ({ refreshKey }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showRejected, setShowRejected] = useState(false);

  // ------------------------------------------------------------------
  // Fetch all maintenance requests
  // ------------------------------------------------------------------
  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const result = await getAllRequests();

      if (result.success) {
        setRequests(result.data || []);
      } else {
        setError(result.message || 'Failed to load maintenance requests');
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to load maintenance requests. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests, refreshKey]);

  // ------------------------------------------------------------------
  // Group requests by status
  // ------------------------------------------------------------------
  const groupedRequests = requests.reduce((acc, req) => {
    const status = req.status || 'pending';
    if (!acc[status]) acc[status] = [];
    acc[status].push(req);
    return acc;
  }, {});

  // ------------------------------------------------------------------
  // Handle card actions — maps action keys to service calls
  // ------------------------------------------------------------------
  const handleAction = async (requestId, actionKey, extraData = {}) => {
    try {
      setError('');

      switch (actionKey) {
        case 'approve':
          await approveRequest(requestId);
          break;
        case 'reject':
          await rejectRequest(requestId, extraData.remarks);
          break;
        case 'assign':
          await assignTechnician(requestId, extraData.technicianId);
          break;
        case 'start':
          await startProgress(requestId);
          break;
        case 'resolve':
          await resolveRequest(requestId, extraData.remarks);
          break;
        default:
          console.warn('Unknown action:', actionKey);
          return;
      }

      // Refresh after successful action
      fetchRequests();
    } catch (err) {
      setError(
        err.response?.data?.message || `Failed to ${actionKey} request`
      );
    }
  };

  // ------------------------------------------------------------------
  // Loading skeleton
  // ------------------------------------------------------------------
  const ColumnSkeleton = () => (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="min-w-[280px] flex-1 animate-pulse rounded-xl border border-gray-700/30 bg-gray-800/30 p-4"
        >
          <div className="mb-4 h-6 w-2/3 rounded bg-gray-700/40" />
          <div className="space-y-3">
            {[...Array(2)].map((__, j) => (
              <div
                key={j}
                className="rounded-lg border border-gray-700/20 bg-gray-800/40 p-4"
              >
                <div className="mb-2 h-4 w-3/4 rounded bg-gray-700/30" />
                <div className="mb-2 h-3 w-full rounded bg-gray-700/20" />
                <div className="h-3 w-1/2 rounded bg-gray-700/20" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  // ------------------------------------------------------------------
  // Render a single column
  // ------------------------------------------------------------------
  const renderColumn = (column) => {
    const items = groupedRequests[column.key] || [];

    return (
      <div
        key={column.key}
        className={`min-w-[280px] flex-1 rounded-xl border-t-2 bg-gray-900/30 ${column.accent}`}
      >
        {/* Column Header */}
        <div
          className={`flex items-center justify-between rounded-t-xl px-4 py-3 ${column.headerBg}`}
        >
          <h3 className={`text-sm font-semibold ${column.headerText}`}>
            {column.label}
          </h3>
          <span
            className={`inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${column.countBg} ${column.countText}`}
          >
            {items.length}
          </span>
        </div>

        {/* Column Body */}
        <div className="space-y-3 p-3">
          {items.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-700/30 py-8 text-center">
              <p className="text-xs text-gray-600">No requests</p>
            </div>
          ) : (
            items.map((request) => (
              <MaintenanceCard
                key={request._id}
                request={request}
                onAction={handleAction}
              />
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Header Row */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-100">
          Maintenance Board
        </h2>
        <div className="flex items-center gap-2">
          {/* Toggle rejected */}
          <button
            onClick={() => setShowRejected((prev) => !prev)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
              showRejected
                ? 'bg-red-600/20 text-red-400 ring-1 ring-red-500/30'
                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-gray-300'
            }`}
          >
            {showRejected ? 'Hide' : 'Show'} Rejected
            {(groupedRequests.rejected || []).length > 0 && (
              <span className="ml-1.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500/20 px-1 text-[10px] text-red-400">
                {groupedRequests.rejected.length}
              </span>
            )}
          </button>

          {/* Refresh */}
          <button
            onClick={fetchRequests}
            disabled={loading}
            className="rounded-lg bg-gray-800/50 p-1.5 text-gray-400 transition-all duration-200 hover:bg-gray-700/50 hover:text-gray-300 disabled:opacity-50"
            title="Refresh"
          >
            <svg
              className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-red-400">{error}</p>
            <button
              onClick={() => setError('')}
              className="text-red-400/50 hover:text-red-400"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Kanban Board */}
      {loading ? (
        <ColumnSkeleton />
      ) : (
        <>
          {/* Main Columns */}
          <div className="flex gap-4 overflow-x-auto pb-4">
            {COLUMNS.map(renderColumn)}
          </div>

          {/* Rejected Section (collapsible) */}
          {showRejected && (
            <div className="mt-4">
              <div className="flex gap-4">
                <div className="w-full max-w-sm">
                  {renderColumn(REJECTED_COLUMN)}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MaintenanceBoard;
