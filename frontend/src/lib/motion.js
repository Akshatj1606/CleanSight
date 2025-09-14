// Centralized motion variants & helpers for consistent animations
// Provides reduced-motion safety checks.
import { useReducedMotion } from 'framer-motion';

export const variants = {
  fadeInUp: (i = 0) => ({
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut', delay: i * 0.08 } }
  }),
  staggerContainer: {
    hidden: {},
    show: { transition: { staggerChildren: 0.08 } }
  },
  hoverCard: {
    initial: { y: 0, boxShadow: '0 0 0 0 rgba(0,0,0,0)' },
    hover: { y: -6, boxShadow: '0 8px 20px -6px rgba(0,0,0,0.12)' }
  },
  subtleScale: {
    initial: { scale: 1 },
    hover: { scale: 1.03 }
  }
};

export function useMotionPref() {
  const prefersReduced = useReducedMotion();
  return {
    prefersReduced,
    maybe(v) {
      if (prefersReduced) {
        if (typeof v === 'object') {
          const clone = { ...v };
          // Strip transitions that animate position/scale for reduced motion users
          ['hidden','show'].forEach(key=>{ if(clone[key]) { delete clone[key].y; delete clone[key].scale; } });
          return clone;
        }
      }
      return v;
    }
  };
}
