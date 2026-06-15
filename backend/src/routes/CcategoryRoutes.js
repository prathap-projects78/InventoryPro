const express = require("express");
const router = express.Router();

const {
  createCategory,
  getCategories
} = require("../controllers/CategoryController");

router.get("/", getCategories);
router.post("/", createCategory);

module.exports = router;