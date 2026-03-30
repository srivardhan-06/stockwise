import React, { useEffect, useState } from "react";
import { getDashboardStats } from "../services/ProductService";
import { useAuth } from "../context/AuthContext";

export default function OverviewPage({ setPage }) {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getDashboardStats().then(r => setStats(r.data));
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const quickActions = [
    { icon: "⊕", label: "Add Product",      sub: "Register a new item to catalogue", page: "add",         color: "#c9a96e" },
    { icon: "◫", label: "View Dashboard",   sub: "Analytics & performance overview", page: "dashboard",   color: "#2563eb" },
    { icon: "◈", label: "Customer Orders",  sub: "Browse all purchase records",      page: "purchases",   color: "#2d6a4f" },
    { icon: "▦", label: "Product Catalogue",sub: "Manage your full inventory",       page: "products",    color: "#9b2226" },
  ];

  const highlights = stats ? [
    { label: "Total Revenue",   value: `₹${parseFloat(stats.totalRevenue || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`, icon: "◆", color: "gold"  },
    { label: "Total Orders",    value: stats.totalOrders   || 0,  icon: "◈", color: "blue"  },
    { label: "Products Listed", value: stats.totalProducts || 0,  icon: "▦", color: "green" },
    { label: "Low / Out Stock", value: `${stats.lowStock || 0} / ${stats.outOfStock || 0}`, icon: "⚠", color: "red" },
  ] : [];

  return (
    <div className="page-body fade-in">
      <div className="page-hero" style={{ marginBottom: "2rem" }}>
        <div className="page-hero-label">Overview</div>
        <h1>{greeting}, {user?.name?.split(" ")[0]} 👋</h1>
        <p>Here's what's happening with your store today. Everything looks on track.</p>
      </div>

      <div className="stats-grid stagger" style={{ marginBottom: "2rem" }}>
        {highlights.map(h => (
          <div className="stat-card" key={h.label}>
            <div className={`stat-icon ${h.color}`}>{h.icon}</div>
            <div className="stat-value">{h.value}</div>
            <div className="stat-label">{h.label}</div>
          </div>
        ))}
      </div>

      <h3 style={{ marginBottom: "1rem", fontFamily: "DM Sans", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
        Quick Actions
      </h3>
      <div className="grid-2 stagger" style={{ marginBottom: "2rem" }}>
        {quickActions.map(a => (
          <button
            key={a.page}
            onClick={() => setPage(a.page)}
            style={{
              background: "var(--surface)", border: "1px solid var(--border)",
              borderRadius: "var(--radius-lg)", padding: "1.5rem",
              display: "flex", alignItems: "flex-start", gap: "1rem",
              cursor: "pointer", textAlign: "left", transition: "all 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "var(--shadow-md)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
          >
            <div style={{ width: 44, height: 44, borderRadius: "var(--radius-sm)", background: `${a.color}18`, color: a.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", flexShrink: 0 }}>{a.icon}</div>
            <div>
              <div style={{ fontWeight: 500, marginBottom: "0.25rem" }}>{a.label}</div>
              <div style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>{a.sub}</div>
            </div>
            <div style={{ marginLeft: "auto", color: "var(--text-muted)", alignSelf: "center" }}>→</div>
          </button>
        ))}
      </div>

      {stats?.recentOrders && stats.recentOrders.length > 0 && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">Recent Orders</span>
            <button className="btn btn-outline btn-sm" onClick={() => setPage("purchases")}>View all →</button>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Product</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map(o => (
                  <tr key={o.id}>
                    <td style={{ fontFamily: "monospace", fontSize: "0.82rem", color: "var(--text-muted)" }}>{o.id}</td>
                    <td style={{ fontWeight: 500 }}>{o.customer}</td>
                    <td>{o.product}</td>
                    <td>₹{parseFloat(o.total || 0).toFixed(2)}</td>
                    <td>
                      <span className={`badge badge-${o.status === "Delivered" ? "success" : o.status === "Shipped" ? "info" : "warning"}`}>
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
