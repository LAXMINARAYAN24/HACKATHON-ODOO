// client/src/pages/AllocationsPage.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api.js';
import useAuthStore from '../store/authStore.js';

const statusStyle = {
  Active:   'bg-blue-100 text-blue-800',
  Returned: 'bg-green-100 text-green-800',
  Overdue:  'bg-red-100 text-red-800',
};

export default function AllocationsPage() {
  const [allocations, setAllocations] = useState([]);
  const { user } = useAuthStore();

  const fetchAllocations = async () => {
    try {
      const res = await api.get('/allocations');
      setAllocations(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch allocations', err);
    }
  };

  useEffect(() => {
    fetchAllocations();
  }, []);

  const handleReturn = async (id) => {
    const condition = window.prompt('Enter condition notes upon return:');
    if (condition === null) return;
    try {
      await api.put(`/allocations/${id}/return`, { conditionAtReturn: condition });
      fetchAllocations();
    } catch (err) {
      console.error('Failed to return asset', err);
    }
  };

  return (
    <div className="page-container">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Allocations</h1>
        {user?.role === 'admin' && (
          <Link to="/allocations/new" className="btn-primary">
            + Allocate Asset
          </Link>
        )}
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="p-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Asset Tag</th>
              <th className="p-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Employee</th>
              <th className="p-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Department</th>
              <th className="p-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Allocated On</th>
              <th className="p-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Status</th>
              {user?.role === 'admin' && (
                <th className="p-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {allocations.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-slate-500 text-sm">
                  No allocations found.
                </td>
              </tr>
            ) : (
              allocations.map((alloc) => (
                <tr key={alloc._id} className="border-b border-border hover:bg-surface-50 transition-colors">
                  <td className="p-3 text-sm font-mono text-primary-400">{alloc.asset?.tag || '—'}</td>
                  <td className="p-3 text-sm text-white">{alloc.employee?.name || '—'}</td>
                  <td className="p-3 text-sm text-slate-400">{alloc.department?.name || '—'}</td>
                  <td className="p-3 text-sm text-slate-400">
                    {alloc.allocatedDate ? new Date(alloc.allocatedDate).toLocaleDateString() : '—'}
                  </td>
                  <td className="p-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyle[alloc.status] || 'bg-gray-100 text-gray-800'}`}>
                      {alloc.status}
                    </span>
                  </td>
                  {user?.role === 'admin' && (
                    <td className="p-3 text-sm">
                      {alloc.status === 'Active' && (
                        <button
                          onClick={() => handleReturn(alloc._id)}
                          className="text-primary-400 hover:text-primary-300 text-sm"
                        >
                          Return
                        </button>
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
