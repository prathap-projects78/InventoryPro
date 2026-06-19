import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { changePassword } from "../services/userService";

function ChangePassword() {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Simple password strength calculation
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: "None", color: "var(--text-muted)" };
    let score = 0;
    if (pwd.length >= 6) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    switch (score) {
      case 0:
      case 1:
        return { score, label: "Weak", color: "var(--accent-rose)" };
      case 2:
      case 3:
        return { score, label: "Medium", color: "var(--accent-amber)" };
      case 4:
      default:
        return { score, label: "Strong", color: "var(--accent-emerald)" };
    }
  };

  const strength = getPasswordStrength(newPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword.trim().length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      await changePassword(newPassword);
      localStorage.setItem("mustChangePassword", "false");
      alert("Password updated successfully! Welcome to InventoryPro.");
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update password. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    localStorage.removeItem("mustChangePassword");
    navigate("/login");
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
          maxWidth: "400px",
          boxShadow: "var(--card-shadow)",
          textAlign: "center"
        }}
      >
        <img src="/logo.png" alt="InventoryPro Logo" style={{ width: "64px", height: "64px", marginBottom: "16px" }} />
        <h2 style={{ color: "var(--text-primary)", marginBottom: "8px", fontWeight: "700" }}>Secure Your Account</h2>
        <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "24px" }}>
          For security, you must update your temporary password before accessing the system.
        </p>

        {error && (
          <div style={{
            background: "rgba(225, 29, 72, 0.1)",
            border: "1px solid rgba(225, 29, 72, 0.2)",
            color: "var(--accent-rose)",
            padding: "10px",
            borderRadius: "8px",
            fontSize: "14px",
            marginBottom: "16px",
            textAlign: "left"
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ textAlign: "left" }}>
            <input
              type="password"
              placeholder="New Secure Password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={{
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid var(--border-color)",
                background: "var(--bg-secondary)",
                color: "var(--text-primary)",
                fontSize: "16px"
              }}
            />
            {newPassword && (
              <div style={{ marginTop: "6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                  Strength: <strong style={{ color: strength.color }}>{strength.label}</strong>
                </span>
                <div style={{ display: "flex", gap: "2px" }}>
                  {[1, 2, 3, 4].map((i) => (
                    <div 
                      key={i} 
                      style={{ 
                        width: "12px", 
                        height: "4px", 
                        borderRadius: "2px",
                        backgroundColor: i <= strength.score ? strength.color : "var(--border-color)"
                      }} 
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <input
            type="password"
            placeholder="Confirm New Password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={{
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid var(--border-color)",
              background: "var(--bg-secondary)",
              color: "var(--text-primary)",
              fontSize: "16px"
            }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "12px",
              borderRadius: "8px",
              border: "none",
              background: "linear-gradient(135deg, var(--accent-blue), var(--accent-purple))",
              color: "white",
              fontSize: "16px",
              cursor: "pointer",
              fontWeight: "bold",
              marginTop: "8px",
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>

        <button
          onClick={handleLogout}
          className="btn-outline"
          style={{
            marginTop: "16px",
            width: "100%",
            border: "1px solid var(--border-color)",
            color: "var(--text-secondary)",
            padding: "10px",
            fontSize: "14px"
          }}
        >
          Cancel & Logout
        </button>
      </div>
    </div>
  );
}

export default ChangePassword;
