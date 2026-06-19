const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const { getReportsData } = require("../controllers/reportsController");

router.get(
  "/",
  authMiddleware,
  authorizeRoles("admin", "manager", "procurement", "viewer"),
  getReportsData
);

module.exports = router;
