import React from 'react';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';

/**
 * Count-up animation when scrolled into view (framer-motion ecosystem via react-countup).
 */
function AnimatedStatNumber({ value, duration = 1.1, decimals = 0, className = '', prefix = '', suffix = '' }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 });
  const n = Number(value);
  const end = Number.isFinite(n) ? n : 0;

  return (
    <span ref={ref} className={className}>
      {inView ? (
        <CountUp
          duration={duration}
          end={end}
          decimals={decimals}
          prefix={prefix}
          suffix={suffix}
          separator=","
        />
      ) : (
        <span>{prefix}0{suffix}</span>
      )}
    </span>
  );
}

export default AnimatedStatNumber;
