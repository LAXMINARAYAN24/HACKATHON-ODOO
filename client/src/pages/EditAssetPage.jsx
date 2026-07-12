// client/src/pages/EditAssetPage.jsx
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api.js';

const STATUS_OPTIONS = ['Available', 'Allocated', 'Reserved', 'Under Maintenance', 'Lost', 'Retired', 'Disposed'];

export default function EditAssetPage() {
  const { id } = useParams();
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/categories').then(res => setCategories(res.data.data || [])).catch(console.error);
    api.get('/departments').then(res => setDepartments(res.data.data || [])).catch(console.error);
    api.get(`/assets/${id}`).then(res => {
      const data = res.data.data;
      reset({
        ...data,
        category: data.category?._id,
        department: data.department?._id,
      });
    }).catch(console.error);
  }, [id, reset]);

  const onSubmit = async (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'photo') {
        if (data[key]?.[0]) formData.append('photo', data[key][0]);
      } else {
        formData.append(key, data[key]);
      }
    });

    try {
      await api.put(`/assets/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      navigate('/assets');
    } catch (err) {
      console.error('Failed to update asset', err);
    }
  };

  return (
    <div className="page-container max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Edit Asset</h1>
        <p className="text-sm text-slate-400 mt-1">Update asset information.</p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Tag *</label>
              <input {...register('tag', { required: true })} className="input-field w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Name *</label>
              <input {...register('name', { required: true })} className="input-field w-full" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Category</label>
              <select {...register('category')} className="input-field w-full">
                <option value="">Select Category</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Department</label>
              <select {...register('department')} className="input-field w-full">
                <option value="">Select Department</option>
                {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Status</label>
            <select {...register('status')} className="input-field w-full">
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Replace Photo</label>
            <input type="file" accept="image/*" {...register('photo')} className="input-field w-full" />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button type="button" onClick={() => navigate('/assets')} className="px-4 py-2 text-slate-400 hover:text-white transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? 'Updating…' : 'Update Asset'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
