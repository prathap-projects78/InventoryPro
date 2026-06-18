import { useEffect, useState } from "react";
import { getOrders, approveOrder, deliverOrder } from "../services/orderService";
import OrderForm from "../components/OrderForm";
import "./Order.css";

function Orders() {
  const [orders, setOrders] = useState([]);
  const role = localStorage.getItem("role") || "viewer";

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

  const fetchOrders = async () => {
    try {
      const data = await getOrders();
      setOrders(data);
    } catch (err) {
      console.error("Failed to load orders:", err);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOrders();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleApprove = async (id) => {
    try {
      await approveOrder(id);
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || "Approval failed");
    }
  };

  const handleDeliver = async (id) => {
    try {
      await deliverOrder(id);
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || "Delivery failed");
    }
  };

  return (
    <div className="page-container orders-container animate-fade-in" style={{ position: "relative" }}>
      {/* Background aurora glow blobs */}
      <div className="page-ambient-blobs">
        <div className="page-ambient-blob p-blob-1"></div>
        <div className="page-ambient-blob p-blob-2"></div>
      </div>

      <div className="flex-header">
        <div>
          <h1 style={{ fontSize: "28px" }}>Purchase Orders</h1>
          <p style={{ margin: 0 }}>Create procurement requests, approve purchase cycles, and track inventory delivery status.</p>
        </div>
      </div>

      {(role === "admin" || role === "procurement") && (
        <div className="glass-card order-form-card">
          <h3 style={{ marginBottom: "16px", fontSize: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--accent-emerald)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="8" cy="21" r="1" />
              <circle cx="19" cy="21" r="1" />
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
            </svg>
            New Purchase Order
          </h3>
          <OrderForm onOrderAdded={fetchOrders} />
        </div>
      )}

      <div className="glass-card order-table-card">
        <h3 style={{ marginBottom: "16px", fontSize: "18px" }}>Procurement Activity</h3>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Quantity Requested</th>
                <th>Supplier</th>
                <th>Timeline</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textCenter: "center", color: "var(--text-muted)", padding: "24px", textAlign: "center" }}>
                    No purchase orders placed yet.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id}>
                    <td style={{ fontWeight: "600" }}>{order.product?.name || "Deleted Product"}</td>
                    <td>{order.quantity} units</td>
                    <td>{order.supplier}</td>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "12px" }}>
                        <div>
                          <span style={{ color: "var(--text-muted)", fontWeight: "500" }}>Created: </span>
                          <span style={{ color: "var(--text-secondary)" }}>{formatDateTime(order.createdAt)}</span>
                        </div>
                        {order.status === "Delivered" && (
                          <div>
                            <span style={{ color: "var(--accent-emerald)", fontWeight: "500" }}>Delivered: </span>
                            <span style={{ color: "var(--text-secondary)" }}>{formatDateTime(order.deliveredAt || order.updatedAt)}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      {order.status === "Pending" && (
                        <span className="badge badge-amber">Pending</span>
                      )}
                      {order.status === "Approved" && (
                        <span className="badge badge-blue">Approved</span>
                      )}
                      {order.status === "Delivered" && (
                        <span className="badge badge-emerald">Delivered</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "8px" }}>
                        {order.status === "Pending" && role === "admin" && (
                          <button
                            className="btn-primary"
                            onClick={() => handleApprove(order._id)}
                            style={{ padding: "6px 12px", fontSize: "13px" }}
                          >
                            Approve Order
                          </button>
                        )}
                        {order.status === "Approved" && role === "admin" && (
                          <button
                            className="btn-primary"
                            onClick={() => handleDeliver(order._id)}
                            style={{ padding: "6px 12px", fontSize: "13px", background: "linear-gradient(135deg, var(--accent-emerald), #059669)" }}
                          >
                            Mark Delivered
                          </button>
                        )}
                        {order.status === "Delivered" && (
                          <span style={{ color: "var(--text-muted)", fontSize: "13px", fontWeight: "500", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                            ✅ Completed
                          </span>
                        )}
                        {order.status !== "Delivered" && role !== "admin" && (
                          <span style={{ color: "var(--text-muted)", fontSize: "13px", fontStyle: "italic" }}>
                            Waiting Admin Action
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Orders;