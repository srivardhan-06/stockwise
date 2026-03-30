import React from "react";
import { useAuth } from "../context/AuthContext";

const NAV = [
  { section: "Main", items: [
    { id: "home",        icon: "⊞", label: "Overview"         },
    { id: "dashboard",   icon: "◫", label: "Dashboard"        },
    { id: "ai",          icon: "✦", label: "Sage AI Assistant", badge: "AI" },
  ]},
  { section: "Inventory", items: [
    { id: "products",    icon: "▦", label: "Product Catalogue" },
    { id: "add",         icon: "⊕", label: "Add New Product"   },
  ]},
  { section: "Sales", items: [
    { id: "record-sale", icon: "◉", label: "Record a Sale"     },
    { id: "purchases",   icon: "◈", label: "Customer Orders"   },
  ]},
];

export default function Sidebar({ activePage, setPage }) {
  const { user, logout } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <rect x="2" y="2" width="7" height="7" rx="1.5" fill="#1a1a2e"/>
            <rect x="11" y="2" width="7" height="7" rx="1.5" fill="#1a1a2e" opacity="0.7"/>
            <rect x="2" y="11" width="7" height="7" rx="1.5" fill="#1a1a2e" opacity="0.7"/>
            <rect x="11" y="11" width="7" height="7" rx="1.5" fill="#1a1a2e" opacity="0.5"/>
          </svg>
        </div>
        <div>
          <div className="sidebar-logo-text">Stockwise</div>
          <div className="sidebar-logo-sub">Inventory Suite</div>
        </div>
      </div>

      {NAV.map(({ section, items }) => (
        <div key={section} className="sidebar-section">
          <div className="sidebar-section-label">{section}</div>
          {items.map(item => (
            <button
              key={item.id}
              className={`nav-item${activePage === item.id ? " active" : ""}`}
              onClick={() => setPage(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
              {item.badge && (
                <span style={{
                  marginLeft: "auto",
                  background: item.badge === "AI" ? "linear-gradient(135deg, #c9a96e, #a07840)" : "var(--accent)",
                  color: "white",
                  fontSize: "0.58rem",
                  fontWeight: 700,
                  padding: "2px 6px",
                  borderRadius: "10px",
                  letterSpacing: "0.05em",
                }}>{item.badge}</span>
              )}
            </button>
          ))}
        </div>
      ))}

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="user-avatar">{user?.initials || "U"}</div>
          <div>
            <div className="user-info-name">{user?.name || "User"}</div>
            <div className="user-info-role">{user?.role || "Staff"}</div>
          </div>
          <button className="logout-btn" onClick={logout} title="Sign out">⎋</button>
        </div>
      </div>
    </aside>
  );
}
