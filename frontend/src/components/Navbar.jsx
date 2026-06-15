import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav style={{ display: "flex", gap: "16px", padding: "12px 16px", borderBottom: "1px solid #ddd" }}>
      <Link to="/dashboard">Dashboard</Link>
      <Link to="/products">Products</Link>
    </nav>
  );
}

export default Navbar;
