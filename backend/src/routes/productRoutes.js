const express = require("express");
const router = express.Router();

const authMiddleware =
 require("../middleware/authMiddleware");

const authorizeRoles =
 require("../middleware/roleMiddleware");

const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct
} = require("../controllers/productController");

router.post(
 "/",
 authMiddleware,
 authorizeRoles(
  "admin",
  "manager"
 ),
 createProduct
);
router.get("/", getProducts);
router.get("/:id", getProductById);
router.put(
 "/:id",
 authMiddleware,
 authorizeRoles(
  "admin",
  "manager"
 ),
 updateProduct
);
router.delete(
 "/:id",
 authMiddleware,
 authorizeRoles(
  "admin"
 ),
 deleteProduct
);

module.exports = router;