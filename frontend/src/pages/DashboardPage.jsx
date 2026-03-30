import React, { useEffect, useState } from "react";
import { getDashboardStats, getProducts } from "../services/ProductService";

export default function DashboardPage() {
  const [stats, setStats]       = useState(null);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    getDashboardStats().then(r => setStats(r.data));
    getProducts().then(r => setProducts(r.data));
  }, []);

  const categoryMap = {};
  products.forEach(p => {
    categoryMap[p.category] = (categoryMap[p.category] || 0) + 1;
  });

  const stockSummary = [
    { label: "In Stock",     count: products.filter(p => parseInt(p.quantity) > 10).length,   color: "var(--success)" },
    { label: "Low Stock",    count: products.filter(p => parseInt(p.quantity) > 0 && parseInt(p.quantity) <= 10).length, color: "var(--warning)" },
    { label: "Out of Stock", count: products.filter(p => parseInt(p.quantity) === 0).length,  color: "var(--danger)"  },
  ];

  const totalInventoryValue = products.reduce(
    (s, p) => s + parseFloat(p.price || 0) * parseInt(p.quantity || 0), 0
  );

  return (
    <div className="page-body fade-in">
      <div className="page-hero" style={{ marginBottom: "2rem" }}>
        <div className="page-hero-label">Analytics</div>
        <h1>Dashboard</h1>
        <p>A real-time overview of your inventory health and sales performance.</p>
      </div>

      <div className="stats-grid stagger" style={{ marginBottom: "2rem" }}>
        {[
          { icon: "◆", color: "gold",  label: "Total Revenue",   value: stats ? `₹${parseFloat(stats.totalRevenue || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}` : "—" },
          { icon: "◈", color: "blue",  label: "Customer Orders", value: stats?.totalOrders ?? "—" },
          { icon: "▦", color: "green", label: "Inventory Value", value: `₹${totalInventoryValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}` },
          { icon: "⚠", color: "red",   label: "Stock Alerts",    value: stats ? (parseInt(stats.lowStock || 0) + parseInt(stats.outOfStock || 0)) : "—" },
        ].map(k => (
          <div className="stat-card" key={k.label}>
            <div className={`stat-icon ${k.color}`}>{k.icon}</div>
            <div className="stat-value">{k.value}</div>
            <div className="stat-label">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ marginBottom: "1.5rem" }}>
        <div className="card">
          <div className="card-header">
            <span className="card-title">Stock Health</span>
            <span className="badge badge-neutral">{products.length} products</span>
          </div>
          <div className="card-body">
            {stockSummary.map(s => (
              <div key={s.label} style={{ marginBottom: "1.25rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                  <span style={{ fontSize: "0.85rem" }}>{s.label}</span>
                  <span style={{ fontWeight: 500, fontSize: "0.85rem" }}>{s.count}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: products.length ? `${(s.count / products.length) * 100}%` : "0%", background: s.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Product Categories</span>
          </div>
          <div className="card-body">
            {Object.entries(categoryMap).length === 0 ? (
              <div style={{ textAlign: "center", padding: "2rem 0", color: "var(--text-muted)", fontSize: "0.88rem" }}>
                No products added yet
              </div>
            ) : Object.entries(categoryMap).map(([cat, count]) => (
              <div key={cat} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.6rem 0", borderBottom: "1px solid var(--border)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: cat === "Electronics" ? "#2563eb" : cat === "Furniture" ? "#c9a96e" : cat === "Fitness" ? "#2d6a4f" : "#9b2226" }} />
                  <span style={{ fontSize: "0.88rem" }}>{cat}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <div className="progress-bar" style={{ width: 80 }}>
                    <div className="progress-fill" style={{ width: `${(count / products.length) * 100}%` }} />
                  </div>
                  <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", minWidth: 20, textAlign: "right" }}>{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Recent Activity</span>
          <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Last 24 hours</span>
        </div>
        <div className="card-body">
          {[
            { text: "Stock levels updated after offline sale", time: "2 hours ago" },
            { text: "New customer order recorded by manager", time: "4 hours ago" },
            { text: "Product catalogue synced with database",  time: "6 hours ago" },
            { text: "Dashboard stats refreshed",              time: "9 hours ago" },
            { text: "Inventory audit completed",              time: "12 hours ago" },
          ].map((a, i) => (
            <div key={i} className="activity-item">
              <div className="activity-dot" />
              <div>
                <div className="activity-text">{a.text}</div>
                <div className="activity-time">{a.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
