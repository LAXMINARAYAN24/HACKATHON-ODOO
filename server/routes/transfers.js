import express from 'express';
import { createTransfer, getTransfers, approveTransfer, rejectTransfer } from '../controllers/transferController.js';
import { validateTransferRequest } from '../validators/transferValidator.js';
import auth from '../middleware/auth.js';
import requireRole from '../middleware/requireRole.js';

const router = express.Router();

router.get('/', auth, getTransfers);
router.post('/', auth, validateTransferRequest, createTransfer);
router.put('/:id/approve', auth, requireRole('admin'), approveTransfer);
router.put('/:id/reject', auth, requireRole('admin'), rejectTransfer);

export default router;
