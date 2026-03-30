import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import OverviewPage from "./pages/OverviewPage";
import DashboardPage from "./pages/DashboardPage";
import ProductCataloguePage from "./pages/ProductCataloguePage";
import AddProductPage from "./pages/AddProductPage";
import CustomerOrdersPage from "./pages/CustomerOrdersPage";
import RecordSalePage from "./pages/RecordSalePage";
import AIAssistantPage from "./pages/AIAssistantPage";
import Sidebar from "./components/Sidebar";
import "./styles.css";

const PAGE_TITLES = {
  home:          { title: "Overview",           sub: "Your store at a glance" },
  dashboard:     { title: "Dashboard",          sub: "Analytics & performance insights" },
  ai:            { title: "Sage — AI Assistant",sub: "Your intelligent inventory assistant" },
  products:      { title: "Product Catalogue",  sub: "Manage your full inventory" },
  add:           { title: "Add New Product",    sub: "Register a new item" },
  "record-sale": { title: "Record a Sale",      sub: "Log an offline sale & update stock" },
  purchases:     { title: "Customer Orders",    sub: "Purchase history & order tracking" },
};

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className={`toast ${type}`}>
      <span>{type === "success" ? "✓" : "✕"}</span>
      {message}
    </div>
  );
}

function AppInner() {
  const { user } = useAuth();
  const [page, setPage]   = useState("home");
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => setToast({ message, type });

  if (!user) return <LoginPage />;

  const { title, sub } = PAGE_TITLES[page] || PAGE_TITLES.home;
  const isAI = page === "ai";

  const renderPage = () => {
    switch (page) {
      case "home":        return <OverviewPage setPage={setPage} />;
      case "dashboard":   return <DashboardPage />;
      case "ai":          return <AIAssistantPage />;
      case "products":    return <ProductCataloguePage setPage={setPage} onToast={showToast} />;
      case "add":         return <AddProductPage setPage={setPage} onToast={showToast} />;
      case "record-sale": return <RecordSalePage setPage={setPage} onToast={showToast} />;
      case "purchases":   return <CustomerOrdersPage />;
      default:            return <OverviewPage setPage={setPage} />;
    }
  };

  return (
    <div className="app-shell">
      <Sidebar activePage={page} setPage={setPage} />
      <div className="main-content" style={isAI ? { display: "flex", flexDirection: "column", overflow: "hidden" } : {}}>
        <header className="page-header">
          <div className="page-header-left">
            <h3>{title}</h3>
            <p>{sub}</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{
              width: 34, height: 34, borderRadius: "50%",
              background: "var(--accent)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "0.8rem", fontWeight: 600, color: "var(--primary)",
            }}>
              {user.initials}
            </div>
          </div>
        </header>
        {renderPage()}
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
