import mongoose from 'mongoose';

/**
 * ActivityLog model
 */
const ActivityLogSchema = new mongoose.Schema(
  {
    user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    action:   { type: String, required: true }, // e.g. 'created audit cycle'
    entity:   { type: String, required: true }, // e.g. 'AuditCycle'
    entityId: { type: mongoose.Schema.Types.ObjectId },
    metadata: { type: mongoose.Schema.Types.Mixed }, // frozen field name: metadata (not meta)
  },
  { timestamps: true }
);

export default mongoose.models.ActivityLog || mongoose.model('ActivityLog', ActivityLogSchema);
