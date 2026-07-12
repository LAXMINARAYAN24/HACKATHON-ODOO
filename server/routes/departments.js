import express from "express";
import {
  getDepartments,
  createDepartment,
  updateDepartment,
} from "../controllers/departmentController.js";
import auth from "../middleware/auth.js";
import requireRole from "../middleware/requireRole.js";

const router = express.Router();

// GET /api/departments — authenticated users
router.get("/", auth, getDepartments);

// POST /api/departments — admin only
router.post("/", auth, requireRole("admin"), createDepartment);

// PATCH /api/departments/:id — admin only
router.patch("/:id", auth, requireRole("admin"), updateDepartment);

export default router;
