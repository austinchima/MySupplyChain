import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Upload, Brain, CheckCircle2 } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const STEPS = [
  {
    num: '01',
    icon: Upload,
    title: 'Upload Your Data',
    description: 'Export your sales history from QuickBooks, Shopify, or Excel. Upload as CSV. No complex integrations, no IT department, no weeks of setup.',
    detail: 'Accepts any standard CSV format with SKU, date, quantity, and price columns.',
    color: '#3b82f6',
    bgLight: 'bg-blue-50',
    border: 'border-blue-200',
  },
  {
    num: '02',
    icon: Brain,
    title: 'AI Analyzes Your Patterns',
    description: 'Our ML.NET engine decomposes your sales data into trend, seasonality, and noise components using Singular Spectrum Analysis — the same method used in climate science and financial forecasting.',
    detail: 'Trained on 900K+ historical records. No generic industry averages — your data, your model.',
    color: '#8b5cf6',
    bgLight: 'bg-violet-50',
    border: 'border-violet-200',
  },
  {
    num: '03',
    icon: CheckCircle2,
    title: 'Get Actionable Forecasts',
    description: 'See 30-day demand predictions with confidence bands. Receive reorder alerts with specific quantities, timing, and dollar-risk scores for every decision.',
    detail: 'Alerts include supplier lead time adjustments and seasonal demand spikes.',
    color: '#10b981',
    bgLight: 'bg-emerald-50',
    border: 'border-emerald-200',
  },
];

export function HowItWorksSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const steps = stepsRef.current?.querySelectorAll('.step-card');
    if (!steps) return;

    const tweens: gsap.core.Tween[] = [];

    steps.forEach((step, i) => {
      gsap.set(step, { y: 60, opacity: 0 });
      const tween = gsap.to(step, {
        y: 0,
        opacity: 1,
        duration: 0.8,
        delay: i * 0.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: stepsRef.current,
          start: 'top 75%',
          toggleActions: 'play none none none',
        },
      });
      tweens.push(tween);
    });

    // Animate the connecting line
    const line = stepsRef.current?.querySelector('.connecting-line');
    if (line) {
      gsap.set(line, { scaleY: 0, transformOrigin: 'top' });
      const lineTween = gsap.to(line, {
        scaleY: 1,
        duration: 1.5,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: stepsRef.current,
          start: 'top 70%',
          toggleActions: 'play none none none',
        },
      });
      tweens.push(lineTween);
    }

    return () => { tweens.forEach(t => t.kill()); };
  }, []);

  return (
    <section id="how-it-works" ref={sectionRef} className="relative py-28 lg:py-36 bg-white overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgba(16,185,129,0.03)_0%,_transparent_60%)]" />
      <div className="absolute inset-0 grid-pattern opacity-20" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-20">
          <span className="inline-block px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-sm font-semibold mb-6">
            How It Works
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#0f172a] mb-6 tracking-tight text-balance">
            From Spreadsheet to<br />
            <span className="text-gradient-emerald">Forecast in 3 Steps</span>
          </h2>
          <p className="text-lg text-[#475569] max-w-2xl mx-auto">
            No implementation consultants. No certification courses. No six-week onboarding. Get your first forecast before your coffee gets cold.
          </p>
        </div>

        {/* Steps */}
        <div ref={stepsRef} className="relative max-w-4xl mx-auto">
          {/* Vertical connecting line (desktop) */}
          <div className="connecting-line absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-violet-500 to-emerald-500 hidden lg:block -translate-x-1/2" />

          <div className="space-y-12 lg:space-y-16">
            {STEPS.map((step, i) => (
              <div
                key={i}
                className={`step-card relative flex flex-col lg:flex-row items-center gap-8 ${
                  i % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}
              >
                {/* Step Number Bubble */}
                <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-white border-4 z-10 items-center justify-center shadow-lg"
                  style={{ borderColor: step.color }}
                >
                  <span className="text-lg font-black" style={{ color: step.color }}>{step.num}</span>
                </div>

                {/* Content Card */}
                <div className={`flex-1 ${i % 2 === 1 ? 'lg:text-right' : ''}`}>
                  <div className={`inline-block p-8 rounded-3xl ${step.bgLight} border ${step.border} max-w-lg ${
                    i % 2 === 1 ? 'lg:ml-auto' : ''
                  }`}>
                    <div className={`w-14 h-14 rounded-2xl bg-white flex items-center justify-center mb-6 shadow-sm`}>
                      <step.icon className="w-7 h-7" style={{ color: step.color }} strokeWidth={1.5} />
                    </div>
                    <h3 className="text-2xl font-bold text-[#0f172a] mb-3">{step.title}</h3>
                    <p className="text-[#475569] leading-relaxed mb-4">{step.description}</p>
                    <p className="text-sm font-semibold" style={{ color: step.color }}>{step.detail}</p>
                  </div>
                </div>

                {/* Spacer for the other side */}
                <div className="flex-1 hidden lg:block" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
