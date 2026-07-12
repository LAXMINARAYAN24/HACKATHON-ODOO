// server/controllers/transferController.js
import * as transferService from '../services/transferService.js';

export const createTransfer = async (req, res) => {
  try {
    const transfer = await transferService.createTransferRequest(req.body);
    res.status(201).json({ success: true, data: transfer });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getTransfers = async (req, res) => {
  try {
    const transfers = await transferService.getAllTransferRequests(req.query);
    res.status(200).json({ success: true, data: transfers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const approveTransfer = async (req, res) => {
  try {
    const transfer = await transferService.approveTransfer(req.params.id, req.user._id);
    res.status(200).json({ success: true, data: transfer });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const rejectTransfer = async (req, res) => {
  try {
    const { reason } = req.body;
    const transfer = await transferService.rejectTransfer(req.params.id, req.user._id, reason);
    res.status(200).json({ success: true, data: transfer });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};