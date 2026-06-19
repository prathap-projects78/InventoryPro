const Product = require("../models/Product");
const Category = require("../models/Category");
const PurchaseOrder = require("../models/PurchaseOrder");
const User = require("../models/user");

const getDashboardStats = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalCategories = await Category.countDocuments();
    const totalPurchaseOrders = await PurchaseOrder.countDocuments();

    const pendingOrders = await PurchaseOrder.countDocuments({
      status: "Pending"
    });

    const lowStockProducts = await Product.countDocuments({
      quantity: { $lt: 20 }
    });

    // Check if logged-in user is admin to send user metrics
    let adminStats = null;
    if (req.user && req.user.role === "admin") {
      const totalUsers = await User.countDocuments();
      const activeUsers = await User.countDocuments({ status: "Active" });
      const inactiveUsers = await User.countDocuments({ status: "Inactive" });
      
      const totalAdmins = await User.countDocuments({ role: "admin" });
      const totalManagers = await User.countDocuments({ role: "manager" });
      const totalProcurements = await User.countDocuments({ role: "procurement" });
      const totalViewers = await User.countDocuments({ role: "viewer" });

      const recentUsers = await User.find({}, "name email role status updatedAt createdAt")
        .sort({ updatedAt: -1 })
        .limit(5);

      adminStats = {
        totalUsers,
        activeUsers,
        inactiveUsers,
        totalAdmins,
        totalManagers,
        totalProcurements,
        totalViewers,
        recentUserActivity: recentUsers.map(u => ({
          id: u._id,
          name: u.name,
          email: u.email,
          role: u.role,
          status: u.status,
          timestamp: u.updatedAt || u.createdAt
        }))
      };
    }

    res.status(200).json({
      totalProducts,
      totalCategories,
      totalPurchaseOrders,
      pendingOrders,
      lowStockProducts,
      adminStats
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

const getLowStockProducts = async (req, res) => {
  try {
    const products = await Product.find({
      quantity: { $lt: 20 }
    });

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

const getRecentOrders = async (req, res) => {
  try {
    const orders = await PurchaseOrder.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("product");

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

const getInventoryValue = async (req, res) => {
  try {
    const products = await Product.find();

    let totalValue = 0;

    products.forEach((product) => {
      totalValue += product.price * product.quantity;
    });

    res.status(200).json({
      totalInventoryValue: totalValue
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

module.exports = {
  getDashboardStats,
  getLowStockProducts,
  getRecentOrders,
  getInventoryValue
};
