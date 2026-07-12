import axios from 'axios';

// ------------------------------------------------------------------
// Base API instance
// Uses Person A's shared API config if available, otherwise falls
// back to a local instance pointing at the server base URL.
// The interceptor attaches the JWT token from localStorage.
// ------------------------------------------------------------------
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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
