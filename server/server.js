import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";


import authRoutes from "./routes/auth.js";
import dashboardRoutes from "./routes/dashboard.js";
import departmentRoutes from "./routes/departments.js";
import categoryRoutes from "./routes/categories.js";
import userRoutes from "./routes/users.js";



const app = express();


app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, message: "AssetFlow API is running." });
});


app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/users", userRoutes);


//404 handler 
app.use("*", (req, res) => {
  res.status(404).json({ success: false, message: "Route not found." });
});

//Global error handler 
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ success: false, message: "Internal server error." });
});

//Start server 
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`AssetFlow server running on port ${PORT}`);
  });
});

export default app;
