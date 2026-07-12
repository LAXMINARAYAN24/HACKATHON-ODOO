import mongoose from 'mongoose';

/**
 * Notification — owned by Satyam (feat/audit-reports)
 * Frozen schema: Contract v1.0
 * Also used by the shared createNotification() helper in utils/notify.js
 * that teammates (Jeny, Mahek) import and call from their controllers.
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
