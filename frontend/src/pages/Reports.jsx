import { useState, useEffect } from "react";
import { getReportsData } from "../services/reportsService";
import { createOrder } from "../services/orderService";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

function Reports() {
  const [reportsData, setReportsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Custom tools state
  const [activeTab, setActiveTab] = useState("dashboard"); // "dashboard", "replenish", "simulator"
  const [allocatedBudget, setAllocatedBudget] = useState(250000);
  const [demandIncrease, setDemandIncrease] = useState(50); // percentage slider, e.g. 50%
  const [replenishTargets, setReplenishTargets] = useState({}); // mapping product.id -> target quantity
  const [selectedReplenish, setSelectedReplenish] = useState({}); // mapping product.id -> boolean
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);

  const fetchReportsData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const result = await getReportsData();
      setReportsData(result);
      
      // Initialize default replenish targets and selected states
      if (result && result.lowStockAlerts) {
        const targets = {};
        const selected = {};
        result.lowStockAlerts.forEach((p) => {
          targets[p.id] = 50; // default safety target
          selected[p.id] = true; // select by default
        });
        setReplenishTargets((prev) => ({ ...targets, ...prev }));
        setSelectedReplenish((prev) => ({ ...selected, ...prev }));
      }
      
      setLoading(false);
    } catch (err) {
      console.error("Failed to load reports data", err);
      setError("Could not retrieve reports data. Please ensure you are logged in.");
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchReportsData();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const downloadCSV = (filename, csvContent) => {
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownload = (reportType) => {
    if (!reportsData) return;

    let headers;
    let rows;
    let filename;

    switch (reportType) {
      case "valuation":
        filename = `Inventory_Valuation_Report_${new Date().toISOString().slice(0, 10)}.csv`;
        headers = "Product Name,Category,Quantity,Price,Total Valuation,Supplier\n";
        rows = reportsData.products.map(
          (p) =>
            `"${p.name}","${p.categoryName}",${p.quantity},${p.price},${
              p.quantity * p.price
            },"${p.supplier}"`
        );
        break;

      case "procurement":
        filename = `Procurement_Cost_Analysis_${new Date().toISOString().slice(0, 10)}.csv`;
        headers = "Order ID,Product Name,Supplier,Quantity,Status,Order Date\n";
        rows = reportsData.purchaseOrders.map(
          (o) =>
            `"${o.id}","${o.productName}","${o.supplier}",${o.quantity},"${o.status}","${new Date(
              o.date
            ).toLocaleDateString()}"`
        );
        break;

      case "supplier":
        filename = `Supplier_Performance_Report_${new Date().toISOString().slice(0, 10)}.csv`;
        headers = "Supplier,Total Orders,Pending,Approved,Delivered,Cancelled,Total Units Ordered\n";
        rows = reportsData.supplierPerformance.map(
          (s) =>
            `"${s.name}",${s.totalOrders},${s.pending},${s.approved},${s.delivered},${s.cancelled},${s.totalQuantityOrdered}`
        );
        break;

      case "lowstock":
        filename = `Low_Stock_Alerts_${new Date().toISOString().slice(0, 10)}.csv`;
        headers = "Product Name,Category,Current Quantity,Price,Total Valuation\n";
        rows = reportsData.lowStockAlerts.map(
          (p) =>
            `"${p.name}","${p.categoryName}",${p.quantity},${p.price},${p.quantity * p.price}`
        );
        break;

      default:
        return;
    }

    const csvContent = headers + rows.join("\n");
    downloadCSV(filename, csvContent);
  };

  const handleBulkReorder = async () => {
    const selectedIds = Object.keys(selectedReplenish).filter((id) => selectedReplenish[id]);
    if (selectedIds.length === 0) {
      setActionMessage({ type: "error", text: "Please select at least one item to reorder." });
      return;
    }

    const role = localStorage.getItem("role") || "viewer";
    if (role !== "admin" && role !== "manager") {
      setActionMessage({ type: "error", text: "Access Denied: Only Admin or Manager roles can create purchase orders." });
      return;
    }

    setActionLoading(true);
    setActionMessage(null);

    let successCount = 0;
    let failCount = 0;

    for (const id of selectedIds) {
      const product = reportsData.lowStockAlerts.find((p) => p.id === id);
      if (!product) continue;

      const target = replenishTargets[id] || 50;
      const current = product.quantity || 0;
      const orderQty = target - current;

      if (orderQty <= 0) continue;

      try {
        await createOrder({
          product: product.id,
          quantity: orderQty,
          supplier: product.supplier || "Unknown Supplier"
        });
        successCount++;
      } catch (err) {
        console.error("Failed to reorder", product.name, err);
        failCount++;
      }
    }

    setActionLoading(false);
    if (successCount > 0) {
      setActionMessage({
        type: "success",
        text: `Successfully created ${successCount} purchase order(s).${failCount > 0 ? " Failed to create " + failCount + " order(s)." : ""}`
      });
      // Refresh database records
      await fetchReportsData(true);
    } else {
      setActionMessage({
        type: "error",
        text: "Failed to create purchase orders. Please ensure server is running and you have proper permissions."
      });
    }
  };

  const downloadSimulationCSV = () => {
    if (!reportsData || !reportsData.products) return;

    let csvContent = "Product Name,Category,Current Quantity,Simulated Restock Quantity,Unit Price,Total Cost,Supplier\n";
    let totalSimulatedCost = 0;

    reportsData.products.forEach((p) => {
      const currentQty = p.quantity || 0;
      const restockQty = Math.round(currentQty * (demandIncrease / 100));
      if (restockQty <= 0) return;

      const cost = restockQty * (p.price || 0);
      totalSimulatedCost += cost;

      csvContent += `"${p.name}","${p.categoryName}",${currentQty},${restockQty},${p.price},${cost},"${p.supplier}"\n`;
    });

    csvContent += `\n,,,,Total Budget Plan,${totalSimulatedCost},\n`;

    const filename = `Inventory_Simulation_Plan_${demandIncrease}pct_increase.csv`;
    downloadCSV(filename, csvContent);
  };

  if (loading) {
    return (
      <div className="page-container" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
        <div className="glass-card" style={{ textAlign: "center", padding: "40px" }}>
          <h2>Loading Report Analytics...</h2>
          <p>Please wait while we calculate real-time valuation metrics.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
        <div className="glass-card" style={{ borderLeft: "4px solid #ef4444", textAlign: "center", padding: "40px" }}>
          <h2 style={{ color: "#f87171" }}>Access Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // Pre-process categories with valuation > 0 for Doughnut Chart
  const categoriesWithValuation = reportsData.categoryBreakdown.filter((c) => c.totalValuation > 0);
  const categoryChartLabels = categoriesWithValuation.map((c) => c.name);
  const categoryChartData = categoriesWithValuation.map((c) => c.totalValuation);

  const isDark = document.documentElement.classList.contains("dark");
  const chartGridColor = isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(15, 23, 42, 0.04)";
  const chartLabelColor = isDark ? "#94a3b8" : "#64748b";
  const chartTooltipBg = isDark ? "#1e293b" : "#ffffff";
  const chartTooltipTitle = isDark ? "#f8fafc" : "#0f172a";
  const chartTooltipBody = isDark ? "#cbd5e1" : "#475569";
  const chartTooltipBorder = isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(15, 23, 42, 0.08)";

  // Setup Category Doughnut Chart Config
  const categoryDoughnutData = {
    labels: categoryChartLabels.length > 0 ? categoryChartLabels : ["No Valued Stock"],
    datasets: [
      {
        data: categoryChartData.length > 0 ? categoryChartData : [1],
        backgroundColor: [
          "#3b82f6", // Blue
          "#8b5cf6", // Purple
          "#10b981", // Emerald
          "#ec4899", // Pink
          "#f59e0b", // Amber
          "#06b6d4", // Cyan
          "#f43f5e", // Rose
        ],
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };

  const categoryDoughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: chartLabelColor,
          font: { family: "Inter", size: 12 },
          padding: 15,
        },
      },
      tooltip: {
        backgroundColor: chartTooltipBg,
        titleColor: chartTooltipTitle,
        bodyColor: chartTooltipBody,
        borderColor: chartTooltipBorder,
        borderWidth: 1,
        padding: 10,
        cornerRadius: 6,
        callbacks: {
          label: (context) => {
            if (categoryChartData.length === 0) return " No stock value registered";
            const val = context.raw;
            return ` Valuation: ₹${val.toLocaleString()}`;
          },
        },
      },
    },
  };

  // Setup Orders Bar Chart Config
  const orderBarData = {
    labels: ["Pending", "Approved", "Delivered", "Cancelled"],
    datasets: [
      {
        label: "Total Orders",
        data: [
          reportsData.procurement.pendingOrdersCount,
          reportsData.procurement.approvedOrdersCount,
          reportsData.procurement.deliveredOrdersCount,
          reportsData.procurement.cancelledOrdersCount,
        ],
        backgroundColor: [
          "#f59e0b", // Amber
          "#3b82f6", // Blue
          "#10b981", // Emerald
          "#ef4444", // Red
        ],
        borderRadius: 6,
        borderWidth: 0,
      },
    ],
  };

  const orderBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: chartTooltipBg,
        titleColor: chartTooltipTitle,
        bodyColor: chartTooltipBody,
        borderColor: chartTooltipBorder,
        borderWidth: 1,
        padding: 10,
        cornerRadius: 6,
      },
    },
    scales: {
      x: {
        grid: { color: chartGridColor },
        ticks: { color: chartLabelColor, font: { family: "Inter", size: 12 } },
      },
      y: {
        grid: { color: chartGridColor },
        ticks: { color: chartLabelColor, font: { family: "Inter", size: 12 } },
      },
    },
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
          <h1 style={{ fontSize: "28px" }}>Analytical Reports & Planning</h1>
          <p style={{ margin: 0, color: "var(--text-secondary)" }}>
            Review real-time financial statements, manage low stock replenishments, and simulate procurement budgets.
          </p>
        </div>
      </div>

      {/* Premium Tab Navigation */}
      <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid var(--border-color)", paddingBottom: "12px", marginBottom: "8px", flexWrap: "wrap" }}>
        <button 
          onClick={() => { setActiveTab("dashboard"); setActionMessage(null); }} 
          style={{
            padding: "10px 20px",
            background: activeTab === "dashboard" ? "linear-gradient(135deg, var(--accent-blue), var(--accent-purple))" : "var(--bg-secondary)",
            color: activeTab === "dashboard" ? "white" : "var(--text-primary)",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "600",
            border: activeTab === "dashboard" ? "none" : "1px solid var(--border-color)",
            cursor: "pointer",
            transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
            boxShadow: activeTab === "dashboard" ? "0 4px 12px rgba(79, 70, 229, 0.2)" : "none"
          }}
        >
          Analytics & Downloads
        </button>
        <button 
          onClick={() => { setActiveTab("replenish"); setActionMessage(null); }} 
          style={{
            padding: "10px 20px",
            background: activeTab === "replenish" ? "linear-gradient(135deg, var(--accent-blue), var(--accent-purple))" : "var(--bg-secondary)",
            color: activeTab === "replenish" ? "white" : "var(--text-primary)",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "600",
            border: activeTab === "replenish" ? "none" : "1px solid var(--border-color)",
            cursor: "pointer",
            transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
            boxShadow: activeTab === "replenish" ? "0 4px 12px rgba(79, 70, 229, 0.2)" : "none"
          }}
        >
          Smart Reorder Planner
        </button>
        <button 
          onClick={() => { setActiveTab("simulator"); setActionMessage(null); }} 
          style={{
            padding: "10px 20px",
            background: activeTab === "simulator" ? "linear-gradient(135deg, var(--accent-blue), var(--accent-purple))" : "var(--bg-secondary)",
            color: activeTab === "simulator" ? "white" : "var(--text-primary)",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "600",
            border: activeTab === "simulator" ? "none" : "1px solid var(--border-color)",
            cursor: "pointer",
            transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
            boxShadow: activeTab === "simulator" ? "0 4px 12px rgba(79, 70, 229, 0.2)" : "none"
          }}
        >
          Demand Simulator
        </button>
      </div>

      {/* TAB 1: DASHBOARD ANALYTICS */}
      {activeTab === "dashboard" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }} className="animate-fade-in">
          {/* KPI Cards Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" }}>
            <div className="glass-card" style={{ display: "flex", gap: "16px", alignItems: "center" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(59, 130, 246, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-blue)", flexShrink: 0 }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h12M6 8h12M6 13h4.5a4.5 4.5 0 0 0 0-9H6m4.5 9L18 21"/></svg>
              </div>
              <div>
                <p style={{ fontSize: "14px", color: "var(--text-secondary)", margin: "0 0 4px 0" }}>Asset Valuation</p>
                <h3 style={{ fontSize: "22px", fontWeight: "700", margin: 0, color: "var(--text-primary)" }}>
                  ₹{reportsData.financials.totalInventoryValue.toLocaleString()}
                </h3>
              </div>
            </div>

            <div className="glass-card" style={{ display: "flex", gap: "16px", alignItems: "center" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(139, 92, 246, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-purple)", flexShrink: 0 }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
              </div>
              <div>
                <p style={{ fontSize: "14px", color: "var(--text-secondary)", margin: "0 0 4px 0" }}>Stocked Units</p>
                <h3 style={{ fontSize: "22px", fontWeight: "700", margin: 0, color: "var(--text-primary)" }}>
                  {reportsData.financials.totalItemsInStock.toLocaleString()}
                </h3>
              </div>
            </div>

            <div className="glass-card" style={{ display: "flex", gap: "16px", alignItems: "center" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(16, 185, 129, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-emerald)", flexShrink: 0 }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
              </div>
              <div>
                <p style={{ fontSize: "14px", color: "var(--text-secondary)", margin: "0 0 4px 0" }}>Procurement Spend</p>
                <h3 style={{ fontSize: "22px", fontWeight: "700", margin: 0, color: "var(--text-primary)" }}>
                  ₹{reportsData.procurement.estimatedProcurementSpend.toLocaleString()}
                </h3>
              </div>
            </div>

            <div className="glass-card" style={{ display: "flex", gap: "16px", alignItems: "center" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(244, 63, 94, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-rose)", flexShrink: 0 }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              </div>
              <div>
                <p style={{ fontSize: "14px", color: "var(--text-secondary)", margin: "0 0 4px 0" }}>Low Stock Warnings</p>
                <h3
                  style={{
                    fontSize: "22px",
                    fontWeight: "700",
                    margin: 0,
                    color: reportsData.lowStockAlerts.length > 0 ? "#fb7185" : "#10b981",
                  }}
                >
                  {reportsData.lowStockAlerts.length}
                </h3>
              </div>
            </div>
          </div>

          {/* Interactive Charts Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "24px" }}>
            <div className="glass-card" style={{ display: "flex", flexDirection: "column", minHeight: "360px" }}>
              <h4 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "16px" }}>Asset Valuation Share by Category</h4>
              <div style={{ flex: 1, position: "relative", minHeight: "240px" }}>
                <Doughnut data={categoryDoughnutData} options={categoryDoughnutOptions} />
              </div>
            </div>

            <div className="glass-card" style={{ display: "flex", flexDirection: "column", minHeight: "360px" }}>
              <h4 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "16px" }}>Purchase Orders Status Distribution</h4>
              <div style={{ flex: 1, position: "relative", minHeight: "240px" }}>
                <Bar data={orderBarData} options={orderBarOptions} />
              </div>
            </div>
          </div>

          {/* Generated Report CSVs Table */}
          <div className="glass-card">
            <h3 style={{ marginBottom: "20px" }}>Download Official Reports</h3>

            <div className="table-container" style={{ marginTop: 0 }}>
              <table>
                <thead>
                  <tr>
                    <th>Report Title</th>
                    <th>Report Type</th>
                    <th>Source Database Type</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ fontWeight: "600" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--accent-blue)" }}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                        Current Inventory Valuation
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-blue">Financial</span>
                    </td>
                    <td>Products & Categories</td>
                    <td>
                      <span className="badge badge-emerald">Ready</span>
                    </td>
                    <td>
                      <button className="btn-outline" onClick={() => handleDownload("valuation")} style={{ padding: "6px 12px", fontSize: "13px", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        Download CSV
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: "600" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--accent-purple)" }}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                        Procurement Cost Analysis
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-blue">Procurement</span>
                    </td>
                    <td>Purchase Orders & Product Cost</td>
                    <td>
                      <span className="badge badge-emerald">Ready</span>
                    </td>
                    <td>
                      <button className="btn-outline" onClick={() => handleDownload("procurement")} style={{ padding: "6px 12px", fontSize: "13px", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        Download CSV
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: "600" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--accent-emerald)" }}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                        Supplier Logistics Summary
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-blue">Vendor</span>
                    </td>
                    <td>Suppliers & Orders</td>
                    <td>
                      <span className="badge badge-emerald">Ready</span>
                    </td>
                    <td>
                      <button className="btn-outline" onClick={() => handleDownload("supplier")} style={{ padding: "6px 12px", fontSize: "13px", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        Download CSV
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: "600" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--accent-rose)" }}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                        Low Stock Alerts & Health
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-blue">Inventory</span>
                    </td>
                    <td>Product Stock warnings</td>
                    <td>
                      <span className="badge badge-emerald">Ready</span>
                    </td>
                    <td>
                      <button className="btn-outline" onClick={() => handleDownload("lowstock")} style={{ padding: "6px 12px", fontSize: "13px", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        Download CSV
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SMART REORDER PLANNER */}
      {activeTab === "replenish" && (
        <div className="glass-card animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <h3 style={{ fontSize: "20px", marginBottom: "6px", borderLeft: "3px solid var(--accent-blue)", paddingLeft: "10px" }}>Smart Reorder Planner</h3>
            <p style={{ margin: 0, color: "var(--text-secondary)" }}>
              Automatically detect inventory items falling below safe threshold (20 units) and create purchase orders instantly.
            </p>
          </div>

          {actionMessage && (
            <div style={{
              padding: "12px 16px",
              borderRadius: "8px",
              background: actionMessage.type === "success" ? "rgba(16, 185, 129, 0.08)" : "rgba(225, 29, 72, 0.08)",
              border: `1px solid ${actionMessage.type === "success" ? "rgba(16, 185, 129, 0.2)" : "rgba(225, 29, 72, 0.2)"}`,
              color: actionMessage.type === "success" ? "var(--accent-emerald)" : "var(--accent-rose)",
              fontSize: "14px",
              fontWeight: "600",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <span>{actionMessage.text}</span>
              <button onClick={() => setActionMessage(null)} style={{ background: "transparent", color: "inherit", padding: "0 4px", fontSize: "16px", border: "none", cursor: "pointer", marginLeft: "auto" }}>×</button>
            </div>
          )}

          {reportsData.lowStockAlerts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <div style={{ fontSize: "40px", marginBottom: "12px" }}>🎉</div>
              <h4 style={{ color: "var(--accent-emerald)", fontSize: "18px", fontWeight: "700" }}>All Items Fully Stocked</h4>
              <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "var(--text-secondary)" }}>No items are currently below the safety threshold of 20 units.</p>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                <span style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-secondary)" }}>
                  {Object.keys(selectedReplenish).filter(k => selectedReplenish[k]).length} of {reportsData.lowStockAlerts.length} items selected
                </span>
                <button 
                  className="btn"
                  disabled={actionLoading}
                  onClick={handleBulkReorder}
                  style={{
                    background: "linear-gradient(135deg, var(--accent-blue), var(--accent-purple))",
                    color: "white",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    fontSize: "14px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px"
                  }}
                >
                  {actionLoading ? "Processing Orders..." : "Generate Selected Purchase Orders"}
                </button>
              </div>

              <div className="table-container" style={{ marginTop: 0 }}>
                <table>
                  <thead>
                    <tr>
                      <th style={{ width: "40px", padding: "16px" }}>
                        <input 
                          type="checkbox" 
                          checked={Object.keys(selectedReplenish).filter(k => selectedReplenish[k]).length === reportsData.lowStockAlerts.length}
                          onChange={(e) => {
                            const nextSelected = {};
                            reportsData.lowStockAlerts.forEach(p => {
                              nextSelected[p.id] = e.target.checked;
                            });
                            setSelectedReplenish(nextSelected);
                          }}
                          style={{ cursor: "pointer" }}
                        />
                      </th>
                      <th>Product Name</th>
                      <th>Category</th>
                      <th>Current Stock</th>
                      <th>Restock Target</th>
                      <th>Reorder Quantity</th>
                      <th>Unit Price</th>
                      <th>Est. Cost</th>
                      <th>Default Supplier</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportsData.lowStockAlerts.map((p) => {
                      const targetVal = replenishTargets[p.id] || 50;
                      const currentVal = p.quantity || 0;
                      const reorderVal = Math.max(0, targetVal - currentVal);
                      const isChecked = !!selectedReplenish[p.id];

                      return (
                        <tr key={p.id} style={{ opacity: isChecked ? 1 : 0.65 }}>
                          <td style={{ padding: "16px" }}>
                            <input 
                              type="checkbox" 
                              checked={isChecked}
                              onChange={(e) => {
                                setSelectedReplenish(prev => ({
                                  ...prev,
                                  [p.id]: e.target.checked
                                }));
                              }}
                              style={{ cursor: "pointer" }}
                            />
                          </td>
                          <td style={{ fontWeight: "600" }}>{p.name}</td>
                          <td>
                            <span className="badge badge-blue">{p.categoryName}</span>
                          </td>
                          <td style={{ fontWeight: "600", color: "var(--accent-rose)" }}>{currentVal}</td>
                          <td>
                            <input 
                              type="number" 
                              min={currentVal + 1}
                              max="1000"
                              value={targetVal}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 0;
                                setReplenishTargets(prev => ({
                                  ...prev,
                                  [p.id]: val
                                }));
                              }}
                              style={{
                                width: "80px",
                                padding: "6px 10px",
                                borderRadius: "6px",
                                border: "1px solid var(--border-color)",
                                fontSize: "14px"
                              }}
                            />
                          </td>
                          <td style={{ fontWeight: "700", color: reorderVal > 0 ? "var(--accent-blue)" : "inherit" }}>
                            {reorderVal}
                          </td>
                          <td>₹{p.price}</td>
                          <td style={{ fontWeight: "700" }}>₹{(reorderVal * p.price).toLocaleString()}</td>
                          <td>
                            <span style={{ fontSize: "14px", color: "var(--text-secondary)", fontWeight: "500" }}>
                              {p.supplier}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB 3: DEMAND SIMULATOR & BUDGET PLANNER */}
      {activeTab === "simulator" && (
        <div className="glass-card animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div>
            <h3 style={{ fontSize: "20px", marginBottom: "6px", borderLeft: "3px solid var(--accent-blue)", paddingLeft: "10px" }}>Procurement Budget & Demand Simulator</h3>
            <p style={{ margin: 0, color: "var(--text-secondary)" }}>
              Simulate a warehouse stock replenishment based on expected sales/demand increase. Preview purchase costs and allocate budget levels.
            </p>
          </div>

          {/* Simulator Control Panel */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "24px", background: "rgba(15, 23, 42, 0.02)", padding: "20px", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-primary)" }}>
                Expected Demand / Stock Increase: <span style={{ color: "var(--accent-blue)", fontSize: "16px", fontWeight: "700" }}>+{demandIncrease}%</span>
              </label>
              <input 
                type="range" 
                min="10" 
                max="200" 
                step="10"
                value={demandIncrease}
                onChange={(e) => setDemandIncrease(parseInt(e.target.value))}
                style={{ cursor: "pointer", height: "6px", borderRadius: "3px" }}
              />
              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>This will calculate a simulated order quantity of {demandIncrease}% of current levels for every active product.</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-primary)" }}>
                Planned Procurement Budget (₹)
              </label>
              <input 
                type="number" 
                min="1000" 
                max="10000000"
                value={allocatedBudget}
                onChange={(e) => setAllocatedBudget(parseInt(e.target.value) || 0)}
                style={{ padding: "8px 12px", borderRadius: "6px" }}
              />
            </div>
          </div>

          {/* Simulation Results Row */}
          {(() => {
            let totalSimulatedCost = 0;
            let totalSimulatedItems = 0;
            const categoryCostMap = {};

            reportsData.products.forEach((p) => {
              const currentQty = p.quantity || 0;
              const restockQty = Math.round(currentQty * (demandIncrease / 100));
              const cost = restockQty * (p.price || 0);
              totalSimulatedCost += cost;
              totalSimulatedItems += restockQty;

              const catName = p.categoryName || "Uncategorized";
              categoryCostMap[catName] = (categoryCostMap[catName] || 0) + cost;
            });

            const budgetUsagePercent = allocatedBudget > 0 ? (totalSimulatedCost / allocatedBudget) * 100 : 0;
            let budgetColor = "var(--accent-emerald)";
            let budgetStatusText = "Under Budget (Safe)";
            if (budgetUsagePercent > 100) {
              budgetColor = "var(--accent-rose)";
              budgetStatusText = "Budget Exceeded";
            } else if (budgetUsagePercent > 80) {
              budgetColor = "var(--accent-amber)";
              budgetStatusText = "Approaching Budget Threshold (Caution)";
            }

            return (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
                  <div style={{ background: "rgba(15, 23, 42, 0.01)", padding: "16px", borderRadius: "10px", border: "1px solid var(--border-color)" }}>
                    <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Total Restock Units</span>
                    <h4 style={{ fontSize: "20px", fontWeight: "700", marginTop: "4px" }}>{totalSimulatedItems.toLocaleString()} items</h4>
                  </div>
                  <div style={{ background: "rgba(15, 23, 42, 0.01)", padding: "16px", borderRadius: "10px", border: "1px solid var(--border-color)" }}>
                    <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Simulated Procurement Cost</span>
                    <h4 style={{ fontSize: "20px", fontWeight: "700", marginTop: "4px" }}>₹{totalSimulatedCost.toLocaleString()}</h4>
                  </div>
                  <div style={{ background: "rgba(15, 23, 42, 0.01)", padding: "16px", borderRadius: "10px", border: "1px solid var(--border-color)" }}>
                    <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Remaining Budget Gap</span>
                    <h4 style={{ fontSize: "20px", fontWeight: "700", marginTop: "4px", color: totalSimulatedCost > allocatedBudget ? "var(--accent-rose)" : "var(--accent-emerald)" }}>
                      ₹{(allocatedBudget - totalSimulatedCost).toLocaleString()}
                    </h4>
                  </div>
                </div>

                {/* Budget Progress Bar */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", fontWeight: "600" }}>
                    <span>Budget Allocation Status: <span style={{ color: budgetColor }}>{budgetStatusText}</span></span>
                    <span>{budgetUsagePercent.toFixed(1)}% Used</span>
                  </div>
                  <div style={{ width: "100%", height: "12px", background: "var(--bg-tertiary)", borderRadius: "6px", overflow: "hidden" }}>
                    <div style={{ width: `${Math.min(100, budgetUsagePercent)}%`, height: "100%", background: budgetColor, borderRadius: "6px", transition: "width 0.3s" }}></div>
                  </div>
                </div>

                {/* Category Cost Breakdown Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", marginTop: "10px" }}>
                  {/* Left Column: Breakdown List */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <h4 style={{ fontSize: "16px", fontWeight: "600" }}>Valuation Distribution by Category</h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {Object.keys(categoryCostMap).map((catName) => {
                        const cost = categoryCostMap[catName];
                        const share = totalSimulatedCost > 0 ? (cost / totalSimulatedCost) * 100 : 0;
                        return (
                          <div key={catName} style={{ display: "flex", flexDirection: "column", gap: "4px", background: "var(--bg-secondary)", padding: "10px 14px", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", fontWeight: "600" }}>
                              <span>{catName}</span>
                              <span>₹{cost.toLocaleString()} ({share.toFixed(0)}%)</span>
                            </div>
                            <div style={{ width: "100%", height: "4px", background: "var(--bg-tertiary)", borderRadius: "2px" }}>
                              <div style={{ width: `${share}%`, height: "100%", background: "var(--accent-blue)", borderRadius: "2px" }}></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Column: Details Card */}
                  <div style={{ background: "linear-gradient(135deg, rgba(79, 70, 229, 0.02) 0%, rgba(124, 58, 237, 0.02) 100%)", border: "1.5px dashed var(--accent-blue)", borderRadius: "12px", padding: "20px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", gap: "16px" }}>
                    <div style={{ fontSize: "32px" }}>📊</div>
                    <div>
                      <h4 style={{ fontSize: "17px", fontWeight: "700", marginBottom: "6px" }}>Download Simulation Blueprint</h4>
                      <p style={{ margin: 0, fontSize: "13px", color: "var(--text-secondary)" }}>
                        Download a full CSV breakdown of the simulation containing the exact reorder quantity, unit costs, and total procurement spend per product.
                      </p>
                    </div>
                    <button 
                      className="btn"
                      onClick={downloadSimulationCSV}
                      style={{
                        background: "linear-gradient(135deg, var(--accent-blue), var(--accent-purple))",
                        color: "white",
                        padding: "10px 20px",
                        borderRadius: "8px",
                        fontSize: "14px",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        fontWeight: "600"
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                      Export Simulation Plan
                    </button>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}

export default Reports;
