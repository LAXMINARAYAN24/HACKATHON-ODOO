import express from "express";
import {
  validateSignup,
  validateLogin,
  handleValidationErrors,
} from "../validators/authValidator.js";
import { signup, login, getMe } from "../controllers/authController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// POST /api/auth/signup
router.post("/signup", validateSignup, handleValidationErrors, signup);

// POST /api/auth/login
router.post("/login", validateLogin, handleValidationErrors, login);

// GET /api/auth/me
router.get("/me", auth, getMe);

export default router;
