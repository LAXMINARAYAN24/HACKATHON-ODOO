import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";

// --- Laxminarayan-owned routes ---
import authRoutes from "./routes/auth.js";
import dashboardRoutes from "./routes/dashboard.js";
import departmentRoutes from "./routes/departments.js";
import categoryRoutes from "./routes/categories.js";
import userRoutes from "./routes/users.js";

// --- Teammate integration blocks (activate after branch merge) ---
//
// JENY (feat/assets-allocation):
import assetRoutes from "./routes/assets.js";
import allocationRoutes from "./routes/allocations.js";
import transferRoutes from "./routes/transfers.js";
//
// MAHEK (feat/booking-maintenance):
import bookingRoutes from "./routes/bookings.js";
import maintenanceRoutes from "./routes/maintenance.js";
//
// SATYAM (feat/audit-reports):
// import auditRoutes from "./routes/audits.js";
// import reportRoutes from "./routes/reports.js";
// import notificationRoutes from "./routes/notifications.js";
// import activityLogRoutes from "./routes/activityLogs.js";

const app = express();

// ── Middleware 
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Health check 
app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, message: "AssetFlow API is running." });
});

// ── Laxminarayan-owned routes 
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/users", userRoutes);

// ── Teammate routes (activate after merge) 
//
// JENY:
app.use("/api/assets", assetRoutes);
app.use("/api/allocations", allocationRoutes);
app.use("/api/transfers", transferRoutes);
//
// MAHEK:
app.use("/api/bookings", bookingRoutes);
app.use("/api/maintenance", maintenanceRoutes);
//
// SATYAM:
// app.use("/api/audits", auditRoutes);
// app.use("/api/reports", reportRoutes);
// app.use("/api/notifications", notificationRoutes);
// app.use("/api/activity-logs", activityLogRoutes);

// ── 404 handler 
app.use("*", (req, res) => {
  res.status(404).json({ success: false, message: "Route not found." });
});

// ── Global error handler 
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ success: false, message: "Internal server error." });
});

// ── Start server 
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`AssetFlow server running on port ${PORT}`);
  });
});

export default app;
