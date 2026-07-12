import Department from "../models/Department.js";

// GET /api/departments
export const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find()
      .populate("head", "name email role")
      .populate("parentDepartment", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: departments,
    });
  } catch (error) {
    console.error("Get departments error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

// POST /api/departments
export const createDepartment = async (req, res) => {
  try {
    const { name, head, parentDepartment, status } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Department name is required.",
      });
    }

    const existing = await Department.findOne({ name: name.trim() });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "A department with this name already exists.",
      });
    }

    const department = await Department.create({
      name: name.trim(),
      head: head || null,
      parentDepartment: parentDepartment || null,
      status: status || "active",
    });

    const populated = await Department.findById(department._id)
      .populate("head", "name email")
      .populate("parentDepartment", "name");

    return res.status(201).json({
      success: true,
      message: "Department created successfully.",
      data: populated,
    });
  } catch (error) {
    console.error("Create department error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

// PATCH /api/departments/:id
export const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, head, parentDepartment, status } = req.body;

    const department = await Department.findById(id);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found.",
      });
    }

    if (name !== undefined) department.name = name.trim();
    if (head !== undefined) department.head = head || null;
    if (parentDepartment !== undefined)
      department.parentDepartment = parentDepartment || null;
    if (status !== undefined) department.status = status;

    await department.save();

    const updated = await Department.findById(id)
      .populate("head", "name email")
      .populate("parentDepartment", "name");

    return res.status(200).json({
      success: true,
      message: "Department updated successfully.",
      data: updated,
    });
  } catch (error) {
    console.error("Update department error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};
