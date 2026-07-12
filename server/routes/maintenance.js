import express from 'express';
const router = express.Router();
import {
  createRequest,
  getAllRequests,
  getRequestById,
  approveRequest,
  rejectRequest,
  assignTechnician,
  startProgress,
  resolveRequest,
} from '../controllers/maintenanceController.js';

// Auth middleware (default export from auth.js)
import auth from '../middleware/auth.js';

// Raise a new maintenance request
router.post('/', auth, createRequest);

// List all maintenance requests
router.get('/', auth, getAllRequests);

// Get a single maintenance request by ID
router.get('/:id', auth, getRequestById);

// Approve a pending request
router.patch('/:id/approve', auth, approveRequest);

// Reject a pending request
router.patch('/:id/reject', auth, rejectRequest);

// Assign a technician to an approved request
router.patch('/:id/assign', auth, assignTechnician);

// Mark as in progress
router.patch('/:id/start', auth, startProgress);

// Resolve a request
router.patch('/:id/resolve', auth, resolveRequest);

export default router;
