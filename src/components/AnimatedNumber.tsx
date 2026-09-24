import { animate, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

/** Counts smoothly between values when they change (counter decrement, risk fall). */
export function AnimatedNumber({ value, format = (n) => String(Math.round(n)), duration = 0.8, from }: { value: number; format?: (n: number) => string; duration?: number; from?: number }) {
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(from ?? value);
  const prev = useRef(from ?? value);

  useEffect(() => {
    if (reduce) {
      setDisplay(value);
      prev.current = value;
      return;
    }
    const controls = animate(prev.current, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(v),
    });
    prev.current = value;
    return () => controls.stop();
  }, [value, duration, reduce]);

  return <span className="num">{format(display)}</span>;
}
