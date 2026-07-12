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
// Maintenance Service
// ------------------------------------------------------------------

/**
 * Raise a new maintenance request.
 * @param {Object} data - { asset, issue, priority, photoUrl? }
 */
export const createRequest = async (data) => {
  const response = await API.post('/maintenance', data);
  return response.data;
};

/**
 * Get all maintenance requests with optional query filters.
 * @param {Object} params - { status, priority, asset }
 */
export const getAllRequests = async (params = {}) => {
  const response = await API.get('/maintenance', { params });
  return response.data;
};

/**
 * Get a single maintenance request by its ID.
 */
export const getRequestById = async (id) => {
  const response = await API.get(`/maintenance/${id}`);
  return response.data;
};

/**
 * Approve a pending maintenance request.
 * Side effect: Asset.status → 'Under Maintenance'
 */
export const approveRequest = async (id) => {
  const response = await API.patch(`/maintenance/${id}/approve`);
  return response.data;
};

/**
 * Reject a pending maintenance request.
 * @param {string} id - Request ID
 * @param {string} [remarks] - Optional rejection reason
 */
export const rejectRequest = async (id, remarks) => {
  const response = await API.patch(`/maintenance/${id}/reject`, { remarks });
  return response.data;
};

/**
 * Assign a technician to an approved request.
 * @param {string} id - Request ID
 * @param {string} technicianId - User ID of the technician
 */
export const assignTechnician = async (id, technicianId) => {
  const response = await API.patch(`/maintenance/${id}/assign`, { technicianId });
  return response.data;
};

/**
 * Mark a request as in progress (from technician_assigned).
 */
export const startProgress = async (id) => {
  const response = await API.patch(`/maintenance/${id}/start`);
  return response.data;
};

/**
 * Resolve a maintenance request.
 * Side effect: Asset.status → 'Available'
 * @param {string} id - Request ID
 * @param {string} [remarks] - Optional resolution notes
 */
export const resolveRequest = async (id, remarks) => {
  const response = await API.patch(`/maintenance/${id}/resolve`, { remarks });
  return response.data;
};

export default {
  createRequest,
  getAllRequests,
  getRequestById,
  approveRequest,
  rejectRequest,
  assignTechnician,
  startProgress,
  resolveRequest,
};
