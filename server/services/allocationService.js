// server/services/allocationService.js
import Allocation from '../models/Allocation.js';
import Asset from '../models/Asset.js';

export const allocateAsset = async (data) => {
  const asset = await Asset.findById(data.asset);
  if (!asset) throw new Error('Asset not found');
  if (asset.status !== 'Available') throw new Error(`Asset is currently ${asset.status} and cannot be allocated`);

  const allocation = new Allocation(data);
  await allocation.save();

  asset.status = 'Allocated';
  await asset.save();

  return await allocation.populate('asset employee department allocatedBy');
};

export const getAllAllocations = async (filters = {}) => {
  return await Allocation.find(filters).populate('asset employee department allocatedBy').sort({ createdAt: -1 });
};

export const getAllocationById = async (id) => {
  const allocation = await Allocation.findById(id).populate('asset employee department allocatedBy');
  if (!allocation) throw new Error('Allocation not found');
  return allocation;
};

export const returnAsset = async (allocationId, conditionAtReturn) => {
  const allocation = await Allocation.findById(allocationId);
  if (!allocation) throw new Error('Allocation not found');
  if (allocation.status !== 'Active') throw new Error('Allocation is not active');

  allocation.status = 'Returned';
  allocation.actualReturnDate = Date.now();
  allocation.conditionAtReturn = conditionAtReturn;
  await allocation.save();

  const asset = await Asset.findById(allocation.asset);
  if (asset) {
    asset.status = 'Available';
    if (conditionAtReturn) asset.condition = conditionAtReturn;
    await asset.save();
  }

  return allocation;
};

export const getActiveAllocationForAsset = async (assetId) => {
  return await Allocation.findOne({ asset: assetId, status: 'Active' });
};