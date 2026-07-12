/**
 * Activity log controller
 */
import ActivityLog from '../models/ActivityLog.js';

// List activity logs
export const listActivityLogs = async (req, res) => {
  try {
    const { entity, userId } = req.query;
    const filter = {};
    if (entity) filter.entity = entity;
    if (userId) filter.user   = userId;

    const logs = await ActivityLog.find(filter)
      .populate('user', 'name role')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.json({ success: true, message: 'Activity logs retrieved', data: logs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
