/**
 * reportController.js — owned by Satyam (feat/audit-reports)
 *
 * Read-only aggregation over cross-module models. Models are resolved at
 * runtime via mongoose.model() — no duplicate schemas.
 * Frozen API list: utilization, maintenance-frequency, due-soon.
 */
import mongoose from 'mongoose';

// Runtime resolution — registered by Jeny's and Mahek's route files at startup
const Allocation         = () => mongoose.model('Allocation');
const Booking            = () => mongoose.model('Booking');
const MaintenanceRequest = () => mongoose.model('MaintenanceRequest');
const Asset              = () => mongoose.model('Asset');

// ─── GET /api/reports/utilization ─────────────────────────────────────────────
// Active allocations + bookings grouped by department
export const getUtilization = async (req, res) => {
  try {
    const allocByDept = await Allocation().aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$department', allocatedCount: { $sum: 1 } } },
      {
        $lookup: {
          from: 'departments', localField: '_id', foreignField: '_id', as: 'dept',
        },
      },
      { $unwind: { path: '$dept', preserveNullAndEmpty: true } },
      {
        $project: {
          _id: 0,
          department:     { $ifNull: ['$dept.name', 'Unassigned'] },
          allocatedCount: 1,
        },
      },
    ]);

    const bookingByDept = await Booking().aggregate([
      { $match: { status: { $in: ['upcoming', 'ongoing', 'completed'] } } },
      {
        $lookup: {
          from: 'assets', localField: 'resource', foreignField: '_id', as: 'asset',
        },
      },
      { $unwind: '$asset' },
      { $group: { _id: '$asset.department', bookingCount: { $sum: 1 } } },
      {
        $lookup: {
          from: 'departments', localField: '_id', foreignField: '_id', as: 'dept',
        },
      },
      { $unwind: { path: '$dept', preserveNullAndEmpty: true } },
      {
        $project: {
          _id: 0,
          department:   { $ifNull: ['$dept.name', 'Unassigned'] },
          bookingCount: 1,
        },
      },
    ]);

    // Merge into a single keyed-by-department-name array
    const map = {};
    allocByDept.forEach(({ department, allocatedCount }) => {
      map[department] = { department, allocatedCount, bookingCount: 0 };
    });
    bookingByDept.forEach(({ department, bookingCount }) => {
      if (map[department]) map[department].bookingCount = bookingCount;
      else map[department] = { department, allocatedCount: 0, bookingCount };
    });

    res.json({ success: true, message: 'Utilization retrieved', data: Object.values(map) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/reports/maintenance-frequency ───────────────────────────────────
// Maintenance request count per asset, sorted highest first
export const getMaintenanceFrequency = async (req, res) => {
  try {
    const data = await MaintenanceRequest().aggregate([
      {
        $lookup: {
          from: 'assets', localField: 'asset', foreignField: '_id', as: 'assetDoc',
        },
      },
      { $unwind: '$assetDoc' },
      {
        $group: {
          _id:  '$assetDoc._id',
          tag:  { $first: '$assetDoc.tag' },
          name: { $first: '$assetDoc.name' },
          maintenanceCount: { $sum: 1 },
        },
      },
      { $sort: { maintenanceCount: -1 } },
      { $limit: 15 },
      {
        $project: {
          _id: 0,
          assetTag:         '$tag',
          assetName:        '$name',
          maintenanceCount: 1,
        },
      },
    ]);

    res.json({ success: true, message: 'Maintenance frequency retrieved', data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/reports/due-soon ────────────────────────────────────────────────
// Assets nearing retirement (4+ years) + overdue active allocations
export const getDueSoon = async (req, res) => {
  try {
    const now          = new Date();
    const fourYearsAgo = new Date(now);
    fourYearsAgo.setFullYear(now.getFullYear() - 4);

    const nearRetirement = await Asset().find({
      acquisitionDate: { $lte: fourYearsAgo },
      status:          { $nin: ['Retired', 'Disposed', 'Lost'] },
    })
      .select('tag name acquisitionDate status location condition')
      .limit(20)
      .lean();

    const overdueAllocations = await Allocation().find({
      status:             'active',
      expectedReturnDate: { $lt: now },
    })
      .populate('asset',    'tag name')
      .populate('employee', 'name')
      .select('expectedReturnDate conditionNotes')
      .limit(20)
      .lean();

    res.json({ success: true, message: 'Due soon retrieved', data: { nearRetirement, overdueAllocations } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/reports/heatmap ─────────────────────────────────────────────────
// Booking heatmap aggregating by day of week and hour
export const getHeatmap = async (req, res) => {
  try {
    const data = await Booking().aggregate([
      {
        $project: {
          dayOfWeek: { $dayOfWeek: '$startDate' },
          hourOfDay: { $hour: '$startDate' }
        }
      },
      {
        $group: {
          _id: { dayOfWeek: '$dayOfWeek', hourOfDay: '$hourOfDay' },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          day: '$_id.dayOfWeek',
          hour: '$_id.hourOfDay',
          count: 1
        }
      }
    ]);

    res.json({ success: true, message: 'Heatmap retrieved', data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
