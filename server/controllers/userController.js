import User from "../models/User.js";

// GET /api/users
export const getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-passwordHash")
      .populate("department", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Get users error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

// PATCH /api/users/:id/role
export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const allowedRoles = ["employee", "dept_head", "asset_manager", "admin"];
    if (!role || !allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Role must be one of: ${allowedRoles.join(", ")}.`,
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    user.role = role;
    await user.save();

    const updated = await User.findById(id)
      .select("-passwordHash")
      .populate("department", "name");

    return res.status(200).json({
      success: true,
      message: "User role updated successfully.",
      data: updated,
    });
  } catch (error) {
    console.error("Update user role error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

// PATCH /api/users/:id/status
export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !["active", "inactive"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be 'active' or 'inactive'.",
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    user.status = status;
    await user.save();

    const updated = await User.findById(id)
      .select("-passwordHash")
      .populate("department", "name");

    return res.status(200).json({
      success: true,
      message: "User status updated successfully.",
      data: updated,
    });
  } catch (error) {
    console.error("Update user status error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

// PATCH /api/users/:id/department
export const updateUserDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { department } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    user.department = department || null;
    await user.save();

    const updated = await User.findById(id)
      .select("-passwordHash")
      .populate("department", "name");

    return res.status(200).json({
      success: true,
      message: "User department updated successfully.",
      data: updated,
    });
  } catch (error) {
    console.error("Update user department error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};
