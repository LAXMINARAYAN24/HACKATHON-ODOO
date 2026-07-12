// server/services/assetService.js
import Asset from '../models/Asset.js';
import Allocation from '../models/Allocation.js';

export const createAsset = async (data, photoUrl) => {
  const assetData = { ...data };
  if (photoUrl) assetData.photoUrl = photoUrl;
  const asset = new Asset(assetData);
  return await asset.save();
};

export const getAllAssets = async (filters = {}) => {
  const query = {};
  if (filters.status) query.status = filters.status;
  if (filters.department) query.department = filters.department;
  if (filters.category) query.category = filters.category;
  if (filters.isBookable !== undefined) query.isBookable = filters.isBookable === 'true';
  
  if (filters.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: 'i' } },
      { tag: { $regex: filters.search, $options: 'i' } }
    ];
  }

  return await Asset.find(query).populate('category department');
};

export const getAssetById = async (id) => {
  const asset = await Asset.findById(id).populate('category department');
  if (!asset) throw new Error('Asset not found');
  return asset;
};

export const updateAsset = async (id, data, photoUrl) => {
  const updateData = { ...data };
  if (photoUrl) updateData.photoUrl = photoUrl;
  
  const asset = await Asset.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).populate('category department');
  if (!asset) throw new Error('Asset not found');
  return asset;
};

export const deleteAsset = async (id) => {
  const asset = await Asset.findById(id);
  if (!asset) throw new Error('Asset not found');
  if (asset.status === 'Allocated') throw new Error('Cannot delete an allocated asset');

  const activeAllocations = await Allocation.countDocuments({ asset: id, status: 'Active' });
  if (activeAllocations > 0) throw new Error('Cannot delete asset with active allocations');

  await Asset.findByIdAndDelete(id);
  return true;
};

export const getAssetStats = async () => {
  const stats = await Asset.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);
  return stats;
};