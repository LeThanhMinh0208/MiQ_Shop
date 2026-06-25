import { motion } from 'framer-motion';

const directionVariants = {
  up:    { hidden: { opacity: 0, y: 36 },          visible: { opacity: 1, y: 0 } },
  down:  { hidden: { opacity: 0, y: -36 },         visible: { opacity: 1, y: 0 } },
  left:  { hidden: { opacity: 0, x: 36 },          visible: { opacity: 1, x: 0 } },
  right: { hidden: { opacity: 0, x: -36 },         visible: { opacity: 1, x: 0 } },
  fade:  { hidden: { opacity: 0 },                  visible: { opacity: 1 } },
  scale: { hidden: { opacity: 0, scale: 0.88 },    visible: { opacity: 1, scale: 1 } },
  pop:   { hidden: { opacity: 0, scale: 0.7 },     visible: { opacity: 1, scale: 1 } },
};

/**
 * ScrollReveal wraps any content and fades/slides it in when it enters the viewport.
 *
 * Props:
 *  direction  — 'up' | 'down' | 'left' | 'right' | 'fade' | 'scale' | 'pop'  (default: 'up')
 *  delay      — seconds before animation starts                                (default: 0)
 *  duration   — animation duration in seconds                                  (default: 0.55)
 *  threshold  — 0–1 fraction of element that must be visible to trigger        (default: 0.12)
 *  className  — forwarded to the wrapper div
 *  as         — motion element tag (default: 'div')
 */
const ScrollReveal = ({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.55,
  threshold = 0.12,
  className = '',
  as = 'div',
}) => {
  const MotionTag = as === 'section' ? motion.section
    : as === 'article' ? motion.article
    : as === 'li' ? motion.li
    : motion.div;

  return (
    <MotionTag
      variants={directionVariants[direction] ?? directionVariants.up}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: threshold }}
      transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </MotionTag>
  );
};

export default ScrollReveal;
