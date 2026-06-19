const jwt = require("jsonwebtoken");
const User = require("../models/user");

const JWT_SECRET = process.env.JWT_SECRET || "inventory_procurement_secret";

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "No token provided"
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      JWT_SECRET
    );

    // Fetch user details from database
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        message: "User account not found"
      });
    }

    // Check active status
    if (user.status === "Inactive") {
      return res.status(403).json({
        message: "Access Denied: Your account has been deactivated"
      });
    }

    // Check if password change is required
    if (user.mustChangePassword) {
      const url = req.originalUrl || "";
      const isAllowed = url.endsWith("/change-password") || url.endsWith("/me");
      if (!isAllowed) {
        return res.status(403).json({
          message: "First login password change required",
          mustChangePassword: true
        });
      }
    }

    req.user = {
      id: user._id.toString(),
      role: user.role,
      status: user.status,
      mustChangePassword: user.mustChangePassword
    };

    next();

  } catch (error) {
    res.status(401).json({
      message: "Invalid or expired token"
    });
  }
};

module.exports = authMiddleware;