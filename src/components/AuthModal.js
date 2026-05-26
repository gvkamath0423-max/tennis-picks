// src/components/AuthModal.js
import { useState } from "react";
import { signIn, signUp } from "../lib/supabase";

export default function AuthModal({ theme, onClose }) {
  const [mode, setMode]       = useState("signin"); // "signin" | "signup"
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError]     = useState(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);

  const t = theme;

  async function handleSubmit() {
    setError(null);
    setLoading(true);
    try {
      if (mode === "signup") {
        if (!username.trim()) { setError("Username is required."); setLoading(false); return; }
        await signUp(email, password, username.trim());
        setDone(true);
      } else {
        await signIn(email, password);
        onClose();
      }
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  }

  const inputStyle = {
    width: "100%",
    padding: "10px 14px",
    background: `${t.bg}`,
    border: `1px solid ${t.border}`,
    borderRadius: 8,
    color: t.text,
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
  };

  const btnStyle = {
    width: "100%",
    padding: "12px",
    background: t.primary,
    border: "none",
    borderRadius: 8,
    color: t.white,
    fontSize: 15,
    fontWeight: 700,
    cursor: loading ? "not-allowed" : "pointer",
    opacity: loading ? 0.7 : 1,
    transition: "opacity 0.2s",
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(0,0,0,0.75)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 16,
    }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: t.surface,
        border: `1px solid ${t.border}`,
        borderRadius: 16,
        padding: 32,
        width: "100%",
        maxWidth: 400,
        boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
      }}>
        {done ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✉️</div>
            <h2 style={{ margin: "0 0 8px", color: t.white }}>Check your email</h2>
            <p style={{ color: t.textDim, fontSize: 14, lineHeight: 1.6 }}>
              We sent a confirmation link to <strong style={{ color: t.text }}>{email}</strong>.
              Click it to activate your account, then sign in.
            </p>
            <button style={{ ...btnStyle, marginTop: 20 }} onClick={onClose}>
              Got it
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{ marginBottom: 24, textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>{t.emoji}</div>
              <h2 style={{ margin: 0, color: t.white, fontSize: 22 }}>
                {mode === "signin" ? "Welcome back" : "Join the predictions"}
              </h2>
              <p style={{ margin: "6px 0 0", color: t.textDim, fontSize: 13 }}>
                {mode === "signin"
                  ? "Sign in to see your picks and the leaderboard"
                  : "Create an account to save your picks and compete"}
              </p>
            </div>

            {/* Fields */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {mode === "signup" && (
                <input
                  style={inputStyle}
                  placeholder="Username (shown on leaderboard)"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              )}
              <input
                style={inputStyle}
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                style={inputStyle}
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
            </div>

            {error && (
              <div style={{
                marginTop: 12, padding: "10px 14px",
                background: "rgba(220,50,50,0.15)",
                border: "1px solid rgba(220,50,50,0.3)",
                borderRadius: 8, color: "#ff7070", fontSize: 13,
              }}>
                {error}
              </div>
            )}

            <button style={{ ...btnStyle, marginTop: 20 }} onClick={handleSubmit} disabled={loading}>
              {loading ? "Please wait…" : mode === "signin" ? "Sign In" : "Create Account"}
            </button>

            {/* Toggle */}
            <div style={{ textAlign: "center", marginTop: 16, fontSize: 13, color: t.textDim }}>
              {mode === "signin" ? "No account yet?" : "Already have an account?"}{" "}
              <button
                onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(null); }}
                style={{ background: "none", border: "none", color: t.accent, cursor: "pointer", fontSize: 13, fontWeight: 600 }}
              >
                {mode === "signin" ? "Sign up free" : "Sign in"}
              </button>
            </div>

            {/* Close */}
            <button
              onClick={onClose}
              style={{
                position: "absolute", top: 16, right: 16,
                background: "none", border: "none",
                color: t.textDim, fontSize: 20, cursor: "pointer",
              }}
            >×</button>
          </>
        )}
      </div>
    </div>
  );
}
