import express from 'express';
import { createAsset, getAssets, getAsset, updateAsset, deleteAsset, getAssetStats } from '../controllers/assetController.js';
import { validateAsset } from '../validators/assetValidator.js';
import upload from '../middleware/upload.js';
import auth from '../middleware/auth.js';
import requireRole from '../middleware/requireRole.js';

const router = express.Router();

router.get('/', auth, getAssets);
router.post('/', auth, requireRole('admin'), upload.single('photo'), validateAsset, createAsset);
router.get('/stats', auth, getAssetStats);
router.get('/:id', auth, getAsset);
router.put('/:id', auth, requireRole('admin'), upload.single('photo'), validateAsset, updateAsset);
router.delete('/:id', auth, requireRole('admin'), deleteAsset);

export default router;
