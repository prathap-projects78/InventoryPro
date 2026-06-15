import { useEffect, useState } from "react";
import { getCategories, createCategory } from "../services/categoryService";

function Categories() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCategories();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await createCategory({ name });
      setName("");
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create category");
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
          <h1 style={{ fontSize: "28px" }}>Product Categories</h1>
          <p style={{ margin: 0 }}>Classify and manage inventory items into logical departments.</p>
        </div>
      </div>

      <div className="glass-card" style={{ maxWidth: "500px", padding: "24px" }}>
        <h3 style={{ marginBottom: "16px", fontSize: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--accent-purple)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
          Create Category
        </h3>
        <form onSubmit={handleSubmit} style={{ display: "flex", gap: "12px" }}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Electronics"
            required
          />
          <button type="submit">Add Category</button>
        </form>
      </div>

      <div className="glass-card">
        <h3 style={{ marginBottom: "20px" }}>Current Categories</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
          {categories.length === 0 ? (
            <p style={{ color: "var(--text-muted)", margin: 0 }}>No categories created yet.</p>
          ) : (
            categories.map((category) => (
              <div
                key={category._id}
                style={{
                  background: "rgba(59, 130, 246, 0.1)",
                  border: "1px solid rgba(59, 130, 246, 0.2)",
                  color: "#60a5fa",
                  padding: "10px 18px",
                  borderRadius: "30px",
                  fontSize: "15px",
                  fontWeight: "500",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  transition: "background 0.2s, transform 0.2s",
                  cursor: "default"
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.background = "rgba(59, 130, 246, 0.15)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.background = "rgba(59, 130, 246, 0.1)";
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ flexShrink: 0 }}
                >
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                </svg>
                {category.name}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Categories;