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
  Send,
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

    const onMove = (e: MouseEvent) => {
      gsap.to(cursor, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.1,
        ease: "power2.out",
      });
      gsap.to(dot, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.02,
        ease: "none",
      });
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
  { label: "Problem", href: "#problem" },
  { label: "Solution", href: "#solution" },
  { label: "Architecture", href: "#tech" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Early Access", href: "#cta" },
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
              GitHub
            </a>
            <a
              href="/dashboard"
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-on-primary bg-primary hover:bg-primary-container hover:text-on-primary-container rounded-xl shadow-md hover:shadow-primary/10 transition-all duration-200"
            >
              Console Console
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
              <GithubIcon className="w-4 h-4" /> GitHub
            </a>
            <a
              href="/dashboard"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-on-primary bg-primary rounded-xl text-center"
            >
              Console
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
                Now in Early Access — 10 Spots Available
              </span>
            </div>

            <h1
              ref={headlineRef}
              className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] mb-6 text-on-surface"
            >
              Stop Guessing.<br />
              Start <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Forecasting.</span>
            </h1>

            <p ref={subRef} className="text-base sm:text-lg text-on-surface-variant leading-relaxed mb-10 max-w-lg">
              AI-powered demand forecasting that analyzes your historical sales to tell you exactly what to reorder and when—so you never run out of stock or lock cash in overstock.
            </p>

            <div ref={ctaRef} className="flex flex-wrap gap-4 mb-8">
              <a
                href="#cta"
                onClick={(e) => {
                  e.preventDefault();
                  document.querySelector("#cta")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="group flex items-center gap-2.5 px-8 py-4 text-sm font-bold text-on-primary bg-primary hover:bg-primary-container hover:text-on-primary-container rounded-2xl transition-all duration-300 shadow-lg hover:shadow-primary/15"
              >
                Try Free for 120 Days
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </a>
              <a
                href="#how-it-works"
                onClick={(e) => {
                  e.preventDefault();
                  document.querySelector("#how-it-works")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="flex items-center gap-2 px-8 py-4 text-sm font-semibold text-on-surface border border-outline-variant/60 rounded-2xl hover:border-secondary hover:text-secondary transition-all duration-300"
              >
                See How It Works
              </a>
            </div>

            <div ref={trustRef} className="flex items-center gap-6 text-xs text-on-surface-variant">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-secondary">check_circle</span>
                No credit card required
              </span>
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-secondary">check_circle</span>
                Cancel anytime
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
                    { label: "Forecast Accuracy", value: "94.2%", trend: "+2.1%", color: "text-secondary" },
                    { label: "Active SKUs", value: "1,247", trend: "+89 new", color: "text-primary" },
                    { label: "Reorder Alerts", value: "12 active", trend: "Critical level", color: "text-tertiary" },
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
                    <p className="text-xs font-bold text-tertiary">Reorder Alert: Organic Flour (25kg)</p>
                    <p className="text-[10px] text-on-surface-variant">Recommended reorder of 80 units due to seasonal demand spike.</p>
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
    title: "The 3 AM Stockout Crisis",
    description: "Your best-selling product flies out of stock. Lead times are weeks. You just lost days of vital, compounding revenues.",
    stat: "23% of SMBs",
    statLabel: "lose sales weekly to preventable stockouts",
    color: "from-rose-500/10 to-rose-600/5",
    borderColor: "border-rose-500/20",
    iconColor: "text-rose-400",
  },
  {
    icon: Lock,
    title: "The Cash-Trap Warehouse",
    description: "You over-ordered inventory just to 'be safe.' Now valuable working capital is collecting dust on warehouse shelves.",
    stat: "$1.1 Trillion",
    statLabel: "locked up globally in excess storage fees",
    color: "from-amber-500/10 to-amber-600/5",
    borderColor: "border-amber-500/20",
    iconColor: "text-amber-400",
  },
  {
    icon: Grid3X3,
    title: "The Spreadsheet Nightmare",
    description: "Relying on a dozen Excel tabs, copy-paste cell equations, and gut feeling. Safe growth cannot scale on fragile systems.",
    stat: "67% of Brands",
    statLabel: "still manage inventories on spreadsheets",
    color: "from-primary/10 to-primary/5",
    borderColor: "border-primary/20",
    iconColor: "text-primary",
  },
];

export function ProblemSection() {
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cards = cardsRef.current?.querySelectorAll(".problem-card");
    if (!cards) return;

    const tweens: gsap.core.Tween[] = [];

    cards.forEach((card) => {
      gsap.set(card, { y: 40, opacity: 0 });
      const tween = gsap.to(card, {
        y: 0,
        opacity: 1,
        duration: 0.7,
        ease: "power2.out",
        scrollTrigger: {
          trigger: card,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      });
      tweens.push(tween);
    });

    return () => tweens.forEach(t => t.kill());
  }, []);

  return (
    <section id="problem" className="relative py-24 lg:py-32 bg-background border-t border-outline-variant/30">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,178,183,0.02)_0%,transparent_60%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-error-container/20 border border-error/30 text-error text-xs font-bold mb-6">
            The Problem
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-on-surface mb-6 tracking-tight">
            Inventory Management Should Not Be a Crisis
          </h2>
          <p className="text-base text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
            Every year, small businesses lose millions to manual stockout errors. The advanced forecasting systems designed to solve this are built only for enterprise budgets.
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
    title: "30-Day Demand Forecasts",
    description: "Upload sales history and generate immediate demand predictions using Singular Spectrum Analysis—the standard in statistical univariate time-series modeling.",
    highlight: "95% Confidence Bounds",
    metric: "30-Day",
    metricLabel: "Forecast Horizon",
    metricColor: "text-secondary",
  },
  {
    icon: Bell,
    title: "Dynamic Reorder Alerts",
    description: "Receive notifications detailing exactly when to place inventory orders, recommended volume, and automated dollar-denominated risk assessments.",
    highlight: "Lead-Time Adjusted",
    metric: "< 6 Hours",
    metricLabel: "Trigger Time",
    metricColor: "text-primary",
  },
  {
    icon: Monitor,
    title: "Beautiful, Frictionless UI",
    description: "Access a clean, dark-themed responsive command center. No enterprise certifications, six-week implementation plans, or IT support required.",
    highlight: "Under 5 Min Setup",
    metric: "Zero",
    metricLabel: "Onboarding Friction",
    metricColor: "text-tertiary",
  },
];

