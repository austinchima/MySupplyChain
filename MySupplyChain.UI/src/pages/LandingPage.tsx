import { Link } from "react-router-dom";
import { useEffect, useRef } from "react";

function useCountUp(target: number, duration = 2000) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start = Math.min(start + step, target);
      el.textContent = Math.floor(start).toLocaleString();
      if (start >= target) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return ref;
}

function StatCounter({ value, suffix, label }: { value: number; suffix?: string; label: string }) {
  const ref = useCountUp(value);
  return (
    <div className="text-center">
      <div className="text-3xl font-bold tabular-nums" style={{ fontFamily: "Space Grotesk", color: "#dce3f0" }}>
        <span ref={ref}>0</span>
        {suffix && <span>{suffix}</span>}
      </div>
      <div className="text-sm mt-1.5" style={{ fontFamily: "JetBrains Mono", color: "#869395", letterSpacing: "0.06em" }}>{label}</div>
    </div>
  );
}

const NAV_LINKS = ["Features", "Solutions", "Pricing", "Docs"];

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: "#0d141d", color: "#dce3f0" }}>

      {/* ── Ambient Background ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="ck-orb-primary" style={{ top: "-10%", right: "-5%", width: "700px", height: "700px" }} />
        <div className="ck-orb-secondary" style={{ bottom: "-20%", left: "-10%", width: "600px", height: "600px" }} />
        <div className="ck-grid-pattern absolute inset-0 opacity-50" />
      </div>

      {/* ── Nav ── */}
      <header className="ck-glass relative z-50 sticky top-0">
        <div className="max-w-7xl mx-auto px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#5ad7e7", boxShadow: "0 0 20px rgba(90,215,231,0.3)" }}>
              <span className="material-symbols-outlined filled text-[18px]" style={{ color: "#00363c" }}>hub</span>
            </div>
            <span style={{ fontFamily: "Space Grotesk", fontWeight: 600, fontSize: "16px", color: "#dce3f0", letterSpacing: "-0.01em" }}>
              MySupplyChain
            </span>
          </div>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="px-4 py-2 rounded-lg text-sm transition-all"
                style={{ fontFamily: "Geist, system-ui", color: "#869395", fontWeight: 500 }}
                onMouseEnter={(e) => { (e.target as HTMLElement).style.color = "#dce3f0"; (e.target as HTMLElement).style.background = "rgba(61,73,75,0.25)"; }}
                onMouseLeave={(e) => { (e.target as HTMLElement).style.color = "#869395"; (e.target as HTMLElement).style.background = "transparent"; }}
              >
                {item}
              </a>
            ))}
          </nav>

          {/* CTA */}
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="hidden sm:block text-sm transition-colors"
              style={{ fontFamily: "JetBrains Mono", color: "#869395", fontWeight: 500, letterSpacing: "0.04em" }}
            >
              Sign in
            </Link>
            <Link to="/login" className="ck-cta-btn" style={{ padding: "9px 20px", fontSize: "12px" }}>
              GET STARTED
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative z-10 pt-28 pb-24 px-6 md:px-8 text-center">
        <div className="ck-hero-glow" />
        <div className="max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full" style={{ background: "rgba(90,215,231,0.08)", border: "1px solid rgba(90,215,231,0.2)" }}>
            <span className="ck-pulse-dot" />
            <span style={{ fontFamily: "JetBrains Mono", fontSize: "11px", fontWeight: 500, letterSpacing: "0.1em", color: "#5ad7e7" }}>
              AI FORECASTING ENGINE V2.0 — NOW LIVE
            </span>
          </div>

          {/* Headline */}
          <h1 className="mb-6" style={{ fontFamily: "Space Grotesk", fontSize: "clamp(40px,7vw,72px)", fontWeight: 700, lineHeight: 1.08, letterSpacing: "-0.04em", color: "#dce3f0" }}>
            Master your supply chain
            <br />
            <span className="ck-gradient-text">with predictive AI.</span>
          </h1>

          {/* Body */}
          <p className="mb-10 max-w-2xl mx-auto" style={{ fontFamily: "Geist, system-ui", fontSize: "18px", lineHeight: 1.6, color: "#bcc9cb" }}>
            Eliminate stockouts, cut waste by 40%, and automate reorders with an AI engine
            that predicts demand before your warehouse feels it.
          </p>

          {/* CTA Row */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link to="/login" className="ck-cta-btn">
              START FREE TRIAL
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
            <button className="ck-cta-ghost">
              <span className="material-symbols-outlined text-[18px]" style={{ color: "#5ad7e7" }}>play_circle</span>
              WATCH DEMO
            </button>
          </div>

          {/* Trust line */}
          <div className="flex flex-wrap items-center justify-center gap-6">
            <span style={{ fontFamily: "JetBrains Mono", fontSize: "11px", color: "#3d494b", letterSpacing: "0.08em" }}>TRUSTED BY</span>
            {["ACMECORE", "LOGITECH", "SUPPLYMAX", "WAREFLOW", "ORDERBRIDGE"].map((co) => (
              <span key={co} style={{ fontFamily: "JetBrains Mono", fontSize: "11px", fontWeight: 600, color: "#3d494b", letterSpacing: "0.12em" }}>{co}</span>
            ))}
          </div>
        </div>

        {/* ── Dashboard Preview ── */}
        <div className="relative max-w-5xl mx-auto mt-16">
          {/* Bottom fade */}
          <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none z-10 rounded-b-xl" style={{ background: "linear-gradient(to bottom, transparent, #0d141d)" }} />

          <div className="ck-browser-chrome text-left">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-4 py-3" style={{ background: "#080f18", borderBottom: "1px solid rgba(61,73,75,0.5)" }}>
              <span className="w-3 h-3 rounded-full" style={{ background: "rgba(255,180,171,0.5)" }} />
              <span className="w-3 h-3 rounded-full" style={{ background: "rgba(90,215,231,0.4)" }} />
              <span className="w-3 h-3 rounded-full" style={{ background: "rgba(90,215,231,0.6)" }} />
              <div className="ml-4 flex-1 rounded flex items-center px-3 gap-2" style={{ background: "#19202a", height: "24px", border: "1px solid rgba(61,73,75,0.5)" }}>
                <span className="material-symbols-outlined text-[13px]" style={{ color: "#5ad7e7" }}>lock</span>
                <span style={{ fontFamily: "JetBrains Mono", fontSize: "11px", color: "#869395" }}>app.mysupplychain.io/dashboard</span>
              </div>
            </div>
            {/* Dashboard mockup */}
            <div className="p-5" style={{ background: "#0d141d" }}>
              {/* Top stats */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { label: "ACTIVE PRODUCTS", value: "2,847", color: "#5ad7e7", icon: "inventory_2" },
                  { label: "REORDER ALERTS", value: "14", color: "#ffb4ab", icon: "warning" },
                  { label: "ORDERS TODAY", value: "312", color: "#bdc9cb", icon: "receipt_long" },
                ].map((c) => (
                  <div key={c.label} className="ck-summary-card" style={{ padding: "16px" }}>
                    <div className="flex justify-between items-start mb-2">
                      <span style={{ fontFamily: "JetBrains Mono", fontSize: "10px", letterSpacing: "0.1em", color: "#869395" }}>{c.label}</span>
                      <span className="material-symbols-outlined text-[16px]" style={{ color: c.color }}>{c.icon}</span>
                    </div>
                    <div style={{ fontFamily: "Space Grotesk", fontSize: "24px", fontWeight: 700, color: c.color }}>{c.value}</div>
                  </div>
                ))}
              </div>
              {/* Chart */}
              <div className="ck-card" style={{ padding: "16px" }}>
                <div className="flex justify-between items-center mb-3">
                  <span style={{ fontFamily: "Space Grotesk", fontSize: "13px", fontWeight: 500, color: "#dce3f0" }}>Demand Forecast — Next 30 Days</span>
                  <span className="ck-chip ck-chip-primary">AI PREDICTION</span>
                </div>
                <div className="flex items-end gap-1 h-20">
                  {[38, 52, 44, 68, 58, 79, 63, 88, 72, 94, 83, 99, 87, 91, 76, 88, 95, 82, 90, 78].map((h, i) => (
                    <div key={i} className="flex-1 rounded-t-sm transition-all" style={{ height: `${h}%`, background: i > 13 ? "rgba(90,215,231,0.2)" : "rgba(90,215,231,0.55)", borderTop: i > 13 ? "1px dashed rgba(90,215,231,0.4)" : "none" }} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Floating badges */}
          <div className="ck-float-badge absolute -left-10 top-1/3 hidden lg:flex">
            <span className="material-symbols-outlined text-[20px]" style={{ color: "#5ad7e7" }}>bolt</span>
            <div>
              <div style={{ fontFamily: "Space Grotesk", fontSize: "13px", fontWeight: 600, color: "#dce3f0" }}>45% less waste</div>
              <div style={{ fontFamily: "JetBrains Mono", fontSize: "10px", color: "#869395" }}>AVG. CUSTOMER RESULT</div>
            </div>
          </div>
          <div className="ck-float-badge ck-float-badge-delay absolute -right-10 top-1/2 hidden lg:flex">
            <span className="material-symbols-outlined text-[20px]" style={{ color: "#5ad7e7" }}>speed</span>
            <div>
              <div style={{ fontFamily: "Space Grotesk", fontSize: "13px", fontWeight: 600, color: "#dce3f0" }}>3ms latency</div>
              <div style={{ fontFamily: "JetBrains Mono", fontSize: "10px", color: "#869395" }}>REAL-TIME TRACKING</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section className="relative z-10 py-16 ck-divider" style={{ borderTop: "1px solid rgba(61,73,75,0.5)", borderBottom: "1px solid rgba(61,73,75,0.5)", background: "rgba(21,28,38,0.5)" }}>
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          <StatCounter value={2847} label="PRODUCTS TRACKED" />
          <StatCounter value={45} suffix="%" label="AVG WASTE REDUCTION" />
          <StatCounter value={99} suffix=".9%" label="UPTIME SLA" />
          <StatCounter value={312} label="ORDERS AUTOMATED" />
        </div>
      </section>

      {/* ── Features Bento ── */}
      <section id="features" className="relative z-10 py-24 px-6 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="ck-section-label block mb-4">PLATFORM FEATURES</span>
            <h2 style={{ fontFamily: "Space Grotesk", fontSize: "clamp(28px,4vw,44px)", fontWeight: 600, letterSpacing: "-0.03em", color: "#dce3f0" }}>
              Everything your team needs.
            </h2>
            <p className="mt-4 max-w-xl mx-auto" style={{ fontFamily: "Geist, system-ui", fontSize: "16px", color: "#869395", lineHeight: 1.6 }}>
              Built for precision. Designed for scale. Engineered for the world's most demanding supply chains.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Large feature */}
            <div className="ck-feature-card lg:col-span-2">
              <div className="w-11 h-11 rounded-lg flex items-center justify-center mb-6" style={{ background: "rgba(90,215,231,0.1)", border: "1px solid rgba(90,215,231,0.2)" }}>
                <span className="material-symbols-outlined text-[24px]" style={{ color: "#5ad7e7" }}>monitoring</span>
              </div>
              <h3 style={{ fontFamily: "Space Grotesk", fontSize: "22px", fontWeight: 600, letterSpacing: "-0.02em", color: "#dce3f0", marginBottom: "12px" }}>
                AI Demand Forecasting
              </h3>
              <p style={{ fontFamily: "Geist, system-ui", fontSize: "15px", color: "#869395", lineHeight: 1.6, marginBottom: "20px" }}>
                Neural networks trained on your historical data predict demand with 94%+ accuracy.
                Never be caught off-guard again.
              </p>
              <div className="flex flex-wrap gap-2">
                {["ML-POWERED", "30-DAY HORIZON", "CONFIDENCE INTERVALS", "AUTO-REORDER"].map((tag) => (
                  <span key={tag} className="ck-chip ck-chip-primary">{tag}</span>
                ))}
              </div>
            </div>

            <div className="ck-feature-card">
              <div className="w-11 h-11 rounded-lg flex items-center justify-center mb-6" style={{ background: "rgba(90,215,231,0.08)", border: "1px solid rgba(90,215,231,0.15)" }}>
                <span className="material-symbols-outlined text-[24px]" style={{ color: "#5ad7e7" }}>sensors</span>
              </div>
              <h3 style={{ fontFamily: "Space Grotesk", fontSize: "18px", fontWeight: 500, letterSpacing: "-0.02em", color: "#dce3f0", marginBottom: "10px" }}>
                Real-time Tracking
              </h3>
              <p style={{ fontFamily: "Geist, system-ui", fontSize: "14px", color: "#869395", lineHeight: 1.6 }}>
                Monitor every SKU across every warehouse with millisecond-level precision.
              </p>
            </div>

            <div className="ck-feature-card">
              <div className="w-11 h-11 rounded-lg flex items-center justify-center mb-6" style={{ background: "rgba(90,215,231,0.08)", border: "1px solid rgba(90,215,231,0.15)" }}>
                <span className="material-symbols-outlined text-[24px]" style={{ color: "#5ad7e7" }}>smart_toy</span>
              </div>
              <h3 style={{ fontFamily: "Space Grotesk", fontSize: "18px", fontWeight: 500, letterSpacing: "-0.02em", color: "#dce3f0", marginBottom: "10px" }}>
                Automated Restocking
              </h3>
              <p style={{ fontFamily: "Geist, system-ui", fontSize: "14px", color: "#869395", lineHeight: 1.6 }}>
                Smart purchase orders fire automatically when stock hits predicted thresholds.
              </p>
            </div>

            <div className="ck-feature-card">
              <div className="w-11 h-11 rounded-lg flex items-center justify-center mb-6" style={{ background: "rgba(90,215,231,0.08)", border: "1px solid rgba(90,215,231,0.15)" }}>
                <span className="material-symbols-outlined text-[24px]" style={{ color: "#5ad7e7" }}>account_tree</span>
              </div>
              <h3 style={{ fontFamily: "Space Grotesk", fontSize: "18px", fontWeight: 500, letterSpacing: "-0.02em", color: "#dce3f0", marginBottom: "10px" }}>
                Multi-Warehouse
              </h3>
              <p style={{ fontFamily: "Geist, system-ui", fontSize: "14px", color: "#869395", lineHeight: 1.6 }}>
                Unified inventory view across all facilities. Intelligent inter-facility transfers.
              </p>
            </div>

            <div className="ck-feature-card lg:col-span-2">
              <div className="w-11 h-11 rounded-lg flex items-center justify-center mb-6" style={{ background: "rgba(90,215,231,0.08)", border: "1px solid rgba(90,215,231,0.15)" }}>
                <span className="material-symbols-outlined text-[24px]" style={{ color: "#5ad7e7" }}>api</span>
              </div>
              <h3 style={{ fontFamily: "Space Grotesk", fontSize: "22px", fontWeight: 600, letterSpacing: "-0.02em", color: "#dce3f0", marginBottom: "12px" }}>
                API-First Architecture
              </h3>
              <p style={{ fontFamily: "Geist, system-ui", fontSize: "15px", color: "#869395", lineHeight: 1.6, marginBottom: "20px" }}>
                Built on Clean Architecture with a RESTful API. Integrate with your ERP, WMS, or any third-party tool in minutes.
              </p>
              <div className="ck-code-block">
                <span style={{ color: "#5ad7e7" }}>GET</span>{" "}
                <span style={{ color: "#bdc9cb" }}>/api/products/{"{id}"}/forecast</span>
                <br />
                <span style={{ color: "#3d494b" }}>→ AI-powered 30-day demand forecast with confidence intervals</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="relative z-10 py-24 px-6 md:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="ck-feature-card" style={{ padding: "64px 48px" }}>
            <div className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-6" style={{ background: "rgba(90,215,231,0.1)", border: "1px solid rgba(90,215,231,0.2)" }}>
              <span className="material-symbols-outlined filled text-[30px]" style={{ color: "#5ad7e7" }}>rocket_launch</span>
            </div>
            <h2 style={{ fontFamily: "Space Grotesk", fontSize: "36px", fontWeight: 700, letterSpacing: "-0.03em", color: "#dce3f0", marginBottom: "16px" }}>
              Ready to take control?
            </h2>
            <p style={{ fontFamily: "Geist, system-ui", fontSize: "16px", color: "#869395", lineHeight: 1.6, marginBottom: "32px" }}>
              Join hundreds of operations teams that trust MySupplyChain to keep their supply lines running.
            </p>
            <Link to="/login" className="ck-cta-btn">
              START FOR FREE
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
            <p style={{ fontFamily: "JetBrains Mono", fontSize: "11px", color: "#3d494b", letterSpacing: "0.06em", marginTop: "16px" }}>
              NO CREDIT CARD REQUIRED · 14-DAY FREE TRIAL
            </p>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 py-12 px-8" style={{ borderTop: "1px solid rgba(61,73,75,0.4)" }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#5ad7e7" }}>
                  <span className="material-symbols-outlined filled text-[16px]" style={{ color: "#00363c" }}>hub</span>
                </div>
                <span style={{ fontFamily: "Space Grotesk", fontWeight: 600, fontSize: "15px", color: "#dce3f0" }}>MySupplyChain</span>
              </div>
              <p style={{ fontFamily: "Geist, system-ui", fontSize: "13px", color: "#869395", lineHeight: 1.6, maxWidth: "240px" }}>
                AI-powered inventory management. Precision you can trust.
              </p>
            </div>
            {[
              { heading: "PRODUCT", links: ["Features", "Forecasting", "API Reference", "Changelog"] },
              { heading: "RESOURCES", links: ["Documentation", "Case Studies", "Blog", "Status"] },
              { heading: "COMPANY", links: ["About", "Careers", "Contact", "Legal"] },
            ].map(({ heading, links }) => (
              <div key={heading}>
                <h4 style={{ fontFamily: "JetBrains Mono", fontSize: "10px", fontWeight: 500, color: "#5ad7e7", letterSpacing: "0.12em", marginBottom: "16px" }}>{heading}</h4>
                <ul className="space-y-2.5">
                  {links.map((link) => (
                    <li key={link}>
                      <a href="#" style={{ fontFamily: "Geist, system-ui", fontSize: "13px", color: "#869395", textDecoration: "none", transition: "color 0.15s" }}
                        onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "#dce3f0")}
                        onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "#869395")}>
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4" style={{ borderTop: "1px solid rgba(61,73,75,0.4)", paddingTop: "24px" }}>
            <p style={{ fontFamily: "JetBrains Mono", fontSize: "11px", color: "#3d494b", letterSpacing: "0.06em" }}>© 2024 MYSUPPLYCHAIN CORP · ALL RIGHTS RESERVED</p>
            <div className="flex gap-2">
              {["language", "shield", "terminal"].map((icon) => (
                <button key={icon} className="ck-icon-btn">
                  <span className="material-symbols-outlined text-[18px]">{icon}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
