import express from "express";
import { getSummary } from "../controllers/dashboardController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// GET /api/dashboard/summary
router.get("/summary", auth, getSummary);

export default router;
