import { useEffect } from 'react';
import { useSmoothScroll } from '@/hooks/useSmoothScroll';
import { CustomCursor } from '@/sections/CustomCursor';
import { Navbar } from '@/sections/Navbar';
import { HeroSection } from '@/sections/HeroSection';
import { ProblemSection } from '@/sections/ProblemSection';
import { SolutionSection } from '@/sections/SolutionSection';
import { TechSection } from '@/sections/TechSection';
import { HowItWorksSection } from '@/sections/HowItWorksSection';
import { CTASection } from '@/sections/CTASection';
import { AboutSection } from '@/sections/AboutSection';
import { FooterSection } from '@/sections/FooterSection';

function App() {
  useSmoothScroll();

  useEffect(() => {
    // Refresh ScrollTrigger after all content loads
    const timeout = setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 100);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="relative">
      <CustomCursor />
      <Navbar />
      <main>
        <HeroSection />
        <ProblemSection />
        <SolutionSection />
        <TechSection />
        <HowItWorksSection />
        <CTASection />
        <AboutSection />
      </main>
      <FooterSection />
    </div>
  );
}

export default App;
