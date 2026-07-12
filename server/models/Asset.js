// server/models/Asset.js
import mongoose from 'mongoose';

const { Schema, Types } = mongoose;

const assetSchema = new Schema(
  {
    tag: {
      type: String,
      required: [true, 'Asset Tag is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },

    name: {
      type: String,
      required: [true, 'Asset Name is required'],
      trim: true,
    },

    category: {
      type: Types.ObjectId,
      ref: 'Category',
      required: [true, 'Asset Category is required'],
    },

    serialNumber: {
      type: String,
      trim: true,
      index: true,
    },

    acquisitionDate: {
      type: Date,
      required: [true, 'Acquisition Date is required'],
    },

    acquisitionCost: {
      type: Number,
      required: [true, 'Acquisition Cost is required'],
      min: [0, 'Acquisition Cost cannot be negative'],
    },

    condition: {
      type: String,
      required: [true, 'Asset Condition is required'],
      trim: true,
    },

    location: {
      type: String,
      trim: true,
    },

    // ✅ Exact enum from frozen contract §7
    status: {
      type: String,
      required: [true, 'Asset Status is required'],
      enum: {
        values: [
          'Available',
          'Allocated',
          'Reserved',
          'Under Maintenance',
          'Lost',
          'Retired',
          'Disposed',
        ],
        message: '{VALUE} is not a valid asset status',
      },
      default: 'Available',
    },

    isBookable: {
      type: Boolean,
      default: false,
    },

    department: {
      type: Types.ObjectId,
      ref: 'Department',
      required: [true, 'Asset Department is required'],
    },

    photoUrl: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// ✅ Standard Mongoose compound index
assetSchema.index({ department: 1, status: 1 }, { name: 'dept_status_idx' });

// ✅ Default export — teammates import as:
//    import Asset from '../models/Asset.js'
const Asset = mongoose.model('Asset', assetSchema);
export default Asset;