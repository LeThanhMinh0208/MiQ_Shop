import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronRight } from 'lucide-react';

// ── Pitch SVG background ───────────────────────────────────────────────────
const PitchLines = () => (
  <svg
    className="absolute inset-0 w-full h-full opacity-[0.07]"
    viewBox="0 0 400 600"
    preserveAspectRatio="xMidYMid slice"
    aria-hidden="true"
  >
    <rect x="20"  y="20"  width="360" height="560" fill="none" stroke="white" strokeWidth="1.5" />
    <rect x="140" y="20"  width="120" height="90"  fill="none" stroke="white" strokeWidth="1" />
    <rect x="100" y="20"  width="200" height="160" fill="none" stroke="white" strokeWidth="1" />
    <circle cx="200" cy="160" r="3" fill="white" />
    <circle cx="200" cy="300" r="60" fill="none" stroke="white" strokeWidth="1" />
    <line x1="20" y1="300" x2="380" y2="300" stroke="white" strokeWidth="1" />
    <circle cx="200" cy="300" r="3" fill="white" />
    <rect x="140" y="490" width="120" height="90"  fill="none" stroke="white" strokeWidth="1" />
    <rect x="100" y="420" width="200" height="160" fill="none" stroke="white" strokeWidth="1" />
    <circle cx="200" cy="440" r="3" fill="white" />
  </svg>
);

// ── Floating tag pill ──────────────────────────────────────────────────────
const FloatingTag = ({ label, style, delay = 0 }) => (
  <motion.div
    animate={{ y: [0, -6, 0] }}
    transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay }}
    className="absolute bg-bg-base/75 backdrop-blur-sm border border-surface-border text-text-secondary text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full select-none"
    style={style}
  >
    {label}
  </motion.div>
);

// ── Main ───────────────────────────────────────────────────────────────────
const CampaignBanner = () => (
  <section
    className="relative overflow-hidden flex flex-col lg:flex-row min-h-[600px] lg:h-full"
    style={{ background: '#08080A' }}
  >
    {/* ── Left: text panel ──────────────────────────────────────────────── */}
    <div className="relative z-10 flex flex-col justify-center w-full lg:w-1/2 px-6 sm:px-10 lg:pl-12 xl:pl-20 py-20 lg:py-16">

      {/* Eyebrow chip */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-[0.22em] px-3.5 py-1.5 rounded-full mb-8 w-fit"
      >
        ✦ BST Mới 2026
      </motion.div>

      {/* Big title */}
      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.1 }}
        className="font-display font-black text-text-primary leading-none mb-4"
        style={{ fontSize: 'clamp(3.5rem, 8vw, 6rem)', letterSpacing: '-0.02em' }}
      >
        STREET
        <br />
        <span className="text-primary">TO</span>
        <br />
        PITCH
      </motion.h2>

      {/* Collection year */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="font-display text-xl lg:text-2xl font-bold text-text-muted uppercase tracking-[0.25em] mb-6"
      >
        COLLECTION 2026
      </motion.div>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="text-text-secondary text-base lg:text-lg leading-relaxed max-w-md mb-10"
      >
        Unleash your speed with the latest turf boots and breathable kits.
        Designed for the streets. Built for the pitch.
      </motion.p>

      {/* CTA buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <Link
          to="/products"
          className="group inline-flex items-center justify-center gap-3 bg-primary hover:bg-primary-600 text-white font-bold text-sm uppercase tracking-wide px-8 py-4 rounded-2xl transition-all duration-200 shadow-neon hover:shadow-neon-lg"
        >
          Khám Phá Bộ Sưu Tập
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
        </Link>
        <Link
          to="/products?category=football-boots"
          className="inline-flex items-center justify-center gap-2 border border-surface-border hover:border-primary/40 text-text-primary hover:text-primary font-bold text-sm uppercase tracking-wide px-7 py-4 rounded-2xl transition-all duration-200"
        >
          Xem Giày Đấu
          <ChevronRight className="w-4 h-4" />
        </Link>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="flex items-center gap-8 mt-12 pt-8 border-t border-surface-border"
      >
        {[
          { value: '200+', label: 'Mẫu mới' },
          { value: '15+',  label: 'Thương hiệu' },
          { value: '98%',  label: 'Hài lòng' },
        ].map((stat) => (
          <div key={stat.label}>
            <div className="font-display text-3xl font-black text-primary">{stat.value}</div>
            <div className="text-[11px] text-text-muted uppercase tracking-widest mt-0.5">{stat.label}</div>
          </div>
        ))}
      </motion.div>
    </div>

    {/* ── Right: visual panel (desktop only) ────────────────────────────── */}
    <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center">
      {/* Pitch green gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, #064E3B 0%, #065F46 40%, #047857 65%, #0A0A0B 100%)',
        }}
      />
      <PitchLines />

      {/* Left edge bleed */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#08080A]/70 via-transparent to-transparent" />
      {/* Bottom bleed */}
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-[#08080A]/70 to-transparent" />

      {/* Centre: levitating boot + rings */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full w-full p-12">
        <motion.div
          animate={{ y: [-10, 10, -10] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
          className="relative"
        >
          {/* Glow disc */}
          <div
            className="w-64 h-64 xl:w-80 xl:h-80 rounded-full flex items-center justify-center"
            style={{
              background: 'radial-gradient(circle, rgba(16,185,129,0.18) 0%, rgba(16,185,129,0.05) 60%, transparent 80%)',
              boxShadow: '0 0 100px rgba(16,185,129,0.25)',
            }}
          >
            <img
              src="/boot.png"
              alt="Street to Pitch Collection 2026"
              className="w-52 h-52 xl:w-72 xl:h-72 object-contain drop-shadow-[0_0_40px_rgba(16,185,129,0.5)]"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>

          {/* Orbit rings */}
          <div
            className="absolute rounded-full border border-primary/20 pointer-events-none"
            style={{ inset: '-24px', animation: 'ring-cw 14s linear infinite' }}
          />
          <div
            className="absolute rounded-full border border-primary/10 pointer-events-none"
            style={{ inset: '-48px', animation: 'ring-ccw 20s linear infinite' }}
          />
        </motion.div>

        {/* Big year watermark */}
        <div className="mt-8 select-none pointer-events-none">
          <span className="font-display text-[7rem] xl:text-[9rem] font-black text-primary/[0.08] leading-none">
            2026
          </span>
        </div>
      </div>

      {/* Floating product tags */}
      <FloatingTag label="Nike Phantom"        style={{ top: '14%', left: '6%'  }} delay={0}   />
      <FloatingTag label="Adidas Predator"     style={{ top: '42%', right: '4%' }} delay={0.4} />
      <FloatingTag label="PUMA Future 8"       style={{ bottom: '22%', left: '8%' }} delay={0.8} />
    </div>
  </section>
);

export default CampaignBanner;
