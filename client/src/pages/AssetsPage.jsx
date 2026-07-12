// client/src/pages/AssetsPage.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api.js';
import useAuthStore from '../store/authStore.js';

const statusColors = {
  'Available':         'bg-green-100 text-green-800',
  'Allocated':         'bg-blue-100 text-blue-800',
  'Reserved':          'bg-yellow-100 text-yellow-800',
  'Under Maintenance': 'bg-orange-100 text-orange-800',
  'Lost':              'bg-red-100 text-red-800',
  'Retired':           'bg-gray-100 text-gray-800',
  'Disposed':          'bg-gray-200 text-gray-900',
};

export default function AssetsPage() {
  const [assets, setAssets] = useState([]);
  const [search, setSearch] = useState('');
  const { user } = useAuthStore();

  const fetchAssets = async () => {
    try {
      const res = await api.get(`/assets?search=${search}`);
      setAssets(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch assets', err);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [search]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this asset?')) return;
    try {
      await api.delete(`/assets/${id}`);
      fetchAssets();
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  return (
    <div className="page-container">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Assets</h1>
        {user?.role === 'admin' && (
          <Link to="/assets/new" className="btn-primary">
            + Add Asset
          </Link>
        )}
      </div>

      <div className="card">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by tag or name…"
            className="input-field max-w-md"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="p-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Tag</th>
                <th className="p-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Name</th>
                <th className="p-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Category</th>
                <th className="p-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Department</th>
                <th className="p-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Status</th>
                {user?.role === 'admin' && (
                  <th className="p-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {assets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-500 text-sm">
                    No assets found.
                  </td>
                </tr>
              ) : (
                assets.map((asset) => (
                  <tr key={asset._id} className="border-b border-border hover:bg-surface-50 transition-colors">
                    <td className="p-3 text-sm font-mono text-primary-400">{asset.tag}</td>
                    <td className="p-3 text-sm text-white">{asset.name}</td>
                    <td className="p-3 text-sm text-slate-400">{asset.category?.name || '—'}</td>
                    <td className="p-3 text-sm text-slate-400">{asset.department?.name || '—'}</td>
                    <td className="p-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[asset.status] || 'bg-gray-100 text-gray-800'}`}>
                        {asset.status}
                      </span>
                    </td>
                    {user?.role === 'admin' && (
                      <td className="p-3 text-sm">
                        <div className="flex gap-3">
                          <Link to={`/assets/edit/${asset._id}`} className="text-primary-400 hover:text-primary-300 text-sm">
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(asset._id)}
                            className="text-red-400 hover:text-red-300 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
