/**
 * routes/audits.js — owned by Satyam (feat/audit-reports)
 *
 * Mount path (send to Laxminarayan for server.js):
 *   app.use('/api/audits', require('./routes/audits'));
 *
 * Auth and role middleware are injected by Laxminarayan's server.js.
 * We import them by agreed path; they will exist after integration.
 */
import express from 'express';
import auth from '../middleware/auth.js';
import requireRole from '../middleware/requireRole.js';
import * as ctrl from '../controllers/auditController.js';

const router = express.Router();

// GET /api/audits — list all cycles
router.get('/',                    auth, ctrl.listCycles);

// POST /api/audits — create cycle (admin / asset_manager only)
router.post('/',                   auth, requireRole('admin', 'asset_manager'), ctrl.createCycle);

// GET /api/audits/:id — get single cycle with assignments
router.get('/:id',                 auth, ctrl.getCycle);

// POST /api/audits/:id/assign — assign auditor(s)
router.post('/:id/assign',         auth, requireRole('admin', 'asset_manager'), ctrl.assignAuditors);

// GET /api/audits/:id/items — checklist for a cycle
router.get('/:id/items',           auth, ctrl.listItems);

// PATCH /api/audits/:id/items/:assetId — mark verified / missing / damaged
router.patch('/:id/items/:assetId',auth, ctrl.updateItem);

// POST /api/audits/:id/close — lock cycle + generate discrepancy report
router.post('/:id/close',          auth, requireRole('admin', 'asset_manager'), ctrl.closeCycle);

export default router;
