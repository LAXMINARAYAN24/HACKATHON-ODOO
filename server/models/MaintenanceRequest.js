const mongoose = require('mongoose');

const maintenanceRequestSchema = new mongoose.Schema(
  {
    asset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset',
      required: [true, 'Asset is required'],
    },
    raisedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Raised-by user is required'],
    },
    issue: {
      type: String,
      required: [true, 'Issue description is required'],
      trim: true,
      maxlength: [2000, 'Issue description cannot exceed 2000 characters'],
    },
    priority: {
      type: String,
      required: [true, 'Priority is required'],
      enum: {
        values: ['low', 'medium', 'high', 'critical'],
        message: '{VALUE} is not a valid priority level',
      },
    },
    photoUrl: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: [
          'pending',
          'approved',
          'rejected',
          'technician_assigned',
          'in_progress',
          'resolved',
        ],
        message: '{VALUE} is not a valid maintenance status',
      },
      default: 'pending',
    },
    technician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    resolvedAt: {
      type: Date,
    },
    remarks: {
      type: String,
      trim: true,
      maxlength: [2000, 'Remarks cannot exceed 2000 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// ------------------------------------------------------------------
// Indexes
// ------------------------------------------------------------------

// Frequently filtered by status (Kanban columns)
maintenanceRequestSchema.index({ status: 1 });

// Frequently filtered by asset
maintenanceRequestSchema.index({ asset: 1 });

// Frequently filtered by priority
maintenanceRequestSchema.index({ priority: 1 });

// Lookup requests raised by a specific user
maintenanceRequestSchema.index({ raisedBy: 1 });

// Person D derives resolutionTime from resolvedAt - createdAt
// createdAt is auto-indexed by timestamps, resolvedAt indexed here
maintenanceRequestSchema.index({ resolvedAt: 1 });

module.exports = mongoose.model('MaintenanceRequest', maintenanceRequestSchema);
