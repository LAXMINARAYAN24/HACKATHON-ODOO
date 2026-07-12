/**
 * Notifications routes
 */
import express from 'express';
import auth from '../middleware/auth.js';
import * as ctrl from '../controllers/notificationController.js';

const router = express.Router();

// Mark all read
router.patch('/read-all', auth, ctrl.markAllRead);

// List notifications
router.get('/',           auth, ctrl.listNotifications);

// Mark read
router.patch('/:id/read', auth, ctrl.markRead);

export default router;
