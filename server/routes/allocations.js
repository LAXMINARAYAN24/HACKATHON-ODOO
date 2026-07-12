import express from 'express';
import { allocateAsset, getAllocations, getAllocation, returnAsset } from '../controllers/allocationController.js';
import { validateAllocation } from '../validators/allocationValidator.js';
import auth from '../middleware/auth.js';
import requireRole from '../middleware/requireRole.js';

const router = express.Router();

router.get('/', auth, getAllocations);
router.post('/', auth, requireRole('admin'), validateAllocation, allocateAsset);
router.get('/:id', auth, getAllocation);
router.put('/:id/return', auth, requireRole('admin'), returnAsset);

export default router;
