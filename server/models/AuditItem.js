import mongoose from 'mongoose';

/**
 * AuditItem — owned by Satyam (feat/audit-reports)
 * Frozen schema: Contract v1.0
 */
const AuditItemSchema = new mongoose.Schema(
  {
    cycle:        { type: mongoose.Schema.Types.ObjectId, ref: 'AuditCycle', required: true },
    asset:        { type: mongoose.Schema.Types.ObjectId, ref: 'Asset',      required: true },
    verification: {
      type:    String,
      enum:    ['unverified', 'verified', 'missing', 'damaged'],
      default: 'unverified',
    },
    notes:        { type: String, default: '' },
    // Not in frozen schema but needed for checklist UX — only safe additions
    checkedAt:    { type: Date },
    checkedBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// Each asset appears at most once per cycle
AuditItemSchema.index({ cycle: 1, asset: 1 }, { unique: true });

export default mongoose.models.AuditItem || mongoose.model('AuditItem', AuditItemSchema);
