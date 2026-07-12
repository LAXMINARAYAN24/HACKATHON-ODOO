import Notification from '../models/Notification.js';

/**
 * createNotification
 * Shared helper function for the AssetFlow team to create notifications.
 *
 * @param {ObjectId|string} userId - The target user's ObjectId
 * @param {string} type - Notification type: 'allocation' | 'transfer' | 'booking' | 'maintenance' | 'audit' | 'system'
 * @param {string} message - Human readable message
 * @param {ObjectId|string} [entityId] - (Optional) Related entity ObjectId for deep-linking
 * @returns {Promise<Document>} The created notification
 */
export const createNotification = async (userId, type, message, entityId = null) => {
  try {
    const validTypes = ['allocation', 'transfer', 'booking', 'maintenance', 'audit', 'system'];
    if (!validTypes.includes(type)) {
      console.warn(`[notify] Invalid notification type '${type}'. Defaulting to 'system'.`);
      type = 'system';
    }

    const payload = { user: userId, type, message };
    if (entityId) payload.entityId = entityId;

    return await Notification.create(payload);
  } catch (error) {
    console.error('[notify] Failed to create notification:', error.message);
    throw error;
  }
};
