/**
 * Audit and Notifications seed
 * Usage: node auditSeed.js
 */
import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';

// Owned models
import AuditCycle from './models/AuditCycle.js';
import AuditAssignment from './models/AuditAssignment.js';
import AuditItem from './models/AuditItem.js';
import Notification from './models/Notification.js';
import ActivityLog from './models/ActivityLog.js';

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // Wipe audit collections
  await Promise.all([
    AuditCycle.deleteMany({}),
    AuditAssignment.deleteMany({}),
    AuditItem.deleteMany({}),
    Notification.deleteMany({}),
    ActivityLog.deleteMany({}),
  ]);
  console.log('🗑️  Cleared audit scope collections');

  // Resolve cross-module models
  let User, Department, Asset;
  try {
    User       = mongoose.model('User');
    Department = mongoose.model('Department');
    Asset      = mongoose.model('Asset');
  } catch {
    console.error(
      '❌ Cross-module models (User/Department/Asset) not registered.\n' +
      '   Run this seed from the root seed.js that imports all models, or\n' +
      '   ensure user and asset seed scripts have run first.'
    );
    process.exit(1);
  }

  // Resolve seed data from existing documents
  const [admin, auditor, deptHead] = await Promise.all([
    User.findOne({ role: 'admin' }),
    User.findOne({ role: 'employee' }),
    User.findOne({ role: 'dept_head' }),
  ]);
  const engDept  = await Department.findOne({ name: /engineering/i });
  const engAssets = await Asset.find({ department: engDept?._id }).limit(5);

  if (!admin || !engDept) {
    console.error('❌ Required base data (admin user / Engineering dept) not found. Run upstream seeds first.');
    process.exit(1);
  }

  // AuditCycle
  const past   = (d) => new Date(Date.now() - d * 86400000);
  const future = (d) => new Date(Date.now() + d * 86400000);

  const cycle = await AuditCycle.create({
    name:            'Q3 Audit: Engineering dept',
    scopeDepartment: engDept._id,
    startDate:       past(10),
    endDate:         future(4),
    status:          'open',
    createdBy:       admin._id,
  });
  console.log(`✅ AuditCycle: "${cycle.name}"`);

  // AuditAssignments
  const assignees = [auditor, deptHead].filter(Boolean);
  if (assignees.length > 0) {
    await AuditAssignment.insertMany(
      assignees.map((u) => ({ cycle: cycle._id, auditor: u._id })),
      { ordered: false }
    );
    console.log(`✅ AuditAssignments: ${assignees.length} auditors assigned`);
  }

  // AuditItems
  if (engAssets.length > 0) {
    const verifications = ['verified', 'missing', 'damaged', 'unverified', 'unverified'];
    const notes = [
      '',
      'Not found at expected desk location',
      'Screen cracked — photos attached',
      '',
      '',
    ];
    const items = await AuditItem.insertMany(
      engAssets.map((a, i) => ({
        cycle:        cycle._id,
        asset:        a._id,
        verification: verifications[i] || 'unverified',
        notes:        notes[i] || '',
        checkedAt:    i < 3 ? past(1) : undefined,
        checkedBy:    i < 3 ? (auditor?._id) : undefined,
      })),
      { ordered: false }
    );
    console.log(`✅ AuditItems: ${items.length} items seeded`);
  }

  // Notifications
  // Enums updated to: allocation, transfer, booking, maintenance, audit, system
  const notifData = [
    { user: admin._id,   type: 'allocation',  message: 'Laptop AF-0079 assigned to Priya Shah',             isRead: false, createdAt: past(0) },
    { user: admin._id,   type: 'maintenance', message: 'Maintenance request AF-0056 approved',              isRead: false, createdAt: past(0) },
    { user: admin._id,   type: 'booking',     message: 'Booking confirmed: Room B2 — 2:00 to 5:00 PM',      isRead: true,  createdAt: past(1) },
    { user: admin._id,   type: 'transfer',    message: 'Transfer approved: Projector to Facilities dept',   isRead: true,  createdAt: past(2) },
    { user: admin._id,   type: 'system',      message: 'Overdue return: AF-0021 was due 30 days ago',       isRead: false, createdAt: past(3) },
    { user: admin._id,   type: 'audit',       message: `Audit discrepancy flagged for cycle: ${cycle.name}`,isRead: false, createdAt: past(0), entityId: cycle._id },
  ];

  // Add auditor notifications if they exist
  if (auditor) {
    notifData.push(
      { user: auditor._id, type: 'audit', message: `You have been assigned to audit: ${cycle.name}`, isRead: false, createdAt: past(9), entityId: cycle._id }
    );
  }

  const notifs = await Notification.insertMany(notifData);
  console.log(`✅ Notifications: ${notifs.length} seeded`);

  // Activity Logs
  const logData = [
    { user: admin._id,   action: 'created audit cycle', entity: 'AuditCycle', entityId: cycle._id, metadata: { cycleName: cycle.name }, createdAt: past(10) },
    { user: admin._id,   action: 'assigned auditors',   entity: 'AuditCycle', entityId: cycle._id, metadata: { count: assignees.length }, createdAt: past(9) },
  ];
  if (auditor && engAssets[0]) {
    logData.push(
      { user: auditor._id, action: 'marked verified', entity: 'AuditItem', entityId: engAssets[0]._id, metadata: { assetTag: engAssets[0].tag }, createdAt: past(1) },
      { user: auditor._id, action: 'marked missing',  entity: 'AuditItem', entityId: engAssets[1]?._id, metadata: { assetTag: engAssets[1]?.tag }, createdAt: past(1) },
      { user: auditor._id, action: 'marked damaged',  entity: 'AuditItem', entityId: engAssets[2]?._id, metadata: { assetTag: engAssets[2]?.tag }, createdAt: past(1) }
    );
  }

  const logs = await ActivityLog.insertMany(logData.filter((l) => l.entityId));
  console.log(`✅ ActivityLogs: ${logs.length} seeded`);

  console.log('\n✅ Seed complete.');
  process.exit(0);
}

seed().catch((err) => { console.error('❌ Seed failed:', err.message); process.exit(1); });
