/**
 * Activity logs routes
 */
import express from 'express';
import auth from '../middleware/auth.js';
import * as ctrl from '../controllers/activityLogController.js';

const router = express.Router();

// List activity logs
router.get('/', auth, ctrl.listActivityLogs);

export default router;
