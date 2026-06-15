const express = require("express");
const router = express.Router();

const {
  getDashboardStats,
  getLowStockProducts,
  getRecentOrders,
  getInventoryValue
} = require("../controllers/dashboardController");

router.get("/", getDashboardStats);
router.get("/low-stock", getLowStockProducts);
router.get("/recent-orders", getRecentOrders);
router.get("/inventory-value", getInventoryValue);

module.exports = router;
