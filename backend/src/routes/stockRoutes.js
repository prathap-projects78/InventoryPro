const express = require("express");
const router = express.Router();

const {
  addStockTransaction
} = require("../controllers/stockController");

router.post("/", addStockTransaction);

module.exports = router;
