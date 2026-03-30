import React, { useEffect, useState } from "react";
import { getProducts, deleteProduct } from "../services/ProductService";

const CATEGORY_ICONS = {
  Electronics: "🔌", Furniture: "🪑", Lifestyle: "🌿", Fitness: "🏋️", General: "📦"
};

export default function ProductCataloguePage({ setPage, onToast }) {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getProducts().then(r => { setProducts(r.data); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const handleDelete = (id, name) => {
    if (!window.confirm(`Remove "${name}" from catalogue?`)) return;
    deleteProduct(id).then(() => {
      onToast(`"${name}" removed successfully`, "success");
      load();
    });
  };

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "All" || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="page-body fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
        <div>
          <h2 style={{ marginBottom: "0.25rem" }}>Product Catalogue</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>
            {products.length} products registered in your inventory
          </p>
        </div>
        <button className="btn btn-accent" onClick={() => setPage("add")}>⊕ Add Product</button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <div className="search-bar">
          <span className="search-bar-icon">⌕</span>
          <input
            placeholder="Search by name or SKU…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="form-select"
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
        >
          {["All", "In Stock", "Low Stock", "Out of Stock"].map(s => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="card">
        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>Loading catalogue…</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <h4>No products found</h4>
            <p>Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <div className="product-thumb">
                          {CATEGORY_ICONS[p.category] || "📦"}
                        </div>
                        <span style={{ fontWeight: 500 }}>{p.name}</span>
                      </div>
                    </td>
                    <td style={{ fontFamily: "monospace", fontSize: "0.82rem", color: "var(--text-muted)" }}>{p.sku}</td>
                    <td>
                      <span className="badge badge-neutral">{p.category}</span>
                    </td>
                    <td>
                      <span style={{
                        fontWeight: 500,
                        color: p.quantity === 0 ? "var(--danger)" : p.quantity <= 10 ? "var(--warning)" : "inherit"
                      }}>
                        {p.quantity}
                      </span>
                    </td>
                    <td style={{ fontWeight: 500 }}>₹{parseFloat(p.price).toFixed(2)}</td>
                    <td>
                      <span className={`badge badge-${
                        p.status === "In Stock" ? "success" :
                        p.status === "Low Stock" ? "warning" : "danger"
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(p.id, p.name)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filtered.length > 0 && (
          <div className="card-footer" style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
            Showing {filtered.length} of {products.length} products
          </div>
        )}
      </div>
    </div>
  );
}
