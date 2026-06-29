import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const SectionDots = ({ activeIndex, total, labels, onDotClick }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  return (
    <div
      className="fixed right-5 top-1/2 -translate-y-1/2 z-50 hidden lg:flex flex-col gap-3.5"
      role="navigation"
      aria-label="Điều hướng phần"
    >
      {Array.from({ length: total }, (_, i) => {
        const isActive = i === activeIndex;
        const isHovered = i === hoveredIndex;
        const label = labels?.[i] ?? `Section ${i + 1}`;

        return (
          <button
            key={i}
            onClick={() => onDotClick(i)}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
            aria-label={label}
            className="group relative flex items-center justify-end gap-2 py-1 -my-1"
          >
            {/* Label tooltip — slides in from right */}
            <AnimatePresence>
              {isHovered && (
                <motion.span
                  initial={{ opacity: 0, x: 6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 4 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  className="absolute right-full mr-3 text-[10px] font-bold uppercase tracking-[0.14em] text-text-secondary whitespace-nowrap pointer-events-none bg-bg-elevated/80 backdrop-blur-sm px-2.5 py-1 rounded-full border border-surface-border"
                >
                  {label}
                </motion.span>
              )}
            </AnimatePresence>

            {/* Dot — morphs to pill when active */}
            <motion.div
              animate={{
                width:   isActive ? 20 : isHovered ? 8 : 5,
                height:  isActive ? 5  : isHovered ? 8 : 5,
                opacity: isActive ? 1  : isHovered ? 0.65 : 0.3,
              }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-full flex-shrink-0"
              style={{
                background: isActive
                  ? 'linear-gradient(90deg, #E8590C, #FB923C)'
                  : '#71717A',
                boxShadow: isActive ? '0 0 8px rgba(232,89,12,0.60)' : 'none',
              }}
            />
          </button>
        );
      })}
    </div>
  );
};

export default SectionDots;
