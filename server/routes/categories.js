import express from "express";
import {
  getCategories,
  createCategory,
  updateCategory,
} from "../controllers/categoryController.js";
import auth from "../middleware/auth.js";
import requireRole from "../middleware/requireRole.js";

const router = express.Router();

// GET /api/categories — authenticated users
router.get("/", auth, getCategories);

// POST /api/categories — admin only (Organization Setup is Admin-only per contract §11 Rule 7)
router.post("/", auth, requireRole("admin"), createCategory);

// PATCH /api/categories/:id — admin only
router.patch("/:id", auth, requireRole("admin"), updateCategory);

export default router;
