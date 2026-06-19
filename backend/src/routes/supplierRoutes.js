const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier
} = require("../controllers/supplierController");

// Restrict all CRUD operations to admin and procurement roles
router.get(
  "/",
  authMiddleware,
  authorizeRoles("admin", "manager", "procurement"),
  getSuppliers
);

router.post(
  "/",
  authMiddleware,
  authorizeRoles("admin", "procurement"),
  createSupplier
);

router.put(
  "/:id",
  authMiddleware,
  authorizeRoles("admin", "procurement"),
  updateSupplier
);

router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles("admin", "procurement"),
  deleteSupplier
);

module.exports = router;
