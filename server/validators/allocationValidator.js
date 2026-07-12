// server/validators/allocationValidator.js
import mongoose from 'mongoose';

export const validateAllocation = (req, res, next) => {
  const errors = {};
  const { asset, employee, department, expectedReturnDate } = req.body;
  const allocatedBy = req.user._id; 

  if (!asset || !mongoose.Types.ObjectId.isValid(asset)) errors.asset = 'Valid Asset ID is required';
  if (!employee || !mongoose.Types.ObjectId.isValid(employee)) errors.employee = 'Valid Employee ID is required';
  if (!department || !mongoose.Types.ObjectId.isValid(department)) errors.department = 'Valid Department ID is required';
  if (!allocatedBy || !mongoose.Types.ObjectId.isValid(allocatedBy)) errors.allocatedBy = 'Valid Admin ID is required';

  if (expectedReturnDate) {
    const expected = new Date(expectedReturnDate);
    const allocated = req.body.allocatedDate ? new Date(req.body.allocatedDate) : new Date();
    if (expected <= allocated) {
      errors.expectedReturnDate = 'Expected return date must be after allocated date';
    }
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }
  
  req.body.allocatedBy = allocatedBy;
  next();
};