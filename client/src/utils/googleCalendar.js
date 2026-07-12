// ------------------------------------------------------------------
// Google Calendar URL Builder
// ------------------------------------------------------------------
// Completely isolated utility — no schema changes, no API changes,
// no OAuth, no backend involvement. Builds a prefilled Google
// Calendar event URL and opens it in a new tab.
// ------------------------------------------------------------------

/**
 * Format a Date object to Google Calendar's required format.
 * Google Calendar expects: YYYYMMDDTHHmmssZ (UTC, no punctuation).
 *
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string
 */
const formatDateForGoogle = (date) => {
  const d = new Date(date);
  return d
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '');
};

/**
 * Build a Google Calendar prefilled event URL from booking details.
 *
 * @param {Object} options
 * @param {string} options.title        - Event title (from booking.title)
 * @param {string} [options.description] - Event description (from booking.description)
 * @param {Date|string} options.startTime - Event start time
 * @param {Date|string} options.endTime   - Event end time
 * @param {string} [options.location]    - Event location (e.g. asset name or room)
 * @returns {string} Full Google Calendar URL
 */
export const buildGoogleCalendarUrl = ({
  title,
  description = '',
  startTime,
  endTime,
  location = '',
}) => {
  const baseUrl = 'https://calendar.google.com/calendar/render';

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    details: description,
    dates: `${formatDateForGoogle(startTime)}/${formatDateForGoogle(endTime)}`,
  });

  // Only add location if provided
  if (location) {
    params.set('location', location);
  }

  return `${baseUrl}?${params.toString()}`;
};

/**
 * Open a prefilled Google Calendar event in a new browser tab.
 * Extracts relevant fields from a populated booking object.
 *
 * @param {Object} booking - Populated booking object from the API
 * @param {string} booking.title
 * @param {string} [booking.description]
 * @param {Date|string} booking.startTime
 * @param {Date|string} booking.endTime
 * @param {Object} [booking.resource] - Populated asset reference
 * @param {string} [booking.resource.name] - Used as event location
 */
export const openInGoogleCalendar = (booking) => {
  const url = buildGoogleCalendarUrl({
    title: booking.title,
    description: booking.description || '',
    startTime: booking.startTime,
    endTime: booking.endTime,
    location: booking.resource?.name || '',
  });

  window.open(url, '_blank', 'noopener,noreferrer');
};

export default {
  buildGoogleCalendarUrl,
  openInGoogleCalendar,
};
