import React, { useState } from "react";
import { addProduct } from "../services/ProductService";

const CATEGORIES = ["Electronics", "Furniture", "Lifestyle", "Fitness", "General", "Clothing", "Food & Beverage"];

export default function AddProductPage({ setPage, onToast }) {
  const [form, setForm] = useState({
    name: "", category: "General", quantity: "", price: "", description: ""
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const set = (field, val) => {
    setForm(f => ({ ...f, [field]: val }));
    setErrors(e => ({ ...e, [field]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim())     errs.name     = "Product name is required";
    if (!form.quantity || isNaN(form.quantity) || +form.quantity < 0) errs.quantity = "Enter a valid quantity";
    if (!form.price    || isNaN(form.price)    || +form.price    <= 0) errs.price    = "Enter a valid price";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    await addProduct(form);
    setSaving(false);
    onToast(`"${form.name}" added to catalogue`, "success");
    setPage("products");
  };

  const handleReset = () => {
    setForm({ name: "", category: "General", quantity: "", price: "", description: "" });
    setErrors({});
  };

  return (
    <div className="page-body fade-in">
      <div style={{ maxWidth: 680 }}>
        <div style={{ marginBottom: "2rem" }}>
          <button
            onClick={() => setPage("products")}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "0.85rem", padding: 0, marginBottom: "1rem" }}
          >
            ← Back to Catalogue
          </button>
          <h2 style={{ marginBottom: "0.25rem" }}>Add New Product</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>
            Fill in the details to register a new item in your inventory
          </p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="card-body">

              {/* Basic Details */}
              <div className="form-section">
                <div className="form-section-title">Basic Information</div>

                <div className="form-group">
                  <label className="form-label">Product Name *</label>
                  <input
                    className="form-input"
                    placeholder="e.g. Wireless Bluetooth Speaker"
                    value={form.name}
                    onChange={e => set("name", e.target.value)}
                    style={errors.name ? { borderColor: "var(--danger)" } : {}}
                  />
                  {errors.name && <div style={{ color: "var(--danger)", fontSize: "0.8rem", marginTop: "0.3rem" }}>{errors.name}</div>}
                </div>

                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    style={{ width: "100%" }}
                    value={form.category}
                    onChange={e => set("category", e.target.value)}
                  >
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-input"
                    placeholder="Brief description of the product (optional)"
                    value={form.description}
                    onChange={e => set("description", e.target.value)}
                    rows={3}
                    style={{ resize: "vertical" }}
                  />
                  <div className="form-hint">Helps staff identify the product quickly</div>
                </div>
              </div>

              {/* Pricing & Stock */}
              <div className="form-section">
                <div className="form-section-title">Pricing & Stock</div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Unit Price (₹) *</label>
                    <input
                      className="form-input"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={form.price}
                      onChange={e => set("price", e.target.value)}
                      style={errors.price ? { borderColor: "var(--danger)" } : {}}
                    />
                    {errors.price && <div style={{ color: "var(--danger)", fontSize: "0.8rem", marginTop: "0.3rem" }}>{errors.price}</div>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Opening Quantity *</label>
                    <input
                      className="form-input"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={form.quantity}
                      onChange={e => set("quantity", e.target.value)}
                      style={errors.quantity ? { borderColor: "var(--danger)" } : {}}
                    />
                    {errors.quantity && <div style={{ color: "var(--danger)", fontSize: "0.8rem", marginTop: "0.3rem" }}>{errors.quantity}</div>}
                  </div>
                </div>

                {/* Stock status preview */}
                {form.quantity !== "" && (
                  <div style={{
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-sm)",
                    padding: "0.75rem 1rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    fontSize: "0.85rem",
                  }}>
                    <span>Stock status preview:</span>
                    <span className={`badge badge-${
                      +form.quantity === 0 ? "danger" :
                      +form.quantity <= 10 ? "warning" : "success"
                    }`}>
                      {+form.quantity === 0 ? "Out of Stock" : +form.quantity <= 10 ? "Low Stock" : "In Stock"}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="card-footer" style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
              <button type="button" className="btn btn-outline" onClick={handleReset}>
                Clear Form
              </button>
              <button type="submit" className="btn btn-primary" style={{ width: "auto", minWidth: 160 }} disabled={saving}>
                {saving ? "Saving…" : "⊕ Add to Catalogue"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
