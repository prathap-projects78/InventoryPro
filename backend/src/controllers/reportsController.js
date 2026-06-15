const Product = require("../models/Product");
const Category = require("../models/Category");
const PurchaseOrder = require("../models/PurchaseOrder");

const getReportsData = async (req, res) => {
  try {
    // 1. Fetch categories, products, and purchase orders from database
    const categories = await Category.find();
    const products = await Product.find().populate("category");
    const purchaseOrders = await PurchaseOrder.find().populate("product");

    // 2. Compute overall stock/financial summaries
    let totalInventoryValue = 0;
    let totalItemsInStock = 0;
    products.forEach((p) => {
      totalInventoryValue += (p.price || 0) * (p.quantity || 0);
      totalItemsInStock += (p.quantity || 0);
    });

    const averageProductPrice =
      products.length > 0
        ? products.reduce((acc, p) => acc + (p.price || 0), 0) / products.length
        : 0;

    // 3. Category breakdown mapping
    const categoryStatsMap = {};
    categories.forEach((cat) => {
      categoryStatsMap[cat._id.toString()] = {
        id: cat._id.toString(),
        name: cat.name,
        productCount: 0,
        totalQuantity: 0,
        totalValuation: 0
      };
    });

    products.forEach((p) => {
      if (p.category) {
        const catIdStr = p.category._id.toString();
        if (!categoryStatsMap[catIdStr]) {
          categoryStatsMap[catIdStr] = {
            id: catIdStr,
            name: p.category.name || "Unknown",
            productCount: 0,
            totalQuantity: 0,
            totalValuation: 0
          };
        }
        categoryStatsMap[catIdStr].productCount += 1;
        categoryStatsMap[catIdStr].totalQuantity += (p.quantity || 0);
        categoryStatsMap[catIdStr].totalValuation += (p.price || 0) * (p.quantity || 0);
      }
    });

    const categoryBreakdown = Object.values(categoryStatsMap);

    // 4. Procurement / Orders Breakdown
    let totalOrderCount = purchaseOrders.length;
    let pendingOrdersCount = 0;
    let approvedOrdersCount = 0;
    let deliveredOrdersCount = 0;
    let cancelledOrdersCount = 0;
    let estimatedProcurementSpend = 0; // valuation of approved and delivered orders

    purchaseOrders.forEach((o) => {
      if (o.status === "Pending") pendingOrdersCount++;
      else if (o.status === "Approved") approvedOrdersCount++;
      else if (o.status === "Delivered") deliveredOrdersCount++;
      else if (o.status === "Cancelled") cancelledOrdersCount++;

      if (o.product && (o.status === "Approved" || o.status === "Delivered")) {
        estimatedProcurementSpend += (o.product.price || 0) * (o.quantity || 0);
      }
    });

    // 5. Supplier performance summary
    const supplierStatsMap = {};
    purchaseOrders.forEach((o) => {
      const supplierName = o.supplier || "Unknown Supplier";
      if (!supplierStatsMap[supplierName]) {
        supplierStatsMap[supplierName] = {
          name: supplierName,
          totalOrders: 0,
          pending: 0,
          approved: 0,
          delivered: 0,
          cancelled: 0,
          totalQuantityOrdered: 0
        };
      }
      supplierStatsMap[supplierName].totalOrders += 1;
      supplierStatsMap[supplierName].totalQuantityOrdered += (o.quantity || 0);
      if (o.status === "Pending") supplierStatsMap[supplierName].pending++;
      else if (o.status === "Approved") supplierStatsMap[supplierName].approved++;
      else if (o.status === "Delivered") supplierStatsMap[supplierName].delivered++;
      else if (o.status === "Cancelled") supplierStatsMap[supplierName].cancelled++;
    });

    const supplierPerformance = Object.values(supplierStatsMap);

    // 6. Low stock warnings (quantity < 20)
    const lowStockAlerts = products
      .filter((p) => (p.quantity || 0) < 20)
      .map((p) => ({
        id: p._id,
        name: p.name,
        quantity: p.quantity,
        price: p.price,
        categoryName: p.category ? p.category.name : "Uncategorized",
        supplier: p.supplier || "Unknown Supplier"
      }));

    const productsList = products.map((p) => ({
      name: p.name,
      quantity: p.quantity,
      price: p.price,
      categoryName: p.category ? p.category.name : "Uncategorized",
      supplier: p.supplier || "N/A"
    }));

    const purchaseOrdersList = purchaseOrders.map((o) => ({
      id: o._id,
      productName: o.product ? o.product.name : "Unknown Product",
      quantity: o.quantity,
      supplier: o.supplier,
      status: o.status,
      date: o.createdAt
    }));

    res.status(200).json({
      financials: {
        totalInventoryValue,
        totalItemsInStock,
        averageProductPrice,
        totalProductsCount: products.length
      },
      categoryBreakdown,
      procurement: {
        totalOrderCount,
        pendingOrdersCount,
        approvedOrdersCount,
        deliveredOrdersCount,
        cancelledOrdersCount,
        estimatedProcurementSpend
      },
      supplierPerformance,
      lowStockAlerts,
      products: productsList,
      purchaseOrders: purchaseOrdersList
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

module.exports = {
  getReportsData
};
