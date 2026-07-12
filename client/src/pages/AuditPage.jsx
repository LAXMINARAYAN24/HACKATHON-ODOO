/**
 * Audit Page
 */
import { useState, useEffect, useCallback } from 'react';
import {
  ClipboardCheck, Plus, X, ChevronRight,
  AlertTriangle, CheckCircle2, XCircle, AlertCircle, Lock, Users,
  Activity, RefreshCw
} from 'lucide-react';
import api from '../services/api';

// Helpers
const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—';

const getErrorMessage = (err) => {
  if (!err || !err.response) return 'Network connection lost or server unavailable. Please try again.';
  const status = err.response.status;
  if (status === 401) return 'Your session has expired. Please log in again.';
  if (status === 403) return 'You do not have permission to perform this action.';
  if (status === 404) return 'The requested resource could not be found.';
  if (status >= 500) return 'An internal server error occurred. Please try again later.';
  return err.response?.data?.message || 'An unexpected error occurred. Please try again.';
};

const VERIFICATION_META = {
  verified:   { cls: 'badge-green',  label: 'Verified',   Icon: CheckCircle2 },
  missing:    { cls: 'badge-red',    label: 'Missing',    Icon: XCircle },
  damaged:    { cls: 'badge-amber',  label: 'Damaged',    Icon: AlertCircle },
  unverified: { cls: 'badge-gray',   label: 'Unverified', Icon: AlertCircle },
};

function VerificationBadge({ v }) {
  const { cls, label, Icon } = VERIFICATION_META[v] || VERIFICATION_META.unverified;
  return (
    <span className={`badge ${cls} gap-1 flex items-center w-max`}>
      <Icon size={10} />
      {label}
    </span>
  );
}

