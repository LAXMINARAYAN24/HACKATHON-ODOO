import MaintenanceRequest from '../models/MaintenanceRequest.js';
import Asset from '../models/Asset.js';



const createRequest = async (req, res) => {
  try {
    const { asset, issue, priority, photoUrl } = req.body;

    if (!asset || !issue || !priority) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: asset, issue, priority',
      });
    }

    
    const assetDoc = await Asset.findById(asset);
    if (!assetDoc) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found',
      });
    }

    const request = await MaintenanceRequest.create({
      asset,
      raisedBy: req.user.id,
      issue,
      priority,
      photoUrl,
    });

    const populated = await MaintenanceRequest.findById(request._id)
      .populate('asset', 'name assetTag category')
      .populate('raisedBy', 'name email');

    return res.status(201).json({
      success: true,
      message: 'Maintenance request raised successfully',
      data: populated,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors)
        .map((e) => e.message)
        .join(', ');
      return res.status(400).json({
        success: false,
        message: `Validation error: ${messages}`,
      });
    }
    console.error('createRequest error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};


const getAllRequests = async (req, res) => {
  try {
    const { status, priority, asset } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (asset) filter.asset = asset;

    const requests = await MaintenanceRequest.find(filter)
      .populate('asset', 'name assetTag category location')
      .populate('raisedBy', 'name email')
      .populate('technician', 'name email')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: 'Maintenance requests retrieved successfully',
      data: requests,
    });
  } catch (error) {
    console.error('getAllRequests error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};


const getRequestById = async (req, res) => {
  try {
    const request = await MaintenanceRequest.findById(req.params.id)
      .populate('asset', 'name assetTag category location status')
      .populate('raisedBy', 'name email department')
      .populate('technician', 'name email')
      .populate('approvedBy', 'name email');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance request not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Maintenance request retrieved successfully',
      data: request,
    });
  } catch (error) {
    console.error('getRequestById error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};


const approveRequest = async (req, res) => {
  try {
    const request = await MaintenanceRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance request not found',
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot approve a request with status '${request.status}'. Only pending requests can be approved.`,
      });
    }

   
    request.status = 'approved';
    request.approvedBy = req.user.id;
    await request.save();

    
    await Asset.findByIdAndUpdate(request.asset, {
      status: 'Under Maintenance',
    });

    const populated = await MaintenanceRequest.findById(request._id)
      .populate('asset', 'name assetTag category')
      .populate('raisedBy', 'name email')
      .populate('approvedBy', 'name email');

    return res.status(200).json({
      success: true,
      message: 'Maintenance request approved. Asset marked as Under Maintenance.',
      data: populated,
    });
  } catch (error) {
    console.error('approveRequest error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};


const rejectRequest = async (req, res) => {
  try {
    const { remarks } = req.body;
    const request = await MaintenanceRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance request not found',
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot reject a request with status '${request.status}'. Only pending requests can be rejected.`,
      });
    }

    request.status = 'rejected';
    request.approvedBy = req.user.id;
    if (remarks) request.remarks = remarks;
    await request.save();

    const populated = await MaintenanceRequest.findById(request._id)
      .populate('asset', 'name assetTag category')
      .populate('raisedBy', 'name email')
      .populate('approvedBy', 'name email');

    return res.status(200).json({
      success: true,
      message: 'Maintenance request rejected',
      data: populated,
    });
  } catch (error) {
    console.error('rejectRequest error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};


const assignTechnician = async (req, res) => {
  try {
    const { technicianId } = req.body;
    const request = await MaintenanceRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance request not found',
      });
    }

    if (request.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: `Cannot assign technician to a request with status '${request.status}'. Only approved requests can have a technician assigned.`,
      });
    }

    if (!technicianId) {
      return res.status(400).json({
        success: false,
        message: 'Technician ID is required',
      });
    }

    request.status = 'technician_assigned';
    request.technician = technicianId;
    await request.save();

    const populated = await MaintenanceRequest.findById(request._id)
      .populate('asset', 'name assetTag category')
      .populate('raisedBy', 'name email')
      .populate('technician', 'name email')
      .populate('approvedBy', 'name email');

    return res.status(200).json({
      success: true,
      message: 'Technician assigned successfully',
      data: populated,
    });
  } catch (error) {
    console.error('assignTechnician error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};


const startProgress = async (req, res) => {
  try {
    const request = await MaintenanceRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance request not found',
      });
    }

    if (request.status !== 'technician_assigned') {
      return res.status(400).json({
        success: false,
        message: `Cannot start progress on a request with status '${request.status}'. Only requests with an assigned technician can begin.`,
      });
    }

    request.status = 'in_progress';
    await request.save();

    const populated = await MaintenanceRequest.findById(request._id)
      .populate('asset', 'name assetTag category')
      .populate('raisedBy', 'name email')
      .populate('technician', 'name email')
      .populate('approvedBy', 'name email');

    return res.status(200).json({
      success: true,
      message: 'Maintenance work is now in progress',
      data: populated,
    });
  } catch (error) {
    console.error('startProgress error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};


const resolveRequest = async (req, res) => {
  try {
    const { remarks } = req.body;
    const request = await MaintenanceRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance request not found',
      });
    }

    if (request.status !== 'in_progress') {
      return res.status(400).json({
        success: false,
        message: `Cannot resolve a request with status '${request.status}'. Only in-progress requests can be resolved.`,
      });
    }

    
    request.status = 'resolved';
    request.resolvedAt = new Date();
    if (remarks) request.remarks = remarks;
    await request.save();

    
    await Asset.findByIdAndUpdate(request.asset, {
      status: 'Available',
    });

    const populated = await MaintenanceRequest.findById(request._id)
      .populate('asset', 'name assetTag category')
      .populate('raisedBy', 'name email')
      .populate('technician', 'name email')
      .populate('approvedBy', 'name email');

    return res.status(200).json({
      success: true,
      message: 'Maintenance request resolved. Asset marked as Available.',
      data: populated,
    });
  } catch (error) {
    console.error('resolveRequest error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export {
  createRequest,
  getAllRequests,
  getRequestById,
  approveRequest,
  rejectRequest,
  assignTechnician,
  startProgress,
  resolveRequest,
};
