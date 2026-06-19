const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "inventory_procurement_secret";

// Helper function to check if user is the last remaining Admin
const checkIsLastAdmin = async (userId) => {
  const user = await User.findById(userId);
  if (!user || user.role !== "admin") return false;

  const adminCount = await User.countDocuments({ role: "admin" });
  return adminCount <= 1;
};

// Create User (Admin Only)
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "User with this email already exists"
      });
    }

    // Hash temporary password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user with forced password change on first login
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "viewer",
      status: "Active",
      mustChangePassword: true
    });

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        mustChangePassword: user.mustChangePassword
      }
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Login User
const loginUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    // Check if user is active
    if (user.status === "Inactive") {
      return res.status(403).json({
        message: "Access Denied: Your account has been deactivated"
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    // Validate role if provided
    if (role && user.role !== role) {
      return res.status(403).json({
        message: `Access Denied: Role mismatch. Registered role is ${user.role}`
      });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role
      },
      JWT_SECRET,
      {
        expiresIn: "1d"
      }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      role: user.role,
      name: user.name,
      mustChangePassword: user.mustChangePassword
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Change Password (Self First Login)
const changePassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.trim().length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long"
      });
    }

    const userId = req.user.id;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await User.findByIdAndUpdate(userId, {
      password: hashedPassword,
      mustChangePassword: false
    });

    res.status(200).json({
      message: "Password updated successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Get All Users (Admin only, support search & filter)
const getUsers = async (req, res) => {
  try {
    const { search, role } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }

    if (role) {
      query.role = role;
    }

    const users = await User.find(query, "-password").sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Edit User Profile Details (Admin Only)
const editUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    // Role check: if shifting role from admin, verify not last admin
    if (user.role === "admin" && role !== "admin") {
      const isLast = await checkIsLastAdmin(id);
      if (isLast) {
        return res.status(400).json({
          message: "Action Blocked: Cannot change the role of the last remaining Admin"
        });
      }
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;

    await user.save();

    res.status(200).json({
      message: "User profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Activate / Deactivate User Account (Admin Only)
const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // "Active" or "Inactive"

    if (!["Active", "Inactive"].includes(status)) {
      return res.status(400).json({
        message: "Invalid status value"
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    // Status check: if deactivating, check if last admin
    if (status === "Inactive" && user.role === "admin") {
      const isLast = await checkIsLastAdmin(id);
      if (isLast) {
        return res.status(400).json({
          message: "Action Blocked: Cannot deactivate the last remaining Admin"
        });
      }
    }

    user.status = status;
    await user.save();

    res.status(200).json({
      message: `User account has been ${status === "Active" ? "activated" : "deactivated"} successfully`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Reset User Password (Admin Only)
const resetUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { tempPassword } = req.body;

    if (!tempPassword || tempPassword.trim().length < 6) {
      return res.status(400).json({
        message: "Temporary password must be at least 6 characters long"
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(tempPassword, salt);

    user.password = hashedPassword;
    user.mustChangePassword = true; // force password change on next login
    await user.save();

    res.status(200).json({
      message: "User password reset successfully. User will be forced to change password at next login."
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Delete User (Admin Only)
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.id === id) {
      return res.status(400).json({
        message: "Action Blocked: You cannot delete your own admin account"
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    // Verify last admin
    if (user.role === "admin") {
      const isLast = await checkIsLastAdmin(id);
      if (isLast) {
        return res.status(400).json({
          message: "Action Blocked: Cannot delete the last remaining Admin account"
        });
      }
    }

    await User.findByIdAndDelete(id);

    res.status(200).json({
      message: "User deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Get Current User Profile details
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  changePassword,
  getUsers,
  editUser,
  updateUserStatus,
  resetUserPassword,
  deleteUser,
  getCurrentUser
};