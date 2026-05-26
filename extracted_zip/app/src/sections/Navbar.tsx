import { useEffect, useRef, useState } from 'react';
import { Package, Github, ExternalLink } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Problem', href: '#problem' },
  { label: 'Solution', href: '#solution' },
  { label: 'Architecture', href: '#tech' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Early Access', href: '#cta' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNav = (href: string) => {
    setMenuOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'glass shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="flex items-center gap-3 group"
          >
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[#0f172a] to-[#1e293b] flex items-center justify-center overflow-hidden group-hover:shadow-lg group-hover:shadow-emerald-500/20 transition-shadow duration-300">
              <Package className="w-5 h-5 text-emerald-400" strokeWidth={2} />
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <span className="text-lg font-bold tracking-tight text-[#0f172a]">
              MySupplyChain
            </span>
          </a>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNav(link.href)}
                className="px-4 py-2 text-sm font-medium text-[#475569] hover:text-[#0f172a] rounded-lg hover:bg-[#f1f5f9] transition-all duration-200 line-glow"
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <a
              href="https://github.com/austinchima/MySupplyChain"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[#475569] border border-[#e2e8f0] rounded-xl hover:border-[#cbd5e1] hover:text-[#0f172a] transition-all duration-200"
            >
              <Github className="w-4 h-4" />
              GitHub
            </a>
            <a
              href="https://your-demo-url.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#0f172a] to-[#1e293b] rounded-xl hover:shadow-lg hover:shadow-emerald-500/20 hover:-translate-y-0.5 transition-all duration-300"
            >
              Live Demo
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden flex flex-col gap-1.5 p-2"
            aria-label="Toggle menu"
          >
            <span className={`block w-6 h-0.5 bg-[#0f172a] transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-6 h-0.5 bg-[#0f172a] transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-6 h-0.5 bg-[#0f172a] transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`lg:hidden overflow-hidden transition-all duration-500 ${menuOpen ? 'max-h-96' : 'max-h-0'}`}>
        <div className="px-6 pb-6 pt-2 bg-white/95 backdrop-blur-xl border-t border-[#e2e8f0]">
          {NAV_LINKS.map((link) => (
            <button
              key={link.href}
              onClick={() => handleNav(link.href)}
              className="block w-full text-left px-4 py-3 text-sm font-medium text-[#475569] hover:text-[#0f172a] hover:bg-[#f8fafc] rounded-lg transition-colors"
            >
              {link.label}
            </button>
          ))}
          <div className="flex gap-3 mt-4 pt-4 border-t border-[#e2e8f0]">
            <a
              href="https://github.com/austinchima/MySupplyChain"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-[#475569] border border-[#e2e8f0] rounded-xl"
            >
              <Github className="w-4 h-4" /> GitHub
            </a>
            <a
              href="https://your-demo-url.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#0f172a] rounded-xl"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Demo
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
