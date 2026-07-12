/**
 * AuditPage.jsx — owned by Satyam (feat/audit-reports)
 *
 * This page is wrapped by DashboardLayout in App.jsx (Laxminarayan owns that).
 * Import path for api: ../services/api (Laxminarayan's shared service).
 * No Layout or Sidebar import here.
 */
import { useState, useEffect, useCallback } from 'react';
import {
  ClipboardCheck, Plus, X, ChevronRight,
  AlertTriangle, CheckCircle2, XCircle, AlertCircle, Lock, Users,
} from 'lucide-react';
import api from '../services/api';

// ── Helpers ────────────────────────────────────────────────────────────────────
const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—';

const VERIFICATION_META = {
  verified:   { cls: 'badge-green',  label: 'Verified',   Icon: CheckCircle2 },
  missing:    { cls: 'badge-red',    label: 'Missing',    Icon: XCircle },
  damaged:    { cls: 'badge-amber',  label: 'Damaged',    Icon: AlertCircle },
  unverified: { cls: 'badge-gray',   label: 'Unverified', Icon: AlertCircle },
};

function VerificationBadge({ v }) {
  const { cls, label, Icon } = VERIFICATION_META[v] || VERIFICATION_META.unverified;
  return (
    <span className={`badge ${cls} gap-1`}>
      <Icon size={10} />
      {label}
    </span>
  );
}

