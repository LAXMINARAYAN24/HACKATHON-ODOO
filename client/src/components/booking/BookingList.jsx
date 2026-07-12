import { useState, useEffect, useCallback } from 'react';
import { getAllBookings, cancelBooking } from '../../services/bookingService';
import BookingCard from './BookingCard';

// ------------------------------------------------------------------
// Status filter options (frozen enum values + 'all')
// ------------------------------------------------------------------
const STATUS_FILTERS = [
  { value: '', label: 'All Bookings' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

/**
 * BookingList — Displays a filterable list of bookings as cards.
 *
 * @param {Object} props
 * @param {number} [props.refreshKey] - Increment to trigger re-fetch (from parent)
 */
const BookingList = ({ refreshKey }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // ------------------------------------------------------------------
  // Fetch bookings
  // ------------------------------------------------------------------
  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const params = {};
      if (statusFilter) params.status = statusFilter;

      const result = await getAllBookings(params);

      if (result.success) {
        setBookings(result.data || []);
      } else {
        setError(result.message || 'Failed to load bookings');
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to load bookings. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  // Re-fetch on filter change or refreshKey change
  useEffect(() => {
    fetchBookings();
  }, [fetchBookings, refreshKey]);

  // ------------------------------------------------------------------
  // Cancel handler — passed to BookingCard
  // ------------------------------------------------------------------
  const handleCancel = async (id) => {
    try {
      const result = await cancelBooking(id);
      if (result.success) {
        fetchBookings();
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to cancel booking'
      );
    }
  };

  // ------------------------------------------------------------------
  // Loading skeleton
  // ------------------------------------------------------------------
  const LoadingSkeleton = () => (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-xl border border-gray-700/30 bg-gray-800/40 p-5"
        >
          <div className="mb-3 flex justify-between">
            <div className="h-5 w-2/3 rounded bg-gray-700/50" />
            <div className="h-5 w-16 rounded-full bg-gray-700/50" />
          </div>
          <div className="mb-4 space-y-2">
            <div className="h-3 w-full rounded bg-gray-700/30" />
            <div className="h-3 w-4/5 rounded bg-gray-700/30" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-1/2 rounded bg-gray-700/30" />
            <div className="h-3 w-2/3 rounded bg-gray-700/30" />
          </div>
        </div>
      ))}
    </div>
  );

  // ------------------------------------------------------------------
  // Empty state
  // ------------------------------------------------------------------
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center rounded-xl border border-gray-700/30 bg-gray-800/30 py-16">
      <svg
        className="mb-4 h-16 w-16 text-gray-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={0.75}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z"
        />
      </svg>
      <p className="text-lg font-medium text-gray-400">No bookings found</p>
      <p className="mt-1 text-sm text-gray-500">
        {statusFilter
          ? `No ${statusFilter} bookings to display.`
          : 'Create your first booking to get started.'}
      </p>
    </div>
  );

  return (
    <div>
      {/* Header + Filter Bar */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold text-gray-100">Bookings</h2>

        <div className="flex items-center gap-2">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setStatusFilter(filter.value)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                statusFilter === filter.value
                  ? 'bg-blue-600/20 text-blue-400 ring-1 ring-blue-500/30'
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-gray-300'
              }`}
            >
              {filter.label}
            </button>
          ))}

          {/* Refresh Button */}
          <button
            onClick={fetchBookings}
            disabled={loading}
            className="ml-1 rounded-lg bg-gray-800/50 p-1.5 text-gray-400 transition-all duration-200 hover:bg-gray-700/50 hover:text-gray-300 disabled:opacity-50"
            title="Refresh"
          >
            <svg
              className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-red-400">{error}</p>
            <button
              onClick={() => setError('')}
              className="text-red-400/50 hover:text-red-400"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <LoadingSkeleton />
      ) : bookings.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {bookings.map((booking) => (
            <BookingCard
              key={booking._id}
              booking={booking}
              onCancel={handleCancel}
              onRefresh={fetchBookings}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BookingList;
