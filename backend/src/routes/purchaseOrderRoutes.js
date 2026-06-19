const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
  createPurchaseOrder,
  getPurchaseOrders,
  approvePurchaseOrder,
  deliverPurchaseOrder,
  rejectPurchaseOrder
} = require("../controllers/purchaseOrderController");

router.get("/", getPurchaseOrders);

router.post(
 "/",
 authMiddleware,
 authorizeRoles(
  "admin",
  "manager"
 ),
 createPurchaseOrder
);

router.put(
 "/:id/approve",
 authMiddleware,
 authorizeRoles(
  "admin",
  "procurement"
 ),
 approvePurchaseOrder
);

router.put(
 "/:id/reject",
 authMiddleware,
 authorizeRoles(
  "admin",
  "procurement"
 ),
 rejectPurchaseOrder
);

router.put(
 "/:id/deliver",
 authMiddleware,
 authorizeRoles(
  "admin",
  "procurement"
 ),
 deliverPurchaseOrder
);

module.exports = router;
