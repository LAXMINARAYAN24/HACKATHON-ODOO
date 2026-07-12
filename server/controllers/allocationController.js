// server/controllers/allocationController.js
import * as allocationService from '../services/allocationService.js';

export const allocateAsset = async (req, res) => {
  try {
    const allocation = await allocationService.allocateAsset(req.body);
    res.status(201).json({ success: true, data: allocation });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getAllocations = async (req, res) => {
  try {
    const allocations = await allocationService.getAllAllocations(req.query);
    res.status(200).json({ success: true, data: allocations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllocation = async (req, res) => {
  try {
    const allocation = await allocationService.getAllocationById(req.params.id);
    res.status(200).json({ success: true, data: allocation });
  } catch (error) {
    res.status(error.message === 'Allocation not found' ? 404 : 500).json({ success: false, message: error.message });
  }
};

export const returnAsset = async (req, res) => {
  try {
    const { conditionAtReturn } = req.body;
    const allocation = await allocationService.returnAsset(req.params.id, conditionAtReturn);
    res.status(200).json({ success: true, data: allocation });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};