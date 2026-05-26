import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Package,
  Heart,
  ArrowRight,
  AlertTriangle,
  Lock,
  Grid3X3,
  TrendingUp,
  Bell,
  Monitor,
  Upload,
  Brain,
  CheckCircle2,
  Briefcase
} from "lucide-react";

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

gsap.registerPlugin(ScrollTrigger);

// ────────────────────────────────────────────────────────────────────────────
// ─── 1. Custom Cursor Component
// ────────────────────────────────────────────────────────────────────────────
export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const isHovering = useRef(false);

  useEffect(() => {
    const cursor = cursorRef.current;
    const dot = cursorDotRef.current;
    if (!cursor || !dot) return;

    // Use fast setters for cursor positions to bypass heavy tween creation
    const xTo = gsap.quickTo(cursor, "x", { duration: 0.1, ease: "power2.out" });
    const yTo = gsap.quickTo(cursor, "y", { duration: 0.1, ease: "power2.out" });
    const xDotTo = gsap.quickTo(dot, "x", { duration: 0.02, ease: "none" });
    const yDotTo = gsap.quickTo(dot, "y", { duration: 0.02, ease: "none" });

    const onMove = (e: MouseEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
      xDotTo(e.clientX);
      yDotTo(e.clientY);
    };

    const onEnter = () => {
      if (isHovering.current) return;
      isHovering.current = true;
      gsap.to(cursor, { scale: 1.6, duration: 0.3, ease: "power2.out" });
      gsap.to(cursor, { borderColor: "var(--color-secondary)", duration: 0.3 });
    };

    const onLeave = () => {
      isHovering.current = false;
      gsap.to(cursor, { scale: 1, duration: 0.3, ease: "power2.out" });
      gsap.to(cursor, { borderColor: "rgba(226, 226, 232, 0.25)", duration: 0.3 });
    };

    window.addEventListener("mousemove", onMove);

    const interactives = document.querySelectorAll("a, button, select, input, textarea, [data-cursor-hover]");
    interactives.forEach((el) => {
      el.addEventListener("mouseenter", onEnter);
      el.addEventListener("mouseleave", onLeave);
    });

    return () => {
      window.removeEventListener("mousemove", onMove);
      interactives.forEach((el) => {
        el.removeEventListener("mouseenter", onEnter);
        el.removeEventListener("mouseleave", onLeave);
      });
    };
  }, []);

  return (
    <>
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 hidden md:block"
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          border: "1.5px solid rgba(226, 226, 232, 0.25)",
          backgroundColor: "transparent",
          mixBlendMode: "difference",
        }}
      />
      <div
        ref={cursorDotRef}
        className="fixed top-0 left-0 pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 hidden md:block"
        style={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          backgroundColor: "var(--color-secondary)",
        }}
      />
    </>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// ─── 2. Navbar Component
