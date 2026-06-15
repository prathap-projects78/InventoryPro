import { useEffect, useState } from "react";
import { createOrder } from "../services/orderService";
import { getProducts } from "../services/productService";

function OrderForm({ onOrderAdded }) {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    product: "",
    quantity: "",
    supplier: ""
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (error) {
        console.error("Failed to load products in order form:", error);
      }
    };

    fetchProducts();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.product || !formData.quantity || !formData.supplier) {
      alert("Please fill out all fields");
      return;
    }

    try {
      await createOrder({
        ...formData,
        quantity: Number(formData.quantity)
      });

      setFormData({
        product: "",
        quantity: "",
        supplier: ""
      });

      if (onOrderAdded) {
        onOrderAdded();
      }

      alert("Purchase Order Created Successfully");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to create order");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: "16px",
      alignItems: "end"
    }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <label style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Choose Product</label>
        <select
          name="product"
          value={formData.product}
          onChange={handleChange}
          required
        >
          <option value="">Select Product</option>
          {products.map((product) => (
            <option key={product._id} value={product._id}>
              {product.name} ({product.quantity} in stock)
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <label style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Quantity</label>
        <input
          type="number"
          name="quantity"
          placeholder="e.g. 100"
          value={formData.quantity}
          onChange={handleChange}
          required
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <label style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Supplier</label>
        <input
          type="text"
          name="supplier"
          placeholder="e.g. Global Distributors"
          value={formData.supplier}
          onChange={handleChange}
          required
        />
      </div>

      <button type="submit" style={{ height: "46px" }}>
        Create Order
      </button>
    </form>
  );
}

export default OrderForm;