/**
 * auditController.js — owned by Satyam (feat/audit-reports)
 *
 * Cross-module model references (User, Department, Asset) are resolved at
 * runtime via mongoose.model() after all routes are mounted in server.js.
 * No duplicate schemas; no stub files.
 */
import mongoose from 'mongoose';
import AuditCycle from '../models/AuditCycle.js';
import AuditAssignment from '../models/AuditAssignment.js';
import AuditItem from '../models/AuditItem.js';
import ActivityLog from '../models/ActivityLog.js';
import { createNotification } from '../utils/notify.js';

// ─── Runtime model resolution (teammate-owned, registered at startup) ─────────
const Asset = () => mongoose.model('Asset');

// ─── Explicit activity logger ─────────────────────────────────────────────────
const log = (userId, action, entity, entityId, metadata = {}) =>
  ActivityLog.create({ user: userId, action, entity, entityId, metadata }).catch(console.error);

// ─── GET /api/audits ──────────────────────────────────────────────────────────
export const listCycles = async (req, res) => {
  try {
    const cycles = await AuditCycle.find()
      .populate('scopeDepartment', 'name')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, message: 'Cycles retrieved', data: cycles });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/audits/:id ──────────────────────────────────────────────────────
export const getCycle = async (req, res) => {
  try {
    const cycle = await AuditCycle.findById(req.params.id)
      .populate('scopeDepartment', 'name')
      .populate('createdBy', 'name email');

    if (!cycle) return res.status(404).json({ success: false, message: 'Audit cycle not found' });

    const assignments = await AuditAssignment.find({ cycle: cycle._id })
      .populate('auditor', 'name email role');

    res.json({ success: true, message: 'Cycle retrieved', data: { cycle, assignments } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── POST /api/audits ─────────────────────────────────────────────────────────
export const createCycle = async (req, res) => {
  try {
    const { name, scopeDepartment, startDate, endDate } = req.body;
    if (!name || !scopeDepartment || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'name, scopeDepartment, startDate, and endDate are all required',
      });
    }

    const cycle = await AuditCycle.create({
      name, scopeDepartment, startDate, endDate, createdBy: req.user._id,
    });

    // Auto-seed checklist: all assets belonging to the scoped department
    const assets = await Asset().find({ department: scopeDepartment }).select('_id');
    if (assets.length > 0) {
      await AuditItem.insertMany(
        assets.map((a) => ({ cycle: cycle._id, asset: a._id })),
        { ordered: false }
      );
    }

    await log(req.user._id, 'created audit cycle', 'AuditCycle', cycle._id, { cycleName: name });

    res.status(201).json({ success: true, message: 'Audit cycle created', data: cycle });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── POST /api/audits/:id/assign ──────────────────────────────────────────────
export const assignAuditors = async (req, res) => {
  try {
    const { auditorIds } = req.body;
    if (!Array.isArray(auditorIds) || auditorIds.length === 0) {
      return res.status(400).json({ success: false, message: 'auditorIds must be a non-empty array' });
    }

    const cycle = await AuditCycle.findById(req.params.id);
    if (!cycle) return res.status(404).json({ success: false, message: 'Audit cycle not found' });
    if (cycle.status === 'closed') {
      return res.status(400).json({ success: false, message: 'Cannot assign auditors to a closed cycle' });
    }

    // insertMany with ordered: false silently skips duplicate-key errors
    await AuditAssignment.insertMany(
      auditorIds.map((id) => ({ cycle: cycle._id, auditor: id })),
      { ordered: false }
    );

    // Notify each assigned auditor via shared helper
    await Promise.all(
      auditorIds.map((uid) =>
        createNotification(uid, 'audit', `You have been assigned to audit: ${cycle.name}`, cycle._id)
      )
    );

    await log(req.user._id, 'assigned auditors', 'AuditCycle', cycle._id, { count: auditorIds.length });

    res.json({ success: true, message: `${auditorIds.length} auditor(s) assigned to "${cycle.name}"`, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/audits/:id/items ────────────────────────────────────────────────
export const listItems = async (req, res) => {
  try {
    const cycle = await AuditCycle.findById(req.params.id).populate('scopeDepartment', 'name');
    if (!cycle) return res.status(404).json({ success: false, message: 'Audit cycle not found' });

    const items = await AuditItem.find({ cycle: req.params.id })
      .populate('asset', 'tag name location status condition')
      .populate('checkedBy', 'name');

    res.json({ success: true, message: 'Items retrieved', data: { cycle, items } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── PATCH /api/audits/:id/items/:assetId ────────────────────────────────────
export const updateItem = async (req, res) => {
  try {
    const { verification, notes } = req.body;
    const validVerifications = ['unverified', 'verified', 'missing', 'damaged'];

    if (verification && !validVerifications.includes(verification)) {
      return res.status(400).json({
        success: false,
        message: `verification must be one of: ${validVerifications.join(', ')}`,
      });
    }

    const cycle = await AuditCycle.findById(req.params.id);
    if (!cycle) return res.status(404).json({ success: false, message: 'Audit cycle not found' });
    if (cycle.status === 'closed') {
      return res.status(400).json({ success: false, message: 'Cycle is closed — items cannot be updated' });
    }

    const item = await AuditItem.findOneAndUpdate(
      { cycle: req.params.id, asset: req.params.assetId },
      { verification, notes, checkedAt: new Date(), checkedBy: req.user._id },
      { new: true }
    ).populate('asset', 'tag name');

    if (!item) {
      return res.status(404).json({ success: false, message: 'Audit item not found for this cycle and asset' });
    }

    await log(req.user._id, `marked ${verification}`, 'AuditItem', item._id, {
      assetTag: item.asset?.tag,
      cycleId:  req.params.id,
    });

    res.json({ success: true, message: 'Item updated', data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── POST /api/audits/:id/close ───────────────────────────────────────────────
export const closeCycle = async (req, res) => {
  try {
    const cycle = await AuditCycle.findById(req.params.id).populate('scopeDepartment', 'name');
    if (!cycle) return res.status(404).json({ success: false, message: 'Audit cycle not found' });
    if (cycle.status === 'closed') {
      return res.status(400).json({ success: false, message: 'Audit cycle is already closed' });
    }

    // Lock the cycle
    cycle.status   = 'closed';
    cycle.closedAt = new Date();
    await cycle.save();

    const items         = await AuditItem.find({ cycle: cycle._id }).populate('asset', 'tag name location status');
    const discrepancies = items.filter((i) => i.verification !== 'verified');
    const missingItems  = items.filter((i) => i.verification === 'missing');

    // Flip missing assets → 'Lost' (frozen status enum)
    if (missingItems.length > 0) {
      await Asset().updateMany(
        { _id: { $in: missingItems.map((i) => i.asset._id) } },
        { status: 'Lost' }
      );
    }

    const report = {
      cycleId:        cycle._id,
      cycleName:      cycle.name,
      department:     cycle.scopeDepartment?.name,
      closedAt:       cycle.closedAt,
      totalItems:     items.length,
      verified:       items.filter((i) => i.verification === 'verified').length,
      missing:        missingItems.length,
      damaged:        items.filter((i) => i.verification === 'damaged').length,
      discrepancies:  discrepancies.map((i) => ({
        assetTag:     i.asset?.tag,
        assetName:    i.asset?.name,
        location:     i.asset?.location,
        verification: i.verification,
        notes:        i.notes,
      })),
    };

    await log(req.user._id, 'closed audit cycle', 'AuditCycle', cycle._id, {
      cycleName:        cycle.name,
      discrepancyCount: discrepancies.length,
      missingCount:     missingItems.length,
    });

    if (discrepancies.length > 0) {
      await createNotification(
        req.user._id,
        'audit',
        `Audit "${cycle.name}" closed — ${discrepancies.length} discrepancy(s) (${missingItems.length} missing, ${report.damaged} damaged)`,
        cycle._id
      );
    }

    res.json({ success: true, message: 'Audit cycle closed', data: { report } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
