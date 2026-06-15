import { useEffect, useState } from "react";
import {
  getDashboardStats,
  getInventoryValue,
  getLowStockProducts,
} from "../services/dashboardService";
import { getUserProfile } from "../services/userService";
import DashboardChart from "../components/DashboardChart";
import "./Dashboard.css";

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [inventoryValue, setInventoryValue] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Greeting & Clock states
  const [userName, setUserName] = useState(localStorage.getItem("name") || "User");
  const userRole = localStorage.getItem("role") || "viewer";
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch core dashboard metrics
        const data = await getDashboardStats();
        setStats(data);

        const valueData = await getInventoryValue();
        setInventoryValue(valueData.totalInventoryValue);

        const lowStock = await getLowStockProducts();
        setLowStockCount(lowStock.length);

        // Fetch current user details for greeting
        try {
          const profile = await getUserProfile();
          if (profile && profile.name) {
            setUserName(profile.name);
            localStorage.setItem("name", profile.name);
          }
        } catch (profileErr) {
          console.warn("Unable to fetch user profile, using localStorage fallback.", profileErr);
        }
      } catch (err) {
        setError(err.message || "Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const showAddProduct = ["admin", "manager"].includes(userRole);
  const showCreateOrder = ["admin", "manager", "procurement"].includes(userRole);

  const getRoleDisplayName = (role) => {
    switch (role) {
      case "admin": return "Administrator";
      case "manager": return "Inventory Manager";
      case "procurement": return "Procurement Officer";
      default: return "Viewer / Read-Only";
    }
  };

  const stockAvailability = stats && stats.totalProducts
    ? Math.round(((stats.totalProducts - stats.lowStockProducts) / stats.totalProducts) * 100)
    : 100;

  const orderCompletion = stats && stats.totalPurchaseOrders
    ? Math.round(((stats.totalPurchaseOrders - stats.pendingOrders) / stats.totalPurchaseOrders) * 100)
    : 100;

  return (
    <div className="dashboard animate-fade-in">
      {/* Background aurora glow blobs */}
      <div className="page-ambient-blobs">
        <div className="page-ambient-blob p-blob-1"></div>
        <div className="page-ambient-blob p-blob-2"></div>
      </div>

      {/* Welcome Banner Card */}
      <div className="dashboard-welcome-banner">
        <div className="welcome-info">
          <h2>Welcome back, <span className="welcome-name">{userName}</span>! 👋</h2>
          <div className="welcome-status">
            <span className="pulsing-green-dot"></span>
            <span className="welcome-role">{getRoleDisplayName(userRole)}</span>
          </div>
        </div>
        <div className="live-clock-card">
          <svg className="clock-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          <div className="clock-text">
            <span className="clock-time">{formatTime(currentTime)}</span>
            <span className="clock-date">{formatDate(currentTime)}</span>
          </div>
        </div>
      </div>

      {loading && <p className="loading-text">Synchronizing warehouse metrics...</p>}
      {error && <p className="error-text">{error}</p>}

      {stats && (
        <>
          {/* Main KPI Stats Cards */}
          <div className="cards">
            <div className="card stat-card-1">
              <div className="card-header-row">
                <div className="icon-badge bg-light-blue">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                    <path d="m3.3 7 8.7 5 8.7-5" />
                    <path d="M12 22V12" />
                  </svg>
                </div>
                <h3>Total Products</h3>
              </div>
              <p className="kpi-value">{stats.totalProducts}</p>
            </div>

            <div className="card stat-card-2">
              <div className="card-header-row">
                <div className="icon-badge bg-light-purple">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-purple)" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <h3>Categories</h3>
              </div>
              <p className="kpi-value">{stats.totalCategories}</p>
            </div>

            <div className="card stat-card-3">
              <div className="card-header-row">
                <div className="icon-badge bg-light-emerald">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-emerald)" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="8" cy="21" r="1" />
                    <circle cx="19" cy="21" r="1" />
                    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                  </svg>
                </div>
                <h3>Total Orders</h3>
              </div>
              <p className="kpi-value">{stats.totalPurchaseOrders}</p>
            </div>

            <div className="card stat-card-4">
              <div className="card-header-row">
                <div className="icon-badge bg-light-amber">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-amber)" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <h3>Pending Orders</h3>
              </div>
              <p className="kpi-value">{stats.pendingOrders}</p>
            </div>

            <div className="card stat-card-5">
              <div className="card-header-row">
                <div className="icon-badge bg-light-emerald">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-emerald)" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 3h12M6 8h12M6 13h4.5a4.5 4.5 0 0 0 0-9H6m4.5 9L18 21" />
                  </svg>
                </div>
                <h3>Inventory Value</h3>
              </div>
              <p className="kpi-value">₹{inventoryValue.toLocaleString()}</p>
            </div>

            <div className={lowStockCount > 0 ? "card warning alert-pulse" : "card"}>
              <div className="card-header-row">
                <div className="icon-badge bg-light-rose">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-rose)" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </div>
                <h3>Low Stock Alert</h3>
              </div>
              <p className="kpi-value">{lowStockCount}</p>
            </div>
          </div>

          {/* System status & progress gauges */}
          <div className="dashboard-gauges-container">
            <div className="gauge-card animate-slide-up-1">
              <div className="gauge-info">
                <span className="gauge-label">Stock Availability Rate</span>
                <span className="gauge-value font-blue">{stockAvailability}%</span>
              </div>
              <div className="gauge-bar-bg">
                <div className="gauge-bar-fill progress-blue" style={{ width: stats ? `${stockAvailability}%` : "0%" }}></div>
              </div>
              <p className="gauge-desc">{stats.totalProducts - stats.lowStockProducts} of {stats.totalProducts} items in healthy supply</p>
            </div>

            <div className="gauge-card animate-slide-up-2">
              <div className="gauge-info">
                <span className="gauge-label">Order Completion Rate</span>
                <span className="gauge-value font-purple">{orderCompletion}%</span>
              </div>
              <div className="gauge-bar-bg">
                <div className="gauge-bar-fill progress-purple" style={{ width: stats ? `${orderCompletion}%` : "0%" }}></div>
              </div>
              <p className="gauge-desc">{stats.totalPurchaseOrders - stats.pendingOrders} of {stats.totalPurchaseOrders} purchase orders completed</p>
            </div>

            <div className="gauge-card animate-slide-up-3">
              <div className="gauge-info">
                <span className="gauge-label">Supplier On-Time Rate</span>
                <div className="status-indicator">
                  <span className="pulsing-green-dot"></span>
                  <span className="gauge-value font-emerald">94%</span>
                </div>
              </div>
              <div className="gauge-bar-bg">
                <div className="gauge-bar-fill progress-emerald" style={{ width: stats ? "94%" : "0%" }}></div>
              </div>
              <p className="gauge-desc">Average lead time: 3.2 days | 8 active vendors</p>
            </div>
          </div>

          {/* Secondary Layout Columns */}
          <div className="dashboard-grid-tools">
            {/* Quick Actions Panel */}
            <div className="dashboard-tools-card quick-actions-panel animate-slide-up-1">
              <h3>Quick Operations</h3>
              <div className="quick-actions-grid">
                {showAddProduct && (
                  <a href="/products?add=true" className="action-btn">
                    <div className="action-icon bg-light-blue">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                    </div>
                    <span>Add Product</span>
                  </a>
                )}
                {showCreateOrder && (
                  <a href="/orders?create=true" className="action-btn">
                    <div className="action-icon bg-light-emerald">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-emerald)" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
                    </div>
                    <span>New Order</span>
                  </a>
                )}
                <a href="/reports" className="action-btn">
                  <div className="action-icon bg-light-purple">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-purple)" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                  </div>
                  <span>View Reports</span>
                </a>
                {userRole === "admin" && (
                  <a href="/users" className="action-btn">
                    <div className="action-icon bg-light-rose">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-rose)" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    </div>
                    <span>Manage Users</span>
                  </a>
                )}
              </div>
            </div>

            {/* Recent Activities Feed */}
            <div className="dashboard-tools-card recent-activities-panel animate-slide-up-2">
              <h3>Recent Activities</h3>
              <div className="activities-list">
                <div className="activity-item">
                  <div className="activity-indicator bg-accent-blue"></div>
                  <div className="activity-detail">
                    <p className="activity-title">Purchase Order PO-102 Approved</p>
                    <p className="activity-meta">Updated by Manager | 12 minutes ago</p>
                  </div>
                </div>
                <div className="activity-item">
                  <div className="activity-indicator bg-accent-rose"></div>
                  <div className="activity-detail">
                    <p className="activity-title">Low Stock Alert Triggered</p>
                    <p className="activity-meta">Product 'Steel Bolts' dropped below safety limit | 42 minutes ago</p>
                  </div>
                </div>
                <div className="activity-item">
                  <div className="activity-indicator bg-accent-emerald"></div>
                  <div className="activity-detail">
                    <p className="activity-title">Category 'Industrial Lubricants' Added</p>
                    <p className="activity-meta">Created by Admin | 2 hours ago</p>
                  </div>
                </div>
                <div className="activity-item">
                  <div className="activity-indicator bg-accent-purple"></div>
                  <div className="activity-detail">
                    <p className="activity-title">Automatic Valuation Completed</p>
                    <p className="activity-meta">System sync calculated inventory value | 4 hours ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chart Section */}
          <div className="chart-container animate-slide-up-3">
            <h3>Activity Analytics</h3>
            <DashboardChart stats={stats} />
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;