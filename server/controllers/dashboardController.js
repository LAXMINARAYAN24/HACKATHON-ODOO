/**
 * Dashboard Summary Controller — Phase 1
 *
 * Returns static zero KPIs. No teammate model imports in Phase 1.
 * After feat/assets-allocation and feat/booking-maintenance are merged,
 * replace the zero literals below with real database queries using the
 * pre-written commented blocks in server.js integration snippets.
 *
 * IMPORTANT: Do NOT add dynamic require() or import() for models that
 * do not yet exist in this branch. Static imports of missing files crash
 * the server at startup.
 */

// GET /api/dashboard/summary
export const getSummary = async (req, res) => {
  try {
    // ── Phase 1: Static zeros ──────────────────────────────────────────
    // These will be replaced with real queries after integration merge.
    // Response shape is frozen per contract §8 — do not change field names.
    const summary = {
      availableAssets: 0,
      allocatedAssets: 0,
      maintenanceToday: 0,
      activeBookings: 0,
      pendingTransfers: 0,
      upcomingReturns: 0,
      overdueReturns: 0,
    };

    // ── Phase 2 (activate after merge — replace zeros above) ───────────
    //
    // JENY's models (add after feat/assets-allocation merges):
    // import Asset from "../models/Asset.js";
    // import Allocation from "../models/Allocation.js";
    // import TransferRequest from "../models/TransferRequest.js";
    //
    // summary.availableAssets = await Asset.countDocuments({ status: "Available" });
    // summary.allocatedAssets  = await Asset.countDocuments({ status: "Allocated" });
    // summary.pendingTransfers = await TransferRequest.countDocuments({ status: "requested" });
    // const now = new Date();
    // const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    // summary.upcomingReturns = await Allocation.countDocuments({
    //   status: "active", expectedReturnDate: { $gte: now, $lte: in7Days },
    // });
    // summary.overdueReturns = await Allocation.countDocuments({
    //   status: "active", expectedReturnDate: { $lt: now },
    // });
    //
    // MAHEK's models (add after feat/booking-maintenance merges):
    // import Booking from "../models/Booking.js";
    // import MaintenanceRequest from "../models/MaintenanceRequest.js";
    //
    // summary.activeBookings = await Booking.countDocuments({ status: "ongoing" });
    // const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    // const todayEnd   = new Date(); todayEnd.setHours(23, 59, 59, 999);
    // summary.maintenanceToday = await MaintenanceRequest.countDocuments({
    //   status: { $in: ["approved", "technician_assigned", "in_progress"] },
    //   createdAt: { $gte: todayStart, $lte: todayEnd },
    // });

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
