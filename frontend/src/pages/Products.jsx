import { useEffect, useState } from "react";
import {
  getProducts,
  deleteProduct,
  updateProduct
} from "../services/productService";
import ProductForm from "../components/ProductForm";

function Products() {
  const [products, setProducts] = useState([]);
  const role = localStorage.getItem("role") || "viewer";
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [barcodeProduct, setBarcodeProduct] = useState(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      setError(err.message || "Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await deleteProduct(id);
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete product");
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
  };

  const handleUpdate = async () => {
    const newPrice = prompt("Enter New Price (₹)", editingProduct.price);
    if (newPrice === null || newPrice === "") return;

    try {
      await updateProduct(editingProduct._id, {
        ...editingProduct,
        price: Number(newPrice)
      });
      fetchProducts();
      setEditingProduct(null);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update product price");
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-container animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px", position: "relative" }}>
      {/* Background aurora glow blobs */}
      <div className="page-ambient-blobs">
        <div className="page-ambient-blob p-blob-1"></div>
        <div className="page-ambient-blob p-blob-2"></div>
      </div>

      <div className="flex-header">
        <div>
          <h1 style={{ fontSize: "28px" }}>Products Catalog</h1>
          <p style={{ margin: 0 }}>Manage enterprise items, categories, and inventory stock levels.</p>
        </div>
      </div>

      {(role === "admin" || role === "manager") && (
        <div className="glass-card" style={{ padding: "20px" }}>
          <h3 style={{ marginBottom: "16px", fontSize: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--accent-blue)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
              <path d="m3.3 7 8.7 5 8.7-5" />
              <path d="M12 22V12" />
            </svg>
            Add New Product
          </h3>
          <ProductForm onSuccess={fetchProducts} onProductAdded={fetchProducts} />
        </div>
      )}

      <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <h3 style={{ fontSize: "18px" }}>All Products</h3>
          <input
            type="text"
            placeholder="Search products by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: "300px" }}
          />
        </div>

        {loading && <p style={{ color: "var(--text-secondary)" }}>Loading catalog...</p>}
        {error && <p style={{ color: "var(--accent-rose)" }}>{error}</p>}

        {!loading && !error && (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>SKU & Barcode</th>
                  <th>Category</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textCenter: "center", color: "var(--text-muted)", padding: "24px", textAlign: "center" }}>
                      No products found.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => {
                    const sku = `PROD-${product._id ? product._id.slice(-6).toUpperCase() : "SKU"}`;
                    return (
                      <tr key={product._id}>
                        <td style={{ fontWeight: "600" }}>{product.name}</td>
                        <td>
                          <div 
                            onClick={() => setBarcodeProduct(product)}
                            title="Click to view full barcode label"
                            style={{ 
                              display: "inline-flex", 
                              flexDirection: "column", 
                              gap: "4px", 
                              cursor: "pointer", 
                              background: "rgba(15, 23, 42, 0.02)", 
                              padding: "6px 10px", 
                              borderRadius: "6px",
                              border: "1px solid var(--border-light)"
                            }}
                          >
                            <span style={{ fontSize: "11px", fontWeight: "700", fontFamily: "monospace", color: "var(--text-secondary)" }}>{sku}</span>
                            <svg style={{ height: "16px", width: "70px" }}>
                              <rect x="0" y="0" width="2" height="16" fill="black"/>
                              <rect x="3" y="0" width="1" height="16" fill="black"/>
                              <rect x="6" y="0" width="3" height="16" fill="black"/>
                              <rect x="11" y="0" width="1" height="16" fill="black"/>
                              <rect x="13" y="0" width="2" height="16" fill="black"/>
                              <rect x="17" y="0" width="4" height="16" fill="black"/>
                              <rect x="22" y="0" width="1" height="16" fill="black"/>
                              <rect x="24" y="0" width="2" height="16" fill="black"/>
                              <rect x="28" y="0" width="3" height="16" fill="black"/>
                              <rect x="32" y="0" width="1" height="16" fill="black"/>
                              <rect x="34" y="0" width="2" height="16" fill="black"/>
                              <rect x="38" y="0" width="4" height="16" fill="black"/>
                              <rect x="43" y="0" width="1" height="16" fill="black"/>
                              <rect x="45" y="0" width="2" height="16" fill="black"/>
                              <rect x="49" y="0" width="3" height="16" fill="black"/>
                              <rect x="53" y="0" width="1" height="16" fill="black"/>
                              <rect x="55" y="0" width="2" height="16" fill="black"/>
                              <rect x="59" y="0" width="4" height="16" fill="black"/>
                              <rect x="64" y="0" width="1" height="16" fill="black"/>
                            </svg>
                          </div>
                        </td>
                        <td>
                          <span className="badge badge-blue">
                            {product.category?.name || "Uncategorized"}
                          </span>
                        </td>
                        <td>
                          <span className={product.quantity <= 5 ? "badge badge-amber" : "badge"}>
                            {product.quantity} units
                          </span>
                        </td>
                        <td>₹{product.price.toLocaleString()}</td>
                        <td>
                          <div style={{ display: "flex", gap: "8px" }}>
                            {(role === "admin" || role === "manager") && (
                              <button
                                className="btn-outline"
                                onClick={() => handleEdit(product)}
                                style={{ padding: "6px 12px", fontSize: "13px" }}
                              >
                                Edit Price
                              </button>
                            )}
                            {role === "admin" && (
                              <button
                                className="btn-danger"
                                onClick={() => handleDelete(product._id)}
                                style={{ padding: "6px 12px", fontSize: "13px" }}
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editingProduct && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(15, 23, 42, 0.6)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div className="glass-card" style={{ width: "400px", padding: "30px", background: "var(--bg-secondary)" }}>
            <h3 style={{ marginBottom: "16px" }}>Modify Price</h3>
            <p style={{ marginBottom: "20px" }}>Update value of <strong>{editingProduct.name}</strong></p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button className="btn-outline" onClick={() => setEditingProduct(null)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleUpdate}>
                Update Price
              </button>
            </div>
          </div>
        </div>
      )}

      {barcodeProduct && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(15, 23, 42, 0.65)",
          backdropFilter: "blur(6px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div className="glass-card" style={{ width: "360px", padding: "24px", background: "var(--bg-secondary)", border: "1px solid var(--border-color)", borderRadius: "16px", boxShadow: "0 10px 40px rgba(0,0,0,0.15)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700" }}>SKU Barcode Ticket</h3>
              <button onClick={() => setBarcodeProduct(null)} style={{ background: "transparent", border: "none", fontSize: "20px", cursor: "pointer", color: "var(--text-muted)", padding: "4px" }}>×</button>
            </div>
            
            <div className="print-ticket-white" style={{ display: "flex", flexDirection: "column", gap: "16px", background: "var(--bg-tertiary)", padding: "20px", borderRadius: "10px", border: "1.5px dashed var(--border-color)", alignItems: "center", textAlign: "center" }}>
              <span style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "var(--text-muted)" }}>Inventory SKU Tag</span>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <h4 style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: "var(--text-primary)" }}>{barcodeProduct.name}</h4>
                <p style={{ margin: 0, fontSize: "12px", color: "var(--text-secondary)" }}>
                  Category: {barcodeProduct.category?.name || "Uncategorized"} | Price: ₹{barcodeProduct.price.toLocaleString()}
                </p>
              </div>

              {/* Printable Barcode */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "center", margin: "10px 0" }}>
                <svg style={{ height: "45px", width: "160px" }}>
                  <rect x="0" y="0" width="3" height="45" fill="var(--text-primary)"/>
                  <rect x="5" y="0" width="1" height="45" fill="var(--text-primary)"/>
                  <rect x="8" y="0" width="4" height="45" fill="var(--text-primary)"/>
                  <rect x="14" y="0" width="2" height="45" fill="var(--text-primary)"/>
                  <rect x="18" y="0" width="1" height="45" fill="var(--text-primary)"/>
                  <rect x="21" y="0" width="3" height="45" fill="var(--text-primary)"/>
                  <rect x="26" y="0" width="5" height="45" fill="var(--text-primary)"/>
                  <rect x="33" y="0" width="1" height="45" fill="var(--text-primary)"/>
                  <rect x="36" y="0" width="2" height="45" fill="var(--text-primary)"/>
                  <rect x="40" y="0" width="4" height="45" fill="var(--text-primary)"/>
                  <rect x="46" y="0" width="2" height="45" fill="var(--text-primary)"/>
                  <rect x="50" y="0" width="1" height="45" fill="var(--text-primary)"/>
                  <rect x="53" y="0" width="3" height="45" fill="var(--text-primary)"/>
                  <rect x="58" y="0" width="5" height="45" fill="var(--text-primary)"/>
                  <rect x="65" y="0" width="1" height="45" fill="var(--text-primary)"/>
                  <rect x="68" y="0" width="2" height="45" fill="var(--text-primary)"/>
                  <rect x="72" y="0" width="4" height="45" fill="var(--text-primary)"/>
                  <rect x="78" y="0" width="2" height="45" fill="var(--text-primary)"/>
                  <rect x="82" y="0" width="1" height="45" fill="var(--text-primary)"/>
                  <rect x="85" y="0" width="3" height="45" fill="var(--text-primary)"/>
                  <rect x="90" y="0" width="5" height="45" fill="var(--text-primary)"/>
                  <rect x="97" y="0" width="1" height="45" fill="var(--text-primary)"/>
                  <rect x="100" y="0" width="2" height="45" fill="var(--text-primary)"/>
                  <rect x="104" y="0" width="4" height="45" fill="var(--text-primary)"/>
                  <rect x="110" y="0" width="2" height="45" fill="var(--text-primary)"/>
                  <rect x="114" y="0" width="1" height="45" fill="var(--text-primary)"/>
                  <rect x="117" y="0" width="3" height="45" fill="var(--text-primary)"/>
                  <rect x="122" y="0" width="5" height="45" fill="var(--text-primary)"/>
                  <rect x="129" y="0" width="1" height="45" fill="var(--text-primary)"/>
                  <rect x="132" y="0" width="2" height="45" fill="var(--text-primary)"/>
                  <rect x="136" y="0" width="4" height="45" fill="var(--text-primary)"/>
                  <rect x="142" y="0" width="2" height="45" fill="var(--text-primary)"/>
                  <rect x="146" y="0" width="1" height="45" fill="var(--text-primary)"/>
                  <rect x="149" y="0" width="3" height="45" fill="var(--text-primary)"/>
                  <rect x="154" y="0" width="4" height="45" fill="var(--text-primary)"/>
                </svg>
                <span style={{ fontSize: "12px", fontFamily: "monospace", letterSpacing: "2px", fontWeight: "700", color: "var(--text-primary)" }}>
                  PROD-{barcodeProduct._id ? barcodeProduct._id.slice(-6).toUpperCase() : "SKU"}
                </span>
              </div>
            </div>
            
            <div style={{ display: "flex", gap: "10px", justifyContent: "stretch", marginTop: "20px" }}>
              <button className="btn-outline" onClick={() => setBarcodeProduct(null)} style={{ flex: 1 }}>
                Close
              </button>
              <button 
                className="btn-primary" 
                onClick={() => {
                  window.print();
                }} 
                style={{ flex: 1 }}
              >
                Print Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Products;