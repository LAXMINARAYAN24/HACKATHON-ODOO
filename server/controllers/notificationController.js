/**
 * Notification controller
 */
import Notification from '../models/Notification.js';

// List notifications
export const listNotifications = async (req, res) => {
  try {
    const { type, isRead } = req.query;

    const filter = { user: req.user._id };
    if (type)                filter.type   = type;
    if (isRead !== undefined) filter.isRead = isRead === 'true';

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    const unreadCount = await Notification.countDocuments({
      user: req.user._id, isRead: false,
    });

    res.json({ success: true, message: 'Notifications retrieved', data: { notifications, unreadCount } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Mark read
export const markRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    if (String(notification.user) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'You cannot mark another user\'s notification' });
    }

    notification.isRead = true;
    await notification.save();

    res.json({ success: true, message: 'Notification marked as read', data: notification });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Mark all read
export const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
    res.json({ success: true, message: 'All notifications marked as read', data: {} });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