// ── Create Cycle Modal ─────────────────────────────────────────────────────────
function CreateCycleModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', scopeDepartment: '', startDate: '', endDate: '' });
  const [depts, setDepts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/departments')
      .then((r) => setDepts(r.data.data || r.data))
      .catch(() => {
        // Fallback while department route is being merged
        setDepts([
          { _id: 'eng', name: 'Engineering' },
          { _id: 'fac', name: 'Facilities' },
          { _id: 'fop', name: 'Field Ops (pest)' },
        ]);
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/audits', form);
      onCreated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create audit cycle');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="af-card w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-semibold text-white">New Audit Cycle</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white/70"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-white/50 mb-1">Cycle Name</label>
            <input className="af-input" placeholder="e.g. Q3 Audit: Engineering dept" required
              value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-1">Department (scope)</label>
            <select className="af-select" required
              value={form.scopeDepartment}
              onChange={(e) => setForm({ ...form, scopeDepartment: e.target.value })}>
              <option value="">Select department…</option>
              {depts.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-white/50 mb-1">Start Date</label>
              <input type="date" className="af-input" required
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1">End Date</label>
              <input type="date" className="af-input" required
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
            </div>
          </div>
          {error && <p className="text-danger text-xs">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1" disabled={loading}>
              {loading ? 'Creating…' : 'Create Cycle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Discrepancy Report Panel ───────────────────────────────────────────────────
function DiscrepancyReport({ report, onDismiss }) {
  if (!report) return null;
  const hasIssues = report.discrepancies?.length > 0;
  return (
    <div className={`rounded-xl border p-4 mb-4 ${hasIssues ? 'bg-danger/10 border-danger/30' : 'bg-success/10 border-success/30'}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {hasIssues
            ? <AlertTriangle size={16} className="text-danger" />
            : <CheckCircle2  size={16} className="text-success" />}
          <h3 className={`font-semibold text-sm ${hasIssues ? 'text-danger' : 'text-success'}`}>
            {hasIssues
              ? `${report.discrepancies.length} discrepancies flagged — report generated automatically`
              : 'All assets verified — no discrepancies'}
          </h3>
        </div>
        <button onClick={onDismiss} className="text-white/30 hover:text-white/60"><X size={14} /></button>
      </div>
      {hasIssues && (
        <table className="af-table mt-2">
          <thead><tr><th>Tag</th><th>Name</th><th>Location</th><th>Status</th><th>Notes</th></tr></thead>
          <tbody>
            {report.discrepancies.map((d, i) => (
              <tr key={i}>
                <td><span className="asset-tag">{d.assetTag}</span></td>
                <td>{d.assetName}</td>
                <td className="text-white/50">{d.location}</td>
                <td><VerificationBadge v={d.verification} /></td>
                <td className="text-white/40 text-xs">{d.notes || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <p className="text-xs text-white/30 mt-3">
        Closed {fmtDate(report.closedAt)} · {report.verified}/{report.totalItems} verified
      </p>
    </div>
  );
}

// ── Assign Auditor Modal ───────────────────────────────────────────────────────
function AssignAuditorModal({ cycle, onClose, onAssigned }) {
  const [users, setUsers] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/users')
      .then((r) => setUsers(r.data.data || r.data))
      .catch(() => {
        setUsers([
          { _id: 'u1', name: 'Arjun Das', role: 'employee' },
          { _id: 'u2', name: 'Priya Shah', role: 'employee' },
        ]);
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedIds.length === 0) return setError('Select at least one auditor');
    setLoading(true);
    setError('');
    try {
      await api.post(`/audits/${cycle._id}/assign`, { auditorIds: selectedIds });
      onAssigned();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign auditors');
    } finally {
      setLoading(false);
    }
  };

  const toggle = (id) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="af-card w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-semibold text-white">Assign Auditors</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white/70"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="max-h-60 overflow-y-auto border border-white/10 rounded">
            {users.map((u) => (
              <label key={u._id} className="flex items-center gap-3 p-3 border-b border-white/5 hover:bg-white/5 cursor-pointer">
                <input type="checkbox" checked={selectedIds.includes(u._id)} onChange={() => toggle(u._id)} />
                <div>
                  <p className="text-sm text-white">{u.name}</p>
                  <p className="text-xs text-white/40">{u.role}</p>
                </div>
              </label>
            ))}
          </div>
          {error && <p className="text-danger text-xs">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1" disabled={loading}>
              {loading ? 'Assigning…' : 'Assign'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Checklist View ─────────────────────────────────────────────────────────────
function ChecklistView({ cycle, onBack, onClosed }) {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [closing, setClosing] = useState(false);
  const [report,  setReport]  = useState(null);
  const [showAssign, setShowAssign] = useState(false);

  const fetchItems = useCallback(async () => {
    try {
      const r = await api.get(`/audits/${cycle._id}/items`);
      if (r.data.success) setItems(r.data.data.items || []);
    } catch (err) {
      console.error('fetchItems:', err.message);
    } finally {
      setLoading(false);
    }
  }, [cycle._id]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const updateVerification = async (assetId, verification) => {
    try {
      await api.patch(`/audits/${cycle._id}/items/${assetId}`, { verification });
      setItems((prev) =>
        prev.map((i) => String(i.asset?._id) === String(assetId) ? { ...i, verification } : i)
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    }
  };

  const closeCycle = async () => {
    if (!window.confirm('Close this audit cycle? This cannot be undone.')) return;
    setClosing(true);
    try {
      const r = await api.post(`/audits/${cycle._id}/close`);
      if (r.data.success) { setReport(r.data.data.report); onClosed(); }
    } catch (err) {
      alert(err.response?.data?.message || 'Close failed');
    } finally {
      setClosing(false);
    }
  };

  const stats = {
    verified:   items.filter((i) => i.verification === 'verified').length,
    missing:    items.filter((i) => i.verification === 'missing').length,
    damaged:    items.filter((i) => i.verification === 'damaged').length,
    unverified: items.filter((i) => i.verification === 'unverified').length,
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="btn-ghost text-xs">← Back</button>
        <div className="flex-1">
          <h2 className="font-semibold text-white">{cycle.name}</h2>
          <p className="text-xs text-white/40 mt-0.5">
            {fmtDate(cycle.startDate)} – {fmtDate(cycle.endDate)} ·&nbsp;
            {cycle.scopeDepartment?.name || '—'}
          </p>
        </div>
        {cycle.status === 'open' ? (
          <div className="flex gap-2">
            <button className="btn-secondary text-xs bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded flex items-center gap-2 transition-colors" onClick={() => setShowAssign(true)}>
              <Users size={14} /> Assign Auditors
            </button>
            <button className="btn-danger" onClick={closeCycle} disabled={closing}>
              <Lock size={14} />
              {closing ? 'Closing…' : 'Close Audit Cycle'}
            </button>
          </div>
        ) : (
          <span className="badge badge-gray"><Lock size={10} /> Closed {fmtDate(cycle.closedAt)}</span>
        )}
      </div>

      {showAssign && (
        <AssignAuditorModal
          cycle={cycle}
          onClose={() => setShowAssign(false)}
          onAssigned={() => alert('Auditors assigned successfully!')}
        />
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Verified',   val: stats.verified,   cls: 'text-success' },
          { label: 'Missing',    val: stats.missing,    cls: 'text-danger' },
          { label: 'Damaged',    val: stats.damaged,    cls: 'text-warning' },
          { label: 'Unverified', val: stats.unverified, cls: 'text-white/40' },
        ].map(({ label, val, cls }) => (
          <div key={label} className="af-card py-3 text-center">
            <p className={`text-2xl font-bold ${cls}`}>{val}</p>
            <p className="text-xs text-white/40 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Discrepancy report (shown after close) */}
      {report && <DiscrepancyReport report={report} onDismiss={() => setReport(null)} />}

      {/* Warning if items flagged but cycle still open */}
      {!report && (stats.missing + stats.damaged) > 0 && cycle.status === 'open' && (
        <div className="banner-danger mb-4">
          <AlertTriangle size={16} />
          {stats.missing + stats.damaged} asset(s) flagged — discrepancy report generated automatically on close
        </div>
      )}

      {/* Checklist table */}
      <div className="af-card p-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white/80">Asset Checklist</h3>
          <span className="text-xs text-white/30">{items.length} assets in scope</span>
        </div>
        {loading ? (
          <div className="p-8 text-center text-white/30 text-sm">Loading checklist…</div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-white/30 text-sm">
            No assets found for this department's scope.
          </div>
        ) : (
          <table className="af-table">
            <thead>
              <tr>
                <th>Asset</th>
                <th>Location</th>
                <th>Verification</th>
                {cycle.status === 'open' && <th>Update</th>}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id}>
                  <td>
                    <span className="asset-tag mr-2">{item.asset?.tag}</span>
                    <span className="text-white/80">{item.asset?.name}</span>
                  </td>
                  <td className="text-white/50 text-xs">{item.asset?.location || '—'}</td>
                  <td><VerificationBadge v={item.verification} /></td>
                  {cycle.status === 'open' && (
                    <td>
                      <select
                        value={item.verification}
                        onChange={(e) => updateVerification(item.asset?._id, e.target.value)}
                        className="bg-transparent text-xs text-white/60 border border-white/10 rounded px-2 py-1 cursor-pointer hover:border-teal/40 transition-colors focus:outline-none"
                      >
                        <option value="unverified">Unverified</option>
                        <option value="verified">Verified</option>
                        <option value="missing">Missing</option>
                        <option value="damaged">Damaged</option>
                      </select>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ── Main Audit Page ────────────────────────────────────────────────────────────
export default function AuditPage() {
  const [cycles,     setCycles]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selected,   setSelected]   = useState(null);

  const fetchCycles = useCallback(async () => {
    try {
      const r = await api.get('/audits');
      if (r.data.success) setCycles(r.data.data);
    } catch (err) {
      console.error('fetchCycles:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCycles(); }, [fetchCycles]);

  const handleClosed = () => {
    // Refresh list after a cycle is closed
    fetchCycles().then(() => {
      // Re-select the updated cycle so checklist reflects closed state
      setCycles((prev) =>
        prev.map((c) => String(c._id) === String(selected?._id)
          ? { ...c, status: 'closed', closedAt: new Date() }
          : c)
      );
    });
  };

  if (selected) {
    return (
      <div className="p-6">
        <ChecklistView
          cycle={selected}
          onBack={() => { setSelected(null); fetchCycles(); }}
          onClosed={handleClosed}
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      {showCreate && (
        <CreateCycleModal onClose={() => setShowCreate(false)} onCreated={fetchCycles} />
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <ClipboardCheck size={20} className="text-teal" />
            Asset Audit
          </h1>
          <p className="text-sm text-white/40 mt-0.5">
            Manage audit cycles, verify assets, and generate discrepancy reports
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowCreate(true)}>
          <Plus size={16} /> New Audit Cycle
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-white/30 text-sm">Loading audit cycles…</div>
      ) : cycles.length === 0 ? (
        <div className="af-card text-center py-16">
          <ClipboardCheck size={32} className="text-white/20 mx-auto mb-3" />
          <p className="text-white/40 text-sm">No audit cycles yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {cycles.map((cycle) => (
            <button
              key={cycle._id}
              onClick={() => setSelected(cycle)}
              className="af-card w-full text-left flex items-center gap-4 hover:border-teal/30 transition-colors"
            >
              <div className={`w-2 h-2 rounded-full flex-none ${cycle.status === 'closed' ? 'bg-white/20' : 'bg-teal'}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="font-medium text-white text-sm truncate">{cycle.name}</h3>
                  <span className={`badge text-xs ${cycle.status === 'closed' ? 'badge-gray' : 'badge-teal'}`}>
                    {cycle.status === 'closed' ? 'Closed' : 'Open'}
                  </span>
                </div>
                <p className="text-xs text-white/40">
                  <span>{cycle.scopeDepartment?.name || '—'}</span>
                  <span className="mx-2">·</span>
                  <Users size={10} className="inline mr-1" />
                  {fmtDate(cycle.startDate)} – {fmtDate(cycle.endDate)}
                </p>
              </div>
              <ChevronRight size={16} className="text-white/30 flex-none" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
