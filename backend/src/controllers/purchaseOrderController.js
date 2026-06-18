const PurchaseOrder = require("../models/PurchaseOrder");
const Product = require("../models/Product");

const createPurchaseOrder = async (req, res) => {
  try {
    const purchaseOrder = await PurchaseOrder.create(req.body);

    res.status(201).json(purchaseOrder);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

const getPurchaseOrders = async (req, res) => {
  try {
    const orders = await PurchaseOrder.find().populate("product");

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

const approvePurchaseOrder = async (req, res) => {
  try {
    const order = await PurchaseOrder.findByIdAndUpdate(
      req.params.id,
      {
        status: "Approved"
      },
      {
        new: true
      }
    );

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

const deliverPurchaseOrder = async (req, res) => {
  try {
    const order = await PurchaseOrder.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    if (order.status === "Delivered") {
      return res.status(400).json({
        message: "Order already delivered"
      });
    }

    order.status = "Delivered";
    order.deliveredAt = new Date();

    await order.save();

    const product = await Product.findById(order.product);

    product.quantity += order.quantity;

    await product.save();

    res.status(200).json({
      message: "Order delivered and stock updated",
      order
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

module.exports = {
  createPurchaseOrder,
  getPurchaseOrders,
  approvePurchaseOrder,
  deliverPurchaseOrder
};
