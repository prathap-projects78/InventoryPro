const mongoose = require("mongoose");
const dns = require("dns");

// Override default DNS servers to resolve MongoDB Atlas SRV query issue (querySrv ECONNREFUSED)
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const seedDefaultAdmin = require("../utils/seedAdmin");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");
    // Seed default admin if missing
    await seedDefaultAdmin();
  } catch (error) {
    console.error("Database Connection Error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;