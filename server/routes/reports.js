/**
 * Reports routes
 */
import express from 'express';
import auth from '../middleware/auth.js';
import * as ctrl from '../controllers/reportController.js';

const router = express.Router();

// Get utilization
router.get('/utilization',           auth, ctrl.getUtilization);

// Get maintenance frequency
router.get('/maintenance-frequency', auth, ctrl.getMaintenanceFrequency);

// Get due soon
router.get('/due-soon',              auth, ctrl.getDueSoon);

// Get heatmap
router.get('/heatmap',               auth, ctrl.getHeatmap);

export default router;
