import { useState } from 'react';

// ------------------------------------------------------------------
// Priority badge configuration
// ------------------------------------------------------------------
const PRIORITY_CONFIG = {
  critical: {
    label: 'Critical',
    bg: 'bg-red-500/10',
    text: 'text-red-400',
    border: 'border-red-500/30',
    dot: 'bg-red-400',
  },
  high: {
    label: 'High',
    bg: 'bg-orange-500/10',
    text: 'text-orange-400',
    border: 'border-orange-500/30',
    dot: 'bg-orange-400',
  },
  medium: {
    label: 'Medium',
    bg: 'bg-yellow-500/10',
    text: 'text-yellow-400',
    border: 'border-yellow-500/30',
    dot: 'bg-yellow-400',
  },
  low: {
    label: 'Low',
    bg: 'bg-green-500/10',
    text: 'text-green-400',
    border: 'border-green-500/30',
    dot: 'bg-green-400',
  },
};

// ------------------------------------------------------------------
// Status-based action buttons configuration
// Maps each status to the actions available on that card
// ------------------------------------------------------------------
const STATUS_ACTIONS = {
  pending: [
    { key: 'approve', label: 'Approve', color: 'emerald' },
    { key: 'reject', label: 'Reject', color: 'red' },
  ],
  approved: [
    { key: 'assign', label: 'Assign Technician', color: 'purple' },
  ],
  technician_assigned: [
    { key: 'start', label: 'Start Progress', color: 'amber' },
  ],
  in_progress: [
    { key: 'resolve', label: 'Resolve', color: 'emerald' },
  ],
  resolved: [],
  rejected: [],
};

// ------------------------------------------------------------------
// Action button color map
// ------------------------------------------------------------------
const ACTION_COLORS = {
  emerald:
    'bg-emerald-600/10 text-emerald-400 hover:bg-emerald-600/20 hover:text-emerald-300',
  red: 'bg-red-600/10 text-red-400 hover:bg-red-600/20 hover:text-red-300',
  purple:
    'bg-purple-600/10 text-purple-400 hover:bg-purple-600/20 hover:text-purple-300',
  amber:
    'bg-amber-600/10 text-amber-400 hover:bg-amber-600/20 hover:text-amber-300',
};

/**
 * Format a date for concise display.
 */
