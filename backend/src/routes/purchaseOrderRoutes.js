const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
  createPurchaseOrder,
  getPurchaseOrders,
  approvePurchaseOrder,
  deliverPurchaseOrder
} = require("../controllers/purchaseOrderController");

router.get("/", getPurchaseOrders);

router.post(
 "/",
 authMiddleware,
 authorizeRoles(
  "admin",
  "procurement"
 ),
 createPurchaseOrder
);

router.put(
 "/:id/approve",
 authMiddleware,
 authorizeRoles(
  "admin"
 ),
 approvePurchaseOrder
);

router.put(
 "/:id/deliver",
 authMiddleware,
 authorizeRoles(
  "admin"
 ),
 deliverPurchaseOrder
);

module.exports = router;