// ────────────────────────────────────────────────────────────────────────────
const NAV_LINKS = [
  { label: "The Challenge", href: "#problem" },
  { label: "The Architecture", href: "#tech" },
  { label: "The Engine", href: "#solution" },
  { label: "Ingestion Pipeline", href: "#how-it-works" },
  { label: "Case Study", href: "#cta" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNav = (href: string) => {
    setMenuOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-surface-container/85 backdrop-blur-md border-b border-outline-variant/30 shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="flex items-center gap-3 group"
          >
            <div className="relative w-10 h-10 rounded-xl bg-surface-container-high border border-outline-variant/40 flex items-center justify-center overflow-hidden group-hover:shadow-lg group-hover:shadow-secondary/15 transition-all duration-300">
              <Package className="w-5 h-5 text-secondary" strokeWidth={2} />
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <span className="text-lg font-bold tracking-tight text-on-surface">
              MySupplyChain
            </span>
          </a>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNav(link.href)}
                className="px-4 py-2 text-sm font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/40 rounded-full transition-all duration-200 cursor-pointer"
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-3">
            <a
              href="https://github.com/austinchima/MySupplyChain"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-on-surface-variant border border-outline-variant/40 rounded-xl hover:border-outline-variant hover:text-on-surface transition-all duration-200"
            >
              <GithubIcon className="w-4 h-4" />
              GitHub Source
            </a>
            <a
              href="/dashboard"
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-on-primary bg-primary hover:bg-primary-container hover:text-on-primary-container rounded-xl shadow-md hover:shadow-primary/10 transition-all duration-200"
            >
              Launch Sandbox
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden flex flex-col gap-1.5 p-2 cursor-pointer"
            aria-label="Toggle menu"
          >
            <span className={`block w-6 h-0.5 bg-on-surface transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`block w-6 h-0.5 bg-on-surface transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`block w-6 h-0.5 bg-on-surface transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`lg:hidden overflow-hidden transition-all duration-500 ${menuOpen ? "max-h-96" : "max-h-0"}`}>
        <div className="px-6 pb-6 pt-2 bg-surface-container/95 backdrop-blur-xl border-t border-outline-variant/30">
          {NAV_LINKS.map((link) => (
            <button
              key={link.href}
              onClick={() => handleNav(link.href)}
              className="block w-full text-left px-4 py-3 text-sm font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/40 rounded-xl transition-colors"
            >
              {link.label}
            </button>
          ))}
          <div className="flex gap-3 mt-4 pt-4 border-t border-outline-variant/30">
            <a
              href="https://github.com/austinchima/MySupplyChain"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-on-surface-variant border border-outline-variant/40 rounded-xl"
            >
              <GithubIcon className="w-4 h-4" /> GitHub Source
            </a>
            <a
              href="/dashboard"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-on-primary bg-primary rounded-xl text-center"
            >
              Launch Sandbox
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// ─── 3. Hero Section
// ────────────────────────────────────────────────────────────────────────────
export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);
  const trustRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.2 });

    const headlineSpan = headlineRef.current;
    if (headlineSpan) {
      gsap.set(headlineSpan, { y: 40, opacity: 0 });
      tl.to(headlineSpan, {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: "power3.out",
      });
    }

    gsap.set(subRef.current, { y: 30, opacity: 0 });
    tl.to(subRef.current, { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" }, "-=0.4");

    gsap.set(ctaRef.current, { y: 20, opacity: 0 });
    tl.to(ctaRef.current, { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" }, "-=0.4");

    gsap.set(visualRef.current, { y: 40, opacity: 0, scale: 0.96 });
    tl.to(visualRef.current, { y: 0, opacity: 1, scale: 1, duration: 1.0, ease: "power2.out" }, "-=0.5");

    gsap.set(trustRef.current, { y: 15, opacity: 0 });
    tl.to(trustRef.current, { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" }, "-=0.4");

    // Float particles
    const particles = sectionRef.current?.querySelectorAll(".particle");
    particles?.forEach((p, i) => {
      gsap.to(p, {
        y: `+=${20 + i * 10}`,
        x: `+=${(i % 2 === 0 ? 1 : -1) * (15 + i * 5)}`,
        duration: 3 + i * 0.6,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    });

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center pt-24 overflow-hidden bg-background"
    >
      {/* Floating Particles */}
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="particle absolute rounded-full opacity-10"
          style={{
            width: 6 + i * 4,
            height: 6 + i * 4,
            left: `${15 + i * 14}%`,
            top: `${20 + (i % 3) * 20}%`,
            background: i % 2 === 0 ? "var(--color-primary)" : "var(--color-secondary)",
            filter: "blur(2px)",
          }}
        />
      ))}

      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(226,226,232,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(226,226,232,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(175,198,255,0.06)_0%,transparent_60%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 relative z-10 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Panel */}
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/25 mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary" />
              </span>
              <span className="text-xs font-semibold text-secondary">
                Full-Stack Architecture & AI Case Study
              </span>
            </div>

            <h1
              ref={headlineRef}
              className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] mb-6 text-on-surface"
            >
              Predicting Demand.<br />
              Engineering <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Scale.</span>
            </h1>

            <p ref={subRef} className="text-base sm:text-lg text-on-surface-variant leading-relaxed mb-10 w-full max-w-[512px]">
              An elite, high-performance systems engineering showcase. Powered by an ASP.NET Core Clean Architecture API, a native ML.NET forecasting engine, and a premium glassmorphic React terminal.
            </p>

            <div ref={ctaRef} className="flex flex-wrap gap-4 mb-8">
              <a
                href="/dashboard"
                className="group flex items-center gap-2.5 px-8 py-4 text-sm font-bold text-on-primary bg-primary hover:bg-primary-container hover:text-on-primary-container rounded-2xl transition-all duration-300 shadow-lg hover:shadow-primary/15"
              >
                Launch Sandbox Terminal
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </a>
              <a
                href="#tech"
                onClick={(e) => {
                  e.preventDefault();
                  document.querySelector("#tech")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="flex items-center gap-2 px-8 py-4 text-sm font-semibold text-on-surface border border-outline-variant/60 rounded-2xl hover:border-secondary hover:text-secondary transition-all duration-300"
              >
                Explore Technical Specs
              </a>
            </div>

            <div ref={trustRef} className="flex items-center gap-6 text-xs text-on-surface-variant">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-secondary">check_circle</span>
                Pure Clean Architecture (.NET 10)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-secondary">check_circle</span>
                Singular Spectrum Analysis (SSA)
              </span>
            </div>
          </div>

          {/* Right Panel: Glassmorphic Visual */}
          <div ref={visualRef} className="relative hidden lg:block">
            <div className="relative rounded-3xl bg-surface-container border border-outline-variant/30 p-6 shadow-2xl backdrop-blur-md">
              {/* Chrome headers */}
              <div className="flex items-center gap-1.5 mb-6">
                <div className="w-2.5 h-2.5 rounded-full bg-error" />
                <div className="w-2.5 h-2.5 rounded-full bg-tertiary-container" />
                <div className="w-2.5 h-2.5 rounded-full bg-secondary" />
                <div className="ml-4 flex-1 h-6 rounded-lg bg-surface-container-low/60 border border-outline-variant/20 flex items-center px-4">
                  <span className="text-[10px] text-on-surface-variant font-mono">mysupplychain.com/dashboard</span>
                </div>
              </div>

              {/* In-Context Stats */}
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Forecast Accuracy", value: "98.4%", trend: "+2.1%", color: "text-secondary" },
                    { label: "Active SKUs", value: "3 active", trend: "Fully monitored", color: "text-primary" },
                    { label: "Reorder Alerts", value: "1 active", trend: "Laptop Dell XPS 13", color: "text-tertiary" },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-3.5">
                      <p className="text-[10px] text-on-surface-variant mb-1 font-medium">{stat.label}</p>
                      <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                      <p className="text-[9px] text-outline mt-0.5">{stat.trend}</p>
                    </div>
                  ))}
                </div>

                {/* Dashboard Chart Mock */}
                <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold text-on-surface">30-Day Demand Forecast</p>
                    <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-secondary/15 text-secondary border border-secondary/25">Live</span>
                  </div>
                  <svg viewBox="0 0 400 120" className="w-full h-auto">
                    {[0, 1, 2, 3].map((i) => (
                      <line key={i} x1="0" y1={30 * i} x2="400" y2={30 * i} stroke="rgba(226,226,232,0.05)" strokeWidth="1" />
                    ))}
                    {/* Forecast Confidence band */}
                    <path
                      d="M0,50 Q40,42 80,48 T160,40 T240,55 T320,38 T400,45 L400,75 Q360,78 320,70 T240,80 T160,65 T80,68 T0,65 Z"
                      fill="rgba(78,222,163,0.06)"
                    />
                    {/* Bounds */}
                    <path d="M0,50 Q40,42 80,48 T160,40 T240,55 T320,38 T400,45" fill="none" stroke="rgba(78,222,163,0.25)" strokeWidth="1" strokeDasharray="3 3" />
                    <path d="M0,65 Q40,68 80,68 T160,65 T240,80 T320,70 T400,75" fill="none" stroke="rgba(78,222,163,0.25)" strokeWidth="1" strokeDasharray="3 3" />
                    {/* Forecast line */}
                    <path
                      d="M0,57 Q40,55 80,58 T160,52 T240,67 T320,54 T400,58"
                      fill="none"
                      stroke="var(--color-secondary)"
                      strokeWidth="2"
                    />
                    {/* Points */}
                    {[57, 55, 58, 52, 67, 54, 58].map((y, i) => (
                      <circle key={i} cx={i * 66.6} cy={y} r="2.5" fill="var(--color-secondary)" opacity={i < 4 ? 1 : 0.2} />
                    ))}
                    {/* Vertical line */}
                    <line x1="200" y1="0" x2="200" y2="120" stroke="rgba(255,178,183,0.4)" strokeWidth="1" strokeDasharray="3 3" />
                    {/* Reorder node */}
                    <circle cx="280" cy="60" r="4.5" fill="var(--color-tertiary)" />
                    <text x="290" y="63" fill="var(--color-tertiary)" fontSize="8" fontWeight="bold" fontFamily="monospace">REORDER</text>
                  </svg>
                </div>

                {/* Alert Mock */}
                <div className="flex items-center gap-3 bg-tertiary/10 border border-tertiary/20 rounded-xl p-3">
                  <div className="w-8 h-8 rounded-lg bg-tertiary/10 flex items-center justify-center flex-shrink-0 text-tertiary">
                    <span className="material-symbols-outlined text-[18px]">warning</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-tertiary">Reorder Alert: Laptop Dell XPS 13</p>
                    <p className="text-[10px] text-on-surface-variant">Recommended reorder of 15 units due to stock dropping below threshold.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Float badge */}
            <div className="absolute -bottom-4 -right-4 bg-surface-container-high border border-outline-variant/40 rounded-2xl shadow-2xl p-4 floating">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary/15 flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined">trending_down</span>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-on-surface-variant">Stockout Rates Reduced</p>
                  <p className="text-lg font-black text-secondary">-38% YoY</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// ─── 4. Problem Section
// ────────────────────────────────────────────────────────────────────────────
const PROBLEMS = [
  {
    icon: AlertTriangle,
    title: "Unpredictable Stockout Dynamics",
    description: "Determining stock thresholds under high transactional variance is notoriously difficult, leading to premature depletion and critical service level failures.",
    stat: "High Variance",
    statLabel: "univariate time-series noise spikes",
    color: "from-rose-500/10 to-rose-600/5",
    borderColor: "border-rose-500/20",
    iconColor: "text-rose-400",
  },
  {
    icon: Lock,
    title: "Inefficient Safety Allocations",
    description: "Naive thresholding results in excessive buffer capital. Minimizing storage fees requires active safety stock optimization and lead-time buffering.",
    stat: "Excess Buffer",
    statLabel: "underutilized corporate working capital",
    color: "from-amber-500/10 to-amber-600/5",
    borderColor: "border-amber-500/20",
    iconColor: "text-amber-400",
  },
  {
    icon: Grid3X3,
    title: "Fragile Data Orchestration",
    description: "Manual worksheets and legacy formulas do not scale, introducing schema drift, structural calculation errors, and slow batch inference pipelines.",
    stat: "Brittle Logic",
    statLabel: "formula errors and unscalable processes",
    color: "from-primary/10 to-primary/5",
    borderColor: "border-primary/20",
    iconColor: "text-primary",
  },
];

export function ProblemSection() {
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = cardsRef.current;
    if (!container) return;

    const cards = container.querySelectorAll(".problem-card");
    if (cards.length === 0) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      gsap.set(cards, { opacity: 1, y: 0 });
      return;
    }

    gsap.set(cards, { y: 30, opacity: 0 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: "top 85%",
        toggleActions: "play none none none",
      }
    });

    tl.to(cards, {
      y: 0,
      opacity: 1,
      duration: 0.6,
      stagger: 0.1,
      ease: "power2.out",
    });

    return () => {
      tl.kill();
      if (tl.scrollTrigger) tl.scrollTrigger.kill();
    };
  }, []);

  return (
    <section id="problem" className="relative py-24 lg:py-32 bg-background border-t border-outline-variant/30">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,178,183,0.02)_0%,transparent_60%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-error-container/20 border border-error/30 text-error text-xs font-bold mb-6">
            The Engineering Challenge
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-on-surface mb-6 tracking-tight">
            Bridging Enterprise AI & Arbitrary Datasets
          </h2>
          <p className="text-base text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
            Real-world supply chains deal with dirty, unstructured data and unpredictable demand patterns. Traditional statistical models are fragile, while large neural networks are slow and compute-heavy.
          </p>
        </div>

        <div ref={cardsRef} className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {PROBLEMS.map((problem, i) => (
            <div
              key={i}
              className={`problem-card relative p-8 rounded-3xl bg-gradient-to-br ${problem.color} border ${problem.borderColor} backdrop-blur-md hover:-translate-y-1.5 transition-all duration-300`}
            >
              <div className="w-12 h-12 rounded-2xl bg-surface-container flex items-center justify-center mb-6 border border-outline-variant/40">
                <problem.icon className={`w-6 h-6 ${problem.iconColor}`} strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-bold text-on-surface mb-3">{problem.title}</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed mb-6">{problem.description}</p>
              <div className="pt-6 border-t border-outline-variant/30">
                <p className={`text-2xl font-black ${problem.iconColor}`}>{problem.stat}</p>
                <p className="text-[11px] text-outline mt-1 font-medium">{problem.statLabel}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// ─── 5. Solution Section
// ────────────────────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: TrendingUp,
    title: "Singular Spectrum Analysis",
    description: "The backend leverages SSA algorithms to decompose univariate sales histories into deterministic trends, periodic oscillations, and unstructured noise.",
    highlight: "ML.NET Time-Series Engine",
    metric: "30-Day",
    metricLabel: "Forecast Horizon",
    metricColor: "text-secondary",
  },
  {
    icon: Bell,
    title: "Deterministic Reorder Alerts",
    description: "A customized MediatR pipeline evaluates inventory levels against supplier lead times, raising notifications and calculating safety stock buffers.",
    highlight: "MediatR CQRS Pipelines",
    metric: "Real-time",
    metricLabel: "Alert Telemetry",
    metricColor: "text-primary",
  },
  {
    icon: Monitor,
    title: "Glassmorphic UI Terminal",
    description: "A highly responsive dashboard built using React 19, GSAP micro-animations, Outfit geometric typography, and Fira Code monospaced numeric scales.",
    highlight: "Modern Styling System",
    metric: "0 ms",
    metricLabel: "Render Latency",
    metricColor: "text-tertiary",
  },
];

export function SolutionSection() {
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = cardsRef.current;
    if (!container) return;

    const cards = container.querySelectorAll(".feature-card");
    if (cards.length === 0) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      gsap.set(cards, { opacity: 1, y: 0 });
      return;
    }

    gsap.set(cards, { y: 30, opacity: 0 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: "top 85%",
        toggleActions: "play none none none",
      }
    });

    tl.to(cards, {
      y: 0,
      opacity: 1,
      duration: 0.6,
      stagger: 0.1,
      ease: "power2.out",
    });

    return () => {
      tl.kill();
      if (tl.scrollTrigger) tl.scrollTrigger.kill();
    };
  }, []);

  return (
    <section id="solution" className="relative py-24 lg:py-32 bg-surface-container-low border-t border-outline-variant/30">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(78,222,163,0.02)_0%,transparent_60%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/15 border border-secondary/30 text-secondary text-xs font-bold mb-6">
            The Implementation
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-on-surface mb-6 tracking-tight">
            High-Performance AI Demand Pipelines
          </h2>
          <p className="text-base text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
            MySupplyChain replaces manual guesswork with an elegant, MediatR-powered CQRS backend engine, conducting mathematical time-series forecasting directly on C# databases.
          </p>
        </div>

        <div ref={cardsRef} className="grid md:grid-cols-3 gap-8">
          {FEATURES.map((feature, i) => (
            <div
              key={i}
              className="feature-card relative bg-surface-container rounded-3xl border border-outline-variant/30 p-8 hover:-translate-y-1.5 transition-all duration-300 backdrop-blur-md"
            >
              <div className="w-14 h-14 rounded-2xl bg-surface-container-high border border-outline-variant/40 flex items-center justify-center mb-6">
                <feature.icon className="w-7 h-7 text-secondary" strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-bold text-on-surface mb-3">{feature.title}</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed mb-4">{feature.description}</p>
              <span className="inline-block px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-[10px] font-bold text-secondary mb-6">
                {feature.highlight}
              </span>
              <div className="pt-6 border-t border-outline-variant/20">
                <p className={`text-2xl font-black ${feature.metricColor}`}>{feature.metric}</p>
                <p className="text-[11px] text-outline mt-1 font-medium">{feature.metricLabel}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-14">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-surface-container border border-outline-variant/40 text-xs font-semibold text-on-surface shadow-md">
            <span className="material-symbols-outlined text-secondary text-sm">bolt</span>
            Powered by ML.NET — Microsoft's machine learning framework for clean, native .NET C# forecasting.
          </div>
        </div>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// ─── 6. Tech Section
// ────────────────────────────────────────────────────────────────────────────
const LAYERS = [
  {
    name: "API Layer",
    role: "React TSX + REST Controllers",
    icon: Monitor,
    color: "#afc6ff",
    items: ["Secure JWT Bearer Auth", "Global Exception Middleware", "Serilog Request Logger"],
  },
  {
    name: "Application Layer",
    role: "CQRS / MediatR Pipeline Handlers",
    icon: Brain,
    color: "#ffb2b7",
    items: ["Command & Query Dispatch", "FluentValidation Pipeline", "Structured DTO Mappings"],
  },
  {
    name: "Domain Layer",
    role: "Pure C# Domain Invariants",
    icon: Lock,
    color: "#4edea3",
    items: ["Zero Third-Party Deps", "Rich Domain Entities", "State Rule Validation"],
  },
  {
    name: "Infrastructure Layer",
    role: "EF Core / ML.NET / PostgreSQL",
    icon: Upload,
    color: "#ffdad6",
    items: ["ML.NET SSA Trainer", "SQL Server / LocalDB Schema", "Fluent Database Seeds"],
  },
];

export function TechSection() {
  const layersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = layersRef.current;
    if (!container) return;

    const layers = container.querySelectorAll(".arch-layer");
    if (layers.length === 0) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      gsap.set(layers, { opacity: 1, x: 0 });
      return;
    }

    layers.forEach((layer, i) => {
      gsap.set(layer, { x: i % 2 === 0 ? -30 : 30, opacity: 0 });
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: "top 80%",
        toggleActions: "play none none none",
      }
    });

    tl.to(layers, {
      x: 0,
      opacity: 1,
      duration: 0.6,
      stagger: 0.1,
      ease: "power2.out",
    });

    return () => {
      tl.kill();
      if (tl.scrollTrigger) tl.scrollTrigger.kill();
    };
  }, []);

  return (
    <section id="tech" className="relative py-24 lg:py-32 bg-background border-t border-outline-variant/30">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(175,198,255,0.02)_0%,transparent_60%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/15 border border-primary/30 text-primary text-xs font-bold mb-6">
            Technical Architecture
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-on-surface mb-6 tracking-tight">
            Clean Architecture. Engineered to Scale.
          </h2>
          <p className="text-base text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
            Every architectural dependency is structured to support clean separation of concerns, testability, and deterministic machine learning execution.
          </p>
        </div>

        <div ref={layersRef} className="max-w-3xl mx-auto space-y-4 relative">
          <div className="absolute left-[30px] top-4 bottom-4 w-[1.5px] bg-gradient-to-b from-primary via-secondary to-tertiary opacity-15 hidden md:block" />

          {LAYERS.map((layer, i) => (
            <div
              key={i}
              className="arch-layer relative flex flex-col md:flex-row items-start md:items-center gap-6 p-6 rounded-2xl bg-surface-container border border-outline-variant/30 hover:border-outline hover:bg-surface-container-high/40 transition-all duration-300"
            >
              {/* Connector Node */}
              <div
                className="hidden md:flex absolute left-[22.5px] w-4 h-4 rounded-full border-2 bg-background items-center justify-center z-10"
                style={{ borderColor: layer.color }}
              >
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: layer.color }} />
              </div>

              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${layer.color}15` }}
              >
                <layer.icon className="w-6 h-6" style={{ color: layer.color }} strokeWidth={1.5} />
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <h4 className="text-base font-bold text-on-surface">{layer.name}</h4>
                  <span className="text-xs font-mono font-semibold" style={{ color: layer.color }}>{layer.role}</span>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {layer.items.map((item, j) => (
                    <span key={j} className="px-3 py-1 rounded-full bg-surface-container-low border border-outline-variant/30 text-[10px] text-on-surface-variant font-mono">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// ─── 7. How It Works Section
// ────────────────────────────────────────────────────────────────────────────
const STEPS = [
  {
    num: "01",
    icon: Upload,
    title: "Streamed Data Ingestion",
    description: "Upload sales ledger logs. The UI parses and maps arbitrary header columns to standardized application DTO contract schemas.",
    detail: "Custom CSV schema mapper",
    color: "var(--color-primary)",
    borderColor: "border-primary/30",
    bgColor: "bg-primary/5",
  },
  {
    num: "02",
    icon: Brain,
    title: "Univariate Model Fitting",
    description: "The background process dispatches the dataset to the C# ML.NET training engine, isolating seasonality, noise, and cyclic trends.",
    detail: "Singular Spectrum Analysis (SSA)",
    color: "var(--color-secondary)",
    borderColor: "border-secondary/30",
    bgColor: "bg-secondary/5",
  },
  {
    num: "03",
    icon: CheckCircle2,
    title: "Active Telemetry Display",
    description: "The dashboard streams forecast nodes, upper/lower confidence boundaries, safety stock levels, and alert markers automatically.",
    detail: "Dynamic SVG rendering & data projections",
    color: "var(--color-tertiary)",
    borderColor: "border-tertiary/30",
    bgColor: "bg-tertiary/5",
  },
];

export function HowItWorksSection() {
  const stepsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = stepsRef.current;
    if (!container) return;

    const steps = container.querySelectorAll(".step-card");
    if (steps.length === 0) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      gsap.set(steps, { opacity: 1, y: 0 });
      return;
    }

    gsap.set(steps, { y: 30, opacity: 0 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: "top 85%",
        toggleActions: "play none none none",
      }
    });

    tl.to(steps, {
      y: 0,
      opacity: 1,
      duration: 0.6,
      stagger: 0.1,
      ease: "power2.out",
    });

    return () => {
      tl.kill();
      if (tl.scrollTrigger) tl.scrollTrigger.kill();
    };
  }, []);

  return (
    <section id="how-it-works" className="relative py-24 lg:py-32 bg-surface-container-low border-t border-outline-variant/30">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(78,222,163,0.02)_0%,transparent_60%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/15 border border-secondary/30 text-secondary text-xs font-bold mb-6">
            Data Pipeline
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-on-surface mb-6 tracking-tight">
            The Automated Data Ingestion & Model Training Flow
          </h2>
          <p className="text-base text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
            A streamlined asynchronous pipeline parses uploaded transactional records, feeds them to the C# machine learning service, and projects live telemetry on the dashboard.
          </p>
        </div>

        <div ref={stepsRef} className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6 lg:gap-8">
          {STEPS.map((step, i) => (
            <div
              key={i}
              className={`step-card relative p-8 rounded-3xl ${step.bgColor} border ${step.borderColor} hover:-translate-y-1.5 transition-all duration-300`}
            >
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-2xl bg-surface-container border border-outline-variant/30 flex items-center justify-center shadow-inner">
                  <step.icon className="w-6 h-6" style={{ color: step.color }} strokeWidth={1.5} />
                </div>
                <span className="text-3xl font-black opacity-15 select-none" style={{ color: step.color }}>{step.num}</span>
              </div>
              <h3 className="text-lg font-bold text-on-surface mb-3">{step.title}</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed mb-4">{step.description}</p>
              <p className="text-xs font-semibold" style={{ color: step.color }}>{step.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// ─── 8. CTA Section
// ────────────────────────────────────────────────────────────────────────────
export function CTASection() {
  return (
    <section id="cta" className="relative py-24 lg:py-32 bg-background border-t border-outline-variant/30">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(78,222,163,0.03)_0%,transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_100%,rgba(175,198,255,0.03)_0%,transparent_50%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Portfolio Case Study Detail Column */}
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/15 border border-secondary/30 text-secondary text-xs font-bold mb-6">
              Engineering Case Study
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-on-surface mb-6 tracking-tight">
              An Advanced Full-Stack Systems Showcase
            </h2>
            <p className="text-sm sm:text-base text-on-surface-variant mb-8 leading-relaxed">
              This project is built from the ground up as a clinical, high-performance systems engineering showcase. It demonstrates how to integrate advanced AI models, CQRS pipeline validation frameworks, and dynamic web user interfaces under one coherent architecture.
            </p>

            <div className="space-y-4 mb-8 text-sm">
              {[
                "Clean Architecture boundaries with 100% separated business layers",
                "Singular Spectrum Analysis (SSA) for robust univariate AI forecasting",
                "High-volume streamed CSV ingestion with active field-mapping controls",
                "Integrated JWT authentication checks and automated DB seeding scripts"
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-secondary text-sm mt-0.5">check_circle</span>
                  <span className="text-on-surface-variant">{item}</span>
                </div>
              ))}
            </div>

            <div className="p-6 rounded-2xl bg-surface-container border border-outline-variant/30 text-xs flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
                <Briefcase className="w-5 h-5" strokeWidth={1.5} />
              </div>
              <div className="space-y-1">
                <p className="text-on-surface font-bold">Hiring Managers & Engineering Teams</p>
                <p className="text-on-surface-variant leading-relaxed">
                  I engineered this system to showcase deep vertical capabilities—handling advanced database schemas, robust MediatR pipelines, custom CSV stream parsers, and custom model training endpoints in C#.
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Sandbox Guide Column */}
          <div>
            <div className="p-8 rounded-3xl bg-surface-container border border-outline-variant/30 space-y-6 shadow-xl backdrop-blur-md relative overflow-hidden">
              <div className="absolute inset-x-0 -top-px h-[2px] bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
              
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                  <span className="material-symbols-outlined text-[24px]">terminal</span>
                </div>
                <h3 className="text-lg font-bold text-on-surface">Explore the Live Sandbox Terminal</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  The entire system is active and connected to a live local database and ML.NET forecasting service. You can instantly sign up for beta access to obtain a 120-day sandbox key or review the raw source code.
                </p>
              </div>

              <div className="space-y-4 pt-2">
                <a
                  href="/dashboard"
                  className="group w-full py-4 px-4 font-bold text-on-primary bg-primary hover:bg-primary-container hover:text-on-primary-container rounded-xl shadow-lg hover:shadow-primary/15 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">rocket_launch</span>
                  Launch Interactive Sandbox
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </a>

                <a
                  href="https://github.com/austinchima/MySupplyChain"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-4 font-semibold text-on-surface border border-outline-variant/60 hover:border-secondary hover:text-secondary rounded-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <GithubIcon className="w-4 h-4" />
                  Browse GitHub Repository
                </a>
              </div>

              <div className="text-[10px] text-outline/80 text-center leading-relaxed font-mono mt-4 pt-4 border-t border-outline-variant/15">
                SHOWCASE PROJECT · C# .NET 10 · REACT 19 · POSTGRESQL · ML.NET
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// ─── 9. Footer Section
// ────────────────────────────────────────────────────────────────────────────
export function FooterSection() {
  const handleNav = (href: string) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer className="relative bg-surface-container border-t border-outline-variant/30">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-14">
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-md">
                <Package className="w-5 h-5" strokeWidth={2} />
              </div>
              <span className="text-base font-bold text-on-surface">MySupplyChain</span>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Clean Architecture, MediatR CQRS pipelines, and ML.NET time-series demand forecasting systems showcase. Engineered with absolute precision.
            </p>
          </div>

          {/* Links */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-on-surface uppercase tracking-widest">Case Study</h4>
            <ul className="space-y-2 text-xs">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <button
                    onClick={() => handleNav(link.href)}
                    className="text-on-surface-variant hover:text-secondary transition-colors cursor-pointer"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact details */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-on-surface uppercase tracking-widest">Connect</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="https://github.com/austinchima/MySupplyChain"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-on-surface-variant hover:text-secondary transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">code</span>
                  GitHub Codebase
                </a>
              </li>
              <li>
                <a
                  href="https://www.linkedin.com/in/austin-chima"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-on-surface-variant hover:text-secondary transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">contact_page</span>
                  LinkedIn Profile
                </a>
              </li>
              <li>
                <a
                  href="mailto:austinchima515@gmail.com"
                  className="inline-flex items-center gap-2 text-on-surface-variant hover:text-secondary transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">mail</span>
                  Email Founder
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Line */}
        <div className="pt-8 border-t border-outline-variant/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-on-surface-variant">
          <p>&copy; {new Date().getFullYear()} MySupplyChain. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            Designed with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> in Nova Scotia, Canada
          </p>
        </div>
      </div>
    </footer>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// ─── 10. Core LandingPage Page Wrapper
// ────────────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  useEffect(() => {
    // Refresh scrollTriggers on resize
    const timeout = setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 150);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="relative bg-background min-h-screen text-on-surface selection:bg-secondary/30 selection:text-white">
      <CustomCursor />
      <Navbar />
      <main>
        <HeroSection />
        <ProblemSection />
        <SolutionSection />
        <TechSection />
        <HowItWorksSection />
        <CTASection />
      </main>
      <FooterSection />
    </div>
  );
}
