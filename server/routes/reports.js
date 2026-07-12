/**
 * routes/reports.js — owned by Satyam (feat/audit-reports)
 *
 * Mount path (send to Laxminarayan for server.js):
 *   app.use('/api/reports', require('./routes/reports'));
 *
 * Frozen API endpoints only — heatmap is NOT in the frozen contract.
 */
import express from 'express';
import auth from '../middleware/auth.js';
import * as ctrl from '../controllers/reportController.js';

const router = express.Router();

// GET /api/reports/utilization
router.get('/utilization',           auth, ctrl.getUtilization);

// GET /api/reports/maintenance-frequency
router.get('/maintenance-frequency', auth, ctrl.getMaintenanceFrequency);

// GET /api/reports/due-soon
router.get('/due-soon',              auth, ctrl.getDueSoon);

// GET /api/reports/heatmap
router.get('/heatmap',               auth, ctrl.getHeatmap);

export default router;
