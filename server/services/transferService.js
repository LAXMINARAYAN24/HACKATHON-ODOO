// server/services/transferService.js
import TransferRequest from '../models/TransferRequest.js';
import Allocation from '../models/Allocation.js';
import Asset from '../models/Asset.js';
import { getActiveAllocationForAsset } from './allocationService.js';

export const createTransferRequest = async (data) => {
  const activeAllocation = await getActiveAllocationForAsset(data.asset);
  if (activeAllocation) {
    data.fromEmployee = activeAllocation.employee;
  }
  const transfer = new TransferRequest(data);
  return await transfer.save();
};

export const getAllTransferRequests = async (filters = {}) => {
  return await TransferRequest.find(filters).populate('asset fromEmployee toEmployee requestedBy').sort({ createdAt: -1 });
};

export const getTransferById = async (id) => {
  const transfer = await TransferRequest.findById(id).populate('asset fromEmployee toEmployee requestedBy');
  if (!transfer) throw new Error('Transfer request not found');
  return transfer;
};

export const approveTransfer = async (id, approvedById) => {
  const transfer = await TransferRequest.findById(id);
  if (!transfer) throw new Error('Transfer request not found');
  if (transfer.status !== 'Pending') throw new Error('Transfer request is not pending');

  const activeAllocation = await getActiveAllocationForAsset(transfer.asset);
  if (activeAllocation) {
    activeAllocation.status = 'Returned';
    activeAllocation.actualReturnDate = Date.now();
    activeAllocation.notes = `Transferred to new employee via TransferRequest ${id}`;
    await activeAllocation.save();
  }

  const asset = await Asset.findById(transfer.asset);
  if (!asset) throw new Error('Asset not found');

  const newAllocation = new Allocation({
    asset: transfer.asset,
    employee: transfer.toEmployee,
    department: asset.department, 
    allocatedBy: approvedById,
    notes: `Generated from TransferRequest ${id}`
  });
  await newAllocation.save();

  asset.status = 'Allocated';
  await asset.save();

  transfer.status = 'Approved';
  transfer.approvedBy = approvedById;
  transfer.approvedAt = Date.now();
  
  return await transfer.save();
};

export const rejectTransfer = async (id, rejectedById, reason) => {
  const transfer = await TransferRequest.findById(id);
  if (!transfer) throw new Error('Transfer request not found');
  if (transfer.status !== 'Pending') throw new Error('Transfer request is not pending');

  transfer.status = 'Rejected';
  transfer.approvedBy = rejectedById; 
  transfer.approvedAt = Date.now();
  transfer.rejectionReason = reason;

  return await transfer.save();
};