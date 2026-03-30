import React, { useState, useEffect, useRef } from "react";
import { getProducts, getPurchases, getDashboardStats } from "../services/ProductService";
import { useAuth } from "../context/AuthContext";

async function askClaude(messages, systemPrompt) {
  const response = await fetch("http://localhost:5000/api/ai/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, system: systemPrompt }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || "API error");
  return data.content[0].text;
}
// ── Suggestion chips ──────────────────────────────
const SUGGESTIONS = [
  "What is my total revenue?",
  "Which product has the lowest stock?",
  "Who are my top customers?",
  "How many orders were placed this month?",
  "What is the most sold product?",
  "Show me all out of stock products",
  "Calculate average order value",
  "Which category earns the most?",
];

// ── Format AI reply with basic markdown ──────────
function FormattedMessage({ text }) {
  const lines = text.split("\n");
  return (
    <div style={{ lineHeight: 1.7 }}>
      {lines.map((line, i) => {
        if (line.startsWith("### ")) return <div key={i} style={{ fontWeight: 600, fontSize: "1rem", margin: "0.75rem 0 0.25rem" }}>{line.replace("### ", "")}</div>;
        if (line.startsWith("## "))  return <div key={i} style={{ fontWeight: 600, fontSize: "1.05rem", margin: "0.75rem 0 0.25rem" }}>{line.replace("## ", "")}</div>;
        if (line.startsWith("**") && line.endsWith("**")) return <div key={i} style={{ fontWeight: 600 }}>{line.replace(/\*\*/g, "")}</div>;
        if (line.startsWith("- ") || line.startsWith("• ")) return (
          <div key={i} style={{ display: "flex", gap: "0.5rem", margin: "0.15rem 0" }}>
            <span style={{ color: "var(--accent)", flexShrink: 0 }}>◆</span>
            <span>{line.replace(/^[-•] /, "")}</span>
          </div>
        );
        if (line.match(/^\d+\. /)) return (
          <div key={i} style={{ display: "flex", gap: "0.5rem", margin: "0.15rem 0" }}>
            <span style={{ color: "var(--accent)", flexShrink: 0, minWidth: 18 }}>{line.match(/^\d+/)[0]}.</span>
            <span>{line.replace(/^\d+\. /, "")}</span>
          </div>
        );
        if (line.trim() === "") return <div key={i} style={{ height: "0.4rem" }} />;
        // Bold inline **text**
        if (line.includes("**")) {
          const parts = line.split(/\*\*(.*?)\*\*/g);
          return (
            <div key={i}>
              {parts.map((p, j) => j % 2 === 1 ? <strong key={j}>{p}</strong> : p)}
            </div>
          );
        }
        return <div key={i}>{line}</div>;
      })}
    </div>
  );
}

export default function AIAssistantPage() {
  const { user } = useAuth();
  const [messages, setMessages]   = useState([]);
  const [input, setInput]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [storeData, setStoreData] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  // ── Load all store data on mount ─────────────────
  useEffect(() => {
    Promise.all([
      getProducts(),
      getPurchases(),
      getDashboardStats(),
    ]).then(([p, pur, s]) => {
      setStoreData({
        products:  p.data,
        purchases: pur.data,
        stats:     s.data,
      });
      setDataLoading(false);
    }).catch(() => setDataLoading(false));
  }, []);

  // ── Auto scroll to bottom ─────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // ── Build system prompt with live store data ──────
  const buildSystemPrompt = () => {
    if (!storeData) return "";

    const { products, purchases, stats } = storeData;
    const totalRevenue = purchases.reduce((s, o) => s + parseFloat(o.total || 0), 0);

    // Revenue per customer
    const customerRevenue = {};
    purchases.forEach(o => {
      customerRevenue[o.customer] = (customerRevenue[o.customer] || 0) + parseFloat(o.total || 0);
    });

    // Revenue per product
    const productRevenue = {};
    purchases.forEach(o => {
      productRevenue[o.product] = (productRevenue[o.product] || 0) + parseFloat(o.total || 0);
    });

    // Revenue per category
    const categoryRevenue = {};
    purchases.forEach(o => {
      categoryRevenue[o.category] = (categoryRevenue[o.category] || 0) + parseFloat(o.total || 0);
    });

    return `You are Sage, an expert AI inventory assistant for Stockwise — a store management system.
You are talking to ${user?.name || "the store manager"} (${user?.role || "Manager"}).
Be helpful, concise, and professional. Use ₹ for currency. Always back answers with exact numbers from the data.

=== LIVE STORE DATA (as of right now) ===

PRODUCTS (${products.length} total):
${products.map(p => `- ${p.name} | SKU: ${p.sku} | Category: ${p.category} | Stock: ${p.quantity} | Price: ₹${p.price} | Status: ${p.status}`).join("\n")}

ORDERS (${purchases.length} total):
${purchases.map(o => `- ${o.id} | Customer: ${o.customer} | Product: ${o.product} | Qty: ${o.qty} | Total: ₹${parseFloat(o.total||0).toFixed(2)} | Date: ${o.date} | Payment: ${o.payment_mode || "N/A"} | Status: ${o.status}`).join("\n")}

REVENUE SUMMARY:
- Total Revenue: ₹${totalRevenue.toFixed(2)}
- Total Orders: ${purchases.length}
- Average Order Value: ₹${purchases.length ? (totalRevenue / purchases.length).toFixed(2) : "0.00"}

REVENUE BY CUSTOMER:
${Object.entries(customerRevenue).sort((a,b) => b[1]-a[1]).map(([name, rev]) => `- ${name}: ₹${rev.toFixed(2)}`).join("\n")}

REVENUE BY PRODUCT:
${Object.entries(productRevenue).sort((a,b) => b[1]-a[1]).map(([name, rev]) => `- ${name}: ₹${rev.toFixed(2)}`).join("\n")}

REVENUE BY CATEGORY:
${Object.entries(categoryRevenue).sort((a,b) => b[1]-a[1]).map(([cat, rev]) => `- ${cat}: ₹${rev.toFixed(2)}`).join("\n")}

STOCK ALERTS:
- Low Stock: ${products.filter(p => parseInt(p.quantity) > 0 && parseInt(p.quantity) <= 10).map(p => `${p.name} (${p.quantity} left)`).join(", ") || "None"}
- Out of Stock: ${products.filter(p => parseInt(p.quantity) === 0).map(p => p.name).join(", ") || "None"}

You can answer questions about:
- Revenue calculations (total, by customer, by product, by category, by date range)
- Stock levels, low stock alerts, reorder suggestions
- Best selling products and top customers
- Order history and patterns
- Business insights and recommendations
- Any calculations or analysis on the above data

Always be accurate with numbers. If asked about a specific customer, look them up in the data above.`;
  };

  // ── Send message ──────────────────────────────────
  const sendMessage = async (text) => {
    const userText = (text || input).trim();
    if (!userText || loading) return;

    setInput("");
    const newMessages = [...messages, { role: "user", content: userText }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const systemPrompt = buildSystemPrompt();
      const apiMessages  = newMessages.map(m => ({ role: m.role, content: m.content }));
      const reply        = await askClaude(apiMessages, systemPrompt);
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: `Sorry, I couldn't connect to the AI service. Error: ${err.message}\n\nMake sure your Anthropic API key is configured in the backend.`,
        isError: true,
      }]);
    }
    setLoading(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => setMessages([]);

  return (
    <div className="page-body fade-in" style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 64px)", padding: 0 }}>

      {/* ── Header ── */}
      <div style={{ padding: "1.5rem 2rem 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
          <div>
            <h2 style={{ marginBottom: "0.25rem" }}>Sage — AI Assistant</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>
              Ask anything about your inventory, sales, customers, and revenue
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            {dataLoading ? (
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Loading store data…</span>
            ) : (
              <span style={{ fontSize: "0.8rem", color: "var(--success)", background: "var(--success-bg)", padding: "0.25rem 0.75rem", borderRadius: "20px" }}>
                ● Live data connected
              </span>
            )}
            {messages.length > 0 && (
              <button className="btn btn-outline btn-sm" onClick={clearChat}>Clear chat</button>
            )}
          </div>
        </div>
      </div>

      {/* ── Chat area ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 2rem" }}>

        {/* Welcome screen */}
        {messages.length === 0 && (
          <div style={{ textAlign: "center", padding: "2rem 1rem" }}>
            <div style={{
              width: 64, height: 64, borderRadius: "50%",
              background: "var(--primary)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 1rem",
              fontSize: "1.5rem",
            }}>✦</div>
            <h3 style={{ marginBottom: "0.5rem" }}>Hi {user?.name?.split(" ")[0]}, I'm Sage</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", maxWidth: 400, margin: "0 auto 2rem" }}>
              Your intelligent store assistant. I have full access to your live inventory, orders, and sales data. Ask me anything!
            </p>

            {/* Suggestion chips */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", justifyContent: "center", maxWidth: 640, margin: "0 auto" }}>
              {SUGGESTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  style={{
                    padding: "0.5rem 1rem",
                    borderRadius: "20px",
                    border: "1.5px solid var(--border-strong)",
                    background: "var(--surface)",
                    color: "var(--text-secondary)",
                    fontSize: "0.82rem",
                    cursor: "pointer",
                    transition: "all 0.15s",
                    fontFamily: "DM Sans, sans-serif",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent-dark)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-strong)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              gap: "0.75rem",
              marginBottom: "1.25rem",
              flexDirection: msg.role === "user" ? "row-reverse" : "row",
              alignItems: "flex-start",
            }}
          >
            {/* Avatar */}
            <div style={{
              width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
              background: msg.role === "user" ? "var(--accent)" : "var(--primary)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: msg.role === "user" ? "0.75rem" : "0.9rem",
              fontWeight: 600,
              color: msg.role === "user" ? "var(--primary)" : "white",
            }}>
              {msg.role === "user" ? (user?.initials || "U") : "✦"}
            </div>

            {/* Bubble */}
            <div style={{
              maxWidth: "72%",
              padding: "0.85rem 1.1rem",
              borderRadius: msg.role === "user" ? "18px 4px 18px 18px" : "4px 18px 18px 18px",
              background: msg.role === "user" ? "var(--primary)" : "var(--surface)",
              border: msg.role === "user" ? "none" : "1px solid var(--border)",
              color: msg.role === "user" ? "white" : "var(--text-primary)",
              fontSize: "0.88rem",
              boxShadow: "var(--shadow-sm)",
            }}>
              {msg.role === "assistant"
                ? <FormattedMessage text={msg.content} />
                : msg.content
              }
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start", marginBottom: "1.25rem" }}>
            <div style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "0.9rem", flexShrink: 0 }}>✦</div>
            <div style={{ padding: "0.85rem 1.1rem", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "4px 18px 18px 18px", display: "flex", gap: "4px", alignItems: "center" }}>
              {[0,1,2].map(i => (
                <div key={i} style={{
                  width: 6, height: 6, borderRadius: "50%", background: "var(--accent)",
                  animation: "bounce 1.2s infinite",
                  animationDelay: `${i * 0.2}s`,
                }} />
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Input bar ── */}
      <div style={{ padding: "1rem 2rem 1.5rem", borderTop: "1px solid var(--border)", background: "var(--surface)" }}>
        {/* Quick suggestions (when chat has messages) */}
        {messages.length > 0 && (
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem", overflowX: "auto", paddingBottom: "2px" }}>
            {SUGGESTIONS.slice(0, 4).map(s => (
              <button
                key={s}
                onClick={() => sendMessage(s)}
                style={{
                  padding: "0.3rem 0.8rem", borderRadius: "20px", whiteSpace: "nowrap",
                  border: "1px solid var(--border-strong)", background: "transparent",
                  color: "var(--text-muted)", fontSize: "0.78rem", cursor: "pointer",
                  fontFamily: "DM Sans, sans-serif", transition: "all 0.15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent-dark)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-strong)"; e.currentTarget.style.color = "var(--text-muted)"; }}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-end" }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Sage anything — revenue, stock, customers, insights…"
            rows={1}
            style={{
              flex: 1,
              padding: "0.75rem 1rem",
              border: "1.5px solid var(--border-strong)",
              borderRadius: "var(--radius-md)",
              fontFamily: "DM Sans, sans-serif",
              fontSize: "0.9rem",
              color: "var(--text-primary)",
              background: "var(--surface-2)",
              outline: "none",
              resize: "none",
              lineHeight: 1.5,
              transition: "border-color 0.2s",
              maxHeight: 120,
              overflowY: "auto",
            }}
            onFocus={e => e.target.style.borderColor = "var(--accent)"}
            onBlur={e => e.target.style.borderColor = "var(--border-strong)"}
            disabled={loading || dataLoading}
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim() || dataLoading}
            style={{
              width: 44, height: 44, borderRadius: "50%", border: "none",
              background: input.trim() && !loading ? "var(--primary)" : "var(--surface-3)",
              color: input.trim() && !loading ? "white" : "var(--text-muted)",
              cursor: input.trim() && !loading ? "pointer" : "default",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.1rem", transition: "all 0.2s", flexShrink: 0,
            }}
          >
            ↑
          </button>
        </div>
        <div style={{ textAlign: "center", marginTop: "0.5rem", fontSize: "0.72rem", color: "var(--text-muted)" }}>
          Press Enter to send · Shift+Enter for new line
        </div>
      </div>

      {/* Bounce animation */}
      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}
