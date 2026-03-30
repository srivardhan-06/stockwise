import React, { useEffect, useState } from "react";
import { getPurchases } from "../services/ProductService";

const STATUS_BADGE = { Delivered: "success", Shipped: "info", Processing: "warning" };

export default function CustomerOrdersPage() {
  const [orders, setOrders]             = useState([]);
  const [search, setSearch]             = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterCategory, setFilterCategory] = useState("All");
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    getPurchases().then(r => { setOrders(r.data); setLoading(false); });
  }, []);

  const categories = ["All", ...new Set(orders.map(o => o.category).filter(Boolean))];
  const statuses   = ["All", "Delivered", "Shipped", "Processing"];

  const filtered = orders.filter(o => {
    const q           = search.toLowerCase();
    const matchSearch = (o.customer || "").toLowerCase().includes(q) ||
                        (o.product  || "").toLowerCase().includes(q) ||
                        (o.id       || "").toLowerCase().includes(q);
    const matchStatus   = filterStatus   === "All" || o.status   === filterStatus;
    const matchCategory = filterCategory === "All" || o.category === filterCategory;
    return matchSearch && matchStatus && matchCategory;
  });

  const totalRevenue    = filtered.reduce((s, o) => s + parseFloat(o.total || 0), 0);
  const uniqueCustomers = new Set(filtered.map(o => o.email)).size;

  return (
    <div className="page-body fade-in">
      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ marginBottom: "0.25rem" }}>Customer Orders</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>
          Full history of all purchases made by your customers
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "1.75rem" }}>
        {[
          { label: "Total Orders",       value: filtered.length,               icon: "◈", color: "blue"  },
          { label: "Unique Customers",   value: uniqueCustomers,               icon: "◫", color: "green" },
          { label: "Revenue (filtered)", value: `₹${totalRevenue.toFixed(2)}`, icon: "◆", color: "gold"  },
        ].map(k => (
          <div className="stat-card" key={k.label}>
            <div className={`stat-icon ${k.color}`}>{k.icon}</div>
            <div className="stat-value" style={{ fontSize: "1.6rem" }}>{k.value}</div>
            <div className="stat-label">{k.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem", flexWrap: "wrap", alignItems: "center" }}>
        <div className="search-bar" style={{ width: 280 }}>
          <span className="search-bar-icon">⌕</span>
          <input
            placeholder="Search customer, product, order ID…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="form-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          {statuses.map(s => <option key={s}>{s}</option>)}
        </select>
        <select className="form-select" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
          {categories.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>Loading orders…</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">◈</div>
            <h4>No orders found</h4>
            <p>{orders.length === 0 ? "Record your first sale to see it here" : "Try adjusting your filters"}</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Product Purchased</th>
                  <th>Category</th>
                  <th>Qty</th>
                  <th>Order Total</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(o => (
                  <tr key={o.id}>
                    <td style={{ fontFamily: "monospace", fontSize: "0.8rem", color: "var(--text-muted)" }}>{o.id}</td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{o.customer}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{o.email}</div>
                    </td>
                    <td>{o.product}</td>
                    <td><span className="badge badge-neutral">{o.category}</span></td>
                    <td style={{ textAlign: "center" }}>{o.qty}</td>
                    <td style={{ fontWeight: 600 }}>₹{parseFloat(o.total || 0).toFixed(2)}</td>
                    <td style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                      {o.date ? new Date(o.date).toLocaleDateString("en-IN") : "—"}
                    </td>
                    <td>
                      <span className={`badge badge-${STATUS_BADGE[o.status] || "neutral"}`}>
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {filtered.length > 0 && (
          <div className="card-footer" style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", color: "var(--text-muted)" }}>
            <span>Showing {filtered.length} of {orders.length} orders</span>
            <span>Total: <strong style={{ color: "var(--text-primary)" }}>₹{totalRevenue.toFixed(2)}</strong></span>
          </div>
        )}
      </div>
    </div>
  );
}
