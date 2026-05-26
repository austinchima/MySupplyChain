import { Package, Github, Linkedin, Mail, Heart } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Problem', href: '#problem' },
  { label: 'Solution', href: '#solution' },
  { label: 'Architecture', href: '#tech' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Early Access', href: '#cta' },
];

const EXTERNAL_LINKS = [
  { label: 'GitHub', href: 'https://github.com/austinchima/MySupplyChain', icon: Github },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/austin-chima', icon: Linkedin },
  { label: 'Email', href: 'mailto:austinchima515@gmail.com', icon: Mail },
];

export function FooterSection() {
  const handleNav = (href: string) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-[#0f172a] border-t border-slate-800/50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                <Package className="w-5 h-5 text-white" strokeWidth={2} />
              </div>
              <span className="text-lg font-bold text-white">MySupplyChain</span>
            </div>
            <p className="text-sm text-[#64748b] leading-relaxed mb-4">
              AI Demand Forecasting for SMBs. Built with .NET 10, React, ML.NET & caffeine in Nova Scotia, Canada.
            </p>
            <p className="text-xs text-[#475569]">
              Data belongs to you — always.
            </p>
          </div>

          {/* Nav Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Product</h4>
            <ul className="space-y-3">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <button
                    onClick={() => handleNav(link.href)}
                    className="text-sm text-[#94a3b8] hover:text-emerald-400 transition-colors line-glow"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* External Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Connect</h4>
            <ul className="space-y-3">
              {EXTERNAL_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-[#94a3b8] hover:text-emerald-400 transition-colors"
                  >
                    <link.icon className="w-4 h-4" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[#64748b]">
            &copy; {new Date().getFullYear()} MySupplyChain. All rights reserved.
          </p>
          <p className="flex items-center gap-1.5 text-sm text-[#64748b]">
            Built with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> in Nova Scotia
          </p>
        </div>
      </div>
    </footer>
  );
}
