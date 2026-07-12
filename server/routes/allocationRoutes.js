// server/routes/allocationRoutes.js
import express from 'express';
import { allocateAsset, getAllocations, getAllocation, returnAsset } from '../controllers/allocationController.js';
import { validateAllocation } from '../validators/allocationValidator.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getAllocations);
router.post('/', protect, adminOnly, validateAllocation, allocateAsset);
router.get('/:id', protect, getAllocation);
router.put('/:id/return', protect, adminOnly, returnAsset);

export default router;