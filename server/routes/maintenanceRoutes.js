const express = require('express');
const router = express.Router();
const {
  createRequest,
  getAllRequests,
  getRequestById,
  approveRequest,
  rejectRequest,
  assignTechnician,
  startProgress,
  resolveRequest,
} = require('../controllers/maintenanceController');

// ------------------------------------------------------------------
// Auth middleware (owned by Person A)
// Applied to all maintenance routes — requires valid JWT
// ------------------------------------------------------------------
const { auth } = require('../middleware/auth');

// ------------------------------------------------------------------
// Maintenance Routes
// Base path: /api/maintenance (mounted in server.js by Person A)
// ------------------------------------------------------------------

// Raise a new maintenance request
router.post('/', auth, createRequest);

// List all maintenance requests (supports query filters: status, priority, asset)
router.get('/', auth, getAllRequests);

// Get a single maintenance request by ID
router.get('/:id', auth, getRequestById);

// Approve a pending request (side effect: Asset.status → 'Under Maintenance')
router.patch('/:id/approve', auth, approveRequest);

// Reject a pending request
router.patch('/:id/reject', auth, rejectRequest);

// Assign a technician to an approved request
router.patch('/:id/assign', auth, assignTechnician);

// Mark as in progress (from technician_assigned)
router.patch('/:id/start', auth, startProgress);

// Resolve a request (side effect: Asset.status → 'Available')
router.patch('/:id/resolve', auth, resolveRequest);

module.exports = router;
