import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

/**
 * CountUp
 * Smoothly animates a number when it enters the viewport.
 * Props:
 *  - end: target number (required)
 *  - duration: seconds (default 1.4)
 *  - delay: seconds before start after visible
 *  - formatter: function(currentValue:number) => string (optional)
 *  - easing: custom easing function (t)=>t (default easeOutCubic)
 *  - className: tailwind classes
 *  - onComplete: callback when finished
 */
const easeOutCubic = t => 1 - Math.pow(1 - t, 3);

const CountUp = ({
  end,
  duration = 1.4,
  delay = 0,
  formatter,
  easing = easeOutCubic,
  className = '',
  onComplete
}) => {
  const ref = useRef(null);
  const frame = useRef();
  const startTime = useRef();
  const [display, setDisplay] = useState('0');
  const [started, setStarted] = useState(false);

  // Normalize target
  const target = typeof end === 'number' ? end : Number(end) || 0;

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !started) {
            setStarted(true);
          }
        });
      },
      { threshold: 0.4 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    let raf;
    const d = duration * 1000;
    const startAfter = delay * 1000;
    const kick = time => {
      if (!startTime.current) startTime.current = time + startAfter;
      if (time < startTime.current) {
        raf = requestAnimationFrame(kick);
        return;
      }
      const elapsed = time - startTime.current;
      const progress = Math.min(1, elapsed / d);
      const eased = easing(progress);
      const current = target * eased;
      const formatted = formatter ? formatter(current) : Math.round(current).toLocaleString();
      setDisplay(formatted);
      if (progress < 1) {
        raf = requestAnimationFrame(kick);
      } else {
        onComplete && onComplete();
      }
    };
    raf = requestAnimationFrame(kick);
    return () => cancelAnimationFrame(raf);
  }, [started, duration, delay, target, formatter, easing, onComplete]);

  return (
    <motion.span
      ref={ref}
      aria-label={display}
      className={className}
      initial={{ opacity: 0, y: 4 }}
      animate={started ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4 }}
    >
      {display}
    </motion.span>
  );
};

export default CountUp;