// Create Cycle Modal
function CreateCycleModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', scopeDepartment: '', startDate: '', endDate: '' });
  const [depts, setDepts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    api.get('/departments')
      .then((r) => setDepts(r.data?.data || []))
      .catch(() => setFetchError(true));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setError('Cycle name is required.');
    if (!form.scopeDepartment) return setError('Department is required.');
    if (!form.startDate || !form.endDate) return setError('Start and end dates are required.');
    
    const start = new Date(form.startDate);
    const end = new Date(form.endDate);
    if (start > end) return setError('Start date must be before or equal to the end date.');

    setLoading(true);
    setError('');
    try {
      await api.post('/audits', form);
      onCreated();
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#1a1c23] border border-white/10 rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <h2 className="font-semibold text-white">New Audit Cycle</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-medium text-white/60 mb-1.5">Cycle Name</label>
            <input className="af-input w-full" placeholder="e.g. Q3 Audit: Engineering dept" required
              disabled={loading}
              value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-medium text-white/60 mb-1.5">Department (scope)</label>
            {fetchError ? (
              <p className="text-xs text-danger">Unable to load departments.</p>
            ) : (
              <select className="af-select w-full" required disabled={loading || depts.length === 0}
                value={form.scopeDepartment}
                onChange={(e) => setForm({ ...form, scopeDepartment: e.target.value })}>
                <option value="">Select department…</option>
                {depts.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">Start Date</label>
              <input type="date" className="af-input w-full" required disabled={loading}
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">End Date</label>
              <input type="date" className="af-input w-full" required disabled={loading}
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
            </div>
          </div>
          {error && (
            <div className="p-3 rounded bg-danger/10 border border-danger/20 text-danger text-xs flex items-start gap-2">
              <AlertCircle size={14} className="mt-0.5 flex-none" />
              <span>{error}</span>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost flex-1" disabled={loading}>Cancel</button>
            <button type="submit" className="btn-primary flex-1" disabled={loading || fetchError}>
              {loading ? 'Creating…' : 'Create Cycle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Discrepancy Report Panel
function DiscrepancyReport({ report, onDismiss }) {
  if (!report) return null;
  const hasIssues = (report.discrepancies?.length || 0) > 0;
  return (
    <div className={`rounded-xl border p-5 mb-6 animate-in slide-in-from-top-4 duration-300 ${hasIssues ? 'bg-danger/5 border-danger/30' : 'bg-success/5 border-success/30'}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${hasIssues ? 'bg-danger/20 text-danger' : 'bg-success/20 text-success'}`}>
            {hasIssues ? <AlertTriangle size={20} /> : <CheckCircle2 size={20} />}
          </div>
          <div>
            <h3 className={`font-semibold ${hasIssues ? 'text-danger' : 'text-success'}`}>
              {hasIssues ? 'Discrepancy Report Generated' : 'Audit Completed Successfully'}
            </h3>
            <p className="text-xs text-white/60 mt-0.5">
              {hasIssues
                ? `${report.discrepancies?.length || 0} assets flagged during the audit process.`
                : 'All assigned assets were fully verified.'}
            </p>
          </div>
        </div>
        <button onClick={onDismiss} className="text-white/30 hover:text-white/60 transition-colors"><X size={16} /></button>
      </div>
      
      {hasIssues && (
        <div className="bg-black/20 rounded-lg overflow-hidden border border-white/5 mt-4">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white/[0.03] text-white/50 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 font-medium">Asset</th>
                <th className="px-4 py-3 font-medium">Location</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium w-full">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {(report.discrepancies || []).map((d, i) => (
                <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="asset-tag">{d.assetTag || '—'}</span>
                      <span className="text-white/80 font-medium truncate max-w-[150px]">{d.assetName || '—'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-white/50">{d.location || '—'}</td>
                  <td className="px-4 py-3"><VerificationBadge v={d.verification} /></td>
                  <td className="px-4 py-3 text-white/40 text-xs truncate max-w-[200px]" title={d.notes || ''}>{d.notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="mt-4 flex items-center gap-4 text-xs text-white/40 border-t border-white/10 pt-4">
        <span><span className="text-white/70 font-medium">{report.verified || 0}</span> verified out of <span className="text-white/70 font-medium">{report.totalItems || 0}</span></span>
        <span>•</span>
        <span>Closed on {fmtDate(report.closedAt)}</span>
      </div>
    </div>
  );
}

// Assign Auditor Modal
function AssignAuditorModal({ cycle, onClose, onAssigned }) {
  const [users, setUsers] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
    api.get('/users')
      .then((r) => setUsers(r.data?.data || []))
      .catch((err) => setFetchError(getErrorMessage(err)));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedIds.length === 0) return setError('Select at least one auditor to assign.');
    setLoading(true);
    setError('');
    try {
      await api.post(`/audits/${cycle._id}/assign`, { auditorIds: selectedIds });
      onAssigned();
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
      setLoading(false);
    }
  };

  const toggle = (id) => {
    if (loading) return;
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#1a1c23] border border-white/10 rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div>
            <h2 className="font-semibold text-white">Assign Auditors</h2>
            <p className="text-xs text-white/50 mt-1">{cycle.name || 'Audit Cycle'}</p>
          </div>
          <button onClick={onClose} disabled={loading} className="text-white/40 hover:text-white transition-colors disabled:opacity-50"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-0">
          <div className="max-h-72 overflow-y-auto p-2">
            {fetchError ? (
              <p className="text-center text-danger text-sm py-8">{fetchError}</p>
            ) : users.length === 0 ? (
              <p className="text-center text-white/30 text-sm py-8">Loading users...</p>
            ) : (
              users.map((u) => (
                <label key={u._id} className={`flex items-center gap-3 p-3 mx-2 my-1 rounded-lg border cursor-pointer transition-all ${selectedIds.includes(u._id) ? 'bg-teal/10 border-teal/30' : 'border-transparent hover:bg-white/5'} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <div className={`w-4 h-4 rounded border flex items-center justify-center flex-none transition-colors ${selectedIds.includes(u._id) ? 'bg-teal border-teal' : 'border-white/20'}`}>
                    {selectedIds.includes(u._id) && <CheckCircle2 size={12} className="text-black" />}
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${selectedIds.includes(u._id) ? 'text-teal' : 'text-white/90'}`}>{u.name || 'Unknown User'}</p>
                    <p className="text-xs text-white/40 capitalize">{(u.role || '').replace('_', ' ')}</p>
                  </div>
                </label>
              ))
            )}
          </div>
          <div className="p-5 border-t border-white/10 bg-white/[0.01]">
            {error && (
              <div className="mb-4 p-3 rounded bg-danger/10 border border-danger/20 text-danger text-xs flex items-start gap-2">
                <AlertCircle size={14} className="mt-0.5 flex-none" />
                <span>{error}</span>
              </div>
            )}
            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="btn-ghost flex-1" disabled={loading}>Cancel</button>
              <button type="submit" className="btn-primary flex-1" disabled={loading || users.length === 0 || !!fetchError}>
                {loading ? 'Assigning…' : `Assign ${selectedIds.length > 0 ? `(${selectedIds.length})` : ''}`}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// Checklist View
function ChecklistView({ cycle, onBack, onClosed }) {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [closing, setClosing] = useState(false);
  const [report,  setReport]  = useState(null);
  const [showAssign, setShowAssign] = useState(false);
  const [toastMsg, setToastMsg] = useState({ text: '', type: 'success' });
  const [updatingIds, setUpdatingIds] = useState(new Set());

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const r = await api.get(`/audits/${cycle._id}/items`);
      if (r.data?.success) setItems(r.data.data?.items || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [cycle._id]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const showToast = (text, type = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg({ text: '', type: 'success' }), 4000);
  };

  const updateVerification = async (assetId, verification) => {
    if (!assetId) return;
    setUpdatingIds((prev) => new Set(prev).add(assetId));
    try {
      await api.patch(`/audits/${cycle._id}/items/${assetId}`, { verification });
      setItems((prev) =>
        prev.map((i) => String(i.asset?._id) === String(assetId) ? { ...i, verification } : i)
      );
      showToast('Asset verification updated');
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setUpdatingIds((prev) => {
        const next = new Set(prev);
        next.delete(assetId);
        return next;
      });
    }
  };

  const closeCycle = async () => {
    if (!window.confirm('Are you sure you want to lock and close this audit cycle? A discrepancy report will be generated for any unverified assets.')) return;
    setClosing(true);
    try {
      const r = await api.post(`/audits/${cycle._id}/close`);
      if (r.data?.success) { 
        setReport(r.data.data?.report); 
        onClosed(); 
      }
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
      setClosing(false); // Only allow re-trying if it failed
    }
  };

  const stats = {
    verified:   items.filter((i) => i.verification === 'verified').length,
    missing:    items.filter((i) => i.verification === 'missing').length,
    damaged:    items.filter((i) => i.verification === 'damaged').length,
    unverified: items.filter((i) => i.verification === 'unverified').length,
  };

  const totalFlagged = stats.missing + stats.damaged;
  const progress = items.length > 0 ? Math.round(((items.length - stats.unverified) / items.length) * 100) : 0;

  return (
    <div className="animate-in fade-in duration-300">
      {toastMsg.text && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg shadow-xl font-medium text-sm flex items-center gap-2 animate-in slide-in-from-bottom-5 ${toastMsg.type === 'error' ? 'bg-danger text-white' : 'bg-teal text-black'}`}>
          {toastMsg.type === 'error' ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
          {toastMsg.text}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/10">
        <button onClick={onBack} disabled={closing} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/5 transition-all disabled:opacity-50">
          <ChevronRight size={18} className="rotate-180" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-white">{cycle.name || 'Audit Cycle'}</h2>
            <span className={`badge text-xs ${cycle.status === 'closed' ? 'badge-gray' : 'badge-teal'}`}>
              {cycle.status === 'closed' ? 'Closed' : 'Active'}
            </span>
          </div>
          <p className="text-sm text-white/50 mt-1 flex items-center gap-3">
            <span className="flex items-center gap-1.5"><Activity size={14} /> {cycle.scopeDepartment?.name || '—'}</span>
            <span>•</span>
            <span>{fmtDate(cycle.startDate)} – {fmtDate(cycle.endDate)}</span>
          </p>
        </div>
        {cycle.status === 'open' ? (
          <div className="flex gap-3">
            <button className="btn-secondary flex items-center gap-2 border-white/10 hover:border-white/30 disabled:opacity-50" onClick={() => setShowAssign(true)} disabled={closing}>
              <Users size={16} className="text-white/60" /> Assign
            </button>
            <button className="bg-white hover:bg-white/90 text-black px-5 py-2 rounded-lg font-medium text-sm flex items-center gap-2 shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed" onClick={closeCycle} disabled={closing}>
              <Lock size={16} />
              {closing ? 'Closing…' : 'Close Audit'}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-white/50 bg-white/5 px-4 py-2 rounded-lg border border-white/10">
            <Lock size={14} /> Locked on {fmtDate(cycle.closedAt)}
          </div>
        )}
      </div>

      {showAssign && (
        <AssignAuditorModal
          cycle={cycle}
          onClose={() => setShowAssign(false)}
          onAssigned={() => showToast('Auditors assigned successfully')}
        />
      )}

      {/* Stats Summary Panel */}
      {!loading && !error && items.length > 0 && (
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="af-card border-none bg-white/[0.02]">
            <p className="text-xs text-white/50 font-medium uppercase tracking-wider mb-1">Progress</p>
            <div className="flex items-end gap-2 mb-2">
              <p className="text-3xl font-bold text-white">{progress}%</p>
            </div>
            <div className="w-full bg-white/10 rounded-full h-1.5">
              <div className="bg-teal h-1.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
          {[
            { label: 'Verified',   val: stats.verified,   cls: 'text-success', bg: 'bg-success/5' },
            { label: 'Flagged',    val: totalFlagged,     cls: totalFlagged > 0 ? 'text-danger' : 'text-white/40', bg: totalFlagged > 0 ? 'bg-danger/5' : 'bg-white/5' },
            { label: 'Pending',    val: stats.unverified, cls: 'text-white/60', bg: 'bg-white/5' },
          ].map(({ label, val, cls, bg }) => (
            <div key={label} className={`af-card border-none ${bg}`}>
              <p className="text-xs text-white/50 font-medium uppercase tracking-wider mb-2">{label}</p>
              <p className={`text-3xl font-bold ${cls}`}>{val}</p>
            </div>
          ))}
        </div>
      )}

      {/* Discrepancy report (shown after close) */}
      {report && <DiscrepancyReport report={report} onDismiss={() => setReport(null)} />}

      {/* Warning if items flagged but cycle still open */}
      {!report && totalFlagged > 0 && cycle.status === 'open' && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-warning/10 border border-warning/20 text-warning text-sm mb-6 animate-in slide-in-from-top-2">
          <AlertTriangle size={18} />
          <p><strong>{totalFlagged} asset(s) flagged.</strong> A discrepancy report will be generated automatically when this cycle is closed.</p>
        </div>
      )}

      {/* Checklist table */}
      <div className="af-card p-0 overflow-hidden shadow-2xl border-white/10">
        <div className="px-6 py-4 border-b border-white/10 bg-white/[0.01] flex items-center justify-between">
          <h3 className="text-base font-semibold text-white">Asset Checklist</h3>
          <span className="badge badge-gray text-xs">{items.length} assets</span>
        </div>
        
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-white/40 gap-3">
            <RefreshCw size={24} className="animate-spin text-teal/50" />
            <p className="text-sm">Loading checklist...</p>
          </div>
        ) : error ? (
          <div className="p-12 flex flex-col items-center justify-center text-danger gap-3 text-center">
            <AlertTriangle size={32} className="text-danger/50 mb-2" />
            <p className="font-medium">Unable to load checklist.</p>
            <p className="text-sm text-danger/70 max-w-md">{error}</p>
            <button onClick={fetchItems} className="btn-secondary mt-2">Try Again</button>
          </div>
        ) : items.length === 0 ? (
          <div className="p-16 flex flex-col items-center text-center">
            <ClipboardCheck size={48} className="text-white/10 mb-4" />
            <p className="text-white/60 font-medium mb-1">No assets in scope</p>
            <p className="text-white/40 text-sm">This department currently has no trackable assets.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white/[0.02] text-white/50 text-xs uppercase tracking-wider border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 font-medium">Asset</th>
                  <th className="px-6 py-4 font-medium">Location</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  {cycle.status === 'open' && <th className="px-6 py-4 font-medium text-right">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {items.map((item) => (
                  <tr key={item._id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="asset-tag font-mono text-xs">{item.asset?.tag || '—'}</span>
                        <span className="text-white font-medium">{item.asset?.name || 'Unknown Asset'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-white/50">{item.asset?.location || '—'}</td>
                    <td className="px-6 py-4">
                      <VerificationBadge v={item.verification} />
                    </td>
                    {cycle.status === 'open' && (
                      <td className="px-6 py-4 text-right">
                        <select
                          value={item.verification || 'unverified'}
                          disabled={updatingIds.has(item.asset?._id) || closing}
                          onChange={(e) => updateVerification(item.asset?._id, e.target.value)}
                          className={`text-sm border rounded-lg px-3 py-1.5 outline-none transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm ${
                            item.verification === 'verified' ? 'bg-success/10 border-success/30 text-success hover:border-success/60' :
                            item.verification === 'missing' ? 'bg-danger/10 border-danger/30 text-danger hover:border-danger/60' :
                            item.verification === 'damaged' ? 'bg-warning/10 border-warning/30 text-warning hover:border-warning/60' :
                            'bg-white/[0.02] border-white/10 text-white/60 hover:border-white/30'
                          }`}
                        >
                          <option className="bg-[#1a1c23] text-white" value="unverified">Unverified</option>
                          <option className="bg-[#1a1c23] text-success" value="verified">Verified</option>
                          <option className="bg-[#1a1c23] text-danger" value="missing">Missing</option>
                          <option className="bg-[#1a1c23] text-warning" value="damaged">Damaged</option>
                        </select>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// Main Audit Page
export default function AuditPage() {
  const [cycles,     setCycles]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [selected,   setSelected]   = useState(null);

  const fetchCycles = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const r = await api.get('/audits');
      if (r.data?.success) setCycles(r.data.data || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCycles(); }, [fetchCycles]);

  const handleClosed = () => {
    fetchCycles().then(() => {
      setCycles((prev) =>
        prev.map((c) => String(c._id) === String(selected?._id)
          ? { ...c, status: 'closed', closedAt: new Date() }
          : c)
      );
    });
  };

  if (selected) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <ChecklistView
          cycle={selected}
          onBack={() => { setSelected(null); fetchCycles(); }}
          onClosed={handleClosed}
        />
      </div>
    );
  }

  // Calculate dynamic KPIs securely
  const activeCount = cycles.filter(c => c.status === 'open').length;
  const closedCount = cycles.filter(c => c.status === 'closed').length;

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in duration-300">
      {showCreate && (
        <CreateCycleModal onClose={() => setShowCreate(false)} onCreated={fetchCycles} />
      )}

      {/* Page Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-teal/10 rounded-xl">
              <ClipboardCheck size={24} className="text-teal" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Audit Cycles</h1>
          </div>
          <p className="text-sm text-white/50 max-w-xl leading-relaxed">
            Manage asset audits, track discrepancies, and maintain compliance across departments.
          </p>
        </div>
        <button className="bg-teal hover:bg-teal-500 text-black px-5 py-2.5 rounded-lg font-semibold text-sm flex items-center gap-2 shadow-lg shadow-teal/20 transition-all active:scale-95 disabled:opacity-50" disabled={loading} onClick={() => setShowCreate(true)}>
          <Plus size={18} /> New Cycle
        </button>
      </div>

      {/* Dynamic KPI Cards */}
      {!loading && !error && cycles.length > 0 && (
        <div className="grid grid-cols-3 gap-5 mb-8">
          <div className="af-card bg-gradient-to-br from-white/[0.05] to-transparent border-white/10 p-5">
            <div className="flex items-center gap-3 text-white/60 mb-2">
              <Activity size={16} />
              <h3 className="text-sm font-medium">Active Cycles</h3>
            </div>
            <p className="text-3xl font-bold text-white">{activeCount}</p>
          </div>
          <div className="af-card bg-gradient-to-br from-white/[0.03] to-transparent border-white/5 p-5">
            <div className="flex items-center gap-3 text-white/50 mb-2">
              <Lock size={16} />
              <h3 className="text-sm font-medium">Closed Audits</h3>
            </div>
            <p className="text-3xl font-bold text-white/80">{closedCount}</p>
          </div>
          <div className="af-card bg-gradient-to-br from-white/[0.03] to-transparent border-white/5 p-5">
            <div className="flex items-center gap-3 text-white/50 mb-2">
              <ClipboardCheck size={16} />
              <h3 className="text-sm font-medium">Total Runs</h3>
            </div>
            <p className="text-3xl font-bold text-white/60">{cycles.length}</p>
          </div>
        </div>
      )}

      {/* Cycle List */}
      {loading ? (
        <div className="py-24 flex flex-col items-center text-white/40">
          <RefreshCw size={32} className="animate-spin text-teal/30 mb-4" />
          <p>Loading audit cycles...</p>
        </div>
      ) : error ? (
        <div className="border border-danger/30 bg-danger/10 rounded-2xl p-16 text-center">
          <div className="w-16 h-16 bg-danger/20 rounded-full flex items-center justify-center mx-auto mb-5 text-danger">
            <AlertTriangle size={28} />
          </div>
          <h3 className="text-lg font-semibold text-danger mb-2">Unable to load audit data</h3>
          <p className="text-danger/70 max-w-md mx-auto mb-6 text-sm">{error}</p>
          <button className="bg-danger/20 hover:bg-danger/30 text-danger border border-danger/30 px-5 py-2.5 rounded-lg transition-colors font-medium text-sm" onClick={fetchCycles}>
            Try Again
          </button>
        </div>
      ) : cycles.length === 0 ? (
        <div className="border border-dashed border-white/20 rounded-2xl p-16 text-center bg-white/[0.01]">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-5">
            <ClipboardCheck size={28} className="text-white/40" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No audit cycles found</h3>
          <p className="text-white/50 max-w-md mx-auto mb-6 text-sm">
            Create your first audit cycle to begin verifying assets for a specific department.
          </p>
          <button className="btn-secondary" onClick={() => setShowCreate(true)}>
            Create Audit Cycle
          </button>
        </div>
      ) : (
        <div className="grid gap-3">
          {cycles.map((cycle) => (
            <button
              key={cycle._id}
              onClick={() => setSelected(cycle)}
              className="group flex items-center gap-5 p-5 rounded-xl border border-white/10 bg-[#1a1c23] hover:bg-white/[0.04] hover:border-teal/40 transition-all text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-teal/50"
            >
              <div className="flex-1 min-w-0 flex items-center gap-5">
                <div className={`w-2.5 h-2.5 rounded-full flex-none shadow-sm ${cycle.status === 'closed' ? 'bg-white/20' : 'bg-teal shadow-teal/50'}`} />
                <div className="flex-1">
                  <h3 className="font-semibold text-white text-base truncate group-hover:text-teal transition-colors mb-1">{cycle.name || 'Unnamed Cycle'}</h3>
                  <div className="flex items-center gap-4 text-xs text-white/50">
                    <span className="flex items-center gap-1.5"><Activity size={12} /> {cycle.scopeDepartment?.name || '—'}</span>
                    <span className="w-1 h-1 bg-white/20 rounded-full" />
                    <span>{fmtDate(cycle.startDate)} – {fmtDate(cycle.endDate)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <span className={`badge ${cycle.status === 'closed' ? 'badge-gray' : 'badge-teal bg-teal/10'} px-3 py-1 font-medium`}>
                  {cycle.status === 'closed' ? 'Closed' : 'Active'}
                </span>
                <ChevronRight size={20} className="text-white/20 group-hover:text-teal transition-colors transform group-hover:translate-x-1" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
