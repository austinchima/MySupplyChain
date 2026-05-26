import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MapPin, Code2, Rocket, Linkedin, Github } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contentRef.current) return;

    gsap.set(contentRef.current, { y: 50, opacity: 0 });
    const tween = gsap.to(contentRef.current, {
      y: 0,
      opacity: 1,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 70%',
        toggleActions: 'play none none none',
      },
    });

    return () => { tween.kill(); };
  }, []);

  return (
    <section id="about" ref={sectionRef} className="relative py-28 lg:py-36 bg-[#f8fafc] overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-20" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(16,185,129,0.03)_0%,_transparent_70%)]" />

      <div className="max-w-5xl mx-auto px-6 lg:px-8 relative z-10">
        <div ref={contentRef} className="text-center">
          {/* Avatar placeholder */}
          <div className="relative inline-block mb-8">
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#0f172a] to-[#334155] flex items-center justify-center mx-auto shadow-xl">
              <span className="text-4xl font-black text-white">AC</span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-emerald-500 border-4 border-[#f8fafc] flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
          </div>

          <span className="inline-block px-4 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-sm font-semibold mb-6">
            About the Founder
          </span>

          <h2 className="text-4xl sm:text-5xl font-black text-[#0f172a] mb-8 tracking-tight text-balance">
            Built by One Engineer Who<br />
            <span className="text-gradient-emerald">Cares About Your Inventory</span>
          </h2>

          <div className="max-w-3xl mx-auto mb-10">
            <p className="text-lg text-[#475569] leading-relaxed mb-6">
              Hi, I'm <strong className="text-[#0f172a]">Austin</strong> — a software engineer in Nova Scotia who got tired of watching small businesses lose money to preventable stockouts and spreadsheet errors. I built MySupplyChain to give SMBs the forecasting power that only enterprises could afford — wrapped in a UI that doesn't require a CS degree to use.
            </p>
            <p className="text-lg text-[#475569] leading-relaxed">
              Every feature, every forecast, every pixel was built with one question in mind: <em>"Does this actually help a business owner sleep better at night?"</em> If the answer's no, it doesn't ship.
            </p>
          </div>

          {/* Quick Facts */}
          <div className="flex flex-wrap justify-center gap-6 mb-12">
            <div className="flex items-center gap-2 px-5 py-3 rounded-full bg-white border border-slate-200 shadow-sm">
              <MapPin className="w-4 h-4 text-rose-500" />
              <span className="text-sm font-medium text-[#475569]">Nova Scotia, Canada</span>
            </div>
            <div className="flex items-center gap-2 px-5 py-3 rounded-full bg-white border border-slate-200 shadow-sm">
              <Code2 className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-[#475569]">C# .NET + React + ML.NET</span>
            </div>
            <div className="flex items-center gap-2 px-5 py-3 rounded-full bg-white border border-slate-200 shadow-sm">
              <Rocket className="w-4 h-4 text-emerald-500" />
              <span className="text-sm font-medium text-[#475569]">Solo-Founded, 2026</span>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex justify-center gap-4">
            <a
              href="https://www.linkedin.com/in/austin-chima"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0f172a] text-white font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
            >
              <Linkedin className="w-5 h-5" />
              Connect on LinkedIn
            </a>
            <a
              href="https://github.com/austinchima/MySupplyChain"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-[#e2e8f0] text-[#0f172a] font-semibold hover:border-[#0f172a] transition-all duration-300"
            >
              <Github className="w-5 h-5" />
              View GitHub
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
