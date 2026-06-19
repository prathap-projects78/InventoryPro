import { useEffect, useState } from "react";
import { getProducts } from "../services/productService";
import { getOrders } from "../services/orderService";
import {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier
} from "../services/supplierService";

function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  
  // Role verification
  const role = localStorage.getItem("role") || "viewer";
  const isAuthorized = role === "admin" || role === "procurement";

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [addForm, setAddForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    rating: 5
  });
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    rating: 5
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch persistent database suppliers, products, and orders in parallel
      const [dbSuppliers, products, orders] = await Promise.all([
        getSuppliers(),
        getProducts(),
        getOrders()
      ]);

      // Compile operational metrics dynamically matching by supplier name (case-insensitive)
      const compiledSuppliers = dbSuppliers.map((sup) => {
        const nameKey = sup.name.trim().toLowerCase();
        
        let productsCount = 0;
        let activeOrdersCount = 0;
        let deliveredOrdersCount = 0;
        let totalSpend = 0;

        // Parse products
        products.forEach((prod) => {
          if (prod.supplier && prod.supplier.trim().toLowerCase() === nameKey) {
            productsCount += 1;
          }
        });

        // Parse orders
        orders.forEach((order) => {
          if (order.supplier && order.supplier.trim().toLowerCase() === nameKey) {
            if (order.status === "Pending" || order.status === "Approved") {
              activeOrdersCount += 1;
            } else if (order.status === "Delivered") {
              deliveredOrdersCount += 1;
            }

            const price = order.product?.price || 0;
            totalSpend += order.quantity * price;
          }
        });

        return {
          ...sup,
          productsCount,
          activeOrdersCount,
          deliveredOrdersCount,
          totalSpend
        };
      });

      setSuppliers(compiledSuppliers);
    } catch (err) {
      setError("Failed to load suppliers data. Please ensure you are authorized.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!addForm.name || !addForm.email || !addForm.phone || !addForm.address) {
      alert("All fields are required.");
      return;
    }

    try {
      await createSupplier(addForm);
      alert("Supplier added successfully!");
      setIsAddModalOpen(false);
      setAddForm({ name: "", email: "", phone: "", address: "", rating: 5 });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add supplier.");
    }
  };

  const handleEditClick = (sup) => {
    setEditingSupplier(sup);
    setEditForm({
      name: sup.name,
      email: sup.email,
      phone: sup.phone,
      address: sup.address,
      rating: sup.rating
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editForm.name || !editForm.email || !editForm.phone || !editForm.address) {
      alert("All fields are required.");
      return;
    }

    try {
      await updateSupplier(editingSupplier._id, editForm);
      alert("Supplier updated successfully!");
      setEditingSupplier(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update supplier.");
    }
  };

  const handleDeleteClick = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteSupplier(id);
      alert("Supplier deleted successfully.");
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete supplier.");
    }
  };

  const filteredSuppliers = suppliers.filter((sup) =>
    sup.name.toLowerCase().includes(search.toLowerCase())
  );

  // Global KPIs
  const totalSuppliersCount = suppliers.length;
  const totalSpendAll = suppliers.reduce((sum, s) => sum + s.totalSpend, 0);
  const totalActiveOrders = suppliers.reduce((sum, s) => sum + s.activeOrdersCount, 0);
  const topSupplier = suppliers.reduce((max, s) => (s.totalSpend > (max?.totalSpend || 0) ? s : max), null);

  return (
    <div className="page-container animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px", position: "relative" }}>
      {/* Background aurora glow blobs */}
      <div className="page-ambient-blobs">
        <div className="page-ambient-blob p-blob-1"></div>
        <div className="page-ambient-blob p-blob-2"></div>
      </div>

      <div className="flex-header">
        <div>
          <h1 style={{ fontSize: "28px" }}>Suppliers Directory</h1>
          <p style={{ margin: 0 }}>View operational statistics, contact profiles, and spend analytics for all active supply partners.</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          {isAuthorized && (
            <button className="btn-primary" onClick={() => setIsAddModalOpen(true)} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              ➕ Add Supplier
            </button>
          )}
          <button className="btn-outline" onClick={fetchData} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            🔄 Refresh
          </button>
        </div>
      </div>

      {loading && <p style={{ color: "var(--text-secondary)" }}>Analyzing catalog supply logs...</p>}
      {error && <p style={{ color: "var(--accent-rose)" }}>{error}</p>}

      {!loading && !error && (
        <>
          {/* Supplier Metrics cards */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px"
          }}>
            <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Total Active Suppliers</span>
              <span style={{ fontSize: "28px", fontWeight: "700", color: "var(--accent-blue)" }}>{totalSuppliersCount}</span>
            </div>
            <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Total Purchase Value</span>
              <span style={{ fontSize: "28px", fontWeight: "700", color: "var(--accent-emerald)" }}>₹{totalSpendAll.toLocaleString()}</span>
            </div>
            <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Active Supply Orders</span>
              <span style={{ fontSize: "28px", fontWeight: "700", color: "var(--accent-amber)" }}>{totalActiveOrders}</span>
            </div>
            <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Primary Partner (by Value)</span>
              <span style={{ fontSize: "20px", fontWeight: "700", color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {topSupplier ? topSupplier.name : "N/A"}
              </span>
            </div>
          </div>

          {/* Search bar */}
          <div className="glass-card" style={{ padding: "16px" }}>
            <input
              type="text"
              placeholder="🔍 Search suppliers by corporate name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ background: "var(--bg-primary)" }}
            />
          </div>

          {/* Cards Grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "20px"
          }}>
            {filteredSuppliers.length === 0 ? (
              <div className="glass-card" style={{ gridColumn: "1/-1", textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                No corporate suppliers found. Add suppliers to generate profiles.
              </div>
            ) : (
              filteredSuppliers.map((sup) => (
                <div key={sup._id} className="glass-card animate-scale-in" style={{ display: "flex", flexDirection: "column", gap: "16px", border: "1px solid var(--border-light)", position: "relative" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                    <div>
                      <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "4px", paddingRight: "40px" }}>{sup.name}</h3>
                      <span className="badge badge-emerald" style={{ fontSize: "11px" }}>★ {sup.rating?.toFixed(1)} Partner</span>
                    </div>
                    <div style={{
                      width: "42px",
                      height: "42px",
                      borderRadius: "10px",
                      background: "linear-gradient(135deg, var(--accent-blue), var(--accent-purple))",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: "700",
                      fontSize: "18px",
                      flexShrink: 0
                    }}>
                      {sup.name.charAt(0).toUpperCase()}
                    </div>
                  </div>

                  <hr style={{ border: "none", borderTop: "1px solid var(--border-light)", margin: 0 }} />

                  {/* Supplier operational details */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "13px" }}>
                    <div>
                      <span style={{ color: "var(--text-muted)", display: "block" }}>Products Cataloged</span>
                      <strong style={{ fontSize: "16px", color: "var(--text-primary)" }}>{sup.productsCount} items</strong>
                    </div>
                    <div>
                      <span style={{ color: "var(--text-muted)", display: "block" }}>Active Orders</span>
                      <strong style={{ fontSize: "16px", color: "var(--accent-amber)" }}>{sup.activeOrdersCount} cycles</strong>
                    </div>
                    <div style={{ gridColumn: "1/-1" }}>
                      <span style={{ color: "var(--text-muted)", display: "block" }}>Total Procurement Value</span>
                      <strong style={{ fontSize: "16px", color: "var(--accent-emerald)" }}>₹{sup.totalSpend?.toLocaleString()}</strong>
                    </div>
                  </div>

                  <hr style={{ border: "none", borderTop: "1px solid var(--border-light)", margin: 0 }} />

                  {/* Contact profile */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px", color: "var(--text-secondary)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span>✉️</span>
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{sup.email}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span>📞</span>
                      <span>{sup.phone}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span>📍</span>
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={sup.address}>{sup.address}</span>
                    </div>
                  </div>

                  {isAuthorized && (
                    <>
                      <hr style={{ border: "none", borderTop: "1px solid var(--border-light)", margin: 0 }} />
                      <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                        <button className="btn-outline" onClick={() => handleEditClick(sup)} style={{ padding: "6px 12px", fontSize: "12px" }}>
                          ✏️ Edit
                        </button>
                        <button className="btn-danger" onClick={() => handleDeleteClick(sup._id, sup.name)} style={{ padding: "6px 12px", fontSize: "12px" }}>
                          🗑️ Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* Add Supplier Modal */}
      {isAddModalOpen && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(15, 23, 42, 0.6)",
          backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000
        }}>
          <form 
            onSubmit={handleAddSubmit}
            className="glass-card animate-scale-in" 
            style={{ width: "450px", padding: "30px", background: "var(--bg-secondary)", border: "1px solid var(--border-color)", borderRadius: "16px", display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <h3 style={{ fontSize: "20px", fontWeight: "700", margin: 0 }}>Add New Supplier</h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)" }}>Supplier Name</label>
              <input
                type="text"
                placeholder="e.g. Apex Industrial Solutions"
                value={addForm.name}
                onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                required
              />
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)" }}>Email Address</label>
              <input
                type="email"
                placeholder="e.g. support@apex.com"
                value={addForm.email}
                onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                required
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)" }}>Phone Number</label>
              <input
                type="text"
                placeholder="e.g. +91 98765 43210"
                value={addForm.phone}
                onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                required
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)" }}>Office Address</label>
              <input
                type="text"
                placeholder="e.g. 102 Sector-A, Gurugram, Haryana"
                value={addForm.address}
                onChange={(e) => setAddForm({ ...addForm, address: e.target.value })}
                required
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)" }}>Rating (1.0 to 5.0)</label>
              <input
                type="number"
                min="1.0"
                max="5.0"
                step="0.1"
                value={addForm.rating}
                onChange={(e) => setAddForm({ ...addForm, rating: parseFloat(e.target.value) || 5.0 })}
                required
              />
            </div>
            
            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "8px" }}>
              <button type="button" className="btn-outline" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Add Supplier
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Supplier Modal */}
      {editingSupplier && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(15, 23, 42, 0.6)",
          backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000
        }}>
          <form 
            onSubmit={handleEditSubmit}
            className="glass-card animate-scale-in" 
            style={{ width: "450px", padding: "30px", background: "var(--bg-secondary)", border: "1px solid var(--border-color)", borderRadius: "16px", display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <h3 style={{ fontSize: "20px", fontWeight: "700", margin: 0 }}>Edit Supplier Profile</h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)" }}>Supplier Name</label>
              <input
                type="text"
                placeholder="e.g. Apex Industrial Solutions"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                required
              />
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)" }}>Email Address</label>
              <input
                type="email"
                placeholder="e.g. support@apex.com"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                required
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)" }}>Phone Number</label>
              <input
                type="text"
                placeholder="e.g. +91 98765 43210"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                required
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)" }}>Office Address</label>
              <input
                type="text"
                placeholder="e.g. 102 Sector-A, Gurugram, Haryana"
                value={editForm.address}
                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                required
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)" }}>Rating (1.0 to 5.0)</label>
              <input
                type="number"
                min="1.0"
                max="5.0"
                step="0.1"
                value={editForm.rating}
                onChange={(e) => setEditForm({ ...editForm, rating: parseFloat(e.target.value) || 5.0 })}
                required
              />
            </div>
            
            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "8px" }}>
              <button type="button" className="btn-outline" onClick={() => setEditingSupplier(null)}>
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default Suppliers;
