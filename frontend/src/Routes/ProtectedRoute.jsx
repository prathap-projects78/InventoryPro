import { Navigate, useLocation } from "react-router-dom";

function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const mustChangePassword = localStorage.getItem("mustChangePassword");
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (mustChangePassword === "true" && location.pathname !== "/change-password") {
    return <Navigate to="/change-password" />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" />;
  }

  return children;
}

export default ProtectedRoute;