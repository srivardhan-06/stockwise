import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

const ROLES = ["Store Manager", "Inventory Staff", "Sales Executive", "Admin"];

export default function LoginPage() {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState("login");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [name, setName]         = useState("");
  const [confirm, setConfirm]   = useState("");
  const [role, setRole]         = useState("Staff");

  const resetForm = () => {
    setEmail(""); setPassword(""); setName(""); setConfirm(""); setRole("Staff"); setError("");
  };
  const switchMode = (m) => { setMode(m); resetForm(); };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    const result = login(email, password);
    if (!result.success) setError(result.error);
    setLoading(false);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    if (!name.trim())  { setError("Please enter your full name."); return; }
    if (!email)        { setError("Please enter your email address."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    const result = signup(name, email, password, role);
    if (!result.success) setError(result.error);
    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-visual">
        <div className="login-brand">
          <div className="login-brand-icon">
            <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
              <rect x="1" y="1" width="8" height="8" rx="1.5" fill="#1a1a2e"/>
              <rect x="11" y="1" width="8" height="8" rx="1.5" fill="#1a1a2e" opacity="0.7"/>
              <rect x="1" y="11" width="8" height="8" rx="1.5" fill="#1a1a2e" opacity="0.7"/>
              <rect x="11" y="11" width="8" height="8" rx="1.5" fill="#1a1a2e" opacity="0.4"/>
            </svg>
          </div>
          <div className="login-brand-name">Stockwise</div>
          <div className="login-brand-tagline">Inventory Management Suite</div>
        </div>
        <div className="login-visual-quote">
          <blockquote>"What gets measured,<br />gets managed."</blockquote>
          <cite>— Peter Drucker</cite>
        </div>
        <div style={{ position: "relative", zIndex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          {[
            { value: "2,400+", label: "Products Tracked" },
            { value: "98.4%",  label: "Order Accuracy"   },
            { value: "₹12L",   label: "Revenue / Month"  },
            { value: "340",    label: "Orders Fulfilled"  },
          ].map(s => (
            <div key={s.label} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "0.85rem 1rem" }}>
              <div style={{ fontSize: "1.3rem", fontWeight: 300, color: "white", letterSpacing: "-0.02em" }}>{s.value}</div>
              <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)", marginTop: "0.15rem" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="login-form-panel">
        <div className="login-form-container fade-in">
          <div style={{ display: "flex", background: "var(--surface-3)", borderRadius: "var(--radius-md)", padding: "4px", marginBottom: "2rem" }}>
            {["login", "signup"].map(m => (
              <button key={m} onClick={() => switchMode(m)} style={{
                flex: 1, padding: "0.6rem", border: "none",
                borderRadius: "calc(var(--radius-md) - 2px)",
                fontFamily: "DM Sans, sans-serif", fontSize: "0.88rem",
                fontWeight: mode === m ? 500 : 400, cursor: "pointer", transition: "all 0.2s",
                background: mode === m ? "var(--surface)" : "transparent",
                color: mode === m ? "var(--text-primary)" : "var(--text-muted)",
                boxShadow: mode === m ? "var(--shadow-sm)" : "none",
              }}>
                {m === "login" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          <div className="login-form-header">
            <h2>{mode === "login" ? "Welcome back" : "Create your account"}</h2>
            <p>{mode === "login" ? "Sign in to access your Stockwise dashboard" : "Register to start managing your inventory"}</p>
          </div>

          {mode === "login" && (
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input className="form-input" type="email" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input className="form-input" type="password" placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} />
              </div>
              {error && <ErrorBox message={error} />}
              <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? "Signing in…" : "Sign in →"}</button>
              <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.83rem", color: "var(--text-muted)" }}>
                Don't have an account?{" "}
                <button onClick={() => switchMode("signup")} style={{ background: "none", border: "none", color: "var(--accent-dark)", cursor: "pointer", fontWeight: 500, fontSize: "0.83rem" }}>Create one →</button>
              </p>
            </form>
          )}

          {mode === "signup" && (
            <form onSubmit={handleSignup}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" type="text" placeholder="e.g. Priya Sharma" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input className="form-input" type="email" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Role</label>
                <select className="form-select" style={{ width: "100%" }} value={role} onChange={e => setRole(e.target.value)}>
                  {ROLES.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input className="form-input" type="password" placeholder="Min. 6 characters" value={password} onChange={e => setPassword(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
                  <input className="form-input" type="password" placeholder="Repeat password" value={confirm} onChange={e => setConfirm(e.target.value)} />
                </div>
              </div>
              {error && <ErrorBox message={error} />}
              <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? "Creating account…" : "Create Account →"}</button>
              <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.83rem", color: "var(--text-muted)" }}>
                Already have an account?{" "}
                <button onClick={() => switchMode("login")} style={{ background: "none", border: "none", color: "var(--accent-dark)", cursor: "pointer", fontWeight: 500, fontSize: "0.83rem" }}>Sign in →</button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function ErrorBox({ message }) {
  return (
    <div style={{ background: "var(--danger-bg)", color: "var(--danger)", padding: "0.65rem 1rem", borderRadius: "var(--radius-sm)", fontSize: "0.85rem", marginBottom: "1rem", border: "1px solid rgba(155,34,38,0.15)" }}>
      ⚠ {message}
    </div>
  );
}
