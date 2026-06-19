const mongoose = require("mongoose");

const supplierSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    address: {
      type: String,
      required: true,
      trim: true
    },
    rating: {
      type: Number,
      default: 5.0,
      min: 1.0,
      max: 5.0
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Supplier", supplierSchema);
