import { useState, useEffect } from 'react';

const BREAKPOINTS = { xs: 480, sm: 768, md: 1024, lg: 1280, xl: 1536 };

export function useResponsive() {
  const [width, setWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1280
  );

  useEffect(() => {
    let raf;
    const handler = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setWidth(window.innerWidth));
    };
    window.addEventListener('resize', handler);
    return () => { window.removeEventListener('resize', handler); cancelAnimationFrame(raf); };
  }, []);

  return {
    width,
    isXs:      width < BREAKPOINTS.xs,
    isMobile:  width < BREAKPOINTS.sm,
    isTablet:  width >= BREAKPOINTS.sm && width < BREAKPOINTS.md,
    isDesktop: width >= BREAKPOINTS.md,
    isLg:      width >= BREAKPOINTS.lg,
    isXl:      width >= BREAKPOINTS.xl,
  };
}

export function useMediaQuery(query) {
  const [matches, setMatches] = useState(
    () => typeof window !== 'undefined' ? window.matchMedia(query).matches : false
  );
  useEffect(() => {
    const mq = window.matchMedia(query);
    const handler = e => setMatches(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [query]);
  return matches;
}
