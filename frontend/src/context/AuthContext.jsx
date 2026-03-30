import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);
const API = "http://localhost:5000/api";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("stockwise_session") || "null");
    } catch {
      return null;
    }
  });

  // ── SIGN UP ───────────────────────────────────────
  const signup = async (name, email, password, role) => {
    try {
      const initials = name
        .trim()
        .split(" ")
        .map(w => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

      const res  = await fetch(`${API}/users/signup`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ name, email, password, role, initials }),
      });
      const data = await res.json();

      if (!res.ok) return { success: false, error: data.error };

      localStorage.setItem("stockwise_session", JSON.stringify(data));
      setUser(data);
      return { success: true };

    } catch (err) {
      return { success: false, error: "Cannot connect to server. Is the backend running?" };
    }
  };

  // ── LOGIN ─────────────────────────────────────────
  const login = async (email, password) => {
    try {
      const res  = await fetch(`${API}/users/login`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) return { success: false, error: data.error };

      localStorage.setItem("stockwise_session", JSON.stringify(data));
      setUser(data);
      return { success: true };

    } catch (err) {
      return { success: false, error: "Cannot connect to server. Is the backend running?" };
    }
  };

  // ── LOGOUT ────────────────────────────────────────
  const logout = () => {
    localStorage.removeItem("stockwise_session");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
