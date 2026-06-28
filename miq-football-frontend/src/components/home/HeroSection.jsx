import { useRef, useState, useCallback, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, LayoutGrid, Sparkles } from 'lucide-react';
import CountUp from '../ui/CountUp.jsx';
import BrandLogos from './BrandLogos.jsx';
import Shoe3DRotator from '../global/Shoe3DRotator.jsx';
import { useLanguageStore } from '../../store/languageStore.js';

const HERO_KEY = 'miq-hero-config';
const getHeroCfg = () => {
  try { return JSON.parse(localStorage.getItem(HERO_KEY) || '{}'); }
  catch { return {}; }
};

// ── Particle data (deterministic, stable across renders) ───────────────────
const PARTICLES = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  top:      `${12 + (i * 5.7) % 76}%`,
  left:     `${8  + (i * 6.3) % 84}%`,
  size:     3 + (i % 4) * 1.6,
  delay:    (i * 0.28) % 3,
  duration: 2.0 + (i % 4) * 0.5,
  opacity:  0.55 + (i % 3) * 0.15,
}));

// ── Animation variants ─────────────────────────────────────────────────────
const wordVariants = {
  hidden:  { opacity: 0, y: 32, rotateX: -90 },
  visible: { opacity: 1, y: 0,  rotateX: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};
const containerVariants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.25 } },
};

// ── Energy rings — perpetual rotation is intentional brand motion (Rule 100):
// aria-hidden + useReducedMotion() guard satisfies WCAG 2.3.3 / Rule 73/100.
// CSS animation (not JS) keeps it on the GPU compositor thread.
const EnergyRings = () => {
  const shouldReduce = useReducedMotion();
  return (
  <svg
    className="absolute w-[580px] h-[580px] z-0 pointer-events-none"
    viewBox="0 0 580 580"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="er1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%"   stopColor="#10B981" stopOpacity="0" />
        <stop offset="45%"  stopColor="#10B981" stopOpacity="0.95" />
        <stop offset="100%" stopColor="#34D399" stopOpacity="0.12" />
      </linearGradient>
      <linearGradient id="er2" x1="100%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%"   stopColor="#00C853" stopOpacity="0" />
        <stop offset="50%"  stopColor="#00C853" stopOpacity="0.75" />
        <stop offset="100%" stopColor="#10B981" stopOpacity="0.08" />
      </linearGradient>
      <linearGradient id="er3" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%"   stopColor="#059669" stopOpacity="0" />
        <stop offset="60%"  stopColor="#059669" stopOpacity="0.80" />
        <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
      </linearGradient>
    </defs>

    {/* Ring 1: wide flat ellipse, dashed, CSS rotate CW */}
    <ellipse
      cx="290" cy="290" rx="252" ry="94"
      fill="none" stroke="url(#er1)" strokeWidth="2.5" strokeDasharray="22 9"
      style={{ transformOrigin: '290px 290px', animation: shouldReduce ? 'none' : 'ring-cw 18s linear infinite' }}
    />
    {/* Ring 2: circle, CSS rotate CCW */}
    <ellipse
      cx="290" cy="290" rx="205" ry="205"
      fill="none" stroke="url(#er2)" strokeWidth="1.5"
      style={{ transformOrigin: '290px 290px', animation: shouldReduce ? 'none' : 'ring-ccw 13s linear infinite' }}
    />
    {/* Ring 3: thin flat ellipse, gentle CSS rock */}
    <ellipse
      cx="290" cy="290" rx="268" ry="54"
      fill="none" stroke="url(#er3)" strokeWidth="3"
      style={{ transformOrigin: '290px 290px', animation: shouldReduce ? 'none' : 'ring-rock 4.2s ease-in-out infinite' }}
    />
  </svg>
  );
};

