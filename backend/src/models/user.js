const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: [
      "admin",
      "manager",
      "procurement",
      "viewer"
    ],
    default: "viewer"
  },
  status: {
    type: String,
    enum: ["Active", "Inactive"],
    default: "Active"
  },
  mustChangePassword: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);