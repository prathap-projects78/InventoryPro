import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("viewer");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post(
        "/auth/login",
        {
          email,
          password,
          role,
        }
      );

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("role", response.data.role);
      localStorage.setItem("name", response.data.name || "");
      localStorage.setItem("mustChangePassword", String(response.data.mustChangePassword));

      if (response.data.mustChangePassword) {
        navigate("/change-password");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      alert(error.response?.data?.message || "Invalid credentials");
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
        <h2 style={{ color: "var(--text-primary)", marginBottom: "24px", fontWeight: "700" }}>Welcome Back</h2>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <input
            type="email"
            placeholder="Email"
            required
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

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            style={{
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
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;