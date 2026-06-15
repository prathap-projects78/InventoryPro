import { useEffect, useState } from "react";
import { createProduct } from "../services/productService";
import { getCategories } from "../services/categoryService";

function ProductForm({ onProductAdded, onSuccess }) {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    quantity: "",
    price: "",
    supplier: ""
  });
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        console.error("Failed to load categories in form:", error);
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await createProduct({
        ...formData,
        quantity: Number(formData.quantity),
        price: Number(formData.price)
      });

      // Reset form fields
      setFormData({
        name: "",
        category: "",
        quantity: "",
        price: "",
        supplier: ""
      });

      if (onProductAdded) {
        onProductAdded();
      } else if (onSuccess) {
        onSuccess();
      }

      alert("Product Added Successfully");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to add product");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
      gap: "16px",
      alignItems: "end"
    }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <label style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Name</label>
        <input
          name="name"
          placeholder="e.g. Laptop"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <label style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Category</label>
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
        >
          <option value="">Choose Category</option>
          {categories.map((category) => (
            <option key={category._id} value={category._id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <label style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Quantity</label>
        <input
          type="number"
          name="quantity"
          placeholder="e.g. 50"
          value={formData.quantity}
          onChange={handleChange}
          required
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <label style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Price (₹)</label>
        <input
          type="number"
          name="price"
          placeholder="e.g. 1500"
          value={formData.price}
          onChange={handleChange}
          required
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <label style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Supplier</label>
        <input
          name="supplier"
          placeholder="Supplier Name"
          value={formData.supplier}
          onChange={handleChange}
          required
        />
      </div>

      <button type="submit" style={{ height: "46px" }}>
        Add Product
      </button>
    </form>
  );
}

export default ProductForm;