import Booking from '../models/Booking.js';
import Asset from '../models/Asset.js';


// ------------------------------------------------------------------
// POST /api/bookings
// Create a new booking with overlap & bookable validation
// ------------------------------------------------------------------
const createBooking = async (req, res) => {
  try {
    const { resourceId, employeeId, title, description, startTime, endTime } =
      req.body;

    // --- Map incoming field names to schema field names ---
    const resource = resourceId;
    const employee = employeeId || req.user?.id;

    if (!resource || !employee || !title || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: resourceId, title, startTime, endTime',
      });
    }

    const newStart = new Date(startTime);
    const newEnd = new Date(endTime);

    if (newEnd <= newStart) {
      return res.status(400).json({
        success: false,
        message: 'End time must be after start time',
      });
    }

    // --- Check that the asset exists and is bookable ---
    const asset = await Asset.findById(resource);

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found',
      });
    }

    if (!asset.isBookable) {
      return res.status(400).json({
        success: false,
        message: 'This asset is not available for booking',
      });
    }

    // --- Overlap check (frozen contract logic) ---
    // Reject if: existing.startTime < newEnd AND existing.endTime > newStart
    // Ignore cancelled bookings.
    const overlap = await Booking.findOne({
      resource,
      status: { $ne: 'cancelled' },
      startTime: { $lt: newEnd },
      endTime: { $gt: newStart },
    });

    if (overlap) {
      return res.status(409).json({
        success: false,
        message: 'Booking conflicts with an existing reservation',
      });
    }

    // --- Create the booking ---
    const booking = await Booking.create({
      resource,
      employee,
      title,
      description,
      startTime: newStart,
      endTime: newEnd,
    });

    const populated = await Booking.findById(booking._id)
      .populate('resource', 'name assetTag')
      .populate('employee', 'name email');

    return res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: populated,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors)
        .map((e) => e.message)
        .join(', ');
      return res.status(400).json({
        success: false,
        message: `Validation error: ${messages}`,
      });
    }
    console.error('createBooking error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// ------------------------------------------------------------------
// GET /api/bookings
// List bookings with optional filters
// ------------------------------------------------------------------
const getAllBookings = async (req, res) => {
  try {
    const { status, resource, employee, startDate, endDate } = req.query;

    const filter = {};

    if (status) filter.status = status;
    if (resource) filter.resource = resource;
    if (employee) filter.employee = employee;

    // Date range filter — bookings overlapping the given range
    if (startDate || endDate) {
      if (startDate) filter.endTime = { $gte: new Date(startDate) };
      if (endDate) {
        filter.startTime = {
          ...filter.startTime,
          $lte: new Date(endDate),
        };
      }
    }

    const bookings = await Booking.find(filter)
      .populate('resource', 'name assetTag category')
      .populate('employee', 'name email')
      .sort({ startTime: -1 });

    return res.status(200).json({
      success: true,
      message: 'Bookings retrieved successfully',
      data: bookings,
    });
  } catch (error) {
    console.error('getAllBookings error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// ------------------------------------------------------------------
// GET /api/bookings/:id
// Get a single booking by ID
// ------------------------------------------------------------------
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('resource', 'name assetTag category location')
      .populate('employee', 'name email department');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Booking retrieved successfully',
      data: booking,
    });
  } catch (error) {
    console.error('getBookingById error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// ------------------------------------------------------------------
// PATCH /api/bookings/:id/cancel
// Cancel a booking (only if currently 'upcoming')
// ------------------------------------------------------------------
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    if (booking.status !== 'upcoming') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a booking with status '${booking.status}'. Only upcoming bookings can be cancelled.`,
      });
    }

    booking.status = 'cancelled';
    await booking.save();

    const populated = await Booking.findById(booking._id)
      .populate('resource', 'name assetTag')
      .populate('employee', 'name email');

    return res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: populated,
    });
  } catch (error) {
    console.error('cancelBooking error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// ------------------------------------------------------------------
// PATCH /api/bookings/:id/status
// Update booking status (upcoming → ongoing → completed)
// ------------------------------------------------------------------
const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Define valid transitions
    const validTransitions = {
      upcoming: ['ongoing', 'cancelled'],
      ongoing: ['completed'],
    };

    const allowed = validTransitions[booking.status];

    if (!allowed || !allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition from '${booking.status}' to '${status}'`,
      });
    }

    booking.status = status;
    await booking.save();

    const populated = await Booking.findById(booking._id)
      .populate('resource', 'name assetTag')
      .populate('employee', 'name email');

    return res.status(200).json({
      success: true,
      message: `Booking status updated to '${status}'`,
      data: populated,
    });
  } catch (error) {
    console.error('updateBookingStatus error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export {
  createBooking,
  getAllBookings,
  getBookingById,
  cancelBooking,
  updateBookingStatus,
};
