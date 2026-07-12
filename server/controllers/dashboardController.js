import Booking from "../models/Booking.js";
import MaintenanceRequest from "../models/MaintenanceRequest.js";

// GET /api/dashboard/summary
export const getSummary = async (req, res) => {
  try {
    const activeBookings = await Booking.countDocuments({
      status: { $in: ["upcoming", "ongoing"] },
    });

    const maintenanceToday = await MaintenanceRequest.countDocuments({
      status: { $in: ["pending", "approved", "technician_assigned", "in_progress"] },
    });

    const summary = {
      availableAssets: 0,
      allocatedAssets: 0,
      maintenanceToday,
      activeBookings,
      pendingTransfers: 0,
      upcomingReturns: 0,
      overdueReturns: 0,
    };

    return res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error("Dashboard summary error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};
