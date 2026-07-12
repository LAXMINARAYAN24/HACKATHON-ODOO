import { useState, useEffect, useCallback } from "react";
import {
  Building2,
  Tags,
  Users,
  Plus,
  Pencil,
  X,
  Check,
  AlertCircle,
  ChevronDown,
} from "lucide-react";
import api from "../services/api.js";

// ── Reusable sub-components 
const SectionHeader = ({ title, subtitle, onAdd }) => (
  <div className="flex items-center justify-between mb-5">
    <div>
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      {subtitle && <p className="text-sm text-slate-400 mt-0.5">{subtitle}</p>}
    </div>
    {onAdd && (
      <button
        onClick={onAdd}
        id={`add-${title.toLowerCase().replace(/\s/g, "-")}-btn`}
        className="btn-primary flex items-center gap-2 text-sm"
      >
        <Plus size={15} />
        Add {title.split(" ")[0]}
      </button>
    )}
  </div>
);

const EmptyState = ({ message }) => (
  <div className="flex flex-col items-center justify-center py-12 text-slate-500">
    <p className="text-sm">{message}</p>
  </div>
);

const ErrorBanner = ({ message }) =>
  message ? (
    <div className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 mb-4">
      <AlertCircle size={15} className="text-red-400 flex-shrink-0" />
      <p className="text-red-400 text-sm">{message}</p>
    </div>
  ) : null;

// ── TAB: Departments 

