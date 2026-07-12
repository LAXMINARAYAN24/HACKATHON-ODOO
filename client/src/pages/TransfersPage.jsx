// client/src/pages/TransfersPage.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api.js';
import useAuthStore from '../store/authStore.js';

const statusStyle = {
  Pending:  'bg-yellow-100 text-yellow-800',
  Approved: 'bg-green-100 text-green-800',
  Rejected: 'bg-red-100 text-red-800',
};

export default function TransfersPage() {
  const [transfers, setTransfers] = useState([]);
  const { user } = useAuthStore();

  const fetchTransfers = async () => {
    try {
      const res = await api.get('/transfers');
      setTransfers(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch transfers', err);
    }
  };

  useEffect(() => {
    fetchTransfers();
  }, []);

  const handleAction = async (id, action) => {
    try {
      let body = {};
      if (action === 'reject') {
        const reason = window.prompt('Enter rejection reason:');
        if (!reason) return;
        body.rejectionReason = reason;
      }
      await api.put(`/transfers/${id}/${action}`, body);
      fetchTransfers();
    } catch (err) {
      console.error(`Failed to ${action} transfer`, err);
    }
  };

  return (
    <div className="page-container">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Transfer Requests</h1>
        <Link to="/transfers/new" className="btn-primary">
          + Request Transfer
        </Link>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="p-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Asset</th>
              <th className="p-3 text-xs font-semibold uppercase tracking-wide text-slate-400">From</th>
              <th className="p-3 text-xs font-semibold uppercase tracking-wide text-slate-400">To</th>
              <th className="p-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Reason</th>
              <th className="p-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Status</th>
              {user?.role === 'admin' && (
                <th className="p-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {transfers.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-slate-500 text-sm">
                  No transfer requests found.
                </td>
              </tr>
            ) : (
              transfers.map((req) => (
                <tr key={req._id} className="border-b border-border hover:bg-surface-50 transition-colors">
                  <td className="p-3 text-sm font-mono text-primary-400">{req.asset?.tag || '—'}</td>
                  <td className="p-3 text-sm text-slate-400">{req.fromEmployee?.name || '—'}</td>
                  <td className="p-3 text-sm text-white">{req.toEmployee?.name || '—'}</td>
                  <td className="p-3 text-sm text-slate-400 max-w-xs truncate">{req.reason}</td>
                  <td className="p-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyle[req.status] || 'bg-gray-100 text-gray-800'}`}>
                      {req.status}
                    </span>
                  </td>
                  {user?.role === 'admin' && (
                    <td className="p-3 text-sm">
                      {req.status === 'Pending' && (
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleAction(req._id, 'approve')}
                            className="text-green-400 hover:text-green-300 text-sm"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleAction(req._id, 'reject')}
                            className="text-red-400 hover:text-red-300 text-sm"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