export function SolutionSection() {
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cards = cardsRef.current?.querySelectorAll(".feature-card");
    if (!cards) return;

    const tweens: gsap.core.Tween[] = [];

    cards.forEach((card) => {
      gsap.set(card, { y: 40, opacity: 0 });
      const tween = gsap.to(card, {
        y: 0,
        opacity: 1,
        duration: 0.7,
        ease: "power2.out",
        scrollTrigger: {
          trigger: card,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      });
      tweens.push(tween);
    });

    return () => tweens.forEach(t => t.kill());
  }, []);

  return (
    <section id="solution" className="relative py-24 lg:py-32 bg-surface-container-low border-t border-outline-variant/30">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(78,222,163,0.02)_0%,transparent_60%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/15 border border-secondary/30 text-secondary text-xs font-bold mb-6">
            The Solution
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-on-surface mb-6 tracking-tight">
            Predict Live Stock Needs. Save Idle Cash.
          </h2>
          <p className="text-base text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
            MySupplyChain replaces spreadsheet fatigue with a clean, MediatR-powered CQRS engine that runs mathematical demand forecasting on your actual sales records.
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
    const layers = layersRef.current?.querySelectorAll(".arch-layer");
    if (!layers) return;

    const tweens: gsap.core.Tween[] = [];

    layers.forEach((layer, i) => {
      gsap.set(layer, { x: i % 2 === 0 ? -30 : 30, opacity: 0 });
      const tween = gsap.to(layer, {
        x: 0,
        opacity: 1,
        duration: 0.7,
        ease: "power2.out",
        scrollTrigger: {
          trigger: layer,
          start: "top 80%",
          toggleActions: "play none none none",
        },
      });
      tweens.push(tween);
    });

    return () => tweens.forEach(t => t.kill());
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
    title: "Ingest Sales CSV Data",
    description: "Export transaction history from QuickBooks, Shopify, or Excel. Drag and drop the messy CSV into our dashboard mapping console.",
    detail: "Supports custom headers automatically.",
    color: "var(--color-primary)",
    borderColor: "border-primary/30",
    bgColor: "bg-primary/5",
  },
  {
    num: "02",
    icon: Brain,
    title: "AI Decomposes Seasonal Trends",
    description: "The ML.NET engine isolates trends, seasonality, and transactional noise patterns using Singular Spectrum Analysis algorithms.",
    detail: "Trained on your real-world local sales data.",
    color: "var(--color-secondary)",
    borderColor: "border-secondary/30",
    bgColor: "bg-secondary/5",
  },
  {
    num: "03",
    icon: CheckCircle2,
    title: "Extract Live Forecast Insights",
    description: "Access 30-day demand predictions with confidence bounds. Obtain reorder points, timing dates, and dollar-at-risk indexes.",
    detail: "Incorporates supplier lead time buffers.",
    color: "var(--color-tertiary)",
    borderColor: "border-tertiary/30",
    bgColor: "bg-tertiary/5",
  },
];

