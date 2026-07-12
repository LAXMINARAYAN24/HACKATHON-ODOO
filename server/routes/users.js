import express from "express";
import {
  getUsers,
  updateUserRole,
  updateUserStatus,
  updateUserDepartment,
} from "../controllers/userController.js";
import auth from "../middleware/auth.js";
import requireRole from "../middleware/requireRole.js";

const router = express.Router();

// GET /api/users — admin only (Employee Directory is part of Admin-only Organization Setup)
router.get("/", auth, requireRole("admin"), getUsers);

// PATCH /api/users/:id/role — admin only
router.patch("/:id/role", auth, requireRole("admin"), updateUserRole);

// PATCH /api/users/:id/status — admin only
router.patch("/:id/status", auth, requireRole("admin"), updateUserStatus);

// PATCH /api/users/:id/department — admin only
router.patch(
  "/:id/department",
  auth,
  requireRole("admin"),
  updateUserDepartment
);

export default router;
