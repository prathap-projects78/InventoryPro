import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("viewer");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/auth/register", {
        name,
        email,
        password,
        role,
      });

      alert("Registration successful! Redirecting to login...");
      navigate("/login");
    } catch (error) {
      alert(error.response?.data?.message || "Registration failed. Try again.");
    }
  };

  return (
    <div className="auth-page-bg">
      <div 
        className="animate-scale-in"
        style={{
          background: "var(--card-bg)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "1px solid var(--border-light)",
          padding: "32px 20px",
          borderRadius: "20px",
          width: "90%",
          maxWidth: "380px",
          boxShadow: "var(--card-shadow)",
          textAlign: "center"
        }}
      >
        <img src="/logo.png" alt="InventoryPro Logo" style={{ width: "64px", height: "64px", marginBottom: "16px" }} />
        <h2 style={{ color: "var(--text-primary)", marginBottom: "24px", fontWeight: "700" }}>Create Account</h2>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <input
            type="text"
            placeholder="Full Name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid var(--border-color)",
              background: "var(--bg-secondary)",
              color: "var(--text-primary)",
              fontSize: "16px"
            }}
          />

          <input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid var(--border-color)",
              background: "var(--bg-secondary)",
              color: "var(--text-primary)",
              fontSize: "16px"
            }}
          />

          <input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid var(--border-color)",
              background: "var(--bg-secondary)",
              color: "var(--text-primary)",
              fontSize: "16px"
            }}
          />

          <div style={{ textAlign: "left" }}>
            <label style={{ fontSize: "14px", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>Select Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid var(--border-color)",
                background: "var(--bg-secondary)",
                color: "var(--text-primary)",
                fontSize: "16px",
                cursor: "pointer"
              }}
            >
              <option value="admin">Admin</option>
              <option value="manager">Inventory Manager</option>
              <option value="procurement">Procurement Officer</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>

          <button
            type="submit"
            style={{
              padding: "12px",
              borderRadius: "8px",
              border: "none",
              background: "linear-gradient(135deg, var(--accent-blue), var(--accent-purple))",
              color: "white",
              fontSize: "16px",
              cursor: "pointer",
              fontWeight: "bold",
              marginTop: "8px"
            }}
          >
            Sign Up
          </button>

          <p style={{ marginTop: "12px", fontSize: "14px", color: "var(--text-secondary)" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "var(--accent-blue)", textDecoration: "none", fontWeight: "bold" }}>Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Register;
