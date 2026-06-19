const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
  registerUser,
  loginUser,
  changePassword,
  getUsers,
  editUser,
  updateUserStatus,
  resetUserPassword,
  deleteUser,
  getCurrentUser
} = require("../controllers/authController");

// Public authentication endpoint
router.post("/login", loginUser);

// Protected self-profile endpoints
router.get("/me", authMiddleware, getCurrentUser);
router.post("/change-password", authMiddleware, changePassword);

// Administrative User Management endpoints (Admin Only)
router.post("/register", authMiddleware, authorizeRoles("admin"), registerUser);
router.get("/", authMiddleware, authorizeRoles("admin"), getUsers);
router.put("/users/:id", authMiddleware, authorizeRoles("admin"), editUser);
router.patch("/users/:id/status", authMiddleware, authorizeRoles("admin"), updateUserStatus);
router.post("/users/:id/reset-password", authMiddleware, authorizeRoles("admin"), resetUserPassword);
router.delete("/:id", authMiddleware, authorizeRoles("admin"), deleteUser);

module.exports = router;