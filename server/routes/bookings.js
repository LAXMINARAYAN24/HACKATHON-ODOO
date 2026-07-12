import express from 'express';
const router = express.Router();
import {
  createBooking,
  getAllBookings,
  getBookingById,
  cancelBooking,
  updateBookingStatus,
} from '../controllers/bookingController.js';

// Auth middleware (default export from auth.js)
import auth from '../middleware/auth.js';

// Create a new booking
router.post('/', auth, createBooking);

// List all bookings
router.get('/', auth, getAllBookings);

// Get a single booking by ID
router.get('/:id', auth, getBookingById);

// Cancel a booking
router.patch('/:id/cancel', auth, cancelBooking);

// Update booking status
router.patch('/:id/status', auth, updateBookingStatus);

export default router;