// ── Main component ─────────────────────────────────────────────────────────
const HeroSection = () => {
  const sectionRef      = useRef(null);
  const btnRef          = useRef(null);
  const spotlightElemRef = useRef(null);
  const rafRef          = useRef(null);
  const t               = useLanguageStore((s) => s.t);
  const cfg             = getHeroCfg();
  const shouldReduce    = useReducedMotion();

  const [btnPos, setBtnPos] = useState({ x: 0, y: 0 });

  // Direct DOM mutation — no React state, no re-render on every mouse move
  const handleMouseMove = useCallback((e) => {
    if (rafRef.current) return; // skip if a frame is already queued
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      const el = sectionRef.current;
      const div = spotlightElemRef.current;
      if (!el || !div) return;
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left)  / rect.width)  * 100;
      const y = ((e.clientY - rect.top)   / rect.height) * 100;
      div.style.background = `radial-gradient(circle 450px at ${x}% ${y}%, rgba(16,185,129,0.13) 0%, transparent 65%)`;
    });
  }, []);

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

  const handleMouseLeave = useCallback(() => {}, []);

  const handleBtnMove = (e) => {
    const rect = btnRef.current?.getBoundingClientRect();
    if (!rect) return;
    setBtnPos({
      x: ((e.clientX - rect.left)  / rect.width  - 0.5) * 14,
      y: ((e.clientY - rect.top)   / rect.height - 0.5) * 8,
    });
  };

  const handleScrollDown = () => {
    const section = sectionRef.current;
    if (!section) return;
    const next = section.nextElementSibling;
    if (next) next.scrollIntoView({ behavior: 'smooth' });
    else window.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
  };

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden min-h-screen lg:min-h-0 lg:h-full flex flex-col"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* ── Main content area ─────────────────────────────────── */}
      <div className="flex-1 relative flex items-center">
        {/* ── Video / image background ───────────────────────────── */}
        <div className="absolute inset-0">
          <video
            autoPlay={!shouldReduce} loop muted playsInline preload="metadata"
            poster={cfg.videoPoster || "https://images.unsplash.com/photo-1522778526097-ce0a22ceb253?w=1920&q=80"}
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="/videos/hero-football.mp4" type="video/mp4" />
          </video>
          {/* Gradient overlay so text is always readable */}
          <div className="absolute inset-0 bg-gradient-to-r from-bg-base/95 via-bg-base/78 to-bg-elevated/40" />
          <div className="absolute inset-0 bg-noise opacity-20 mix-blend-overlay pointer-events-none" />
        </div>

        {/* ── Cursor spotlight — updated via direct DOM ref, no React re-render ── */}
        <div
          ref={spotlightElemRef}
          className="absolute inset-0 pointer-events-none z-[1]"
          style={{ background: 'radial-gradient(circle 450px at 65% 45%, rgba(16,185,129,0.13) 0%, transparent 65%)' }}
        />

        {/* ── Main 12-col grid ──────────────────────────────────────── */}
        <div className="relative z-10 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-20 py-24 lg:py-0 flex items-center">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full">

            {/* ── LEFT: Text — 5 cols ─────────────────────────────── */}
            <div className="lg:col-span-5">

              {/* Season badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-[11px] font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-6"
              >
                <Sparkles className="w-3.5 h-3.5 fill-primary/40" />
                {cfg.badge || 'Mùa giải mới 2024/25'}
              </motion.div>

              {/* Slogan */}
              <motion.h1
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="font-viet font-bold text-text-primary mb-6"
                style={{ fontSize: 'clamp(2.6rem, 4.8vw, 5.2rem)', perspective: '900px' }}
              >
                {/* Eyebrow — Be Vietnam Pro handles diacritics perfectly */}
                <motion.span
                  variants={wordVariants}
                  className="block font-viet text-text-muted font-semibold mb-4"
                  style={{ fontSize: 'clamp(0.85rem, 1.4vw, 1.1rem)', letterSpacing: '0.12em' }}
                >
                  {cfg.eyebrow || t('heroEyebrow')}
                </motion.span>

                {/* BẮT ĐẦU — gradient neon */}
                <motion.span
                  variants={wordVariants}
                  className="block font-viet font-black mb-1"
                  style={{
                    fontFamily: '"Be Vietnam Pro", "Noto Sans", sans-serif',
                    lineHeight: 1.3,
                    letterSpacing: '-0.01em',
                    paddingTop: '0.25em',
                    paddingBottom: '0.05em',
                    background: 'linear-gradient(135deg, #10B981 0%, #34D399 40%, #D4AF37 70%, #10B981 100%)',
                    backgroundSize: '200% auto',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    animation: 'gradient-shift 3s ease infinite',
                  }}
                >
                  {cfg.line1 || t('heroBig1')}
                </motion.span>

                {/* TỪ ĐÂY */}
                <motion.span
                  variants={wordVariants}
                  className="block font-black text-text-primary"
                  style={{
                    lineHeight: 1.2,
                    letterSpacing: '-0.01em',
                    textShadow: '0 0 80px rgba(16,185,129,0.3)',
                  }}
                >
                  {cfg.line2 || t('heroBig2')}
                </motion.span>
              </motion.h1>

              {/* Animated SVG underline */}
              <svg viewBox="0 0 320 14" className="w-56 mb-5 text-primary overflow-visible" aria-hidden="true">
                <motion.path
                  d="M4 10 Q 80 3 160 10 T 316 10"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  fill="none"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.9, delay: 0.72, ease: [0.16, 1, 0.3, 1] }}
                />
              </svg>

              {/* Tagline */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.72 }}
                className="mb-10"
              >
                <p className="text-text-primary text-lg md:text-xl font-semibold leading-snug mb-1">
                  {cfg.tagline1 || t('heroTagline1')}
                </p>
                <p className="text-text-secondary text-base leading-relaxed">
                  {cfg.tagline2 || t('heroTagline2')}
                </p>
              </motion.div>

              {/* CTA buttons */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.88 }}
                className="flex flex-wrap gap-4 mb-12"
              >
                {/* Primary: MUA NGAY — magnetic */}
                <motion.div
                  ref={btnRef}
                  onMouseMove={handleBtnMove}
                  onMouseLeave={() => setBtnPos({ x: 0, y: 0 })}
                  animate={{ x: btnPos.x, y: btnPos.y }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                >
                  <Link
                    to="/products"
                    className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-primary to-emerald-600 text-white font-bold uppercase tracking-wider px-10 py-5 rounded-xl transition-all duration-300 hover:shadow-[0_0_60px_rgba(16,185,129,0.6)] overflow-hidden"
                  >
                    <span className="absolute inset-0 bg-white/0 group-hover:bg-white/[0.08] transition-colors duration-300 rounded-xl" />
                    <span className="relative">{cfg.cta1Label || t('heroCTA1')}</span>
                    {/* Double-arrow slide animation */}
                    <span className="relative w-5 h-4 overflow-hidden flex items-center">
                      <ArrowRight className="w-4 h-4 absolute transition-transform duration-300 group-hover:translate-x-6" />
                      <ArrowRight className="w-4 h-4 absolute transition-transform duration-300 -translate-x-6 group-hover:translate-x-0" />
                    </span>
                  </Link>
                </motion.div>

                {/* Secondary: Xem bộ sưu tập */}
                <Link
                  to={cfg.cta2Link || '/products?category=kits'}
                  className="group inline-flex items-center gap-2 border-2 border-text-primary/20 text-text-primary font-bold uppercase tracking-wider px-8 py-5 rounded-xl transition-all duration-200 hover:border-primary hover:text-primary"
                >
                  <LayoutGrid className="w-4 h-4 group-hover:text-primary transition-colors" />
                  {cfg.cta2Label || t('heroCTA2')}
                </Link>
              </motion.div>

              {/* Quick stats */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.0 }}
                className="flex items-center gap-8"
              >
                {[
                  { to: cfg.stat1Val ?? 500, suffix: '+',  decimals: 0, label: cfg.stat1Label || t('heroStat1'), dur: 1.4 },
                  { to: cfg.stat2Val ?? 50,  suffix: 'K+', decimals: 0, label: cfg.stat2Label || t('heroStat2'), dur: 1.6 },
                  { to: cfg.stat3Val ?? 4.9, suffix: '★',  decimals: 1, label: cfg.stat3Label || t('heroStat3'), dur: 1.8 },
                ].map(({ to, suffix, decimals, label, dur }) => (
                  <div key={label} className="text-center">
                    <p className="font-display text-2xl font-bold text-text-primary">
                      <CountUp to={to} suffix={suffix} decimals={decimals} duration={dur} />
                    </p>
                    <p className="text-xs text-text-secondary font-medium">{label}</p>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* ── RIGHT: Shoe 3D — 7 cols ─────────────────────────── */}
            <div className="lg:col-span-7 relative flex items-center justify-center min-h-[480px] lg:min-h-[620px]">

              {/* Radial spotlight blob — CSS pulsing (GPU composited) */}
              <div
                className="absolute w-[560px] h-[560px] rounded-full blur-3xl pointer-events-none"
                style={{
                  background: 'radial-gradient(circle, rgba(16,185,129,0.34) 0%, rgba(16,185,129,0.12) 42%, transparent 70%)',
                  animation:  'glow-pulse 3.2s ease-in-out infinite',
                }}
              />

              {/* Rotating energy rings */}
              <EnergyRings />

              {/* Particles — CSS float-up animation (offloaded to GPU) */}
              {PARTICLES.map((p) => (
                <div
                  key={p.id}
                  className="absolute rounded-full bg-primary pointer-events-none z-0"
                  style={{
                    top:       p.top,
                    left:      p.left,
                    width:     p.size,
                    height:    p.size,
                    opacity:   0,
                    animation: `float-up ${p.duration}s ease-out ${p.delay}s infinite`,
                  }}
                />
              ))}

              {/* Interactive 3D shoe — drag to rotate 360°, or custom image from admin */}
              <div
                id="hero-shoe-slot"
                className="relative z-10 w-[380px] h-[340px] lg:w-[500px] lg:h-[450px]"
                style={{ animation: shouldReduce ? 'none' : 'shoe-levitate 5.5s ease-in-out infinite' }}
              >
                {cfg.shoeImageUrl ? (
                  <img
                    src={cfg.shoeImageUrl}
                    alt="Featured shoe"
                    className="w-full h-full object-contain"
                    style={{
                      filter: 'drop-shadow(0 36px 72px rgba(16,185,129,0.68)) drop-shadow(0 12px 28px rgba(0,0,0,0.36))',
                    }}
                  />
                ) : (
                  <Shoe3DRotator
                    mode="interactive"
                    fps={30}
                    width="100%"
                    height="100%"
                    filter="drop-shadow(0 36px 72px rgba(16,185,129,0.68)) drop-shadow(0 12px 28px rgba(0,0,0,0.36))"
                  />
                )}
                {/* Hint label */}
                {!cfg.shoeImageUrl && (
                  <p className="absolute bottom-2 inset-x-0 text-center text-[10px] text-text-muted/60 font-medium tracking-widest uppercase pointer-events-none select-none">
                    {t('heroDrag')}
                  </p>
                )}
              </div>

              {/* Pedestal ellipse shadow */}
              <div className="absolute bottom-16 lg:bottom-20 w-64 h-5 bg-primary/40 rounded-full blur-3xl pointer-events-none z-0" />
            </div>
          </div>
        </div>

        {/* ── Scroll indicator ──────────────────────────────────────── */}
        <motion.button
          onClick={handleScrollDown}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
          aria-label="Cuộn xuống"
          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 text-text-muted hover:text-primary transition-colors duration-200 group"
        >
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-60 group-hover:opacity-100 transition-opacity">
            {t('heroScroll')}
          </span>
          {/* Custom scroll-mouse SVG: Lucide has no scroll-indicator icon; the
              bouncing inner rect animation cannot be achieved with a static icon.
              aria-hidden="true" — purely decorative, no AT exposure (Rule 97). */}
          <svg
            width="26" height="38" viewBox="0 0 26 38"
            className="opacity-50 group-hover:opacity-80 transition-opacity"
            aria-hidden="true"
          >
            <rect x="1.5" y="1.5" width="23" height="35" rx="11.5"
              stroke="currentColor" strokeWidth="1.5" fill="none" />
            <rect
              x="10.5" y="7" width="5" height="8" rx="2.5"
              fill="currentColor"
              style={{ animation: shouldReduce ? 'none' : 'scroll-dot 1.6s ease-in-out infinite',
                       transformBox: 'fill-box', transformOrigin: 'center' }}
            />
          </svg>
        </motion.button>
      </div>

      {/* ── Brand logos strip ─────────────────────────────────────── */}
      <div className="relative z-10 flex-shrink-0">
        <BrandLogos className="bg-black/50 border-t border-white/[0.06] py-5" />
      </div>
    </section>
  );
};

export default HeroSection;
