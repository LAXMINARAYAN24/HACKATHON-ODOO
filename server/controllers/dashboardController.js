import Booking from "../models/Booking.js";
import MaintenanceRequest from "../models/MaintenanceRequest.js";
import Asset from "../models/Asset.js";
import TransferRequest from "../models/TransferRequest.js";
import Allocation from "../models/Allocation.js";

// GET /api/dashboard/summary
export const getSummary = async (req, res) => {
  try {
    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(now.getDate() + 7);

    const availableAssets = await Asset.countDocuments({ status: "Available" });
    const allocatedAssets = await Asset.countDocuments({ status: "Allocated" });

    const activeBookings = await Booking.countDocuments({
      status: { $in: ["upcoming", "ongoing"] },
    });

    const maintenanceToday = await MaintenanceRequest.countDocuments({
      status: { $in: ["pending", "approved", "technician_assigned", "in_progress"] },
    });

    const pendingTransfers = await TransferRequest.countDocuments({
      status: "Pending",
    });

    const upcomingReturns = await Allocation.countDocuments({
      status: "Active",
      expectedReturnDate: { $gte: now, $lte: nextWeek },
    });

    const overdueReturns = await Allocation.countDocuments({
      status: { $in: ["Active", "Overdue"] },
      expectedReturnDate: { $lt: now },
    });

    const summary = {
      availableAssets,
      allocatedAssets,
      maintenanceToday,
      activeBookings,
      pendingTransfers,
      upcomingReturns,
      overdueReturns,
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
