require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");
const authroutes = require("./routes/authroutes");
const testroutes = require("./routes/testroutes");
const categoryRoutes = require("./routes/CategoryRoutes");
const productRoutes = require("./routes/productRoutes");
const stockRoutes = require("./routes/stockRoutes");
const purchaseOrderRoutes = require("./routes/purchaseOrderRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const reportsRoutes = require("./routes/reportsRoutes");
const supplierRoutes = require("./routes/supplierRoutes");

const authMiddleware = require("./middleware/authMiddleware");

connectDB();
app.use("/api/auth", authroutes);
app.use("/api/test", testroutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/stocks", stockRoutes);
app.use("/api/purchase-orders", purchaseOrderRoutes);
app.use("/api/dashboard", authMiddleware, dashboardRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/suppliers", supplierRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => { 
  console.log(`Server running on port ${PORT}`);
});