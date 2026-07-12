// server/routes/transferRoutes.js
import express from 'express';
import { createTransfer, getTransfers, approveTransfer, rejectTransfer } from '../controllers/transferController.js';
import { validateTransferRequest } from '../validators/transferValidator.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getTransfers);
router.post('/', protect, validateTransferRequest, createTransfer);
router.put('/:id/approve', protect, adminOnly, approveTransfer);
router.put('/:id/reject', protect, adminOnly, rejectTransfer);

export default router;