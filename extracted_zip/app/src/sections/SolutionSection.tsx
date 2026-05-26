import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TrendingUp, Bell, Monitor } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const FEATURES = [
  {
    icon: TrendingUp,
    title: '30-Day Demand Forecasts',
    description: 'Upload your sales history. Our engine analyzes seasonality, trends, and noise to predict demand a full month ahead with statistically rigorous confidence intervals.',
    highlight: '95% confidence intervals',
    metric: '30-Day',
    metricLabel: 'Forecast Horizon',
    gradient: 'from-emerald-500 to-teal-600',
    bgLight: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    iconColor: 'text-emerald-600',
    metricColor: 'text-emerald-600',
  },
  {
    icon: Bell,
    title: 'Smart Reorder Alerts',
    description: 'Get notified exactly when to reorder, how much to buy, and why — with dollar-denominated risk assessments for every decision. No more guessing.',
    highlight: 'Dollar-risk scoring',
    metric: '< 6hrs',
    metricLabel: 'Alert Lead Time',
    gradient: 'from-amber-500 to-orange-600',
    bgLight: 'bg-amber-50',
    borderColor: 'border-amber-200',
    iconColor: 'text-amber-600',
    metricColor: 'text-amber-600',
  },
  {
    icon: Monitor,
    title: 'Beautiful, Simple Dashboard',
    description: 'No 6-week implementation. No certification courses. No IT department required. See your forecasts, inventory levels, and alerts in one clean, intuitive view.',
    highlight: 'Zero onboarding friction',
    metric: '< 5 min',
    metricLabel: 'To First Forecast',
    gradient: 'from-blue-500 to-indigo-600',
    bgLight: 'bg-blue-50',
    borderColor: 'border-blue-200',
    iconColor: 'text-blue-600',
    metricColor: 'text-blue-600',
  },
];

export function SolutionSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cards = cardsRef.current?.querySelectorAll('.feature-card');
    if (!cards) return;

    const tweens: gsap.core.Tween[] = [];

    cards.forEach((card, i) => {
      gsap.set(card, { y: 50, opacity: 0, scale: 0.95 });
      const tween = gsap.to(card, {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.7,
        delay: i * 0.15,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: card,
          start: 'top 88%',
          toggleActions: 'play none none none',
        },
      });
      tweens.push(tween);
    });

    return () => { tweens.forEach(t => t.kill()); };
  }, []);

  return (
    <section id="solution" ref={sectionRef} className="relative py-28 lg:py-36 bg-[#f8fafc] overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(16,185,129,0.05)_0%,_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(245,158,11,0.03)_0%,_transparent_50%)]" />
      <div className="absolute inset-0 grid-pattern opacity-30" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-20">
          <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold mb-6">
            The Solution
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#0f172a] mb-6 tracking-tight text-balance">
            One Forecast.<br />
            <span className="text-gradient-emerald">Zero Guesswork.</span>
          </h2>
          <p className="text-lg text-[#475569] max-w-2xl mx-auto">
            MySupplyChain replaces your spreadsheet chaos with ML-powered predictions that learn from your actual sales history — not industry averages, not rules of thumb.
          </p>
        </div>

        {/* Feature Cards */}
        <div ref={cardsRef} className="grid md:grid-cols-3 gap-8">
          {FEATURES.map((feature, i) => (
            <div
              key={i}
              className={`feature-card group relative bg-white rounded-3xl border border-[#e2e8f0] p-8 hover:shadow-xl hover:shadow-slate-900/5 hover:-translate-y-2 transition-all duration-500 overflow-hidden`}
            >
              {/* Gradient top bar */}
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

              {/* Icon */}
              <div className={`w-16 h-16 rounded-2xl ${feature.bgLight} border ${feature.borderColor} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className={`w-8 h-8 ${feature.iconColor}`} strokeWidth={1.5} />
              </div>

              <h3 className="text-xl font-bold text-[#0f172a] mb-3">{feature.title}</h3>
              <p className="text-[#475569] leading-relaxed mb-6">{feature.description}</p>

              {/* Highlight pill */}
              <span className={`inline-block px-3 py-1 rounded-full ${feature.bgLight} border ${feature.borderColor} text-xs font-semibold ${feature.iconColor} mb-6`}>
                {feature.highlight}
              </span>

              {/* Metric */}
              <div className="pt-6 border-t border-[#f1f5f9]">
                <p className={`text-4xl font-black ${feature.metricColor} stat-number`}>{feature.metric}</p>
                <p className="text-sm text-[#94a3b8] mt-1">{feature.metricLabel}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Powered by ML.NET badge */}
        <div className="flex justify-center mt-12">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-[#0f172a] text-white">
            <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            <span className="text-sm font-semibold">Powered by ML.NET — Microsoft's machine learning framework for .NET</span>
          </div>
        </div>
      </div>
    </section>
  );
}