export function HowItWorksSection() {
  const stepsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const steps = stepsRef.current?.querySelectorAll(".step-card");
    if (!steps) return;

    const tweens: gsap.core.Tween[] = [];

    steps.forEach((step) => {
      gsap.set(step, { y: 40, opacity: 0 });
      const tween = gsap.to(step, {
        y: 0,
        opacity: 1,
        duration: 0.7,
        ease: "power2.out",
        scrollTrigger: {
          trigger: step,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      });
      tweens.push(tween);
    });

    return () => tweens.forEach(t => t.kill());
  }, []);

  return (
    <section id="how-it-works" className="relative py-24 lg:py-32 bg-surface-container-low border-t border-outline-variant/30">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(78,222,163,0.02)_0%,transparent_60%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/15 border border-secondary/30 text-secondary text-xs font-bold mb-6">
            Ingestion Flow
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-on-surface mb-6 tracking-tight">
            From Messy CSV to Active Forecast in 3 Steps
          </h2>
          <p className="text-base text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
            No expensive consultants, database schema migrations, or engineering workshops. Build your first forecast dashboard before your coffee cools.
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
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    business: "",
    email: "",
    skuCount: "",
    painPoint: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <section id="cta" className="relative py-24 lg:py-32 bg-background border-t border-outline-variant/30">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(78,222,163,0.03)_0%,transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_100%,rgba(175,198,255,0.03)_0%,transparent_50%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Pitch info */}
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/15 border border-secondary/30 text-secondary text-xs font-bold mb-6">
              Founding User Program
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-on-surface mb-6 tracking-tight">
              Shape the Future of Custom Supply Chain Analytics
            </h2>
            <p className="text-sm sm:text-base text-on-surface-variant mb-8 leading-relaxed">
              We are currently in a highly focused developer preview. We are seeking 10 small brands to use the platform <strong className="text-on-surface">completely free for 120 days</strong> in exchange for feedback. You get white-glove onboarding and direct support from the founder.
            </p>

            <div className="space-y-4 mb-8 text-sm">
              {[
                "120 days completely free — no billing card required",
                "Dedicated data setup call to map your custom spreadsheets",
                "Direct line to the builder for pipeline requests",
                "Help configure features to match your exact inventory flows"
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-secondary text-sm mt-0.5">check_circle</span>
                  <span className="text-on-surface-variant">{item}</span>
                </div>
              ))}
            </div>

            <div className="p-6 rounded-2xl bg-surface-container border border-outline-variant/30 text-xs flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
                <Briefcase className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <p className="text-on-surface font-bold">Hiring Managers & Builders</p>
                <p className="text-on-surface-variant leading-relaxed">
                  I built this system to showcase deep vertical architecture—Clean Architecture, robust MediatR pipelines, custom CSV stream parsers, and custom model training endpoints in C#.
                </p>
              </div>
            </div>
          </div>

          {/* Request Form */}
          <div>
            {!submitted ? (
              <form onSubmit={handleSubmit} className="p-8 rounded-3xl bg-surface-container border border-outline-variant/30 space-y-5">
                <h3 className="text-lg font-bold text-on-surface">Request Early Dev Preview Access</h3>

                <div className="space-y-sm">
                  <label className="text-xs font-bold text-on-surface-variant pl-1">Your Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-surface-container-highest border border-outline-variant text-on-surface rounded-xl px-4 py-3 text-xs focus:ring-2 focus:ring-primary outline-none"
                    placeholder="Jane Smith"
                  />
                </div>

                <div className="space-y-sm">
                  <label className="text-xs font-bold text-on-surface-variant pl-1">Business Name</label>
                  <input
                    type="text"
                    name="business"
                    required
                    value={formData.business}
                    onChange={handleChange}
                    className="w-full bg-surface-container-highest border border-outline-variant text-on-surface rounded-xl px-4 py-3 text-xs focus:ring-2 focus:ring-primary outline-none"
                    placeholder="Acme Flour Co."
                  />
                </div>

                <div className="space-y-sm">
                  <label className="text-xs font-bold text-on-surface-variant pl-1">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-surface-container-highest border border-outline-variant text-on-surface rounded-xl px-4 py-3 text-xs focus:ring-2 focus:ring-primary outline-none"
                    placeholder="jane@acmeflour.com"
                  />
                </div>

                <div className="space-y-sm">
                  <label className="text-xs font-bold text-on-surface-variant pl-1">Approximate SKU Count</label>
                  <select
                    name="skuCount"
                    required
                    value={formData.skuCount}
                    onChange={handleChange}
                    className="w-full bg-surface-container-highest border border-outline-variant text-on-surface rounded-xl p-3 text-xs focus:ring-2 focus:ring-primary outline-none cursor-pointer"
                  >
                    <option value="">Select SKU range...</option>
                    <option value="under-50">Under 50 SKUs</option>
                    <option value="50-500">50 – 500 SKUs</option>
                    <option value="500-5000">500 – 5,000 SKUs</option>
                    <option value="5000+">5,000+ SKUs</option>
                  </select>
                </div>

                <div className="space-y-sm">
                  <label className="text-xs font-bold text-on-surface-variant pl-1">Inventory Pain Point</label>
                  <textarea
                    name="painPoint"
                    rows={2}
                    value={formData.painPoint}
                    onChange={handleChange}
                    className="w-full bg-surface-container-highest border border-outline-variant text-on-surface rounded-xl px-4 py-3 text-xs focus:ring-2 focus:ring-primary outline-none resize-none"
                    placeholder="We manually check Shopify and over-order flour every spring..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-4 font-bold text-on-primary bg-primary hover:bg-primary-container hover:text-on-primary-container rounded-xl shadow-lg hover:shadow-primary/10 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Request Free Entry
                </button>
              </form>
            ) : (
              <div className="p-8 rounded-3xl bg-secondary/10 border border-secondary/20 text-center space-y-md">
                <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center mx-auto text-secondary">
                  <span className="material-symbols-outlined text-[28px]">check_circle</span>
                </div>
                <h3 className="text-xl font-bold text-on-surface">Application Received!</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Thank you for applying. I will personally review your submission and email onboarding coordinates within 24 hours. Let's make inventory errors history!
                </p>
              </div>
            )}
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
              Clean Architecture, MediatR CQRS pipelines, and ML.NET demand forecasting for growing SMBs. Engineered with precision.
            </p>
          </div>

          {/* Links */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-on-surface uppercase tracking-widest">Platform</h4>
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
