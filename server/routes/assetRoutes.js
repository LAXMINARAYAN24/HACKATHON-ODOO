// server/routes/assetRoutes.js
import express from 'express';
import { createAsset, getAssets, getAsset, updateAsset, deleteAsset, getAssetStats } from '../controllers/assetController.js';
import { validateAsset } from '../validators/assetValidator.js';
import upload from '../middleware/upload.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getAssets);
router.post('/', protect, adminOnly, upload.single('photo'), validateAsset, createAsset);
router.get('/stats', protect, getAssetStats);
router.get('/:id', protect, getAsset);
router.put('/:id', protect, adminOnly, upload.single('photo'), validateAsset, updateAsset);
router.delete('/:id', protect, adminOnly, deleteAsset);

export default router;