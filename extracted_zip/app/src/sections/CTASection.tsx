import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Send, Briefcase, CheckCircle } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export function CTASection() {
  const sectionRef = useRef<HTMLElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    business: '',
    email: '',
    skuCount: '',
    painPoint: '',
  });

  useEffect(() => {
    if (!formRef.current) return;

    gsap.set(formRef.current, { y: 50, opacity: 0 });
    const tween = gsap.to(formRef.current, {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <section id="cta" ref={sectionRef} className="relative py-28 lg:py-36 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#0f172a] to-[#1e293b]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(16,185,129,0.1)_0%,_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(245,158,11,0.06)_0%,_transparent_50%)]" />
      <div className="absolute inset-0 grid-pattern opacity-5" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Pitch */}
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold mb-6">
              Limited Early Access
            </span>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-6 tracking-tight text-balance">
              Be Among the First<br />
              <span className="text-gradient-emerald">10 Founding Users</span>
            </h2>
            <p className="text-lg text-[#94a3b8] mb-8 leading-relaxed">
              MySupplyChain is currently in early access. I'm looking for 10 small businesses to use the platform <strong className="text-white">free for 120 days</strong> in exchange for feedback and a testimonial. You'll get white-glove onboarding and direct access to the founder.
            </p>

            <div className="space-y-4 mb-10">
              {[
                '120 days completely free — no credit card required',
                'Personal onboarding call to import your data',
                'Direct line to the founder for feature requests and support',
                'Help shape the product roadmap with your feedback',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span className="text-[#cbd5e1]">{item}</span>
                </div>
              ))}
            </div>

            {/* Hiring managers note */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <Briefcase className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-white font-semibold mb-1">Not a business owner?</p>
                  <p className="text-sm text-[#94a3b8] mb-3">
                    I'm also exploring full-stack engineering roles. This project demonstrates production-grade Clean Architecture, CQRS, ML.NET integration, and modern React development.
                  </p>
                  <a
                    href="https://www.linkedin.com/in/austin-chima"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    View my LinkedIn profile
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Form */}
          <div ref={formRef}>
            {!submitted ? (
              <form onSubmit={handleSubmit} className="p-8 lg:p-10 rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10">
                <h3 className="text-2xl font-bold text-white mb-6">Request Early Access</h3>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-[#cbd5e1] mb-2">Your Name</label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-[#64748b] focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                      placeholder="Jane Smith"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#cbd5e1] mb-2">Business Name</label>
                    <input
                      type="text"
                      name="business"
                      required
                      value={formData.business}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-[#64748b] focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                      placeholder="Acme Supplies Co."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#cbd5e1] mb-2">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-[#64748b] focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                      placeholder="jane@acmesupplies.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#cbd5e1] mb-2">Approximate SKU Count</label>
                    <select
                      name="skuCount"
                      required
                      value={formData.skuCount}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all appearance-none"
                    >
                      <option value="" className="bg-[#0f172a]">Select a range...</option>
                      <option value="under-50" className="bg-[#0f172a]">Under 50</option>
                      <option value="50-500" className="bg-[#0f172a]">50 – 500</option>
                      <option value="500-5000" className="bg-[#0f172a]">500 – 5,000</option>
                      <option value="5000+" className="bg-[#0f172a]">5,000+</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#cbd5e1] mb-2">Biggest Inventory Pain Point</label>
                    <textarea
                      name="painPoint"
                      rows={3}
                      value={formData.painPoint}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-[#64748b] focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none"
                      placeholder="We constantly run out of our best-selling items during peak season..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-3 px-8 py-4 text-base font-bold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl hover:shadow-lg hover:shadow-emerald-500/30 hover:-translate-y-0.5 transition-all duration-300"
                  >
                    <Send className="w-5 h-5" />
                    Request Early Access
                  </button>

                  <p className="text-xs text-center text-[#64748b]">
                    No spam. No sales calls. I'll personally review every submission and respond within 24 hours.
                  </p>
                </div>
              </form>
            ) : (
              <div className="p-10 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Thank You!</h3>
                <p className="text-[#cbd5e1]">
                  I've received your request and I'll be in touch within 24 hours. In the meantime, feel free to connect with me on LinkedIn.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
