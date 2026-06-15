const StockTransaction = require("../models/StockTransaction");
const Product = require("../models/Product");

const addStockTransaction = async (req, res) => {
  try {
    const { product, type, quantity, remarks } = req.body;

    const stock = await StockTransaction.create({
      product,
      type,
      quantity,
      remarks
    });

    const productDoc = await Product.findById(product);

    if (!productDoc) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    if (type === "OUT" && productDoc.quantity < quantity) {
      return res.status(400).json({
        message: "Insufficient stock"
      });
    }

    if (type === "IN") {
      productDoc.quantity += quantity;
    } else {
      productDoc.quantity -= quantity;
    }

    await productDoc.save();

    res.status(201).json(stock);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

module.exports = {
  addStockTransaction
};
