import { useEffect, useState } from "react";
import { 
  getUsers, 
  deleteUser, 
  createUser, 
  editUser, 
  updateUserStatus, 
  resetUserPassword 
} from "../services/userService";

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter state
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  // Active items for editing
  const [currentUser, setCurrentUser] = useState(null);
  
  // Form fields
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formRole, setFormRole] = useState("viewer");
  const [formPassword, setFormPassword] = useState("");
  const [tempPassword, setTempPassword] = useState("");

  const currentUserId = localStorage.getItem("userId") || ""; // We'll try to find current user's profile to prevent self-deletion

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUsers(search, roleFilter);
      setUsers(data);
    } catch (err) {
      setError(err.message || "Failed to load system members.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchUsers();
    }, 300); // Debounce search changes

    return () => clearTimeout(delayDebounce);
  }, [search, roleFilter]);

  const handleDelete = async (id, name, role) => {
    if (role === "admin") {
      const adminCount = users.filter((u) => u.role === "admin").length;
      if (adminCount <= 1) {
        alert("Action Blocked: Cannot delete the last remaining Admin account.");
        return;
      }
    }

    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;

    try {
      await deleteUser(id);
      alert("User deleted successfully.");
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete user.");
    }
  };

  const handleStatusToggle = async (user) => {
    const newStatus = user.status === "Active" ? "Inactive" : "Active";
    
    if (newStatus === "Inactive" && user.role === "admin") {
      const activeAdmins = users.filter((u) => u.role === "admin" && u.status === "Active");
      if (activeAdmins.length <= 1) {
        alert("Action Blocked: Cannot deactivate the last remaining active Admin.");
        return;
      }
    }

    try {
      await updateUserStatus(user._id, newStatus);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to change user status.");
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formName || !formEmail || !formPassword) {
      alert("Please fill out all fields.");
      return;
    }

    try {
      await createUser({
        name: formName,
        email: formEmail,
        password: formPassword,
        role: formRole
      });
      alert("User account created successfully.");
      setShowCreateModal(false);
      resetForms();
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create user.");
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!formName || !formEmail) {
      alert("Please fill out all fields.");
      return;
    }

    // Integrity check for role change of last admin
    if (currentUser.role === "admin" && formRole !== "admin") {
      const adminCount = users.filter((u) => u.role === "admin").length;
      if (adminCount <= 1) {
        alert("Action Blocked: Cannot change the role of the last remaining Admin.");
        return;
      }
    }

    try {
      await editUser(currentUser._id, {
        name: formName,
        email: formEmail,
        role: formRole
      });
      alert("User profile updated successfully.");
      setShowEditModal(false);
      resetForms();
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update user.");
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!tempPassword || tempPassword.length < 6) {
      alert("Temporary password must be at least 6 characters.");
      return;
    }

    try {
      await resetUserPassword(currentUser._id, tempPassword);
      alert(`Password reset successfully for ${currentUser.name}. They will be forced to change it on next login.`);
      setShowResetModal(false);
      resetForms();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to reset password.");
    }
  };

  const openCreateModal = () => {
    resetForms();
    setShowCreateModal(true);
  };

  const openEditModal = (user) => {
    setCurrentUser(user);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormRole(user.role);
    setShowEditModal(true);
  };

  const openResetModal = (user) => {
    setCurrentUser(user);
    setTempPassword("");
    setShowResetModal(true);
  };

  const resetForms = () => {
    setFormName("");
    setFormEmail("");
    setFormRole("viewer");
    setFormPassword("");
    setTempPassword("");
    setCurrentUser(null);
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case "admin": return "badge-rose";
      case "manager": return "badge-blue";
      case "procurement": return "badge-amber";
      default: return "badge-emerald";
    }
  };

  return (
    <div className="page-container animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px", position: "relative" }}>
      {/* Background aurora glow blobs */}
      <div className="page-ambient-blobs">
        <div className="page-ambient-blob p-blob-1"></div>
        <div className="page-ambient-blob p-blob-2"></div>
      </div>

      <div className="flex-header">
        <div>
          <h1 style={{ fontSize: "28px" }}>User Management</h1>
          <p style={{ margin: 0 }}>Create, monitor, and coordinate platform access permissions and staff credentials.</p>
        </div>
        <button className="btn-primary" onClick={openCreateModal} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          Add System User
        </button>
      </div>

      {/* Filter bar */}
      <div className="glass-card" style={{ display: "flex", gap: "16px", flexWrap: "wrap", padding: "16px" }}>
        <div style={{ flex: 1, minWidth: "250px" }}>
          <input
            type="text"
            placeholder="🔍 Search users by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: "100%", background: "var(--bg-primary)" }}
          />
        </div>
        <div style={{ width: "200px" }}>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{ width: "100%", background: "var(--bg-primary)", cursor: "pointer" }}
          >
            <option value="">All Roles</option>
            <option value="admin">Administrator</option>
            <option value="manager">Inventory Manager</option>
            <option value="procurement">Procurement Officer</option>
            <option value="viewer">Viewer</option>
          </select>
        </div>
      </div>

      {/* Main user list table */}
      <div className="glass-card">
        {loading && <p style={{ color: "var(--text-secondary)" }}>Fetching system users...</p>}
        {error && <p style={{ color: "var(--accent-rose)" }}>{error}</p>}

        {!loading && !error && (
          <div className="table-container" style={{ margin: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>User Profile</th>
                  <th>Email Address</th>
                  <th>Assigned Role</th>
                  <th>Status</th>
                  <th>Security Flags</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center", color: "var(--text-muted)", padding: "24px" }}>
                      No users match the criteria.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user._id}>
                      <td style={{ display: "flex", alignItems: "center", gap: "12px", border: "none" }}>
                        <div style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "50%",
                          background: "linear-gradient(135deg, var(--accent-blue), var(--accent-purple))",
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: "700",
                          fontSize: "14px"
                        }}>
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: "600" }}>{user.name}</div>
                          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                            Created: {new Date(user.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`badge ${getRoleBadgeClass(user.role)}`} style={{ textTransform: "capitalize" }}>
                          {user.role}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span className={`badge ${user.status === "Active" ? "badge-emerald" : "badge-rose"}`}>
                            {user.status}
                          </span>
                          <button
                            onClick={() => handleStatusToggle(user)}
                            className="btn-outline"
                            style={{ padding: "4px 8px", fontSize: "11px", height: "auto" }}
                            title={`Toggle to ${user.status === "Active" ? "Deactivate" : "Activate"}`}
                          >
                            Toggle
                          </button>
                        </div>
                      </td>
                      <td>
                        {user.mustChangePassword ? (
                          <span className="badge badge-amber" style={{ fontSize: "11px" }}>🔑 Force Pwd Change</span>
                        ) : (
                          <span className="badge badge-emerald" style={{ fontSize: "11px" }}>✅ Verified</span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            className="btn-outline"
                            onClick={() => openEditModal(user)}
                            style={{ padding: "6px 12px", fontSize: "12px" }}
                          >
                            Edit
                          </button>
                          <button
                            className="btn-outline"
                            onClick={() => openResetModal(user)}
                            style={{ padding: "6px 12px", fontSize: "12px", border: "1px solid rgba(217, 119, 6, 0.3)", color: "var(--accent-amber)" }}
                          >
                            Reset Pwd
                          </button>
                          <button
                            className="btn-danger"
                            onClick={() => handleDelete(user._id, user.name, user.role)}
                            style={{ padding: "6px 12px", fontSize: "12px" }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- CREATE USER MODAL --- */}
      {showCreateModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "rgba(15, 23, 42, 0.6)",
          backdropFilter: "blur(8px)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000
        }}>
          <div className="glass-card animate-scale-in" style={{ width: "90%", maxWidth: "450px", border: "1px solid var(--border-light)" }}>
            <h3 style={{ marginBottom: "20px" }}>Create System User</h3>
            <form onSubmit={handleCreateSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", color: "var(--text-secondary)" }}>Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", color: "var(--text-secondary)" }}>Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. john@example.com"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", color: "var(--text-secondary)" }}>Assign System Role</label>
                <select value={formRole} onChange={(e) => setFormRole(e.target.value)}>
                  <option value="admin">Administrator</option>
                  <option value="manager">Inventory Manager</option>
                  <option value="procurement">Procurement Officer</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", color: "var(--text-secondary)" }}>Temporary Password</label>
                <input
                  type="password"
                  required
                  placeholder="At least 6 characters"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                />
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>User will be forced to change this password at first login.</span>
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                <button type="submit" style={{ flex: 1 }}>Create Account</button>
                <button type="button" className="btn-outline" onClick={() => setShowCreateModal(false)} style={{ flex: 1 }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT USER MODAL --- */}
      {showEditModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "rgba(15, 23, 42, 0.6)",
          backdropFilter: "blur(8px)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000
        }}>
          <div className="glass-card animate-scale-in" style={{ width: "90%", maxWidth: "450px", border: "1px solid var(--border-light)" }}>
            <h3 style={{ marginBottom: "20px" }}>Edit System User</h3>
            <form onSubmit={handleEditSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", color: "var(--text-secondary)" }}>Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", color: "var(--text-secondary)" }}>Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. john@example.com"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", color: "var(--text-secondary)" }}>Assign System Role</label>
                <select value={formRole} onChange={(e) => setFormRole(e.target.value)}>
                  <option value="admin">Administrator</option>
                  <option value="manager">Inventory Manager</option>
                  <option value="procurement">Procurement Officer</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                <button type="submit" style={{ flex: 1 }}>Save Changes</button>
                <button type="button" className="btn-outline" onClick={() => setShowEditModal(false)} style={{ flex: 1 }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- RESET PASSWORD MODAL --- */}
      {showResetModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "rgba(15, 23, 42, 0.6)",
          backdropFilter: "blur(8px)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000
        }}>
          <div className="glass-card animate-scale-in" style={{ width: "90%", maxWidth: "450px", border: "1px solid var(--border-light)" }}>
            <h3 style={{ marginBottom: "8px" }}>Reset User Password</h3>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "20px" }}>
              Assign a new temporary password for <strong>{currentUser?.name}</strong>.
            </p>
            <form onSubmit={handleResetPasswordSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", color: "var(--text-secondary)" }}>Temporary Password</label>
                <input
                  type="password"
                  required
                  placeholder="At least 6 characters"
                  value={tempPassword}
                  onChange={(e) => setTempPassword(e.target.value)}
                />
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                <button type="submit" style={{ flex: 1 }}>Reset Password</button>
                <button type="button" className="btn-outline" onClick={() => setShowResetModal(false)} style={{ flex: 1 }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Users;
