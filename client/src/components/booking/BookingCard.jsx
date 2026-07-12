import { openInGoogleCalendar } from '../../utils/googleCalendar';

// ------------------------------------------------------------------
// Status badge configuration
// Maps frozen enum values to Tailwind color classes
// ------------------------------------------------------------------
const STATUS_CONFIG = {
  upcoming: {
    label: 'Upcoming',
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    border: 'border-blue-500/30',
  },
  ongoing: {
    label: 'Ongoing',
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
  },
  completed: {
    label: 'Completed',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
  },
  cancelled: {
    label: 'Cancelled',
    bg: 'bg-gray-500/10',
    text: 'text-gray-400',
    border: 'border-gray-500/30',
  },
};

/**
 * Format a date for display.
 * @param {string|Date} date
 * @returns {string} Formatted date string
 */
const formatDateTime = (date) => {
  return new Date(date).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * BookingCard — Displays a single booking as a card.
 *
 * @param {Object} props
 * @param {Object} props.booking - Populated booking object from API
 * @param {Function} [props.onCancel] - Callback when cancel button is clicked
 * @param {Function} [props.onRefresh] - Callback to refresh the parent list
 */
const BookingCard = ({ booking, onCancel, onRefresh }) => {
  const status = STATUS_CONFIG[booking.status] || STATUS_CONFIG.upcoming;

  const handleCancel = async () => {
    if (onCancel) {
      await onCancel(booking._id);
      if (onRefresh) onRefresh();
    }
  };

  const handleAddToCalendar = () => {
    openInGoogleCalendar(booking);
  };

  return (
    <div className="group relative rounded-xl border border-gray-700/50 bg-gray-800/60 p-5 backdrop-blur-sm transition-all duration-300 hover:border-gray-600/70 hover:bg-gray-800/80 hover:shadow-lg hover:shadow-black/20">
      {/* Header: Title + Status Badge */}
      <div className="mb-3 flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold text-gray-100 leading-tight">
          {booking.title}
        </h3>
        <span
          className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${status.bg} ${status.text} ${status.border}`}
        >
          {status.label}
        </span>
      </div>

      {/* Description */}
      {booking.description && (
        <p className="mb-4 text-sm text-gray-400 leading-relaxed line-clamp-2">
          {booking.description}
        </p>
      )}

      {/* Details Grid */}
      <div className="mb-4 space-y-2">
        {/* Resource */}
        <div className="flex items-center gap-2 text-sm">
          <svg className="h-4 w-4 shrink-0 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <span className="text-gray-400">
            {booking.resource?.name || 'N/A'}
          </span>
          {booking.resource?.assetTag && (
            <span className="rounded bg-gray-700/60 px-1.5 py-0.5 text-xs text-gray-500">
              {booking.resource.assetTag}
            </span>
          )}
        </div>

        {/* Employee */}
        <div className="flex items-center gap-2 text-sm">
          <svg className="h-4 w-4 shrink-0 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
          <span className="text-gray-400">
            {booking.employee?.name || 'N/A'}
          </span>
        </div>

        {/* Time Range */}
        <div className="flex items-center gap-2 text-sm">
          <svg className="h-4 w-4 shrink-0 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-gray-400">
            {formatDateTime(booking.startTime)}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <svg className="h-4 w-4 shrink-0 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-gray-400">
            {formatDateTime(booking.endTime)}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 border-t border-gray-700/40 pt-3">
        {/* Add to Google Calendar — always visible for non-cancelled */}
        {booking.status !== 'cancelled' && (
          <button
            onClick={handleAddToCalendar}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600/10 px-3 py-1.5 text-xs font-medium text-emerald-400 transition-all duration-200 hover:bg-emerald-600/20 hover:text-emerald-300"
            title="Add to Google Calendar"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
            Add to Calendar
          </button>
        )}

        {/* Cancel — only for upcoming bookings */}
        {booking.status === 'upcoming' && onCancel && (
          <button
            onClick={handleCancel}
            className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-red-600/10 px-3 py-1.5 text-xs font-medium text-red-400 transition-all duration-200 hover:bg-red-600/20 hover:text-red-300"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

export default BookingCard;
