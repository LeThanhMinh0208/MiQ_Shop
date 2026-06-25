import { useEffect, useState, useRef } from 'react';
import { useScrollReveal } from '../../hooks/useScrollReveal.js';

/**
 * CountUp animates a number from `from` to `to` once the element enters the viewport.
 *
 * Props:
 *  to        — target number (required)
 *  from      — start value                    (default: 0)
 *  duration  — animation duration in seconds  (default: 1.6)
 *  decimals  — decimal places to display      (default: 0)
 *  prefix    — text before the number         (default: '')
 *  suffix    — text after the number          (default: '')
 *  threshold — IntersectionObserver threshold (default: 0.6)
 */
const CountUp = ({
  to,
  from = 0,
  duration = 1.6,
  decimals = 0,
  prefix = '',
  suffix = '',
  threshold = 0.6,
  className = '',
}) => {
  const [value, setValue] = useState(from);
  const { ref, isInView } = useScrollReveal({ threshold, once: true });
  const started = useRef(false);
  const rafId = useRef(null);

  useEffect(() => {
    if (!isInView || started.current) return;
    started.current = true;

    const startTime = performance.now();
    const range = to - from;

    const tick = (now) => {
      const t = Math.min(1, (now - startTime) / (duration * 1000));
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      setValue(from + range * eased);
      if (t < 1) rafId.current = requestAnimationFrame(tick);
    };

    rafId.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId.current);
  }, [isInView, from, to, duration]);

  const display = decimals > 0 ? value.toFixed(decimals) : Math.round(value);

  return (
    <span ref={ref} className={className}>
      {prefix}{display}{suffix}
    </span>
  );
};

export default CountUp;
