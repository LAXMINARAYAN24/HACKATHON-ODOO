// client/src/pages/RequestTransferPage.jsx
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';

export default function RequestTransferPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const [assets, setAssets] = useState([]);
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/assets').then(res => setAssets(res.data.data || [])).catch(console.error);
    api.get('/users').then(res => setUsers(res.data.data || [])).catch(console.error);
  }, []);

  const onSubmit = async (data) => {
    try {
      await api.post('/transfers', data);
      navigate('/transfers');
    } catch (err) {
      console.error('Failed to request transfer', err);
    }
  };

  return (
    <div className="page-container max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Request Transfer</h1>
        <p className="text-sm text-slate-400 mt-1">Request an asset to be transferred to another employee.</p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Asset *</label>
            <select {...register('asset', { required: true })} className="input-field w-full">
              <option value="">Select Asset</option>
              {assets.map(a => (
                <option key={a._id} value={a._id}>{a.tag} — {a.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">To Employee *</label>
            <select {...register('toEmployee', { required: true })} className="input-field w-full">
              <option value="">Select Employee</option>
              {users.map(u => (
                <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Reason *</label>
            <textarea
              {...register('reason', { required: true, minLength: { value: 10, message: 'Minimum 10 characters' } })}
              rows={4}
              className="input-field w-full resize-none"
              placeholder="Explain the reason for the transfer (min 10 characters)…"
            />
            {errors.reason && <p className="text-red-400 text-xs mt-1">{errors.reason.message}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button type="button" onClick={() => navigate('/transfers')} className="px-4 py-2 text-slate-400 hover:text-white transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? 'Submitting…' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
