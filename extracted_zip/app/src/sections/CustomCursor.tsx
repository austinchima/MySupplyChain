import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const isHovering = useRef(false);

  useEffect(() => {
    const cursor = cursorRef.current;
    const dot = cursorDotRef.current;
    if (!cursor || !dot) return;

    const onMove = (e: MouseEvent) => {
      gsap.to(cursor, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.08,
        ease: 'power2.out',
      });
      gsap.to(dot, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.02,
        ease: 'none',
      });
    };

    const onEnter = () => {
      if (isHovering.current) return;
      isHovering.current = true;
      gsap.to(cursor, { scale: 1.8, duration: 0.3, ease: 'power2.out' });
      gsap.to(cursor, { borderColor: '#10b981', duration: 0.3 });
    };

    const onLeave = () => {
      isHovering.current = false;
      gsap.to(cursor, { scale: 1, duration: 0.3, ease: 'power2.out' });
      gsap.to(cursor, { borderColor: 'rgba(15, 23, 42, 0.4)', duration: 0.3 });
    };

    window.addEventListener('mousemove', onMove);

    const interactives = document.querySelectorAll('a, button, [data-cursor-hover]');
    interactives.forEach((el) => {
      el.addEventListener('mouseenter', onEnter);
      el.addEventListener('mouseleave', onLeave);
    });

    return () => {
      window.removeEventListener('mousemove', onMove);
      interactives.forEach((el) => {
        el.removeEventListener('mouseenter', onEnter);
        el.removeEventListener('mouseleave', onLeave);
      });
    };
  }, []);

  return (
    <>
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 hidden md:block"
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          border: '1.5px solid rgba(15, 23, 42, 0.4)',
          backgroundColor: 'transparent',
          mixBlendMode: 'difference',
        }}
      />
      <div
        ref={cursorDotRef}
        className="fixed top-0 left-0 pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 hidden md:block"
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          backgroundColor: '#10b981',
        }}
      />
    </>
  );
}
