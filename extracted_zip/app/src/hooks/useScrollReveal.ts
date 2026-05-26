import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ScrollRevealOptions {
  y?: number;
  x?: number;
  opacity?: number;
  duration?: number;
  delay?: number;
  stagger?: number;
  ease?: string;
  start?: string;
  scale?: number;
  rotateX?: number;
}

export function useScrollReveal<T extends HTMLElement>(options: ScrollRevealOptions = {}) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const {
      y = 60,
      x = 0,
      opacity = 0,
      duration = 1,
      delay = 0,
      ease = 'power3.out',
      start = 'top 85%',
      scale = 1,
      rotateX = 0,
    } = options;

    const children = el.querySelectorAll('[data-reveal-child]');
    const targets = children.length > 0 ? children : el;

    gsap.set(targets, { y, x, opacity, scale, rotateX });

    const tween = gsap.to(targets, {
      y: 0,
      x: 0,
      opacity: 1,
      scale: 1,
      rotateX: 0,
      duration,
      delay,
      ease,
      stagger: children.length > 0 ? (options.stagger || 0.1) : 0,
      scrollTrigger: {
        trigger: el,
        start,
        toggleActions: 'play none none none',
      },
    });

    return () => {
      tween.kill();
      ScrollTrigger.getAll().forEach(st => {
        if (st.trigger === el) st.kill();
      });
    };
  }, []);

  return ref;
}
