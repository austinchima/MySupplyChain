import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth } from "../lib/api";
import { setToken } from "../lib/auth";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [errorTitle, setErrorTitle] = useState<string | null>(null);
  const [errorAction, setErrorAction] = useState<{ label: string; onClick: () => void } | null>(null);

  const setErr = (title: string, message: string, action?: { label: string; onClick: () => void }) => {
    setErrorTitle(title);
    setError(message);
    setErrorAction(action ?? null);
  };
  const clearErr = () => { setError(null); setErrorTitle(null); setErrorAction(null); };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    clearErr();
    try {
      const res = await auth.login({ usernameOrEmail: email, password });
      if (res.token) { setToken(res.token); navigate("/dashboard"); }
    } catch (err: any) {
      const msg: string = err.message ?? "Something went wrong. Please try again.";
      const status: number = err.status ?? 0;
      if (status === 401 || msg.toLowerCase().includes("password") || msg.toLowerCase().includes("credentials")) {
        setErr("Incorrect credentials", "The email or password you entered is incorrect. Please check and try again.");
      } else if (status === 429) {
        setErr("Too many attempts", msg);
      } else {
        setErr("Sign in failed", msg);
      }
    } finally { setLoading(false); }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    clearErr();
    try {
      const username = `${firstName} ${lastName}`.trim();
      await auth.register({ username, email, password });
      const res = await auth.login({ usernameOrEmail: email, password });
      if (res.token) { setToken(res.token); navigate("/dashboard"); }
    } catch (err: any) {
      const msg: string = err.message ?? "Something went wrong. Please try again.";
      const isAlreadyExists = msg.toLowerCase().includes("already exists") ||
        msg.toLowerCase().includes("already registered") ||
        msg.toLowerCase().includes("username or email");
      if (isAlreadyExists) {
        setErr(
          "Account already exists",
          `An account with this email address is already registered.`,
          { label: "Sign in instead →", onClick: () => { setMode("login"); clearErr(); } }
        );
      } else if (msg.toLowerCase().includes("password")) {
        setErr("Password requirements", msg);
      } else {
        setErr("Registration failed", msg);
      }
    } finally { setLoading(false); }
  };

  return (
    /*
     * Outer: flex-row on desktop (lg+), stacked on mobile.
     * min-h-screen so content never clips; no overflow-hidden on root.
     */
    <div style={{ display: "flex", minHeight: "100vh", background: "#0d141d" }}>

      {/* ══════════════════════════════════
          LEFT PANEL — decorative, desktop only
      ══════════════════════════════════ */}
      <div
        className="hidden lg:flex"
        style={{
          width: "52%",
          flexShrink: 0,
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "48px",
          position: "relative",
          overflow: "hidden",
          background: "#080f18",
          borderRight: "1px solid rgba(61,73,75,0.5)",
        }}
      >
        {/* Ambient decorations */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          <div className="ck-grid-pattern" style={{ position: "absolute", inset: 0, opacity: 0.4 }} />
          <div className="ck-orb-primary" style={{ top: "-15%", left: "-10%", width: "500px", height: "500px" }} />
          <div className="ck-orb-secondary" style={{ bottom: "-10%", right: "-5%", width: "400px", height: "400px" }} />
        </div>

        {/* Logo */}
        <Link to="/" style={{ position: "relative", zIndex: 10, display: "inline-flex", alignItems: "center", gap: "12px", textDecoration: "none" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#5ad7e7", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 24px rgba(90,215,231,0.35)", flexShrink: 0 }}>
            <span className="material-symbols-outlined filled" style={{ fontSize: "20px", color: "#00363c" }}>hub</span>
          </div>
          <span style={{ fontFamily: "Space Grotesk, system-ui", fontWeight: 600, fontSize: "17px", color: "#dce3f0", letterSpacing: "-0.01em" }}>MySupplyChain</span>
        </Link>

        {/* Hero text block */}
        <div style={{ position: "relative", zIndex: 10 }}>
          <h1 style={{ fontFamily: "Space Grotesk, system-ui", fontSize: "clamp(28px, 3vw, 42px)", fontWeight: 700, lineHeight: 1.15, letterSpacing: "-0.04em", color: "#dce3f0", marginBottom: "16px" }}>
            Supply chain intelligence<br />
            <span className="ck-gradient-text">that actually works.</span>
          </h1>
          <p style={{ fontFamily: "Geist, system-ui", fontSize: "15px", lineHeight: 1.7, color: "#869395", maxWidth: "360px", marginBottom: "32px" }}>
            AI-powered forecasting, real-time inventory tracking, and automated reorders — in one precision-engineered platform.
          </p>

          {/* Feature list */}
          <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px 0", display: "flex", flexDirection: "column", gap: "12px" }}>
            {[
              { icon: "monitoring", text: "AI demand forecasting with 94%+ accuracy" },
              { icon: "sensors", text: "Real-time tracking across all warehouses" },
              { icon: "smart_toy", text: "Automated purchase orders on threshold breach" },
              { icon: "analytics", text: "Deep analytics and inventory health metrics" },
            ].map(({ icon, text }) => (
              <li key={text} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "18px", color: "#5ad7e7", flexShrink: 0 }}>{icon}</span>
                <span style={{ fontFamily: "Geist, system-ui", fontSize: "14px", color: "#bcc9cb" }}>{text}</span>
              </li>
            ))}
          </ul>

          {/* Testimonial */}
          <div className="ck-card" style={{ padding: "20px 24px" }}>
            <p style={{ fontFamily: "Geist, system-ui", fontSize: "14px", lineHeight: 1.7, color: "#bcc9cb", fontStyle: "italic", marginBottom: "16px" }}>
              "MySupplyChain cut our excess inventory by 43% in the first quarter. The AI predictions are scary accurate."
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "9999px", flexShrink: 0, background: "rgba(90,215,231,0.15)", border: "1px solid rgba(90,215,231,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "11px", fontWeight: 600, color: "#5ad7e7" }}>JR</span>
              </div>
              <div>
                <div style={{ fontFamily: "Geist, system-ui", fontSize: "13px", fontWeight: 600, color: "#dce3f0" }}>Jordan Rivera</div>
                <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "10px", color: "#869395", letterSpacing: "0.06em" }}>VP OF OPERATIONS · LOGICORE</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stat row */}
        <div style={{ position: "relative", zIndex: 10, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
          {[{ v: "45%", l: "WASTE REDUCTION" }, { v: "99.9%", l: "UPTIME SLA" }, { v: "3ms", l: "API LATENCY" }].map(({ v, l }) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "Space Grotesk, system-ui", fontSize: "24px", fontWeight: 700, color: "#dce3f0" }}>{v}</div>
              <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "10px", color: "#869395", letterSpacing: "0.1em", marginTop: "4px" }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════
          RIGHT PANEL — auth form
      ══════════════════════════════════ */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px 24px",
          position: "relative",
          minWidth: 0, /* prevents flex child from overflowing */
        }}
      >
        {/* Mobile background */}
        <div className="lg:hidden" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          <div className="ck-grid-pattern" style={{ position: "absolute", inset: 0, opacity: 0.3 }} />
          <div className="ck-orb-primary" style={{ top: 0, right: 0, width: "400px", height: "400px" }} />
        </div>

        {/* Mobile logo */}
        <div className="lg:hidden" style={{ marginBottom: "32px", position: "relative", zIndex: 10 }}>
          <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#5ad7e7", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span className="material-symbols-outlined filled" style={{ fontSize: "18px", color: "#00363c" }}>hub</span>
            </div>
            <span style={{ fontFamily: "Space Grotesk, system-ui", fontWeight: 600, fontSize: "16px", color: "#dce3f0" }}>MySupplyChain</span>
          </Link>
        </div>

        {/* ── The Form Card ── */}
        <div style={{ width: "100%", maxWidth: "440px", position: "relative", zIndex: 10 }}>
          <div className="ck-auth-card" style={{ padding: "32px" }}>

            {/* Tab toggle */}
            <div style={{ display: "flex", gap: "4px", padding: "4px", borderRadius: "8px", marginBottom: "28px", background: "#080f18", border: "1px solid rgba(61,73,75,0.5)" }}>
              {(["login", "register"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setError(null); }}
                  style={{
                    flex: 1,
                    padding: "10px 0",
                    borderRadius: "6px",
                    fontFamily: "JetBrains Mono, monospace",
                    fontSize: "12px",
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    background: mode === m ? "#19202a" : "transparent",
                    color: mode === m ? "#5ad7e7" : "#869395",
                    border: mode === m ? "1px solid rgba(90,215,231,0.2)" : "1px solid transparent",
                  }}
                >
                  {m === "login" ? "SIGN IN" : "REGISTER"}
                </button>
              ))}
            </div>

            {/* Heading */}
            <h2 style={{ fontFamily: "Space Grotesk, system-ui", fontSize: "26px", fontWeight: 700, letterSpacing: "-0.03em", color: "#dce3f0", marginBottom: "6px" }}>
              {mode === "login" ? "Welcome back." : "Get started."}
            </h2>
            <p style={{ fontFamily: "Geist, system-ui", fontSize: "14px", color: "#869395", marginBottom: "24px" }}>
              {mode === "login"
                ? "Enter your credentials to access the dashboard."
                : "Create your account to start a free trial."}
            </p>

            {/* Error banner */}
            {error && (
              <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                background: "rgba(255,180,171,0.06)",
                border: "1px solid rgba(255,180,171,0.22)",
                borderRadius: "8px",
                padding: "14px 16px",
                marginBottom: "20px",
              }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "18px", color: "#ffb4ab", flexShrink: 0, marginTop: "1px" }}>error_outline</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {errorTitle && (
                      <p style={{ fontFamily: "Space Grotesk, system-ui", fontSize: "13px", fontWeight: 600, color: "#ffb4ab", margin: "0 0 3px 0" }}>
                        {errorTitle}
                      </p>
                    )}
                    <p style={{ fontFamily: "Geist, system-ui", fontSize: "13px", color: "rgba(255,180,171,0.8)", lineHeight: 1.5, margin: 0 }}>
                      {error}
                    </p>
                    {errorAction && (
                      <button
                        onClick={errorAction.onClick}
                        style={{
                          marginTop: "8px",
                          background: "rgba(90,215,231,0.08)",
                          border: "1px solid rgba(90,215,231,0.2)",
                          borderRadius: "6px",
                          padding: "5px 12px",
                          fontFamily: "JetBrains Mono, monospace",
                          fontSize: "11px",
                          fontWeight: 600,
                          letterSpacing: "0.06em",
                          color: "#5ad7e7",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          transition: "all 0.15s ease",
                        }}
                      >
                        {errorAction.label}
                      </button>
                    )}
                  </div>
                  <button onClick={clearErr} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,180,171,0.5)", padding: "0", lineHeight: 1, flexShrink: 0 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>close</span>
                  </button>
                </div>
              </div>
            )}

            {/* ── LOGIN FORM ── */}
            {mode === "login" ? (
              <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {/* Email */}
                <div>
                  <label className="ck-label">Email Address</label>
                  <div style={{ position: "relative", width: "100%" }}>
                    <span className="material-symbols-outlined" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "18px", color: "#3d494b", pointerEvents: "none" }}>mail</span>
                    <input
                      className="ck-input"
                      style={{ paddingLeft: "40px" }}
                      type="email"
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <span className="ck-label" style={{ marginBottom: 0 }}>Password</span>
                    <a href="#" style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "11px", color: "#5ad7e7", letterSpacing: "0.06em", textDecoration: "none" }}>FORGOT?</a>
                  </div>
                  <div style={{ position: "relative", width: "100%" }}>
                    <span className="material-symbols-outlined" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "18px", color: "#3d494b", pointerEvents: "none" }}>lock</span>
                    <input
                      className="ck-input"
                      style={{ paddingLeft: "40px" }}
                      type="password"
                      placeholder="••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Remember me */}
                <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                  <input type="checkbox" style={{ width: "14px", height: "14px", accentColor: "#5ad7e7", flexShrink: 0 }} />
                  <span style={{ fontFamily: "Geist, system-ui", fontSize: "13px", color: "#869395" }}>Keep me signed in for 30 days</span>
                </label>

                {/* Submit */}
                <button type="submit" disabled={loading} className="ck-auth-submit" style={{ marginTop: "4px" }}>
                  {loading
                    ? <><span className="material-symbols-outlined animate-spin" style={{ fontSize: "18px" }}>progress_activity</span>AUTHENTICATING...</>
                    : <>ACCESS DASHBOARD <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>arrow_forward</span></>}
                </button>
              </form>
            ) : (
              /* ── REGISTER FORM ── */
              <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {/* Name row */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label className="ck-label">First Name</label>
                    <input className="ck-input" type="text" placeholder="Alex" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                  </div>
                  <div>
                    <label className="ck-label">Last Name</label>
                    <input className="ck-input" type="text" placeholder="Rivera" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                  </div>
                </div>

                {/* Work email */}
                <div>
                  <label className="ck-label">Work Email</label>
                  <div style={{ position: "relative", width: "100%" }}>
                    <span className="material-symbols-outlined" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "18px", color: "#3d494b", pointerEvents: "none" }}>mail</span>
                    <input className="ck-input" style={{ paddingLeft: "40px" }} type="email" placeholder="alex@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="ck-label">Password</label>
                  <div style={{ position: "relative", width: "100%" }}>
                    <span className="material-symbols-outlined" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "18px", color: "#3d494b", pointerEvents: "none" }}>lock</span>
                    <input className="ck-input" style={{ paddingLeft: "40px" }} type="password" placeholder="Min. 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  </div>
                </div>

                {/* Submit */}
                <button type="submit" disabled={loading} className="ck-auth-submit" style={{ marginTop: "4px" }}>
                  {loading
                    ? <><span className="material-symbols-outlined animate-spin" style={{ fontSize: "18px" }}>progress_activity</span>CREATING ACCOUNT...</>
                    : <><span className="material-symbols-outlined" style={{ fontSize: "18px" }}>verified</span>CREATE FREE ACCOUNT</>}
                </button>

                <p style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "10px", color: "#3d494b", letterSpacing: "0.06em", textAlign: "center", margin: 0 }}>
                  BY SIGNING UP, YOU AGREE TO OUR{" "}
                  <a href="#" style={{ color: "#5ad7e7", textDecoration: "none" }}>TERMS</a> AND{" "}
                  <a href="#" style={{ color: "#5ad7e7", textDecoration: "none" }}>PRIVACY POLICY</a>
                </p>
              </form>
            )}
          </div>

          {/* Enterprise note */}
          <p style={{ textAlign: "center", marginTop: "24px", fontFamily: "JetBrains Mono, monospace", fontSize: "11px", color: "#3d494b", letterSpacing: "0.06em" }}>
            ENTERPRISE SSO & SAML AVAILABLE.{" "}
            <a href="#" style={{ color: "#5ad7e7", textDecoration: "none" }}>CONTACT SALES →</a>
          </p>
        </div>
      </div>
    </div>
  );
}
