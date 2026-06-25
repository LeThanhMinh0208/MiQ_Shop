import { useEffect, useState } from 'react';

/**
 * Tracks which section is visible at the vertical center of the scroll container.
 * @param {React.MutableRefObject<HTMLElement[]>} sectionRefs
 * @param {number} count - total section count (triggers effect re-run on mount)
 * @param {React.MutableRefObject<HTMLElement>} containerRef - scroll container (null = viewport)
 */
export function useActiveSectionObserver(sectionRefs, count, containerRef) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const elements = sectionRefs.current.filter(Boolean);
    if (elements.length === 0) return;

    const root = containerRef?.current ?? null;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = sectionRefs.current.indexOf(entry.target);
            if (idx !== -1) setActiveIndex(idx);
          }
        });
      },
      { root, threshold: 0, rootMargin: '-49% 0px -49% 0px' },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sectionRefs, count]); // containerRef is a ref object — stable, read once on mount

  return activeIndex;
}
