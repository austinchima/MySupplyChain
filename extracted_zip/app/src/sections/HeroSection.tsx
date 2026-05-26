import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ArrowRight, ChevronDown } from 'lucide-react';

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);
  const trustRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.3 });

    // Headline word-by-word reveal
    const words = headlineRef.current?.querySelectorAll('.word');
    if (words) {
      gsap.set(words, { y: 80, opacity: 0, rotateX: -40 });
      tl.to(words, {
        y: 0,
        opacity: 1,
        rotateX: 0,
        duration: 1,
        stagger: 0.12,
        ease: 'power3.out',
      });
    }

    // Subheadline
    gsap.set(subRef.current, { y: 40, opacity: 0 });
    tl.to(subRef.current, { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out' }, '-=0.4');

    // CTAs
    gsap.set(ctaRef.current, { y: 30, opacity: 0 });
    tl.to(ctaRef.current, { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out' }, '-=0.5');

    // Visual
    gsap.set(visualRef.current, { y: 60, opacity: 0, scale: 0.95 });
    tl.to(visualRef.current, { y: 0, opacity: 1, scale: 1, duration: 1.2, ease: 'power2.out' }, '-=0.6');

    // Trust bar
    gsap.set(trustRef.current, { y: 20, opacity: 0 });
    tl.to(trustRef.current, { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out' }, '-=0.4');

    // Floating particles
    const particles = sectionRef.current?.querySelectorAll('.particle');
    particles?.forEach((p, i) => {
      gsap.to(p, {
        y: `+=${30 + i * 15}`,
        x: `+=${(i % 2 === 0 ? 1 : -1) * (20 + i * 10)}`,
        duration: 4 + i * 0.8,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    });

    return () => { tl.kill(); };
  }, []);

  const handleScrollDown = () => {
    document.querySelector('#problem')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center pt-20 overflow-hidden mesh-gradient"
    >
      {/* Floating Particles */}
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="particle absolute rounded-full opacity-20"
          style={{
            width: 4 + i * 3,
            height: 4 + i * 3,
            left: `${10 + i * 12}%`,
            top: `${15 + (i % 3) * 25}%`,
            background: i % 2 === 0 ? '#10b981' : '#f59e0b',
            filter: 'blur(1px)',
          }}
        />
      ))}

      {/* Grid Pattern */}
      <div className="absolute inset-0 grid-pattern opacity-40" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-32 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Text */}
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 mb-8">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="text-sm font-semibold text-emerald-700">Now in Early Access — 10 Spots Available</span>
            </div>

            <h1
              ref={headlineRef}
              className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] mb-6"
              style={{ perspective: 800 }}
            >
              <span className="word inline-block text-[#0f172a]">Stop</span>{' '}
              <span className="word inline-block text-[#0f172a]">Guessing.</span>
              <br />
              <span className="word inline-block text-gradient-emerald">Start</span>{' '}
              <span className="word inline-block text-gradient-emerald">Forecasting.</span>
            </h1>

            <p ref={subRef} className="text-lg lg:text-xl text-[#475569] leading-relaxed mb-10 max-w-lg">
              AI-powered demand forecasting that tells you exactly what to reorder and when — so you never run out of stock or tie up cash in overstock.
            </p>

            <div ref={ctaRef} className="flex flex-wrap gap-4 mb-8">
              <a
                href="#cta"
                onClick={(e) => { e.preventDefault(); document.querySelector('#cta')?.scrollIntoView({ behavior: 'smooth' }); }}
                className="group flex items-center gap-3 px-8 py-4 text-base font-bold text-white bg-gradient-to-r from-[#0f172a] to-[#1e293b] rounded-2xl hover:shadow-xl hover:shadow-emerald-500/20 hover:-translate-y-1 transition-all duration-300"
              >
                Try Free for 120 Days
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
              </a>
              <a
                href="#how-it-works"
                onClick={(e) => { e.preventDefault(); document.querySelector('#how-it-works')?.scrollIntoView({ behavior: 'smooth' }); }}
                className="flex items-center gap-2 px-8 py-4 text-base font-semibold text-[#0f172a] border-2 border-[#e2e8f0] rounded-2xl hover:border-[#10b981] hover:text-[#10b981] transition-all duration-300"
              >
                See How It Works
              </a>
            </div>

            <div ref={trustRef} className="flex items-center gap-6 text-sm text-[#64748b]">
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                No credit card required
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Cancel anytime
              </span>
            </div>
          </div>

          {/* Right: Visual Demo */}
          <div ref={visualRef} className="relative hidden lg:block">
            <div className="relative rounded-3xl bg-gradient-to-br from-[#0f172a] to-[#1e293b] p-6 shadow-2xl shadow-slate-900/30 border border-slate-700/50">
              {/* Browser Chrome */}
              <div className="flex items-center gap-2 mb-6">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <div className="ml-4 flex-1 h-8 rounded-lg bg-slate-800/60 flex items-center px-4">
                  <span className="text-xs text-slate-500 font-mono">mysupplychain.app/dashboard</span>
                </div>
              </div>

              {/* Dashboard Content */}
              <div className="space-y-4">
                {/* Header Stats */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Forecast Accuracy', value: '94.2%', trend: '+2.1%', color: 'text-emerald-400' },
                    { label: 'Active SKUs', value: '1,247', trend: '+89', color: 'text-blue-400' },
                    { label: 'Reorder Alerts', value: '12', trend: 'This week', color: 'text-amber-400' },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/30">
                      <p className="text-xs text-slate-400 mb-1">{stat.label}</p>
                      <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                      <p className="text-xs text-slate-500 mt-1">{stat.trend}</p>
                    </div>
                  ))}
                </div>

                {/* Forecast Chart */}
                <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/30">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-slate-300 font-semibold">30-Day Demand Forecast</p>
                    <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400">Live</span>
                  </div>
                  <svg viewBox="0 0 400 120" className="w-full h-auto">
                    {/* Grid lines */}
                    {[0, 1, 2, 3, 4].map((i) => (
                      <line key={i} x1="0" y1={24 * i} x2="400" y2={24 * i} stroke="rgba(148,163,184,0.1)" strokeWidth="1" />
                    ))}
                    {/* Confidence interval band */}
                    <path
                      d="M0,50 Q40,45 80,48 T160,42 T240,55 T320,40 T400,45 L400,75 Q360,78 320,72 T240,80 T160,65 T80,70 T0,68 Z"
                      fill="rgba(16,185,129,0.1)"
                    />
                    {/* Upper bound */}
                    <path
                      d="M0,50 Q40,45 80,48 T160,42 T240,55 T320,40 T400,45"
                      fill="none"
                      stroke="rgba(16,185,129,0.4)"
                      strokeWidth="1.5"
                      strokeDasharray="4 4"
                    />
                    {/* Lower bound */}
                    <path
                      d="M0,68 Q40,70 80,70 T160,65 T240,80 T320,72 T400,75"
                      fill="none"
                      stroke="rgba(16,185,129,0.4)"
                      strokeWidth="1.5"
                      strokeDasharray="4 4"
                    />
                    {/* Actual forecast line */}
                    <path
                      d="M0,58 Q40,56 80,58 T160,52 T240,68 T320,55 T400,58"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    {/* Historical data points */}
                    {[58, 56, 60, 54, 62, 58, 64, 55, 68, 52].map((y, i) => (
                      <circle key={i} cx={i * 44.4} cy={y} r="3" fill="#10b981" opacity={i < 5 ? 1 : 0} />
                    ))}
                    {/* Vertical divider */}
                    <line x1="222" y1="0" x2="222" y2="120" stroke="rgba(245,158,11,0.5)" strokeWidth="1" strokeDasharray="4 4" />
                    {/* Reorder point marker */}
                    <circle cx="310" cy="55" r="5" fill="#f59e0b" />
                    <text x="318" y="48" fill="#f59e0b" fontSize="8" fontFamily="JetBrains Mono">REORDER</text>
                  </svg>
                </div>

                {/* Alert Row */}
                <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                    <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-amber-400">Reorder Alert: Organic Flour (25kg)</p>
                    <p className="text-xs text-slate-400">Projected stockout in 6 days. Recommended order: 80 units.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Badge */}
            <div className="absolute -bottom-4 -right-4 bg-white rounded-2xl shadow-xl p-4 border border-slate-200 floating">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-[#0f172a]">Stockout Rate Down</p>
                  <p className="text-lg font-black text-emerald-600">-38%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <button
        onClick={handleScrollDown}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[#94a3b8] hover:text-[#0f172a] transition-colors"
      >
        <span className="text-xs font-medium uppercase tracking-widest">Scroll</span>
        <ChevronDown className="w-5 h-5 animate-bounce" />
      </button>
    </section>
  );
}
