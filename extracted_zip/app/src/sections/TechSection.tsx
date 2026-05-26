import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Layers, Cpu, Globe, Server } from 'lucide-react';
import { useCountUp } from '@/hooks/useCountUp';

gsap.registerPlugin(ScrollTrigger);

const LAYERS = [
  {
    name: 'API Layer',
    role: 'React SPA + REST Controllers',
    icon: Globe,
    color: '#3b82f6',
    items: ['JWT Auth', 'Global Exception Handling', 'Structured Logging'],
  },
  {
    name: 'Application Layer',
    role: 'CQRS / MediatR / Pipeline Behaviors',
    icon: Cpu,
    color: '#8b5cf6',
    items: ['Commands & Queries', 'Validation Pipeline', 'Event Dispatching'],
  },
  {
    name: 'Domain Layer',
    role: 'Business Rules / Entities / Value Objects',
    icon: Layers,
    color: '#10b981',
    items: ['Pure C# — Zero Dependencies', 'Rich Domain Models', 'Business Invariants'],
  },
  {
    name: 'Infrastructure Layer',
    role: 'EF Core / ML.NET / Docker / CI/CD',
    icon: Server,
    color: '#f59e0b',
    items: ['ML.NET SSA Pipeline', 'Multi-stage Docker', 'GitHub Actions'],
  },
];

const STATS = [
  { value: 10, suffix: '+', label: 'RESTful API Endpoints' },
  { value: 94, suffix: '%', label: 'Unit Test Coverage' },
  { value: 900, suffix: 'K+', label: 'Rows in Training Dataset' },
  { value: 95, suffix: '%', label: 'Confidence Intervals' },
  { value: 30, suffix: 'ms', label: 'Avg API Response' },
  { value: 4, suffix: '', label: 'Clean Architecture Layers' },
];

function StatBox({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const { ref, display } = useCountUp(value, 2, suffix);

  return (
    <div className="text-center p-6 rounded-2xl bg-slate-800/50 border border-slate-700/40">
      <div ref={ref} className="text-4xl lg:text-5xl font-black text-emerald-400 stat-number mb-2">
        {display}
      </div>
      <p className="text-sm text-slate-400">{label}</p>
    </div>
  );
}

export function TechSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const layersRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layers = layersRef.current?.querySelectorAll('.arch-layer');
    const tweens: gsap.core.Tween[] = [];

    if (layers) {
      layers.forEach((layer, i) => {
        gsap.set(layer, { x: i % 2 === 0 ? -40 : 40, opacity: 0 });
        const tween = gsap.to(layer, {
          x: 0,
          opacity: 1,
          duration: 0.7,
          delay: i * 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: layersRef.current,
            start: 'top 75%',
            toggleActions: 'play none none none',
          },
        });
        tweens.push(tween);
      });
    }

    const statCards = statsRef.current?.querySelectorAll('.stat-card');
    if (statCards) {
      statCards.forEach((card, i) => {
        gsap.set(card, { y: 30, opacity: 0 });
        const tween = gsap.to(card, {
          y: 0,
          opacity: 1,
          duration: 0.6,
          delay: i * 0.08,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: statsRef.current,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        });
        tweens.push(tween);
      });
    }

    return () => { tweens.forEach(t => t.kill()); };
  }, []);

  return (
    <section id="tech" ref={sectionRef} className="relative py-28 lg:py-36 bg-[#0f172a] overflow-hidden">
      {/* Grid pattern */}
      <div className="absolute inset-0 grid-pattern opacity-10" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(16,185,129,0.04)_0%,_transparent_70%)]" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-20">
          <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold mb-6">
            Technical Architecture
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6 tracking-tight text-balance">
            Built Like Enterprise Software.<br />
            <span className="text-gradient-emerald">Priced for Small Business.</span>
          </h2>
          <p className="text-lg text-[#94a3b8] max-w-2xl mx-auto">
            Every architectural decision was made with scalability, testability, and maintainability in mind. This isn't a prototype — it's production-grade engineering.
          </p>
        </div>

        {/* Architecture Diagram */}
        <div ref={layersRef} className="max-w-3xl mx-auto mb-20">
          <div className="relative">
            {/* Connecting Line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-emerald-500 to-amber-500 opacity-30 hidden md:block" />

            <div className="space-y-4">
              {LAYERS.map((layer, i) => (
                <div
                  key={i}
                  className="arch-layer group relative flex flex-col md:flex-row md:items-center gap-4 md:gap-6 p-6 rounded-2xl bg-slate-800/40 border border-slate-700/40 hover:bg-slate-800/60 hover:border-slate-600/50 transition-all duration-300"
                >
                  {/* Connector dot */}
                  <div className="hidden md:flex absolute left-[1.85rem] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full items-center justify-center z-10"
                    style={{ backgroundColor: `${layer.color}20`, border: `2px solid ${layer.color}` }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: layer.color }} />
                  </div>

                  {/* Icon */}
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${layer.color}15` }}
                  >
                    <layer.icon className="w-7 h-7" style={{ color: layer.color }} strokeWidth={1.5} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                      <h3 className="text-lg font-bold text-white">{layer.name}</h3>
                      <span className="text-sm font-mono" style={{ color: layer.color }}>{layer.role}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {layer.items.map((item, j) => (
                        <span key={j} className="px-3 py-1 rounded-full bg-slate-900/60 border border-slate-700/40 text-xs text-slate-400 font-mono">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div ref={statsRef} className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6 max-w-4xl mx-auto">
          {STATS.map((stat, i) => (
            <div key={i} className="stat-card">
              <StatBox value={stat.value} suffix={stat.suffix} label={stat.label} />
            </div>
          ))}
        </div>

        {/* GitHub Link */}
        <div className="text-center mt-12">
          <a
            href="https://github.com/austinchima/MySupplyChain"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-700 text-slate-300 hover:text-white hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all duration-300"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
            View the full architecture on GitHub
          </a>
        </div>
      </div>
    </section>
  );
}