const DepartmentsTab = ({ users }) => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState({ name: "", head: "", parentDepartment: "", status: "active" });
  const [saving, setSaving] = useState(false);

  const fetchDepts = useCallback(async () => {
    try {
      const res = await api.get("/departments");
      setDepartments(res.data.data || []);
    } catch {
      setError("Failed to load departments.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDepts(); }, [fetchDepts]);

  const openCreate = () => {
    setEditTarget(null);
    setForm({ name: "", head: "", parentDepartment: "", status: "active" });
    setError("");
    setShowForm(true);
  };

  const openEdit = (dept) => {
    setEditTarget(dept);
    setForm({
      name: dept.name,
      head: dept.head?._id || "",
      parentDepartment: dept.parentDepartment?._id || "",
      status: dept.status,
    });
    setError("");
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setError("Department name is required."); return; }
    setSaving(true);
    setError("");
    try {
      const payload = {
        name: form.name.trim(),
        head: form.head || null,
        parentDepartment: form.parentDepartment || null,
        status: form.status,
      };
      if (editTarget) {
        await api.patch(`/departments/${editTarget._id}`, payload);
      } else {
        await api.post("/departments", payload);
      }
      setShowForm(false);
      fetchDepts();
    } catch (err) {
      setError(err.response?.data?.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <SectionHeader
        title="Departments"
        subtitle="Manage organizational structure"
        onAdd={openCreate}
      />
      <ErrorBanner message={error} />

      {/* Inline form */}
      {showForm && (
        <div className="card mb-5 border-primary-500/30">
          <h3 className="text-sm font-semibold text-white mb-4">
            {editTarget ? "Edit Department" : "New Department"}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Name *</label>
              <input
                id="dept-name-input"
                className="input"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Information Technology"
              />
            </div>
            <div>
              <label className="label">Department Head</label>
              <select
                id="dept-head-select"
                className="input"
                value={form.head}
                onChange={(e) => setForm((f) => ({ ...f, head: e.target.value }))}
              >
                <option value="">— None —</option>
                {users.map((u) => (
                  <option key={u._id} value={u._id}>{u.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Parent Department</label>
              <select
                id="dept-parent-select"
                className="input"
                value={form.parentDepartment}
                onChange={(e) => setForm((f) => ({ ...f, parentDepartment: e.target.value }))}
              >
                <option value="">— None (top-level) —</option>
                {departments
                  .filter((d) => d._id !== editTarget?._id)
                  .map((d) => (
                    <option key={d._id} value={d._id}>{d.name}</option>
                  ))}
              </select>
            </div>
            <div>
              <label className="label">Status</label>
              <select
                id="dept-status-select"
                className="input"
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              id="dept-save-btn"
              onClick={handleSave}
              disabled={saving}
              className="btn-primary flex items-center gap-2 text-sm"
            >
              {saving ? <div className="spinner h-4 w-4" /> : <Check size={14} />}
              {editTarget ? "Update" : "Create"}
            </button>
            <button
              id="dept-cancel-btn"
              onClick={() => setShowForm(false)}
              className="btn-secondary text-sm flex items-center gap-2"
            >
              <X size={14} /> Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-10"><div className="spinner h-6 w-6" /></div>
      ) : departments.length === 0 ? (
        <EmptyState message="No departments yet. Create your first one above." />
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Head</th>
                <th>Parent</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((dept) => (
                <tr key={dept._id}>
                  <td className="font-medium text-white">{dept.name}</td>
                  <td>{dept.head?.name || <span className="text-slate-600">—</span>}</td>
                  <td>{dept.parentDepartment?.name || <span className="text-slate-600">—</span>}</td>
                  <td>
                    <span className={dept.status === "active" ? "badge-green" : "badge-gray"}>
                      {dept.status}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => openEdit(dept)}
                      className="text-slate-400 hover:text-primary-400 transition-colors"
                      title="Edit"
                    >
                      <Pencil size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ── TAB: Categories 

const CategoriesTab = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState({ name: "" });
  const [saving, setSaving] = useState(false);

  const fetchCats = useCallback(async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data.data || []);
    } catch {
      setError("Failed to load categories.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCats(); }, [fetchCats]);

  const openCreate = () => {
    setEditTarget(null);
    setForm({ name: "" });
    setError("");
    setShowForm(true);
  };

  const openEdit = (cat) => {
    setEditTarget(cat);
    setForm({ name: cat.name });
    setError("");
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setError("Category name is required."); return; }
    setSaving(true);
    setError("");
    try {
      if (editTarget) {
        await api.patch(`/categories/${editTarget._id}`, { name: form.name.trim() });
      } else {
        await api.post("/categories", { name: form.name.trim() });
      }
      setShowForm(false);
      fetchCats();
    } catch (err) {
      setError(err.response?.data?.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <SectionHeader
        title="Categories"
        subtitle="Asset classification categories used during registration"
        onAdd={openCreate}
      />
      <ErrorBanner message={error} />

      {showForm && (
        <div className="card mb-5 border-primary-500/30">
          <h3 className="text-sm font-semibold text-white mb-4">
            {editTarget ? "Edit Category" : "New Category"}
          </h3>
          <div>
            <label className="label">Name *</label>
            <input
              id="cat-name-input"
              className="input"
              value={form.name}
              onChange={(e) => setForm({ name: e.target.value })}
              placeholder="e.g. Laptop"
            />
          </div>
          <div className="flex gap-2 mt-4">
            <button
              id="cat-save-btn"
              onClick={handleSave}
              disabled={saving}
              className="btn-primary flex items-center gap-2 text-sm"
            >
              {saving ? <div className="spinner h-4 w-4" /> : <Check size={14} />}
              {editTarget ? "Update" : "Create"}
            </button>
            <button
              id="cat-cancel-btn"
              onClick={() => setShowForm(false)}
              className="btn-secondary text-sm flex items-center gap-2"
            >
              <X size={14} /> Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-10"><div className="spinner h-6 w-6" /></div>
      ) : categories.length === 0 ? (
        <EmptyState message="No categories yet. Create your first one above." />
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat._id}>
                  <td className="font-medium text-white">{cat.name}</td>
                  <td>{new Date(cat.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button
                      onClick={() => openEdit(cat)}
                      className="text-slate-400 hover:text-primary-400 transition-colors"
                      title="Edit"
                    >
                      <Pencil size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ── TAB: Users 

const ROLES = ["employee", "dept_head", "asset_manager", "admin"];

const UsersTab = ({ users, onRefresh }) => {
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(null);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    api.get("/departments").then((r) => setDepartments(r.data.data || []));
  }, []);

  const updateField = async (userId, endpoint, payload) => {
    setSaving(userId + endpoint);
    setError("");
    try {
      await api.patch(`/users/${userId}/${endpoint}`, payload);
      onRefresh();
    } catch (err) {
      setError(err.response?.data?.message || "Update failed.");
    } finally {
      setSaving(null);
    }
  };

  return (
    <div>
      <SectionHeader
        title="Employee Directory"
        subtitle="Manage user roles, status, and department assignments"
      />
      <ErrorBanner message={error} />

      {users.length === 0 ? (
        <EmptyState message="No users found." />
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Department</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td className="font-medium text-white">{u.name}</td>
                  <td className="text-slate-400">{u.email}</td>
                  <td>
                    <select
                      id={`user-role-select-${u._id}`}
                      className="input py-1 text-xs"
                      value={u.role}
                      disabled={saving === u._id + "role"}
                      onChange={(e) => updateField(u._id, "role", { role: e.target.value })}
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>{r.replace(/_/g, " ")}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <select
                      id={`user-dept-select-${u._id}`}
                      className="input py-1 text-xs"
                      value={u.department?._id || ""}
                      disabled={saving === u._id + "department"}
                      onChange={(e) => updateField(u._id, "department", { department: e.target.value || null })}
                    >
                      <option value="">— Unassigned —</option>
                      {departments.map((d) => (
                        <option key={d._id} value={d._id}>{d.name}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <button
                      id={`user-status-btn-${u._id}`}
                      disabled={saving === u._id + "status"}
                      onClick={() =>
                        updateField(u._id, "status", {
                          status: u.status === "active" ? "inactive" : "active",
                        })
                      }
                      className={u.status === "active" ? "badge-green cursor-pointer" : "badge-gray cursor-pointer"}
                    >
                      {u.status}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ── Main page 
const TABS = [
  { key: "departments", label: "Departments", icon: Building2 },
  { key: "categories", label: "Categories", icon: Tags },
  { key: "users", label: "Employee Directory", icon: Users },
];

const OrganizationSetup = () => {
  const [activeTab, setActiveTab] = useState("departments");
  const [users, setUsers] = useState([]);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await api.get("/users");
      setUsers(res.data.data || []);
    } catch {
      setUsers([]);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="page-title">Organization Setup</h1>
        <p className="page-subtitle">
          Manage departments, asset categories, and user permissions
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            id={`org-tab-${key}`}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all duration-200 -mb-px ${
              activeTab === key
                ? "border-primary-500 text-primary-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="card">
        {activeTab === "departments" && <DepartmentsTab users={users} />}
        {activeTab === "categories" && <CategoriesTab />}
        {activeTab === "users" && <UsersTab users={users} onRefresh={fetchUsers} />}
      </div>
    </div>
  );
};

export default OrganizationSetup;
