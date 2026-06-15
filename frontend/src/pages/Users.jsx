import { useEffect, useState } from "react";
import { getUsers, deleteUser } from "../services/userService";

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      setError(err.message || "Failed to load system members.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await deleteUser(id);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete user");
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
          <h1 style={{ fontSize: "28px" }}>User Directory</h1>
          <p style={{ margin: 0 }}>View and coordinate user credentials, roles, and platform permissions.</p>
        </div>
      </div>

      <div className="glass-card">
        <h3 style={{ marginBottom: "20px" }}>System Members</h3>

        {loading && <p style={{ color: "var(--text-secondary)" }}>Loading members directory...</p>}
        {error && <p style={{ color: "var(--accent-rose)" }}>{error}</p>}

        {!loading && !error && (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Email Address</th>
                  <th>Assigned Role</th>
                  <th>Joined Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
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
                      <span style={{ fontWeight: "600" }}>{user.name}</span>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <span className="badge badge-blue" style={{ textTransform: "capitalize" }}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: "var(--text-secondary)" }}>
                        {new Date(user.createdAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric"
                        })}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn-danger"
                        onClick={() => handleDelete(user._id)}
                        style={{ padding: "6px 12px", fontSize: "13px" }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Users;
