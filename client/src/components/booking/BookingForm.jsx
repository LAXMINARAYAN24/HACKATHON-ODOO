import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { createBooking } from '../../services/bookingService';
import { openInGoogleCalendar } from '../../utils/googleCalendar';
import axios from 'axios';

// ------------------------------------------------------------------
// API instance for fetching bookable assets (shared config)
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

/**
 * BookingForm — Create a new resource booking.
 * Uses React Hook Form for validation and submission.
 *
 * @param {Object} props
 * @param {Function} [props.onSuccess] - Callback after successful booking creation
 */
const BookingForm = ({ onSuccess }) => {
  const [assets, setAssets] = useState([]);
  const [loadingAssets, setLoadingAssets] = useState(true);
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [createdBooking, setCreatedBooking] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      resourceId: '',
      title: '',
      description: '',
      startTime: '',
      endTime: '',
    },
  });

  const watchStartTime = watch('startTime');

  // ------------------------------------------------------------------
  // Fetch bookable assets on mount
  // ------------------------------------------------------------------
  useEffect(() => {
    const fetchAssets = async () => {
      try {
        setLoadingAssets(true);
        const response = await API.get('/assets', {
          params: { isBookable: true },
        });
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

      const result = await createBooking({
        resourceId: data.resourceId,
        title: data.title.trim(),
        description: data.description?.trim() || '',
        startTime: new Date(data.startTime).toISOString(),
        endTime: new Date(data.endTime).toISOString(),
      });

      if (result.success) {
        setCreatedBooking(result.data);
        reset();
        if (onSuccess) onSuccess(result.data);
      }
    } catch (error) {
      const status = error.response?.status;
      const message =
        error.response?.data?.message || 'Failed to create booking';

      if (status === 409) {
        setSubmitError('⚠️ Booking conflicts with an existing reservation. Please choose a different time slot.');
      } else if (status === 400) {
        setSubmitError(message);
      } else {
        setSubmitError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ------------------------------------------------------------------
  // Handle Google Calendar after creation
  // ------------------------------------------------------------------
  const handleAddToCalendar = () => {
    if (createdBooking) {
      openInGoogleCalendar(createdBooking);
      setCreatedBooking(null);
    }
  };

  const dismissSuccess = () => {
    setCreatedBooking(null);
  };

  // ------------------------------------------------------------------
  // Get current datetime string for min attribute
  // ------------------------------------------------------------------
  const getNowString = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  return (
    <div className="rounded-xl border border-gray-700/50 bg-gray-800/60 p-6 backdrop-blur-sm">
      <h2 className="mb-6 text-xl font-semibold text-gray-100">
        Book a Resource
      </h2>

      {/* Success Banner with Google Calendar */}
      {createdBooking && (
        <div className="mb-6 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-medium text-emerald-400">
                ✓ Booking created successfully!
              </p>
              <p className="mt-1 text-sm text-emerald-400/70">
                &quot;{createdBooking.title}&quot; has been reserved.
              </p>
            </div>
            <button
              onClick={dismissSuccess}
              className="text-emerald-400/50 hover:text-emerald-400"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <button
            onClick={handleAddToCalendar}
            className="mt-3 inline-flex items-center gap-2 rounded-lg bg-emerald-600/20 px-4 py-2 text-sm font-medium text-emerald-300 transition-all duration-200 hover:bg-emerald-600/30"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
            Add to Google Calendar
          </button>
        </div>
      )}

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
        {/* Resource Selector */}
        <div>
          <label
            htmlFor="booking-resource"
            className="mb-1.5 block text-sm font-medium text-gray-300"
          >
            Resource <span className="text-red-400">*</span>
          </label>
          <select
            id="booking-resource"
            className="w-full rounded-lg border border-gray-600/50 bg-gray-900/50 px-4 py-2.5 text-sm text-gray-200 outline-none transition-colors focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/25 disabled:opacity-50"
            disabled={loadingAssets}
            {...register('resourceId', {
              required: 'Please select a resource',
            })}
          >
            <option value="">
              {loadingAssets ? 'Loading assets...' : 'Select a resource'}
            </option>
            {assets.map((asset) => (
              <option key={asset._id} value={asset._id}>
                {asset.name} {asset.assetTag ? `(${asset.assetTag})` : ''}
              </option>
            ))}
          </select>
          {errors.resourceId && (
            <p className="mt-1 text-xs text-red-400">
              {errors.resourceId.message}
            </p>
          )}
        </div>

        {/* Title */}
        <div>
          <label
            htmlFor="booking-title"
            className="mb-1.5 block text-sm font-medium text-gray-300"
          >
            Title <span className="text-red-400">*</span>
          </label>
          <input
            id="booking-title"
            type="text"
            placeholder="e.g. Team standup meeting"
            className="w-full rounded-lg border border-gray-600/50 bg-gray-900/50 px-4 py-2.5 text-sm text-gray-200 placeholder-gray-500 outline-none transition-colors focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/25"
            {...register('title', {
              required: 'Title is required',
              maxLength: {
                value: 200,
                message: 'Title cannot exceed 200 characters',
              },
            })}
          />
          {errors.title && (
            <p className="mt-1 text-xs text-red-400">
              {errors.title.message}
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="booking-description"
            className="mb-1.5 block text-sm font-medium text-gray-300"
          >
            Description
          </label>
          <textarea
            id="booking-description"
            rows={3}
            placeholder="Optional details about this booking..."
            className="w-full resize-none rounded-lg border border-gray-600/50 bg-gray-900/50 px-4 py-2.5 text-sm text-gray-200 placeholder-gray-500 outline-none transition-colors focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/25"
            {...register('description', {
              maxLength: {
                value: 1000,
                message: 'Description cannot exceed 1000 characters',
              },
            })}
          />
          {errors.description && (
            <p className="mt-1 text-xs text-red-400">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Time Inputs — Side by Side */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Start Time */}
          <div>
            <label
              htmlFor="booking-start"
              className="mb-1.5 block text-sm font-medium text-gray-300"
            >
              Start Time <span className="text-red-400">*</span>
            </label>
            <input
              id="booking-start"
              type="datetime-local"
              min={getNowString()}
              className="w-full rounded-lg border border-gray-600/50 bg-gray-900/50 px-4 py-2.5 text-sm text-gray-200 outline-none transition-colors focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/25"
              {...register('startTime', {
                required: 'Start time is required',
              })}
            />
            {errors.startTime && (
              <p className="mt-1 text-xs text-red-400">
                {errors.startTime.message}
              </p>
            )}
          </div>

          {/* End Time */}
          <div>
            <label
              htmlFor="booking-end"
              className="mb-1.5 block text-sm font-medium text-gray-300"
            >
              End Time <span className="text-red-400">*</span>
            </label>
            <input
              id="booking-end"
              type="datetime-local"
              min={watchStartTime || getNowString()}
              className="w-full rounded-lg border border-gray-600/50 bg-gray-900/50 px-4 py-2.5 text-sm text-gray-200 outline-none transition-colors focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/25"
              {...register('endTime', {
                required: 'End time is required',
                validate: (value) => {
                  if (watchStartTime && new Date(value) <= new Date(watchStartTime)) {
                    return 'End time must be after start time';
                  }
                  return true;
                },
              })}
            />
            {errors.endTime && (
              <p className="mt-1 text-xs text-red-400">
                {errors.endTime.message}
              </p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all duration-200 hover:from-blue-500 hover:to-blue-400 hover:shadow-blue-500/30 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? (
            <span className="inline-flex items-center gap-2">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Booking...
            </span>
          ) : (
            'Book Resource'
          )}
        </button>
      </form>
    </div>
  );
};

export default BookingForm;
