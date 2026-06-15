import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function DashboardChart({ stats }) {
  const isDark = document.documentElement.classList.contains("dark");
  const gridColor = isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(15, 23, 42, 0.04)";
  const labelColor = isDark ? "#94a3b8" : "#64748b";
  const tooltipBg = isDark ? "#1e293b" : "#ffffff";
  const tooltipTitle = isDark ? "#f8fafc" : "#0f172a";
  const tooltipBody = isDark ? "#cbd5e1" : "#475569";
  const tooltipBorder = isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(15, 23, 42, 0.08)";

  const data = {
    labels: [
      "Products",
      "Categories",
      "Orders",
      "Pending Orders",
    ],

    datasets: [
      {
        label: "Total Count",
        data: [
          stats.totalProducts,
          stats.totalCategories,
          stats.totalPurchaseOrders,
          stats.pendingOrders,
        ],
        backgroundColor: [
          "#3b82f6", // Blue
          "#8b5cf6", // Purple
          "#10b981", // Emerald
          "#f59e0b", // Amber
        ],
        borderRadius: 8,
        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false, // Hide dataset legend block as labels are self-explanatory
      },
      tooltip: {
        backgroundColor: tooltipBg,
        titleColor: tooltipTitle,
        bodyColor: tooltipBody,
        borderColor: tooltipBorder,
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
      }
    },
    scales: {
      x: {
        grid: {
          color: gridColor,
        },
        ticks: {
          color: labelColor,
          font: {
            family: "Inter",
            size: 13,
          }
        },
      },
      y: {
        grid: {
          color: gridColor,
        },
        ticks: {
          color: labelColor,
          font: {
            family: "Inter",
            size: 13,
          }
        },
      },
    },
  };

  return <Bar data={data} options={options} />;
}

export default DashboardChart;