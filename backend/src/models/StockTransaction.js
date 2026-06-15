const mongoose = require("mongoose");

const stockTransactionSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },

    type: {
      type: String,
      enum: ["IN", "OUT"],
      required: true
    },

    quantity: {
      type: Number,
      required: true
    },

    remarks: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("StockTransaction", stockTransactionSchema);
