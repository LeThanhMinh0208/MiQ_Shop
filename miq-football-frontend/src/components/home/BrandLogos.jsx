import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

// ── Brand data ─────────────────────────────────────────────────────────────
// Two rows with different ordering for visual variety
const ROW_A = [
  { name: 'NIKE',         slug: 'Nike',          cls: 'font-display font-black italic tracking-[-0.04em] text-2xl md:text-3xl' },
  { name: 'adidas',       slug: 'Adidas',        cls: 'font-display font-black tracking-[-0.02em] text-2xl md:text-3xl lowercase' },
  { name: 'PUMA',         slug: 'Puma',          cls: 'font-display font-black italic tracking-widest text-xl md:text-2xl' },
  { name: 'Mizuno',       slug: 'Mizuno',        cls: 'font-display font-bold text-xl md:text-2xl' },
  { name: 'New Balance',  slug: 'New Balance',   cls: 'font-body font-black text-xs md:text-sm tracking-[0.18em] uppercase' },
  { name: 'UNDER ARMOUR', slug: 'Under Armour',  cls: 'font-display font-bold tracking-wider text-base md:text-lg' },
];
const ROW_B = [
  { name: 'UNDER ARMOUR', slug: 'Under Armour',  cls: 'font-display font-bold tracking-wider text-base md:text-lg' },
  { name: 'New Balance',  slug: 'New Balance',   cls: 'font-body font-black text-xs md:text-sm tracking-[0.18em] uppercase' },
  { name: 'PUMA',         slug: 'Puma',          cls: 'font-display font-black italic tracking-widest text-xl md:text-2xl' },
  { name: 'Mizuno',       slug: 'Mizuno',        cls: 'font-display font-bold text-xl md:text-2xl' },
  { name: 'NIKE',         slug: 'Nike',          cls: 'font-display font-black italic tracking-[-0.04em] text-2xl md:text-3xl' },
  { name: 'adidas',       slug: 'Adidas',        cls: 'font-display font-black tracking-[-0.02em] text-2xl md:text-3xl lowercase' },
];

// ── Separator dot ──────────────────────────────────────────────────────────
const Dot = () => (
  <span className="w-1.5 h-1.5 rounded-full bg-white/20 flex-shrink-0 inline-block" aria-hidden="true" />
);

// ── Marquee row ────────────────────────────────────────────────────────────
// Quadruples the list so the seamless -50% loop always has content
const MarqueeRow = ({ brands, reverse = false }) => {
  const items = [...brands, ...brands, ...brands, ...brands];
  const animClass = reverse ? 'animate-marquee-r' : 'animate-marquee-l';

  return (
    <div className="overflow-hidden">
      <div
        className={`flex items-center gap-10 w-max ${animClass} group-hover/strip:[animation-play-state:paused]`}
      >
        {items.map((brand, i) => (
          <span key={i} className="inline-flex items-center gap-10 flex-shrink-0">
            <Link
              to={`/products?brand=${encodeURIComponent(brand.slug)}`}
              className={`${brand.cls} text-white/25 hover:text-white/75 hover:scale-105 transition-all duration-200 whitespace-nowrap`}
            >
              {brand.name}
            </Link>
            <Dot />
          </span>
        ))}
      </div>
    </div>
  );
};

// ── Section ────────────────────────────────────────────────────────────────
const BrandLogos = ({ className = '' }) => (
  <section className={`group/strip overflow-hidden ${className || 'py-8 bg-gray-950 border-y border-white/[0.06]'}`}>
    {/* Title */}
    <motion.p
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="text-center font-display text-[10px] font-bold tracking-[0.35em] uppercase text-white/30 mb-6"
    >
      Đối tác thương hiệu chính hãng
    </motion.p>

    <div className="space-y-5">
      <MarqueeRow brands={ROW_A} />
      <MarqueeRow brands={ROW_B} reverse />
    </div>
  </section>
);

export default BrandLogos;
