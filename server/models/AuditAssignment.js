import mongoose from 'mongoose';

/**
 * AuditAssignment model
 */
const AuditAssignmentSchema = new mongoose.Schema(
  {
    cycle:   { type: mongoose.Schema.Types.ObjectId, ref: 'AuditCycle', required: true },
    auditor: { type: mongoose.Schema.Types.ObjectId, ref: 'User',       required: true },
  },
  { timestamps: true }
);

// Unique: same auditor cannot be assigned twice to the same cycle
AuditAssignmentSchema.index({ cycle: 1, auditor: 1 }, { unique: true });

export default mongoose.models.AuditAssignment || mongoose.model('AuditAssignment', AuditAssignmentSchema);
