// server/validators/transferValidator.js
import mongoose from 'mongoose';

export const validateTransferRequest = (req, res, next) => {
  const errors = {};
  const { asset, toEmployee, reason } = req.body;
  const requestedBy = req.user._id;

  if (!asset || !mongoose.Types.ObjectId.isValid(asset)) errors.asset = 'Valid Asset ID is required';
  if (!toEmployee || !mongoose.Types.ObjectId.isValid(toEmployee)) errors.toEmployee = 'Valid Target Employee ID is required';
  if (!requestedBy || !mongoose.Types.ObjectId.isValid(requestedBy)) errors.requestedBy = 'Valid Requester ID is required';
  if (!reason || reason.trim().length < 10) errors.reason = 'Reason is required and must be at least 10 characters long';

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }

  req.body.requestedBy = requestedBy;
  next();
};