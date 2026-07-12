// server/controllers/assetController.js
import * as assetService from '../services/assetService.js';

export const createAsset = async (req, res) => {
  try {
    const photoUrl = req.file ? `/uploads/${req.file.filename}` : undefined;
    const asset = await assetService.createAsset(req.body, photoUrl);
    res.status(201).json({ success: true, data: asset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAssets = async (req, res) => {
  try {
    const assets = await assetService.getAllAssets(req.query);
    res.status(200).json({ success: true, data: assets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAsset = async (req, res) => {
  try {
    const asset = await assetService.getAssetById(req.params.id);
    res.status(200).json({ success: true, data: asset });
  } catch (error) {
    res.status(error.message === 'Asset not found' ? 404 : 500).json({ success: false, message: error.message });
  }
};

export const updateAsset = async (req, res) => {
  try {
    const photoUrl = req.file ? `/uploads/${req.file.filename}` : undefined;
    const asset = await assetService.updateAsset(req.params.id, req.body, photoUrl);
    res.status(200).json({ success: true, data: asset });
  } catch (error) {
    res.status(error.message === 'Asset not found' ? 404 : 500).json({ success: false, message: error.message });
  }
};

export const deleteAsset = async (req, res) => {
  try {
    await assetService.deleteAsset(req.params.id);
    res.status(200).json({ success: true, message: 'Asset deleted successfully' });
  } catch (error) {
    const status = error.message === 'Asset not found' ? 404 : 400;
    res.status(status).json({ success: false, message: error.message });
  }
};

export const getAssetStats = async (req, res) => {
  try {
    const stats = await assetService.getAssetStats();
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};