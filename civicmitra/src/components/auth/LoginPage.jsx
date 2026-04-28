// LoginPage.jsx — Auth screen for Citizen & Authority login/register
import React, { useState } from "react";
import { registerUser, loginUser } from "../../services/authService";
import "./LoginPage.css";

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [role, setRole] = useState("citizen");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isRegister) {
        await registerUser(form.email, form.password, form.name, role);
      } else {
        await loginUser(form.email, form.password);
      }
      // Auth state change handled by useAuth hook in App.jsx
    } catch (err) {
      const msg = err.code === "auth/email-already-in-use"
        ? "Email already registered. Try logging in."
        : err.code === "auth/wrong-password" || err.code === "auth/invalid-credential"
        ? "Invalid email or password."
        : err.code === "auth/user-not-found"
        ? "No account found. Please register."
        : err.code === "auth/weak-password"
        ? "Password must be at least 6 characters."
        : err.message || "Something went wrong.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Animated background shapes */}
      <div className="login-bg-shape login-bg-shape-1" />
      <div className="login-bg-shape login-bg-shape-2" />
      <div className="login-bg-shape login-bg-shape-3" />

      <div className="login-card">
        {/* Header */}
        <div className="login-header">
          <span className="login-logo">🏙️</span>
          <h1 className="login-title">CivicMitra</h1>
          <p className="login-subtitle">
            {isRegister
              ? "Create your account to start reporting"
              : "Sign in to your account"}
          </p>
        </div>

        {/* Role Toggle (only on register) */}
        {isRegister && (
          <div className="role-toggle">
            <button
              type="button"
              className={`role-btn ${role === "citizen" ? "active" : ""}`}
              onClick={() => setRole("citizen")}
            >
              👤 Citizen
            </button>
            <button
              type="button"
              className={`role-btn ${role === "authority" ? "active" : ""}`}
              onClick={() => setRole("authority")}
            >
              🏛️ Authority
            </button>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="login-form">
          {isRegister && (
            <div className="form-group">
              <label htmlFor="login-name">Full Name</label>
              <input
                id="login-name"
                name="name"
                type="text"
                placeholder="Enter your name"
                value={form.name}
                onChange={handleChange}
                required
                autoComplete="name"
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              name="password"
              type="password"
              placeholder="Min 6 characters"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
              autoComplete={isRegister ? "new-password" : "current-password"}
            />
          </div>

          {error && <div className="login-error">⚠️ {error}</div>}

          <button type="submit" className="login-submit" disabled={loading}>
            {loading
              ? "Please wait…"
              : isRegister
              ? "Create Account"
              : "Sign In"}
          </button>
        </form>

        {/* Toggle login ↔ register */}
        <p className="login-toggle-text">
          {isRegister ? "Already have an account?" : "Don't have an account?"}
          <button
            type="button"
            className="login-toggle-btn"
            onClick={() => {
              setIsRegister(!isRegister);
              setError("");
            }}
          >
            {isRegister ? "Sign In" : "Register"}
          </button>
        </p>
      </div>
    </div>
  );
}
