/**
 * FloatingShoe — scroll-driven, position:fixed.
 *
 * Slots are stored as DOCUMENT-ABSOLUTE coordinates (viewport + scrollTop at
 * measurement time). The scroll handler derives current viewport positions
 * analytically — no DOM reads, no setState, no stale-ref lag during transitions.
 *
 * Behaviour
 *  scrollTop = 0         → Hero slot  (auto-spin + levitate)
 *  0 < scrollTop < slideH → Mid-flight (auto-spin, rotateZ tumble)
 *  scrollTop ≈ slideH    → Dock slot  (interactive drag)
 *  scrollTop > slideH    → Hidden immediately — no drift into slide 3
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useScroll, useMotionValue } from 'framer-motion';
import Shoe3DRotator from './Shoe3DRotator.jsx';

const SHOE_W  = 500;
const SHOE_H  = 450;
const FILTER  = 'drop-shadow(0 32px 64px rgba(0,0,0,0.55)) drop-shadow(0 10px 24px rgba(0,0,0,0.38))';
const AT_SNAP = 36; // px — within this distance of a snap point = "snapped"

function lerp(a, b, t) { return a + (b - a) * t; }
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

const FloatingShoe = ({ containerRef }) => {
  const [desktop,      setDesktop]      = useState(false);
  const [slots,        setSlots]        = useState(null);
  const [atHero,       setAtHero]       = useState(true);
  const [docked,       setDocked]       = useState(false);
  const [hidden,       setHidden]       = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);

  // Scroll-driven transform MotionValues — set directly in handler, zero re-renders
  const posX    = useMotionValue(0);
  const posY    = useMotionValue(0);
  const pScale  = useMotionValue(1);
  const posRotZ = useMotionValue(0);

  // ── Desktop guard ────────────────────────────────────────────────────────
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    setDesktop(mq.matches);
    const h = (e) => setDesktop(e.matches);
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, []);

  // ── Slot measurement — stores DOCUMENT-ABSOLUTE coords ───────────────────
  // docCy = viewportCy + scrollTop  →  stays valid regardless of scrollTop
  const remeasure = useCallback(() => {
    const heroEl = document.getElementById('hero-shoe-slot');
    const dockEl = document.getElementById('new-arrivals-dock-slot');
    const container = containerRef.current;
    if (!heroEl || !dockEl || !container) return;

    const sy     = container.scrollTop;
    const slideH = container.clientHeight;
    const hr = heroEl.getBoundingClientRect();
    const dr = dockEl.getBoundingClientRect();

    if (slideH <= 0) return;

    setSlots({
      // X is unaffected by vertical scroll — keep as viewport X
      heroCx:    hr.left + hr.width  / 2,
      dockCx:    dr.left + dr.width  / 2,
      // Y: convert to document-absolute so scroll handler needs no DOM reads
      heroDocCy: hr.top  + hr.height / 2 + sy,
      dockDocCy: dr.top  + dr.height / 2 + sy,
      slideH,
      heroScale: Math.min(hr.width / SHOE_W, hr.height / SHOE_H, 1),
      dockScale: Math.min(dr.width / SHOE_W, dr.height / SHOE_H, 0.88),
      heroW: hr.width, heroH: hr.height,
      dockW: dr.width, dockH: dr.height,
    });
  }, [containerRef]);

  useEffect(() => {
    if (!desktop) { setSlots(null); return; }
    // Three passes to absorb CLS from fonts / lazy images
    const t1 = setTimeout(remeasure, 150);
    const t2 = setTimeout(remeasure, 800);
    const t3 = setTimeout(remeasure, 2500);
    // Remeasure on resize only — NOT on scroll (avoids stale-ref lag)
    window.addEventListener('resize', remeasure, { passive: true });
    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3);
      window.removeEventListener('resize', remeasure);
    };
  }, [desktop, remeasure]);

  // ── Scroll-driven position ───────────────────────────────────────────────
  const { scrollY } = useScroll({ container: containerRef });

  const slotsRef  = useRef(null);
  const atHeroRef = useRef(true);
  const dockedRef = useRef(false);
  const hiddenRef = useRef(false);
  useEffect(() => { slotsRef.current = slots; }, [slots]);

  useEffect(() => {
    const update = (sy) => {
      const s = slotsRef.current;
      if (!s) return;
      const { heroCx, dockCx, heroDocCy, dockDocCy, slideH, heroScale, dockScale } = s;

      const prog = clamp(sy / slideH, 0, 1);

      // Derive current viewport Y from document-absolute Y — no DOM read needed
      // viewportCy = docCy - scrollTop
      const heroCy = heroDocCy - sy;
      const dockCy = dockDocCy - sy;

      posX.set(lerp(heroCx,    dockCx,    prog) - SHOE_W / 2);
      posY.set(lerp(heroCy,    dockCy,    prog) - SHOE_H / 2);
      pScale.set(lerp(heroScale, dockScale, prog));
      // sin curve: 0° at both snap points, −55° peak at mid-flight
      posRotZ.set(Math.sin(prog * Math.PI) * -55);

      // Threshold state — only call setState when crossing a boundary
      const nowAtHero = sy <= AT_SNAP;
      const nowDocked = sy >= slideH - AT_SNAP;
      // Hide immediately when leaving slide 2 — prevents shoe floating into slide 3
      const nowHidden = sy > slideH + 4;

      if (nowAtHero !== atHeroRef.current) { atHeroRef.current = nowAtHero; setAtHero(nowAtHero); }
      if (nowDocked !== dockedRef.current) { dockedRef.current = nowDocked; setDocked(nowDocked); }
      if (nowHidden !== hiddenRef.current) { hiddenRef.current = nowHidden; setHidden(nowHidden); }
    };

    return scrollY.on('change', update);
  }, [scrollY, posX, posY, pScale, posRotZ]);

  // Seed MotionValues when slots first arrive or after resize
  useEffect(() => {
    if (!slots) return;
    slotsRef.current = slots;
    const sy = containerRef.current?.scrollTop ?? 0;
    const { heroCx, dockCx, heroDocCy, dockDocCy, slideH, heroScale, dockScale } = slots;
    const prog   = clamp(sy / slideH, 0, 1);
    const heroCy = heroDocCy - sy;
    const dockCy = dockDocCy - sy;
    posX.set(lerp(heroCx,    dockCx,    prog) - SHOE_W / 2);
    posY.set(lerp(heroCy,    dockCy,    prog) - SHOE_H / 2);
    pScale.set(lerp(heroScale, dockScale, prog));
    posRotZ.set(Math.sin(prog * Math.PI) * -55);
  }, [slots, containerRef, posX, posY, pScale, posRotZ]);

  // ── Render ───────────────────────────────────────────────────────────────
  if (!desktop || !slots || hidden) return null;

  return (
    <motion.div
      className="select-none"
      aria-hidden="true"
      style={{
        position:        'fixed',
        top:             0,
        left:            0,
        width:           SHOE_W,
        height:          SHOE_H,
        zIndex:          30,
        pointerEvents:   docked ? 'auto' : 'none',
        willChange:      'transform',
        transformOrigin: 'center',
        x:               posX,
        y:               posY,
        scale:           pScale,
        rotateZ:         posRotZ,
      }}
    >
      {/* Emerald ambient glow */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          inset:      '-40%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 50%, transparent 70%)',
          animation:  'glow-pulse 3s ease-in-out infinite',
        }}
      />

      {/* Levitate only while resting at Hero — killed during flight to avoid Y jitter */}
      <div
        style={{
          width:     '100%',
          height:    '100%',
          animation: atHero ? 'levitate 3.8s ease-in-out infinite' : 'none',
        }}
      >
        <Shoe3DRotator
          mode={docked ? 'interactive' : 'auto'}
          fps={4.5}
          startFrame={currentFrame}
          onFrameChange={setCurrentFrame}
          width="100%"
          height="100%"
          filter={FILTER}
        />
      </div>
    </motion.div>
  );
};

export default FloatingShoe;
