const User = require("../models/user");
const bcrypt = require("bcryptjs");

const seedDefaultAdmin = async () => {
  try {
    // Check if an Admin account exists
    const adminExists = await User.findOne({ role: "admin" });

    if (!adminExists) {
      console.log("No Admin account found. Creating default System Admin...");

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("Admin@123", salt);

      // Create default admin user
      await User.create({
        name: "System Admin",
        email: "prathapcse78@gmail.com",
        password: hashedPassword,
        role: "admin",
        status: "Active",
        mustChangePassword: true
      });

      console.log("Default Admin account created successfully!");
      console.log("Email: prathapcse78@gmail.com");
      console.log("Password: Admin@123");
    } else {
      console.log("Admin account already exists. Seeding skipped.");
    }
  } catch (error) {
    console.error("Error seeding default Admin account:", error.message);
  }
};

module.exports = seedDefaultAdmin;
