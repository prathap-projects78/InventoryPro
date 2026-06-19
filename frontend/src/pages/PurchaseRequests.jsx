import { useEffect, useState } from "react";
import { getOrders, createOrder } from "../services/orderService";
import { getProducts } from "../services/productService";

function PurchaseRequests() {
  const [products, setProducts] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form State
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [supplier, setSupplier] = useState("");
  const [formSubmitLoading, setFormSubmitLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [productsData, ordersData] = await Promise.all([
        getProducts(),
        getOrders()
      ]);
      setProducts(productsData);
      
      // Filter only pending requests
      const pendingRequests = ordersData.filter(o => o.status === "Pending");
      setRequests(pendingRequests);
    } catch (err) {
      setError("Failed to fetch data logs. Please refresh.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!productId || !quantity || !supplier) {
      alert("Please fill out all fields.");
      return;
    }

    try {
      setFormSubmitLoading(true);
      await createOrder({
        product: productId,
        quantity: Number(quantity),
        supplier: supplier
      });

      alert("Purchase Request Submitted Successfully to Admin Queue.");
      setProductId("");
      setQuantity("");
      setSupplier("");
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit request.");
    } finally {
      setFormSubmitLoading(false);
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
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
          <h1 style={{ fontSize: "28px" }}>Purchase Requests</h1>
          <p style={{ margin: 0 }}>Initiate new procurement cycles and monitor pending supervisor approvals.</p>
        </div>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr",
        gap: "24px"
      }}>
        {/* Submission Form */}
        <div className="glass-card">
          <h3 style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px", fontSize: "18px" }}>
            <span>➕</span> New Procurement Request
          </h3>
          
          <form onSubmit={handleSubmit} style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px",
            alignItems: "end"
          }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Choose Catalog Product</label>
              <select
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                required
                style={{ width: "100%" }}
              >
                <option value="">Select Product</option>
                {products.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} (Stock: {p.quantity} | Price: ₹{p.price})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Quantity Needed</label>
              <input
                type="number"
                min="1"
                placeholder="e.g. 50"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Supplier Name</label>
              <input
                type="text"
                placeholder="e.g. Acme Industries"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                required
              />
            </div>

            <button type="submit" disabled={formSubmitLoading} style={{ height: "46px" }}>
              {formSubmitLoading ? "Submitting..." : "Submit Request"}
            </button>
          </form>
        </div>

        {/* Requests List */}
        <div className="glass-card">
          <h3 style={{ marginBottom: "16px", fontSize: "18px" }}>Pending Admin Approvals</h3>

          {loading && <p style={{ color: "var(--text-secondary)" }}>Fetching active queues...</p>}
          {error && <p style={{ color: "var(--accent-rose)" }}>{error}</p>}

          {!loading && !error && (
            <div className="table-container" style={{ margin: 0 }}>
              <table>
                <thead>
                  <tr>
                    <th>Product Name</th>
                    <th>Requested Quantity</th>
                    <th>Supplier Vendor</th>
                    <th>Request Timestamp</th>
                    <th>Approval Status</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: "center", color: "var(--text-muted)", padding: "24px" }}>
                        No pending purchase requests found.
                      </td>
                    </tr>
                  ) : (
                    requests.map((req) => (
                      <tr key={req._id}>
                        <td style={{ fontWeight: "600" }}>{req.product?.name || "Deleted Product"}</td>
                        <td>{req.quantity} units</td>
                        <td>{req.supplier}</td>
                        <td>{formatDateTime(req.createdAt)}</td>
                        <td>
                          <span className="badge badge-amber">Awaiting Review</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PurchaseRequests;
