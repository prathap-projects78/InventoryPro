import { useEffect, useState } from "react";
import { getProducts } from "../services/productService";
import { getOrders } from "../services/orderService";

function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [products, orders] = await Promise.all([
        getProducts(),
        getOrders()
      ]);

      // Map to compile supplier metrics
      const supplierMap = {};

      // Parse products
      products.forEach((prod) => {
        if (prod.supplier) {
          const name = prod.supplier.trim();
          if (!supplierMap[name]) {
            supplierMap[name] = {
              name,
              productsCount: 0,
              activeOrdersCount: 0,
              totalSpend: 0,
              deliveredOrdersCount: 0
            };
          }
          supplierMap[name].productsCount += 1;
        }
      });

      // Parse orders
      orders.forEach((order) => {
        if (order.supplier) {
          const name = order.supplier.trim();
          if (!supplierMap[name]) {
            supplierMap[name] = {
              name,
              productsCount: 0,
              activeOrdersCount: 0,
              totalSpend: 0,
              deliveredOrdersCount: 0
            };
          }

          if (order.status === "Pending" || order.status === "Approved") {
            supplierMap[name].activeOrdersCount += 1;
          } else if (order.status === "Delivered") {
            supplierMap[name].deliveredOrdersCount += 1;
          }

          const price = order.product?.price || 0;
          supplierMap[name].totalSpend += order.quantity * price;
        }
      });

      const compiledSuppliers = Object.values(supplierMap).map((sup, index) => {
        // Generate consistent mock contact info based on name
        const cleanName = sup.name.toLowerCase().replace(/[^a-z0-9]/g, "");
        return {
          id: index,
          ...sup,
          email: `contact@${cleanName || "supplier"}.com`,
          phone: `+91 98765 ${String(10000 + index).substring(1)}`,
          address: `${100 + index} Industrial Area, Phase-II, New Delhi`,
          rating: 4.0 + (index % 10) * 0.1
        };
      });

      setSuppliers(compiledSuppliers);
    } catch (err) {
      setError("Failed to load suppliers data. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
        <button className="btn-outline" onClick={fetchData} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          🔄 Refresh Directory
        </button>
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
                No corporate suppliers found. Add suppliers to your products or place a purchase request to generate logs.
              </div>
            ) : (
              filteredSuppliers.map((sup) => (
                <div key={sup.id} className="glass-card animate-scale-in" style={{ display: "flex", flexDirection: "column", gap: "16px", border: "1px solid var(--border-light)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                    <div>
                      <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "4px" }}>{sup.name}</h3>
                      <span className="badge badge-emerald" style={{ fontSize: "11px" }}>★ {sup.rating.toFixed(1)} Partner</span>
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
                      fontSize: "18px"
                    }}>
                      {sup.name.charAt(0).toUpperCase()}
                    </div>
                  </div>

                  <hr style={{ border: "none", borderTop: "1px solid var(--border-light)" }} />

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
                      <strong style={{ fontSize: "16px", color: "var(--accent-emerald)" }}>₹{sup.totalSpend.toLocaleString()}</strong>
                    </div>
                  </div>

                  <hr style={{ border: "none", borderTop: "1px solid var(--border-light)" }} />

                  {/* Contact profile */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px", color: "var(--text-secondary)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span>✉️</span>
                      <span>{sup.email}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span>📞</span>
                      <span>{sup.phone}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span>📍</span>
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{sup.address}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default Suppliers;
