// server/models/TransferRequest.js
import mongoose from 'mongoose';

const transferRequestSchema = new mongoose.Schema({
  asset: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Asset',
    required: true,
  },
  fromEmployee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  toEmployee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending',
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  approvedAt: {
    type: Date,
  },
  rejectionReason: {
    type: String,
  }
}, { timestamps: true });

transferRequestSchema.index({ asset: 1, status: 1 });

export default mongoose.model('TransferRequest', transferRequestSchema);