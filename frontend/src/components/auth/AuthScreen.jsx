import { useState } from "react";
import { Eye, EyeOff, Sparkles, Globe, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import LanguageSelector from "../common/LanguageSelector";
import { useAuth } from "../../context/AuthContext";
import { MOCK_USERS } from "../../data/mockData";

export default function AuthScreen({ onBackToChat, initialMode = "login", onSuccess }) {
  const { login, register, authError, authLoading, switchMockUser, isMockMode, setIsMockMode } = useAuth();
  const [mode, setMode] = useState(initialMode); // 'login' | 'register'
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState("hi");
  const [clientError, setClientError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setClientError("");
    setSuccessMsg("");

    if (!email || !password) {
      setClientError("Please fill in all required fields.");
      return;
    }

    if (mode === "register" && (!username || username.trim().length < 3)) {
      setClientError("Username must be at least 3 characters.");
      return;
    }

    if (password.length < 8) {
      setClientError("Password must be at least 8 characters.");
      return;
    }

    if (mode === "login") {
      const res = await login({ email, password });
      if (res.ok) {
        setSuccessMsg("Logged in successfully! Connecting...");
        setTimeout(() => {
          if (onSuccess) onSuccess();
          else if (onBackToChat) onBackToChat();
        }, 500);
      }
    } else {
      const res = await register({
        username,
        email,
        password,
        preferredLanguage,
      });
      if (res.ok) {
        setSuccessMsg("Account created successfully!");
        setTimeout(() => {
          if (onSuccess) onSuccess();
          else if (onBackToChat) onBackToChat();
        }, 600);
      }
    }
  };

  const handleDemoLogin = (user) => {
    switchMockUser(user);
    if (onSuccess) onSuccess();
    else if (onBackToChat) onBackToChat();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "radial-gradient(ellipse at top, #1a152e 0%, #0d0c14 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        overflowY: "auto",
      }}
    >
      {/* Background glow orbs */}
      <div
        style={{
          position: "absolute",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(124, 58, 237, 0.15) 0%, transparent 70%)",
          top: "10%",
          left: "20%",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(6, 182, 212, 0.1) 0%, transparent 70%)",
          bottom: "10%",
          right: "20%",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 460,
          background: "rgba(19, 18, 29, 0.95)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          borderRadius: "var(--radius-lg)",
          padding: "36px 32px",
          boxShadow: "0 20px 60px -10px rgba(0, 0, 0, 0.8)",
          backdropFilter: "blur(20px)",
        }}
      >
        {/* Back to chat link */}
        <button
          onClick={onBackToChat}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            color: "var(--text-muted)",
            fontSize: 12,
            marginBottom: 20,
            cursor: "pointer",
            transition: "color var(--transition-fast)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-main)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
        >
          <ArrowLeft size={14} />
          <span>Back to conversations</span>
        </button>

        {/* Brand header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: "var(--radius-md)",
              background: "linear-gradient(135deg, #6366f1, #7c3aed)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 800,
              fontSize: 22,
              boxShadow: "0 4px 18px var(--primary-glow)",
            }}
          >
            P
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-main)", letterSpacing: -0.5 }}>
              Polyglot Chat
            </h1>
            <p style={{ fontSize: 12, color: "var(--text-secondary)" }}>
              One conversation. Every language.
            </p>
          </div>
        </div>

        {/* Tab switch between Login & Register */}
        <div
          style={{
            display: "flex",
            background: "rgba(255, 255, 255, 0.04)",
            padding: 4,
            borderRadius: "var(--radius-md)",
            marginBottom: 24,
            border: "1px solid var(--border-subtle)",
          }}
        >
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setClientError("");
            }}
            style={{
              flex: 1,
              padding: "8px 0",
              borderRadius: "var(--radius-sm)",
              fontSize: 13,
              fontWeight: 600,
              color: mode === "login" ? "#fff" : "var(--text-muted)",
              background: mode === "login" ? "var(--primary)" : "transparent",
              boxShadow: mode === "login" ? "0 2px 8px var(--primary-glow)" : "none",
              transition: "all var(--transition-fast)",
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setClientError("");
            }}
            style={{
              flex: 1,
              padding: "8px 0",
              borderRadius: "var(--radius-sm)",
              fontSize: 13,
              fontWeight: 600,
              color: mode === "register" ? "#fff" : "var(--text-muted)",
              background: mode === "register" ? "var(--primary)" : "transparent",
              boxShadow: mode === "register" ? "0 2px 8px var(--primary-glow)" : "none",
              transition: "all var(--transition-fast)",
            }}
          >
            Create Account
          </button>
        </div>

        {/* Error / Success Alerts */}
        {(clientError || authError) && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 14px",
              borderRadius: "var(--radius-sm)",
              background: "rgba(244, 63, 94, 0.15)",
              border: "1px solid rgba(244, 63, 94, 0.3)",
              color: "#fca5a5",
              fontSize: 12,
              marginBottom: 16,
            }}
          >
            <AlertCircle size={14} style={{ flexShrink: 0 }} />
            <span>{clientError || authError}</span>
          </div>
        )}

        {successMsg && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 14px",
              borderRadius: "var(--radius-sm)",
              background: "rgba(16, 185, 129, 0.15)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              color: "#6ee7b7",
              fontSize: 12,
              marginBottom: 16,
            }}
          >
            <CheckCircle2 size={14} style={{ flexShrink: 0 }} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Main Auth Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {mode === "register" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>
                Username
              </label>
              <input
                type="text"
                placeholder="e.g. priya_s"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                style={{
                  background: "var(--bg-input)",
                  border: "1px solid var(--border-medium)",
                  borderRadius: "var(--radius-sm)",
                  padding: "10px 14px",
                  color: "var(--text-main)",
                  fontSize: 14,
                }}
              />
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>
              Email Address
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                background: "var(--bg-input)",
                border: "1px solid var(--border-medium)",
                borderRadius: "var(--radius-sm)",
                padding: "10px 14px",
                color: "var(--text-main)",
                fontSize: 14,
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>
                Password (min 8 chars)
              </label>
              {mode === "login" && (
                <span style={{ fontSize: 11, color: "var(--primary-light)", cursor: "pointer" }}>
                  Forgot?
                </span>
              )}
            </div>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: "100%",
                  background: "var(--bg-input)",
                  border: "1px solid var(--border-medium)",
                  borderRadius: "var(--radius-sm)",
                  padding: "10px 40px 10px 14px",
                  color: "var(--text-main)",
                  fontSize: 14,
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted)",
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {mode === "register" && (
            <LanguageSelector
              label="Your Preferred Language (for incoming translations)"
              value={preferredLanguage}
              onChange={(code) => setPreferredLanguage(code)}
            />
          )}

          <button
            type="submit"
            disabled={authLoading}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              background: "var(--bg-bubble-sent)",
              color: "#fff",
              padding: "12px",
              borderRadius: "var(--radius-sm)",
              fontWeight: 700,
              fontSize: 14,
              marginTop: 6,
              boxShadow: "0 4px 16px var(--primary-glow)",
              transition: "transform var(--transition-fast)",
            }}
          >
            <span>{authLoading ? "Processing..." : mode === "login" ? "Sign In" : "Create Free Account"}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Quick Demo Test Users Section */}
        <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid var(--border-subtle)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
            <Sparkles size={14} color="var(--accent-cyan)" />
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)" }}>
              One-Click Demo Personas (Review Instantly)
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
            {MOCK_USERS.slice(0, 3).map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => handleDemoLogin(u)}
                style={{
                  padding: "8px 6px",
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-sm)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                  cursor: "pointer",
                  transition: "all var(--transition-fast)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--primary-light)")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border-subtle)")}
              >
                <img
                  src={u.avatar}
                  alt={u.username}
                  style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover" }}
                />
                <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-main)" }}>
                  {u.username.split(" ")[0]}
                </span>
                <span style={{ fontSize: 9, color: "var(--accent-cyan)", fontWeight: 700 }}>
                  {u.preferredLanguage.toUpperCase()}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