const formatDate = (date) => {
  return new Date(date).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * MaintenanceCard — Displays a single maintenance request as a Kanban card.
 *
 * @param {Object} props
 * @param {Object} props.request - Populated maintenance request from API
 * @param {Function} props.onAction - Callback: (requestId, actionKey, extraData?) => void
 */
const MaintenanceCard = ({ request, onAction }) => {
  const [remarksInput, setRemarksInput] = useState('');
  const [technicianInput, setTechnicianInput] = useState('');
  const [showInputFor, setShowInputFor] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const priority = PRIORITY_CONFIG[request.priority] || PRIORITY_CONFIG.medium;
  const actions = STATUS_ACTIONS[request.status] || [];

  // ------------------------------------------------------------------
  // Handle action button click
  // ------------------------------------------------------------------
  const handleAction = async (actionKey) => {
    // Actions that require extra input — show inline form
    if (actionKey === 'reject' && !showInputFor) {
      setShowInputFor('reject');
      return;
    }
    if (actionKey === 'assign' && !showInputFor) {
      setShowInputFor('assign');
      return;
    }
    if (actionKey === 'resolve' && !showInputFor) {
      setShowInputFor('resolve');
      return;
    }

    try {
      setActionLoading(true);

      let extraData = {};
      if (actionKey === 'reject') {
        extraData = { remarks: remarksInput };
      } else if (actionKey === 'assign') {
        if (!technicianInput.trim()) return;
        extraData = { technicianId: technicianInput.trim() };
      } else if (actionKey === 'resolve') {
        extraData = { remarks: remarksInput };
      }

      if (onAction) {
        await onAction(request._id, actionKey, extraData);
      }

      setShowInputFor(null);
      setRemarksInput('');
      setTechnicianInput('');
    } catch (err) {
      console.error('Action failed:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const cancelInput = () => {
    setShowInputFor(null);
    setRemarksInput('');
    setTechnicianInput('');
  };

  return (
    <div className="group rounded-xl border border-gray-700/50 bg-gray-800/60 p-4 backdrop-blur-sm transition-all duration-300 hover:border-gray-600/70 hover:bg-gray-800/80 hover:shadow-lg hover:shadow-black/20">
      {/* Header: Asset + Priority */}
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h4 className="truncate text-sm font-semibold text-gray-100">
            {request.asset?.name || 'Unknown Asset'}
          </h4>
          {request.asset?.assetTag && (
            <span className="mt-0.5 inline-block rounded bg-gray-700/60 px-1.5 py-0.5 text-[10px] text-gray-500">
              {request.asset.assetTag}
            </span>
          )}
        </div>
        <span
          className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${priority.bg} ${priority.text} ${priority.border}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${priority.dot}`} />
          {priority.label}
        </span>
      </div>

      {/* Issue Description */}
      <p className="mb-3 text-xs leading-relaxed text-gray-400 line-clamp-2">
        {request.issue}
      </p>

      {/* Meta Info */}
      <div className="mb-3 space-y-1.5">
        {/* Raised By */}
        <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
          <svg className="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
          <span>Raised by {request.raisedBy?.name || 'N/A'}</span>
        </div>

        {/* Technician (if assigned) */}
        {request.technician && (
          <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
            <svg className="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.1-5.1a1.5 1.5 0 010-2.12l.88-.88a1.5 1.5 0 012.12 0l2.83 2.83 5.66-5.66a1.5 1.5 0 012.12 0l.88.88a1.5 1.5 0 010 2.12l-7.17 7.17a1.5 1.5 0 01-2.12 0z" />
            </svg>
            <span>Tech: {request.technician.name}</span>
          </div>
        )}

        {/* Date */}
        <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
          <svg className="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{formatDate(request.createdAt)}</span>
        </div>

        {/* Resolved At (if resolved) */}
        {request.resolvedAt && (
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-500/70">
            <svg className="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Resolved {formatDate(request.resolvedAt)}</span>
          </div>
        )}

        {/* Remarks (if any) */}
        {request.remarks && (
          <div className="mt-1 rounded-md bg-gray-900/40 px-2 py-1.5 text-[11px] italic text-gray-500">
            &ldquo;{request.remarks}&rdquo;
          </div>
        )}
      </div>

      {/* Inline Input Forms */}
      {showInputFor === 'reject' && (
        <div className="mb-3 space-y-2">
          <textarea
            value={remarksInput}
            onChange={(e) => setRemarksInput(e.target.value)}
            placeholder="Rejection reason (optional)..."
            rows={2}
            className="w-full resize-none rounded-lg border border-gray-600/50 bg-gray-900/50 px-3 py-2 text-xs text-gray-200 placeholder-gray-500 outline-none focus:border-red-500/50"
          />
          <div className="flex gap-2">
            <button
              onClick={() => handleAction('reject')}
              disabled={actionLoading}
              className="flex-1 rounded-md bg-red-600/20 px-2 py-1.5 text-xs font-medium text-red-400 hover:bg-red-600/30 disabled:opacity-50"
            >
              {actionLoading ? 'Rejecting...' : 'Confirm Reject'}
            </button>
            <button
              onClick={cancelInput}
              className="rounded-md bg-gray-700/30 px-2 py-1.5 text-xs text-gray-400 hover:bg-gray-700/50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {showInputFor === 'assign' && (
        <div className="mb-3 space-y-2">
          <input
            type="text"
            value={technicianInput}
            onChange={(e) => setTechnicianInput(e.target.value)}
            placeholder="Technician User ID"
            className="w-full rounded-lg border border-gray-600/50 bg-gray-900/50 px-3 py-2 text-xs text-gray-200 placeholder-gray-500 outline-none focus:border-purple-500/50"
          />
          <div className="flex gap-2">
            <button
              onClick={() => handleAction('assign')}
              disabled={actionLoading || !technicianInput.trim()}
              className="flex-1 rounded-md bg-purple-600/20 px-2 py-1.5 text-xs font-medium text-purple-400 hover:bg-purple-600/30 disabled:opacity-50"
            >
              {actionLoading ? 'Assigning...' : 'Confirm Assign'}
            </button>
            <button
              onClick={cancelInput}
              className="rounded-md bg-gray-700/30 px-2 py-1.5 text-xs text-gray-400 hover:bg-gray-700/50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {showInputFor === 'resolve' && (
        <div className="mb-3 space-y-2">
          <textarea
            value={remarksInput}
            onChange={(e) => setRemarksInput(e.target.value)}
            placeholder="Resolution notes (optional)..."
            rows={2}
            className="w-full resize-none rounded-lg border border-gray-600/50 bg-gray-900/50 px-3 py-2 text-xs text-gray-200 placeholder-gray-500 outline-none focus:border-emerald-500/50"
          />
          <div className="flex gap-2">
            <button
              onClick={() => handleAction('resolve')}
              disabled={actionLoading}
              className="flex-1 rounded-md bg-emerald-600/20 px-2 py-1.5 text-xs font-medium text-emerald-400 hover:bg-emerald-600/30 disabled:opacity-50"
            >
              {actionLoading ? 'Resolving...' : 'Confirm Resolve'}
            </button>
            <button
              onClick={cancelInput}
              className="rounded-md bg-gray-700/30 px-2 py-1.5 text-xs text-gray-400 hover:bg-gray-700/50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons (only if no inline form is showing) */}
      {actions.length > 0 && !showInputFor && (
        <div className="flex flex-wrap gap-2 border-t border-gray-700/40 pt-3">
          {actions.map((action) => (
            <button
              key={action.key}
              onClick={() => handleAction(action.key)}
              disabled={actionLoading}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 disabled:opacity-50 ${ACTION_COLORS[action.color]}`}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MaintenanceCard;
