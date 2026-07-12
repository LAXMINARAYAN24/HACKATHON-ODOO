import mongoose from 'mongoose';

/**
 * Notification model
 */
const NotificationSchema = new mongoose.Schema(
  {
    user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type:     { type: String, required: true, enum: ['allocation', 'transfer', 'booking', 'maintenance', 'audit', 'system'] },   // 'allocation' | 'transfer' | 'booking' | 'maintenance' | 'audit' | 'system'
    message:  { type: String, required: true },
    isRead:   { type: Boolean, default: false },
    entityId: { type: mongoose.Schema.Types.ObjectId }, // optional deep-link ref
  },
  { timestamps: true }
);

export default mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
