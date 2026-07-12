
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
