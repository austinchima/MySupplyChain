import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AlertTriangle, Lock, Grid3X3 } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const PROBLEMS = [
  {
    icon: AlertTriangle,
    title: 'The 3 AM Stockout',
    description: 'Your best-selling item is out of stock and your supplier needs 2 weeks lead time. You just lost a week\'s revenue.',
    stat: '23% of SMBs',
    statLabel: 'lose sales weekly to stockouts',
    color: 'from-rose-500/20 to-rose-600/10',
    borderColor: 'border-rose-500/20',
    iconColor: 'text-rose-500',
    statColor: 'text-rose-600',
  },
  {
    icon: Lock,
    title: 'The Cash Trap',
    description: 'You over-ordered last quarter to "be safe." Now $40K of inventory sits in your warehouse collecting dust.',
    stat: '$1.1 Trillion',
    statLabel: 'tied up in excess inventory (US)',
    color: 'from-amber-500/20 to-amber-600/10',
    borderColor: 'border-amber-500/20',
    iconColor: 'text-amber-500',
    statColor: 'text-amber-600',
  },
  {
    icon: Grid3X3,
    title: 'The Spreadsheet Nightmare',
    description: 'Your current "system" is 17 Excel tabs, gut feeling, and hoping your part-time bookkeeper doesn\'t make a copy-paste error.',
    stat: '67% of SMBs',
    statLabel: 'still rely on spreadsheets for inventory',
    color: 'from-slate-500/20 to-slate-600/10',
    borderColor: 'border-slate-500/20',
    iconColor: 'text-slate-500',
    statColor: 'text-slate-600',
  },
];

export function ProblemSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cards = cardsRef.current?.querySelectorAll('.problem-card');
    if (!cards) return;

    const tweens: gsap.core.Tween[] = [];

    cards.forEach((card, i) => {
      gsap.set(card, { y: 60, opacity: 0, rotateY: i === 0 ? -8 : i === 2 ? 8 : 0 });
      const tween = gsap.to(card, {
        y: 0,
        opacity: 1,
        rotateY: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      });
      tweens.push(tween);
    });

    return () => { tweens.forEach(t => t.kill()); };
  }, []);

  return (
    <section id="problem" ref={sectionRef} className="relative py-28 lg:py-36 bg-[#0f172a] overflow-hidden noise-overlay">
      {/* Subtle Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(16,185,129,0.06)_0%,_transparent_70%)]" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-semibold mb-6">
            The Problem
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6 tracking-tight text-balance">
            Inventory Management<br />
            <span className="text-gradient-emerald">Shouldn't Be a Daily Crisis</span>
          </h2>
          <p className="text-lg text-[#94a3b8] max-w-2xl mx-auto">
            Small businesses lose billions every year to preventable inventory mistakes. The tools that could help are built for enterprises, not for you.
          </p>
        </div>

        {/* Problem Cards */}
        <div ref={cardsRef} className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {PROBLEMS.map((problem, i) => (
            <div
              key={i}
              className={`problem-card relative group p-8 rounded-3xl bg-gradient-to-br ${problem.color} border ${problem.borderColor} backdrop-blur-sm hover:-translate-y-2 transition-all duration-500`}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="absolute inset-0 rounded-3xl bg-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${problem.color} border ${problem.borderColor} flex items-center justify-center mb-6`}>
                <problem.icon className={`w-7 h-7 ${problem.iconColor}`} strokeWidth={1.5} />
              </div>

              <h3 className="text-xl font-bold text-white mb-3">{problem.title}</h3>
              <p className="text-[#94a3b8] leading-relaxed mb-6">{problem.description}</p>

              <div className="pt-6 border-t border-white/10">
                <p className={`text-3xl font-black ${problem.statColor} stat-number`}>{problem.stat}</p>
                <p className="text-sm text-[#64748b] mt-1">{problem.statLabel}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-[#64748b] mb-4">Sound familiar? You're not alone.</p>
          <a
            href="#solution"
            onClick={(e) => { e.preventDefault(); document.querySelector('#solution')?.scrollIntoView({ behavior: 'smooth' }); }}
            className="inline-flex items-center gap-2 text-emerald-400 font-semibold hover:text-emerald-300 transition-colors"
          >
            See the solution
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </a>
        </div>
      </div>
    </section>
  );
}
