import mongoose from 'mongoose';

const { Schema, Types } = mongoose;

const assetSchema = new Schema(
  {
    // Human-readable identifier must be unique across the collection
    tag: {
      type: String,
      required: [true, 'Asset Tag is required'],
      unique: true,
      trim: true,
    },

    // Descriptive name of the asset
    name: {
      type: String,
      required: [true, 'Asset Name is required'],
      trim: true,
    },

    // Reference to a Category document
    category: {
      type: Types.ObjectId,
      ref: 'Category',
      required: [true, 'Asset Category is required'],
    },

    // Serial number
    serialNumber: {
      type: String,
      trim: true,
      index: true,
    },

    // Date the asset was acquired
    acquisitionDate: {
      type: Date,
      required: [true, 'Acquisition Date is required'],
    },

    // Purchase price
    acquisitionCost: {
      type: Number,
      required: [true, 'Acquisition Cost is required'],
      min: [0, 'Acquisition Cost cannot be negative'],
    },

    // Free-text condition description 
    condition: {
      type: String,
      required: [true, 'Asset Condition is required'],
      trim: true,
    },

    // Physical location within the premises
    location: {
      type: String,
      trim: true,
    },

    // Current status – follows the contract-defined enum
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

    // condition asset can be booked/reserved
    isBookable: {
      type: Boolean,
      default: false,
    },

    // Reference to a Department document 
    department: {
      type: Types.ObjectId,
      ref: 'Department',
      required: [true, 'Asset Department is required'],
    },

    // Optional URL to a photo or document for the asset
    photoUrl: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

assetSchema.index({ department: 1, status: 1 }, { name: 'dept_status_idx' });

const Asset = mongoose.model('Asset', assetSchema);
export default Asset;
