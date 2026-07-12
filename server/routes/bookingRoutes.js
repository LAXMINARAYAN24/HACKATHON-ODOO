const express = require('express');
const router = express.Router();
const {
  createBooking,
  getAllBookings,
  getBookingById,
  cancelBooking,
  updateBookingStatus,
} = require('../controllers/bookingController');

// ------------------------------------------------------------------
// Auth middleware (owned by Person A)
// Applied to all booking routes — requires valid JWT
// ------------------------------------------------------------------
const { auth } = require('../middleware/auth');

// ------------------------------------------------------------------
// Booking Routes
// Base path: /api/bookings (mounted in server.js by Person A)
// ------------------------------------------------------------------

// Create a new booking (overlap + bookable validation in controller)
router.post('/', auth, createBooking);

// List all bookings (supports query filters: status, resource, employee, startDate, endDate)
router.get('/', auth, getAllBookings);

// Get a single booking by ID
router.get('/:id', auth, getBookingById);

// Cancel a booking (only if status is 'upcoming')
router.patch('/:id/cancel', auth, cancelBooking);

// Update booking status (upcoming → ongoing → completed)
router.patch('/:id/status', auth, updateBookingStatus);

module.exports = router;
