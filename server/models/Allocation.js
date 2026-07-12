// server/models/Allocation.js
import mongoose from 'mongoose';

const allocationSchema = new mongoose.Schema({
  asset: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Asset',
    required: true,
  },
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true,
  },
  allocatedDate: {
    type: Date,
    default: Date.now,
  },
  expectedReturnDate: {
    type: Date,
  },
  actualReturnDate: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['Active', 'Returned', 'Overdue'],
    default: 'Active',
  },
  conditionAtReturn: {
    type: String,
  },
  allocatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  notes: {
    type: String,
  }
}, { timestamps: true });

allocationSchema.index({ asset: 1, status: 1 });

export default mongoose.model('Allocation', allocationSchema);