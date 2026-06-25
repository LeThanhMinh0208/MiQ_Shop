import { useEffect, useRef } from 'react';

const FOCUSABLE_SEL = [
  'a[href]',
  'button:not([disabled]):not([aria-hidden="true"])',
  'input:not([disabled]):not([aria-hidden="true"])',
  'select:not([disabled]):not([aria-hidden="true"])',
  'textarea:not([disabled]):not([aria-hidden="true"])',
  '[tabindex]:not([tabindex="-1"]):not([aria-hidden="true"])',
].join(', ');

const isVisible = (el) => {
  if (!el) return false;
  const r = el.getBoundingClientRect();
  if (r.width === 0 && r.height === 0) return false;
  return getComputedStyle(el).display !== 'none';
};

/**
 * Traps keyboard focus inside `containerRef` while `isActive` is true.
 * Restores focus to the element that was active when the trap activated.
 * Calls `onEscape` when the Escape key is pressed.
 */
const useFocusTrap = (containerRef, isActive, onEscape) => {
  const triggerRef = useRef(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    triggerRef.current = document.activeElement;

    const frame = requestAnimationFrame(() => {
      if (!containerRef.current) return;
      const focusable = Array.from(containerRef.current.querySelectorAll(FOCUSABLE_SEL)).filter(isVisible);
      focusable[0]?.focus();
    });

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        onEscape?.();
        return;
      }
      if (e.key !== 'Tab' || !containerRef.current) return;
      const focusable = Array.from(containerRef.current.querySelectorAll(FOCUSABLE_SEL)).filter(isVisible);
      if (focusable.length === 0) { e.preventDefault(); return; }
      const first = focusable[0];
      const last  = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('keydown', onKeyDown);
      triggerRef.current?.focus();
      triggerRef.current = null;
    };
  // onEscape is a callback — intentionally excluded to avoid stale-closure re-mounts
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, containerRef]);
};

export default useFocusTrap;
