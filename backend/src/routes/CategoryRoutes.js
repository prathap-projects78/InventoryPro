const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
  createCategory,
  getCategories,
  deleteCategory
} = require("../controllers/CategoryController");

router.get("/", getCategories);

router.post(
 "/",
 authMiddleware,
 authorizeRoles(
  "admin"
 ),
 createCategory
);

router.delete(
 "/:id",
 authMiddleware,
 authorizeRoles(
  "admin"
 ),
 deleteCategory
);

module.exports = router;