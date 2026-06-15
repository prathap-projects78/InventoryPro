const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
  registerUser,
  loginUser,
  getUsers,
  deleteUser,
  getCurrentUser
} = require("../controllers/authController");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", authMiddleware, getCurrentUser);

router.get(
  "/",
  authMiddleware,
  authorizeRoles("admin"),
  getUsers
);

router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles("admin"),
  deleteUser
);

module.exports = router;