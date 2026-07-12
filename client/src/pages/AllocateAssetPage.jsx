// client/src/pages/AllocateAssetPage.jsx
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';

export default function AllocateAssetPage() {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm();
  const [assets, setAssets] = useState([]);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/assets?status=Available').then(res => setAssets(res.data.data || [])).catch(console.error);
    api.get('/users').then(res => setUsers(res.data.data || [])).catch(console.error);
    api.get('/departments').then(res => setDepartments(res.data.data || [])).catch(console.error);
  }, []);

  const onSubmit = async (data) => {
    try {
      await api.post('/allocations', data);
      navigate('/allocations');
    } catch (err) {
      console.error('Failed to allocate asset', err);
    }
  };

  return (
    <div className="page-container max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Allocate Asset</h1>
        <p className="text-sm text-slate-400 mt-1">Assign an available asset to an employee.</p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Asset *</label>
            <select {...register('asset', { required: true })} className="input-field w-full">
              <option value="">Select Available Asset</option>
              {assets.map(a => (
                <option key={a._id} value={a._id}>{a.tag} — {a.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Employee *</label>
            <select {...register('employee', { required: true })} className="input-field w-full">
              <option value="">Select Employee</option>
              {users.map(u => (
                <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Department *</label>
            <select {...register('department', { required: true })} className="input-field w-full">
              <option value="">Select Department</option>
              {departments.map(d => (
                <option key={d._id} value={d._id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Expected Return Date</label>
            <input type="date" {...register('expectedReturnDate')} className="input-field w-full" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Notes</label>
            <textarea
              {...register('notes')}
              rows={3}
              className="input-field w-full resize-none"
              placeholder="Optional notes…"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button type="button" onClick={() => navigate('/allocations')} className="px-4 py-2 text-slate-400 hover:text-white transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? 'Allocating…' : 'Allocate Asset'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
