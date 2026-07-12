import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { createRequest } from '../../services/maintenanceService';
import axios from 'axios';

// ------------------------------------------------------------------
// API instance for fetching assets
// ------------------------------------------------------------------
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ------------------------------------------------------------------
// Priority options
// ------------------------------------------------------------------
const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low', description: 'Minor issue, no urgency' },
  { value: 'medium', label: 'Medium', description: 'Needs attention soon' },
  { value: 'high', label: 'High', description: 'Impacting operations' },
  { value: 'critical', label: 'Critical', description: 'Immediate attention required' },
];

/**
 * MaintenanceForm — Raise a new maintenance request.
 * Uses React Hook Form for validation and submission.
 *
 * @param {Object} props
 * @param {Function} [props.onSuccess] - Callback after successful request creation
 * @param {Function} [props.onClose] - Callback to close the form (if used in modal)
 */
const MaintenanceForm = ({ onSuccess, onClose }) => {
  const [assets, setAssets] = useState([]);
  const [loadingAssets, setLoadingAssets] = useState(true);
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      asset: '',
      issue: '',
      priority: 'medium',
      photoUrl: '',
    },
  });

  // ------------------------------------------------------------------
  // Fetch assets on mount
  // ------------------------------------------------------------------
  useEffect(() => {
    const fetchAssets = async () => {
      try {
        setLoadingAssets(true);
        const response = await API.get('/assets');
        if (response.data.success) {
          setAssets(response.data.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch assets:', error);
        setAssets([]);
      } finally {
        setLoadingAssets(false);
      }
    };

    fetchAssets();
  }, []);

  // ------------------------------------------------------------------
  // Form submission
  // ------------------------------------------------------------------
  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      setSubmitError('');

      const result = await createRequest({
        asset: data.asset,
        issue: data.issue.trim(),
        priority: data.priority,
        photoUrl: data.photoUrl?.trim() || undefined,
      });

      if (result.success) {
        reset();
        if (onSuccess) onSuccess(result.data);
        if (onClose) onClose();
      }
    } catch (error) {
      const message =
        error.response?.data?.message || 'Failed to raise maintenance request';
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-xl border border-gray-700/50 bg-gray-800/60 p-6 backdrop-blur-sm">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-100">
          Raise Maintenance Request
        </h2>
        {onClose && (
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-700/50 hover:text-gray-300"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Error Banner */}
      {submitError && (
        <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4">
          <div className="flex items-start justify-between">
            <p className="text-sm text-red-400">{submitError}</p>
            <button
              onClick={() => setSubmitError('')}
              className="text-red-400/50 hover:text-red-400"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Asset Selector */}
        <div>
          <label
            htmlFor="maintenance-asset"
            className="mb-1.5 block text-sm font-medium text-gray-300"
          >
            Asset <span className="text-red-400">*</span>
          </label>
          <select
            id="maintenance-asset"
            className="w-full rounded-lg border border-gray-600/50 bg-gray-900/50 px-4 py-2.5 text-sm text-gray-200 outline-none transition-colors focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/25 disabled:opacity-50"
            disabled={loadingAssets}
            {...register('asset', {
              required: 'Please select an asset',
            })}
          >
            <option value="">
              {loadingAssets ? 'Loading assets...' : 'Select an asset'}
            </option>
            {assets.map((asset) => (
              <option key={asset._id} value={asset._id}>
                {asset.name} {asset.assetTag ? `(${asset.assetTag})` : ''}
              </option>
            ))}
          </select>
          {errors.asset && (
            <p className="mt-1 text-xs text-red-400">
              {errors.asset.message}
            </p>
          )}
        </div>

        {/* Issue Description */}
        <div>
          <label
            htmlFor="maintenance-issue"
            className="mb-1.5 block text-sm font-medium text-gray-300"
          >
            Issue Description <span className="text-red-400">*</span>
          </label>
          <textarea
            id="maintenance-issue"
            rows={4}
            placeholder="Describe the issue in detail..."
            className="w-full resize-none rounded-lg border border-gray-600/50 bg-gray-900/50 px-4 py-2.5 text-sm text-gray-200 placeholder-gray-500 outline-none transition-colors focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/25"
            {...register('issue', {
              required: 'Issue description is required',
              maxLength: {
                value: 2000,
                message: 'Issue description cannot exceed 2000 characters',
              },
            })}
          />
          {errors.issue && (
            <p className="mt-1 text-xs text-red-400">
              {errors.issue.message}
            </p>
          )}
        </div>

        {/* Priority */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">
            Priority <span className="text-red-400">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {PRIORITY_OPTIONS.map((option) => (
              <label
                key={option.value}
                className="group/radio cursor-pointer"
              >
                <input
                  type="radio"
                  value={option.value}
                  className="peer hidden"
                  {...register('priority', {
                    required: 'Priority is required',
                  })}
                />
                <div className="rounded-lg border border-gray-600/50 bg-gray-900/30 p-3 text-center transition-all duration-200 peer-checked:border-blue-500/50 peer-checked:bg-blue-500/10 hover:border-gray-500/50 hover:bg-gray-900/50">
                  <p className="text-sm font-medium text-gray-300 peer-checked:text-blue-400">
                    {option.label}
                  </p>
                  <p className="mt-0.5 text-[10px] text-gray-500">
                    {option.description}
                  </p>
                </div>
              </label>
            ))}
          </div>
          {errors.priority && (
            <p className="mt-1 text-xs text-red-400">
              {errors.priority.message}
            </p>
          )}
        </div>

        {/* Photo URL */}
        <div>
          <label
            htmlFor="maintenance-photo"
            className="mb-1.5 block text-sm font-medium text-gray-300"
          >
            Photo URL
            <span className="ml-1 text-xs text-gray-500">(optional)</span>
          </label>
          <input
            id="maintenance-photo"
            type="url"
            placeholder="https://example.com/photo.jpg"
            className="w-full rounded-lg border border-gray-600/50 bg-gray-900/50 px-4 py-2.5 text-sm text-gray-200 placeholder-gray-500 outline-none transition-colors focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/25"
            {...register('photoUrl')}
          />
        </div>

        {/* Submit Button */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 rounded-lg bg-gradient-to-r from-orange-600 to-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition-all duration-200 hover:from-orange-500 hover:to-orange-400 hover:shadow-orange-500/30 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? (
              <span className="inline-flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Submitting...
              </span>
            ) : (
              'Raise Request'
            )}
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-gray-700/50 px-6 py-3 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-700/70"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default MaintenanceForm;
