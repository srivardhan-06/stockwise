import React, { useEffect, useState } from "react";
import { getProducts, recordSale } from "../services/ProductService";

const PAYMENT_MODES = ["Cash", "UPI", "Card", "Bank Transfer", "Cheque"];

export default function RecordSalePage({ setPage, onToast }) {
  const [products, setProducts]       = useState([]);
  const [selectedId, setSelectedId]   = useState("");
  const [qty, setQty]                 = useState(1);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [note, setNote]               = useState("");
  const [errors, setErrors]           = useState({});
  const [saving, setSaving]           = useState(false);
  const [lastSale, setLastSale]       = useState(null); // receipt after success

  useEffect(() => {
    getProducts().then(r => {
      // Only show products that have stock
      setProducts(r.data.filter(p => p.quantity > 0));
    });
  }, []);

  const selectedProduct = products.find(p => p.id === parseInt(selectedId));
  const saleTotal = selectedProduct ? (parseFloat(selectedProduct.price) * qty).toFixed(2) : "0.00";
  const stockAfter = selectedProduct ? parseInt(selectedProduct.quantity) - qty : null;
  const validate = () => {
    const e = {};
    if (!selectedId)              e.product = "Please select a product.";
    if (!customerName.trim())     e.name    = "Customer name is required.";
    if (!qty || qty < 1)          e.qty     = "Quantity must be at least 1.";
    if (selectedProduct && qty > selectedProduct.quantity)
      e.qty = `Only ${selectedProduct.quantity} unit(s) available.`;
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSaving(true);
    try {
      const res = await recordSale({
        productId: parseInt(selectedId),
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        qty: parseInt(qty),
        paymentMode,
        note: note.trim(),
      });
      setLastSale(res.data);
      onToast(`Sale recorded — ${res.data.sale.id}`, "success");
      // Reset form
      setSelectedId(""); setQty(1); setCustomerName("");
      setCustomerPhone(""); setNote(""); setErrors({});
      // Refresh available products (stock changed)
      getProducts().then(r => setProducts(r.data.filter(p => p.quantity > 0)));
    } catch (err) {
      setErrors({ qty: err.message });
    }
    setSaving(false);
  };

  return (
    <div className="page-body fade-in">
      <div style={{ marginBottom: "2rem" }}>
        <button onClick={() => setPage("home")}
          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "0.85rem", padding: 0, marginBottom: "0.75rem" }}>
          ← Back to Overview
        </button>
        <h2 style={{ marginBottom: "0.25rem" }}>Record Offline Sale</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>
          Log a sale made in-store. Stock will be deducted automatically and the order will appear in Customer Orders.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "1.5rem", alignItems: "start" }}>

        {/* ── Main form ── */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Sale Details</span>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="card-body">

              {/* Product selector */}
              <div className="form-section">
                <div className="form-section-title">Product Being Sold</div>

                <div className="form-group">
                  <label className="form-label">Select Product *</label>
                  <select
                    className="form-select"
                    style={{ width: "100%", ...(errors.product ? { borderColor: "var(--danger)" } : {}) }}
                    value={selectedId}
                    onChange={e => { setSelectedId(e.target.value); setQty(1); setErrors({}); }}
                  >
                    <option value="">— Choose a product —</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name}  ({p.quantity} in stock) — ₹{p.price}
                      </option>
                    ))}
                  </select>
                  {errors.product && <div style={{ color: "var(--danger)", fontSize: "0.8rem", marginTop: "0.3rem" }}>{errors.product}</div>}
                </div>

                {/* Live product info card */}
                {selectedProduct && (
                  <div style={{
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-md)",
                    padding: "1rem",
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "1rem",
                    marginBottom: "1rem",
                  }}>
                    {[
                     { label: "Unit Price",    value: `₹${parseFloat(selectedProduct.price).toFixed(2)}` },
                      { label: "Current Stock", value: selectedProduct.quantity },
                      { label: "Category",      value: selectedProduct.category },
                    ].map(d => (
                      <div key={d.label}>
                        <div style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: "0.2rem" }}>{d.label}</div>
                        <div style={{ fontWeight: 500 }}>{d.value}</div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Quantity Sold *</label>
                  <input
                    className="form-input"
                    type="number"
                    min="1"
                    max={selectedProduct?.quantity || 999}
                    value={qty}
                    onChange={e => { setQty(parseInt(e.target.value) || 1); setErrors(prev => ({ ...prev, qty: "" })); }}
                    style={errors.qty ? { borderColor: "var(--danger)" } : {}}
                  />
                  {errors.qty && <div style={{ color: "var(--danger)", fontSize: "0.8rem", marginTop: "0.3rem" }}>⚠ {errors.qty}</div>}
                  {selectedProduct && !errors.qty && (
                    <div className="form-hint">
                      Stock after this sale:&nbsp;
                      <strong style={{ color: stockAfter === 0 ? "var(--danger)" : stockAfter <= 10 ? "var(--warning)" : "var(--success)" }}>
                        {Math.max(0, stockAfter)} units
                        {stockAfter === 0 ? " — Out of Stock" : stockAfter <= 10 ? " — Low Stock" : ""}
                      </strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Customer info */}
              <div className="form-section">
                <div className="form-section-title">Customer Information</div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Customer Name *</label>
                    <input
                      className="form-input"
                      placeholder="e.g. Rahul Sharma"
                      value={customerName}
                      onChange={e => { setCustomerName(e.target.value); setErrors(prev => ({ ...prev, name: "" })); }}
                      style={errors.name ? { borderColor: "var(--danger)" } : {}}
                    />
                    {errors.name && <div style={{ color: "var(--danger)", fontSize: "0.8rem", marginTop: "0.3rem" }}>{errors.name}</div>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input
                      className="form-input"
                      placeholder="e.g. 9876543210"
                      value={customerPhone}
                      onChange={e => setCustomerPhone(e.target.value)}
                    />
                    <div className="form-hint">Optional — for follow-up</div>
                  </div>
                </div>
              </div>

              {/* Payment */}
              <div className="form-section">
                <div className="form-section-title">Payment Details</div>

                <div className="form-group">
                  <label className="form-label">Payment Mode</label>
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                    {PAYMENT_MODES.map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setPaymentMode(m)}
                        style={{
                          padding: "0.45rem 1rem",
                          borderRadius: "20px",
                          border: paymentMode === m ? "2px solid var(--accent)" : "1.5px solid var(--border-strong)",
                          background: paymentMode === m ? "rgba(201,169,110,0.1)" : "transparent",
                          color: paymentMode === m ? "var(--accent-dark)" : "var(--text-secondary)",
                          fontFamily: "DM Sans, sans-serif",
                          fontSize: "0.85rem",
                          fontWeight: paymentMode === m ? 500 : 400,
                          cursor: "pointer",
                          transition: "all 0.15s",
                        }}
                      >
                        {m === "Cash" ? "💵" : m === "UPI" ? "📱" : m === "Card" ? "💳" : m === "Cheque" ? "📝" : "🏦"} {m}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Note / Remarks</label>
                  <textarea
                    className="form-input"
                    placeholder="e.g. Bulk purchase, discount applied, exchange item…"
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    rows={2}
                    style={{ resize: "vertical" }}
                  />
                </div>
              </div>
            </div>

            <div className="card-footer" style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
              <button type="button" className="btn btn-outline" onClick={() => setPage("home")}>Cancel</button>
              <button type="submit" className="btn btn-primary" style={{ width: "auto", minWidth: 180 }} disabled={saving}>
                {saving ? "Recording…" : "✓ Confirm Sale"}
              </button>
            </div>
          </form>
        </div>

        {/* ── Right: Order summary + last receipt ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

          {/* Live bill preview */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Order Summary</span>
            </div>
            <div className="card-body">
              {!selectedProduct ? (
                <div style={{ textAlign: "center", padding: "1.5rem 0", color: "var(--text-muted)", fontSize: "0.88rem" }}>
                  Select a product to see the bill preview
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: "1rem" }}>
                    <div style={{ fontWeight: 500, marginBottom: "0.25rem" }}>{selectedProduct.name}</div>
                    <div style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>{selectedProduct.sku} · {selectedProduct.category}</div>
                  </div>

                  {[
                   { label: "Unit Price",  value: `₹${parseFloat(selectedProduct.price).toFixed(2)}` },
                    { label: "Quantity",    value: `× ${qty}` },
                    { label: "Payment",     value: paymentMode },
                  ].map(r => (
                    <div key={r.label} style={{ display: "flex", justifyContent: "space-between", padding: "0.4rem 0", borderBottom: "1px solid var(--border)", fontSize: "0.88rem" }}>
                      <span style={{ color: "var(--text-muted)" }}>{r.label}</span>
                      <span>{r.value}</span>
                    </div>
                  ))}

                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1rem", alignItems: "baseline" }}>
                    <span style={{ fontWeight: 500 }}>Total Amount</span>
                    <span style={{ fontSize: "1.5rem", fontWeight: 300, letterSpacing: "-0.02em" }}>₹{saleTotal}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Last recorded sale receipt */}
          {lastSale && (
            <div className="card" style={{ border: "1.5px solid rgba(45,106,79,0.3)" }}>
              <div className="card-header" style={{ background: "var(--success-bg)" }}>
                <span style={{ color: "var(--success)", fontWeight: 500, fontSize: "0.9rem" }}>✓ Last Sale Recorded</span>
                <span className="badge badge-success">{lastSale.sale.id}</span>
              </div>
              <div className="card-body" style={{ fontSize: "0.85rem" }}>
                {[
                  { label: "Customer",  value: lastSale.sale.customer },
                  { label: "Product",   value: lastSale.sale.product },
                  { label: "Qty Sold",  value: lastSale.sale.qty },
                  { label: "Amount",    value: `₹${lastSale.sale.total.toFixed(2)}` },
                  { label: "Payment",   value: lastSale.sale.paymentMode },
                  { label: "Stock Left",value: `${lastSale.updatedProduct.quantity} units (${lastSale.updatedProduct.status})` },
                ].map(r => (
                  <div key={r.label} style={{ display: "flex", justifyContent: "space-between", padding: "0.35rem 0", borderBottom: "1px solid var(--border)" }}>
                    <span style={{ color: "var(--text-muted)" }}>{r.label}</span>
                    <span style={{ fontWeight: 500 }}>{r.value}</span>
                  </div>
                ))}
              </div>
              <div className="card-footer">
                <button className="btn btn-outline btn-sm" onClick={() => setPage("purchases")} style={{ width: "100%" }}>
                  View in Customer Orders →
                </button>
              </div>
            </div>
          )}

          {/* Quick stock alert */}
          {products.filter(p => p.quantity <= 10).length > 0 && (
            <div style={{
              background: "var(--warning-bg)",
              border: "1px solid rgba(123,94,0,0.2)",
              borderRadius: "var(--radius-md)",
              padding: "1rem",
              fontSize: "0.85rem",
            }}>
              <div style={{ fontWeight: 500, color: "var(--warning)", marginBottom: "0.5rem" }}>⚠ Low Stock Alert</div>
              {products.filter(p => p.quantity <= 10).map(p => (
                <div key={p.id} style={{ display: "flex", justifyContent: "space-between", padding: "0.25rem 0", color: "var(--text-secondary)" }}>
                  <span>{p.name}</span>
                  <span style={{ fontWeight: 500 }}>{p.quantity} left</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
