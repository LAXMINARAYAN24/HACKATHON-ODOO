import API from './api.js';

// ------------------------------------------------------------------
// Booking Service
// ------------------------------------------------------------------

/**
 * Create a new booking.
 * Sends resourceId & employeeId — controller maps them to resource & employee.
 */
export const createBooking = async (data) => {
  const response = await API.post('/bookings', data);
  return response.data;
};

/**
 * Get all bookings with optional query filters.
 * @param {Object} params - { status, resource, employee, startDate, endDate }
 */
export const getAllBookings = async (params = {}) => {
  const response = await API.get('/bookings', { params });
  return response.data;
};

/**
 * Get a single booking by its ID.
 */
export const getBookingById = async (id) => {
  const response = await API.get(`/bookings/${id}`);
  return response.data;
};

/**
 * Cancel a booking (only if status is 'upcoming').
 */
export const cancelBooking = async (id) => {
  const response = await API.patch(`/bookings/${id}/cancel`);
  return response.data;
};

/**
 * Update booking status (upcoming → ongoing → completed).
 * @param {string} id - Booking ID
 * @param {Object} data - { status: 'ongoing' | 'completed' }
 */
export const updateBookingStatus = async (id, data) => {
  const response = await API.patch(`/bookings/${id}/status`, data);
  return response.data;
};

export default {
  createBooking,
  getAllBookings,
  getBookingById,
  cancelBooking,
  updateBookingStatus,
};
