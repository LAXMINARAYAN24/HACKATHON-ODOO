// server/validators/assetValidator.js
import mongoose from 'mongoose';

export const validateAsset = (req, res, next) => {
  const errors = {};
  const { tag, name, category, department, acquisitionDate, acquisitionCost, condition } = req.body;

  if (!tag || tag.trim() === '') errors.tag = 'Tag is required';
  if (!name || name.trim() === '') errors.name = 'Name is required';
  if (!category || !mongoose.Types.ObjectId.isValid(category)) errors.category = 'Valid Category ID is required';
  if (!department || !mongoose.Types.ObjectId.isValid(department)) errors.department = 'Valid Department ID is required';
  if (acquisitionDate && isNaN(Date.parse(acquisitionDate))) errors.acquisitionDate = 'Valid acquisition date is required';
  if (acquisitionCost !== undefined && (isNaN(acquisitionCost) || Number(acquisitionCost) < 0)) errors.acquisitionCost = 'Acquisition cost must be a number >= 0';
  if (!condition || condition.trim() === '') errors.condition = 'Condition is required';

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }
  next();
};