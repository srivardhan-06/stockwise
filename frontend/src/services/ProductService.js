// All functions now call the real Express + MySQL backend
// Make sure your backend is running on http://localhost:5000

const API = "http://localhost:5000/api";

// ── Helper: calculate status label from quantity ──
const calcStatus = (qty) =>
  qty === 0 ? "Out of Stock" : qty <= 10 ? "Low Stock" : "In Stock";

// ────────────────────────────────────────────────────
// PRODUCTS
// ────────────────────────────────────────────────────

export async function getProducts() {
  const res  = await fetch(`${API}/products`);
  const data = await res.json();
  return { data };
}

export async function addProduct(product) {
  const qty = parseInt(product.quantity);
  const body = {
    ...product,
    price:    parseFloat(product.price),
    quantity: qty,
    sku:      `PRD-${Date.now().toString().slice(-4)}`,
    status:   calcStatus(qty),
    category: product.category || "General",
  };
  const res  = await fetch(`${API}/products`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(body),
  });
  const data = await res.json();
  return { data };
}

export async function deleteProduct(id) {
  await fetch(`${API}/products/${id}`, { method: "DELETE" });
  return { data: { success: true } };
}

// ────────────────────────────────────────────────────
// RECORD A SALE
// ────────────────────────────────────────────────────

export async function recordSale({ productId, customerName, customerPhone, qty, paymentMode, note }) {
  const res  = await fetch(`${API}/sales`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ productId, customerName, customerPhone, qty, paymentMode, note }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Sale failed");
  return { data };
}

// ────────────────────────────────────────────────────
// PURCHASES
// ────────────────────────────────────────────────────

export async function getPurchases() {
  const res  = await fetch(`${API}/purchases`);
  const data = await res.json();
  return { data };
}

// ────────────────────────────────────────────────────
// DASHBOARD STATS
// ────────────────────────────────────────────────────

export async function getDashboardStats() {
  const res  = await fetch(`${API}/dashboard`);
  const data = await res.json();
  return { data };
}
