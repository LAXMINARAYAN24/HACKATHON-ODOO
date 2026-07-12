import mongoose from 'mongoose';

/**
 * AuditCycle — owned by Satyam (feat/audit-reports)
 * Frozen schema: Contract v1.0
 */
const AuditCycleSchema = new mongoose.Schema(
  {
    name:            { type: String, required: true, trim: true },
    scopeDepartment: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    startDate:       { type: Date, required: true },
    endDate:         { type: Date, required: true },
    status:          { type: String, enum: ['open', 'closed'], default: 'open' },
    closedAt:        { type: Date },
    createdBy:       { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.models.AuditCycle || mongoose.model('AuditCycle', AuditCycleSchema);
