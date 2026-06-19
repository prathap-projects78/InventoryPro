const Supplier = require("../models/Supplier");
const Product = require("../models/Product");
const PurchaseOrder = require("../models/PurchaseOrder");

// Helper to generate consistent mock details for seeded suppliers
const generateMockSupplierDetails = (name, index) => {
  const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, "");
  return {
    name,
    email: `contact@${cleanName || "supplier"}.com`,
    phone: `+91 98765 ${String(10000 + index).substring(1)}`,
    address: `${100 + index} Industrial Area, Phase-II, New Delhi`,
    rating: parseFloat((4.0 + (index % 10) * 0.1).toFixed(1))
  };
};

// GET all suppliers (Restricted to admin, procurement)
exports.getSuppliers = async (req, res) => {
  try {
    let suppliers = await Supplier.find().sort({ name: 1 });

    // Auto-seed from existing products/orders if Supplier DB is empty
    if (suppliers.length === 0) {
      console.log("Suppliers database is empty. Auto-seeding from existing Products and PurchaseOrders...");
      
      const [products, orders] = await Promise.all([
        Product.find(),
        PurchaseOrder.find()
      ]);

      const uniqueNames = new Set();
      products.forEach((p) => {
        if (p.supplier && p.supplier.trim()) {
          uniqueNames.add(p.supplier.trim());
        }
      });
      orders.forEach((o) => {
        if (o.supplier && o.supplier.trim()) {
          uniqueNames.add(o.supplier.trim());
        }
      });

      // If no suppliers are found in existing products/orders, add some default templates
      if (uniqueNames.size === 0) {
        uniqueNames.add("Global Distributors");
        uniqueNames.add("Delta Electronics");
        uniqueNames.add("Apex Industries");
      }

      const seedData = Array.from(uniqueNames).map((name, index) => 
        generateMockSupplierDetails(name, index)
      );

      await Supplier.insertMany(seedData);
      suppliers = await Supplier.find().sort({ name: 1 });
      console.log(`Auto-seeded ${suppliers.length} suppliers successfully!`);
    }

    res.status(200).json(suppliers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CREATE a supplier (Restricted to admin, procurement)
exports.createSupplier = async (req, res) => {
  try {
    const { name, email, phone, address, rating } = req.body;

    if (!name || !email || !phone || !address) {
      return res.status(400).json({ message: "Name, email, phone, and address are required." });
    }

    // Check duplicate
    const existing = await Supplier.findOne({ name: { $regex: new RegExp(`^${name.trim()}$`, "i") } });
    if (existing) {
      return res.status(400).json({ message: "A supplier with this name already exists." });
    }

    const newSupplier = new Supplier({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim(),
      rating: rating ? Number(rating) : 5.0
    });

    const saved = await newSupplier.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE a supplier (Restricted to admin, procurement)
exports.updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address, rating } = req.body;

    const supplier = await Supplier.findById(id);
    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found." });
    }

    // If changing name, check conflict
    if (name && name.trim().toLowerCase() !== supplier.name.toLowerCase()) {
      const conflict = await Supplier.findOne({ name: { $regex: new RegExp(`^${name.trim()}$`, "i") } });
      if (conflict) {
        return res.status(400).json({ message: "Another supplier with this name already exists." });
      }
      supplier.name = name.trim();
    }

    if (email) supplier.email = email.trim();
    if (phone) supplier.phone = phone.trim();
    if (address) supplier.address = address.trim();
    if (rating !== undefined) supplier.rating = Number(rating);

    const updated = await supplier.save();
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE a supplier (Restricted to admin, procurement)
exports.deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const supplier = await Supplier.findByIdAndDelete(id);

    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found." });
    }

    res.status(200).json({ message: "Supplier deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
