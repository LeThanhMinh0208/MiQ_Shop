import { useEffect, useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

const TOTAL    = 36;
const STEP     = 360 / TOTAL;   // 10° per frame
const FALLBACK = '/boot.png';

// Build the frame URL. Supports both PNG and WebP.
// Falls back to /boot.png if the 3d-shoe folder hasn't been populated yet.
const frameUrl = (index, ext = 'webp') => {
  const angle = index * STEP;
  return `/3d-shoe/frame-${String(Math.floor(angle)).padStart(3, '0')}.${ext}`;
};

/**
 * Shoe3DRotator
 *
 * Modes
 *   "auto"        – continuous spin at `fps`, pauses on hover
 *   "interactive" – mouse/touch drag to rotate, drag hint shown on first render
 *   "static"      – fixed at `startFrame`, no animation
 *
 * Props
 *   mode          string   default "auto"
 *   fps           number   default 10
 *   startFrame    number   default 0
 *   width/height  number|string  passed directly to container style
 *   className     string
 *   filter        string   CSS filter, e.g. drop-shadow(...)
 *   onFrameChange (frame: number) => void
 */
const Shoe3DRotator = ({
  mode          = 'auto',
  fps           = 10,
  startFrame    = 0,
  width         = 500,
  height        = 400,
  className     = '',
  filter        = 'drop-shadow(0 28px 56px rgba(16,185,129,0.6)) drop-shadow(0 8px 20px rgba(0,0,0,0.3))',
  onFrameChange,
}) => {
  const [frame,     setFrame]     = useState(startFrame % TOTAL);
  const [paused,    setPaused]    = useState(false);
  const [dragging,  setDragging]  = useState(false);
  const [cssRotY,   setCssRotY]   = useState(0);
  // Track whether any frame loaded (fallback if 3d-shoe not yet populated)
  const [hasFrames, setHasFrames] = useState(false);
  const dragRef  = useRef({ startX: 0, startFrame: 0 });
  const hintShownRef = useRef(false);

  // Sync startFrame when parent changes it (e.g. state machine handoff)
  const prevStart = useRef(startFrame);
  useEffect(() => {
    if (prevStart.current !== startFrame) {
      prevStart.current = startFrame;
      setFrame(startFrame % TOTAL);
    }
  }, [startFrame]);

  // Probe the first frame to decide whether to use 3D or fallback img
  useEffect(() => {
    const img = new window.Image();
    img.onload  = () => setHasFrames(true);
    img.onerror = () => setHasFrames(false);
    img.src = frameUrl(0, 'webp');
  }, []);

  // Preload frames when 3D is available
  useEffect(() => {
    if (!hasFrames) return;
    for (let i = 0; i < TOTAL; i++) {
      const img = new window.Image();
      img.src = frameUrl(i, 'webp');
    }
  }, [hasFrames]);

  // Auto-rotation
  useEffect(() => {
    if (mode !== 'auto' || paused || dragging || !hasFrames) return;
    const id = setInterval(() => {
      setFrame((f) => {
        const next = (f + 1) % TOTAL;
        onFrameChange?.(next);
        return next;
      });
    }, 1000 / fps);
    return () => clearInterval(id);
  }, [mode, fps, paused, dragging, hasFrames, onFrameChange]);

  // ── Drag handling ──────────────────────────────────────────────────────────
  const onDragStart = useCallback((clientX) => {
    if (mode === 'static') return;
    setDragging(true);
    dragRef.current = { startX: clientX, startFrame: hasFrames ? frame : cssRotY / 10 };
  }, [mode, frame, hasFrames, cssRotY]);

  const onDragMove = useCallback((clientX) => {
    if (!dragging) return;
    const delta = clientX - dragRef.current.startX;
    if (hasFrames) {
      const fd   = Math.round(delta / 8);
      const next = ((dragRef.current.startFrame + fd) % TOTAL + TOTAL) % TOTAL;
      setFrame(next);
      onFrameChange?.(next);
    } else {
      setCssRotY(dragRef.current.startFrame * 10 + delta * 0.5);
    }
  }, [dragging, hasFrames, onFrameChange]);

  const onDragEnd = useCallback(() => setDragging(false), []);

  // Global move / up listeners while dragging
  useEffect(() => {
    if (!dragging) return;
    const move = (e) => onDragMove(e.clientX ?? e.touches?.[0]?.clientX ?? 0);
    const up   = ()  => onDragEnd();
    window.addEventListener('mousemove',  move, { passive: true });
    window.addEventListener('mouseup',    up);
    window.addEventListener('touchmove',  move, { passive: true });
    window.addEventListener('touchend',   up);
    return () => {
      window.removeEventListener('mousemove',  move);
      window.removeEventListener('mouseup',    up);
      window.removeEventListener('touchmove',  move);
      window.removeEventListener('touchend',   up);
    };
  }, [dragging, onDragMove, onDragEnd]);

  // ── Fallback: no frames yet ────────────────────────────────────────────────
  const isInteractive = mode === 'interactive';

  if (!hasFrames) {
    return (
      <div
        className={`relative select-none ${isInteractive ? 'cursor-grab' : ''} ${dragging ? '!cursor-grabbing' : ''} ${className}`}
        style={{ width, height, perspective: '800px' }}
        onMouseDown={isInteractive ? (e) => onDragStart(e.clientX) : undefined}
        onTouchStart={isInteractive ? (e) => onDragStart(e.touches[0].clientX) : undefined}
      >
        <img
          src={FALLBACK}
          alt=""
          draggable={false}
          className="w-full h-full object-contain"
          style={{
            filter,
            transform: isInteractive ? `rotateY(${cssRotY}deg) rotateX(4deg)` : undefined,
            transformStyle: 'preserve-3d',
            transition: dragging ? 'none' : 'transform 0.4s ease',
            animation: mode === 'auto' ? 'levitate 3.8s ease-in-out infinite' : undefined,
          }}
        />
        {isInteractive && !hintShownRef.current && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: [0, 0.9, 0.9, 0] }}
            transition={{ duration: 3.5, times: [0, 0.15, 0.75, 1], delay: 0.8 }}
            onAnimationComplete={() => { hintShownRef.current = true; }}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none z-20"
          >
            <div className="bg-bg-elevated/90 backdrop-blur border border-primary/25 rounded-full px-4 py-2 flex items-center gap-2 text-xs text-text-secondary whitespace-nowrap shadow-lg">
              <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M8 12h8M5 9l3 3-3 3M19 9l-3 3 3 3" />
              </svg>
              Kéo để xoay 360°
            </div>
          </motion.div>
        )}
      </div>
    );
  }

  // ── 3D frame display ───────────────────────────────────────────────────────

  return (
    <div
      className={`relative select-none ${isInteractive ? 'cursor-grab' : ''} ${dragging ? '!cursor-grabbing' : ''} ${className}`}
      style={{ width, height }}
      onMouseDown={isInteractive ? (e) => onDragStart(e.clientX) : undefined}
      onTouchStart={isInteractive ? (e) => onDragStart(e.touches[0].clientX) : undefined}
      onMouseEnter={mode === 'auto' ? () => setPaused(true) : undefined}
      onMouseLeave={mode === 'auto' ? () => setPaused(false) : undefined}
    >
      {/* Render all frames; only the active one is visible */}
      {Array.from({ length: TOTAL }, (_, i) => (
        <img
          key={i}
          src={frameUrl(i, 'webp')}
          alt=""
          draggable={false}
          className="absolute inset-0 w-full h-full object-contain pointer-events-none"
          style={{
            opacity:    frame === i ? 1 : 0,
            transition: 'opacity 0.06s linear',
            willChange: 'opacity',
            filter,
          }}
          loading={i < 4 || i === 9 || i === 18 || i === 27 ? 'eager' : 'lazy'}
        />
      ))}

      {/* Drag hint — shows briefly on first interactive render */}
      {isInteractive && !hintShownRef.current && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: [0, 0.9, 0.9, 0] }}
          transition={{ duration: 3.5, times: [0, 0.15, 0.75, 1], delay: 0.8 }}
          onAnimationComplete={() => { hintShownRef.current = true; }}
          className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none z-20"
        >
          <div className="bg-bg-elevated/90 backdrop-blur border border-primary/25 rounded-full px-4 py-2 flex items-center gap-2 text-xs text-text-secondary whitespace-nowrap shadow-lg">
            <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M8 12h8M5 9l3 3-3 3M19 9l-3 3 3 3" />
            </svg>
            Kéo để xoay 360°
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Shoe3DRotator;
