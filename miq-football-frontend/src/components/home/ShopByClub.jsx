import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Trophy } from 'lucide-react';

const CLUBS = [
  { id: 'man-utd',     name: 'Man United',    abbr: 'MAN UTD',  country: 'ENG', color: '#DA291C', bg: '#DA291C',                                            textColor: '#ffffff' },
  { id: 'real-madrid', name: 'Real Madrid',   abbr: 'REAL',     country: 'ESP', color: '#00529F', bg: '#EEF2FF',                                            textColor: '#00529F' },
  { id: 'barcelona',   name: 'Barcelona',     abbr: 'BARÇA',    country: 'ESP', color: '#004D98', bg: 'linear-gradient(135deg, #004D98 0%, #A50044 100%)', textColor: '#ffffff' },
  { id: 'man-city',    name: 'Man City',      abbr: 'MAN CITY', country: 'ENG', color: '#6CABDD', bg: '#6CABDD',                                            textColor: '#ffffff' },
  { id: 'arsenal',     name: 'Arsenal',       abbr: 'ARSENAL',  country: 'ENG', color: '#EF0107', bg: '#EF0107',                                            textColor: '#ffffff' },
  { id: 'liverpool',   name: 'Liverpool',     abbr: 'LFC',      country: 'ENG', color: '#C8102E', bg: '#C8102E',                                            textColor: '#ffffff' },
  { id: 'bayern',      name: 'Bayern Munich', abbr: 'BAYERN',   country: 'GER', color: '#DC052D', bg: '#DC052D',                                            textColor: '#ffffff' },
  { id: 'psg',         name: 'PSG',           abbr: 'PSG',      country: 'FRA', color: '#004170', bg: '#004170',                                            textColor: '#ffffff' },
  { id: 'chelsea',     name: 'Chelsea',       abbr: 'CFC',      country: 'ENG', color: '#034694', bg: '#034694',                                            textColor: '#ffffff' },
  { id: 'juventus',    name: 'Juventus',      abbr: 'JUV',      country: 'ITA', color: '#333333', bg: '#1a1a1a',                                            textColor: '#ffffff' },
  { id: 'inter',       name: 'Inter Milan',   abbr: 'INTER',    country: 'ITA', color: '#010E80', bg: 'linear-gradient(135deg, #010E80 50%, #000000 100%)', textColor: '#ffffff' },
  { id: 'atletico',    name: 'Atlético',      abbr: 'ATM',      country: 'ESP', color: '#CB3524', bg: '#CB3524',                                            textColor: '#ffffff' },
  { id: 'vietnam',     name: 'Việt Nam',      abbr: 'VN',       country: 'VIE', color: '#DA251D', bg: '#DA251D',                                            textColor: '#FFFF00' },
  { id: 'brazil',      name: 'Brazil',        abbr: 'BRA',      country: 'BRA', color: '#009C3B', bg: '#009C3B',                                            textColor: '#FEDE00' },
  { id: 'argentina',   name: 'Argentina',     abbr: 'ARG',      country: 'ARG', color: '#5B9FD4', bg: '#74ACDF',                                            textColor: '#ffffff' },
];

// Compute text-size class based on character count (excluding spaces)
function badgeTextClass(abbr) {
  const len = abbr.replace(/\s/g, '').length;
  if (len <= 3) return 'text-xl lg:text-2xl';
  if (len <= 5) return 'text-sm lg:text-base';
  return 'text-[10px] lg:text-xs';
}

// ── Club card ──────────────────────────────────────────────────────────────
const ClubCard = ({ club, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.4) }}
    className="flex-shrink-0 w-28 lg:w-36 group cursor-pointer"
  >
    <Link to={`/products?club=${club.id}`} className="flex flex-col items-center gap-3">
      {/* Badge circle with glow */}
      <div className="relative w-24 h-24 lg:w-32 lg:h-32">
        {/* Hover glow */}
        <div
          className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"
          style={{ background: `radial-gradient(circle, ${club.color}66, transparent 70%)` }}
        />

        {/* CSS badge — no external image */}
        <motion.div
          whileHover={{ scale: 1.12 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full h-full rounded-full overflow-hidden shadow-lg ring-2 ring-black/10 group-hover:ring-primary/40 transition-shadow duration-300 flex items-center justify-center"
          style={{ background: club.bg }}
        >
          <div
            className="flex flex-col items-center justify-center gap-0 select-none"
            style={{ color: club.textColor }}
          >
            {club.abbr.split(' ').map((word, i) => (
              <span
                key={i}
                className={`block font-black leading-none tracking-wider text-center ${badgeTextClass(club.abbr)}`}
              >
                {word}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Country chip */}
        <div className="absolute -bottom-1 -right-1 bg-bg-base border border-surface-border text-[8px] font-black text-text-muted px-1.5 py-0.5 rounded-full uppercase tracking-widest">
          {club.country}
        </div>
      </div>

      {/* Club name */}
      <span className="text-xs lg:text-sm font-bold text-text-secondary group-hover:text-primary text-center transition-colors duration-200 uppercase tracking-wide line-clamp-1">
        {club.name}
      </span>
    </Link>
  </motion.div>
);

// ── Main ───────────────────────────────────────────────────────────────────
const ShopByClub = () => {
  const scrollRef = useRef(null);
  const [canScrollLeft,  setCanScrollLeft]  = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  useEffect(() => { checkScroll(); }, []);

  const scroll = (dir) => {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -340 : 340, behavior: 'smooth' });
    setTimeout(checkScroll, 380);
  };

  return (
    <section className="py-10 lg:py-12 bg-bg-elevated overflow-hidden">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-20">

        {/* ── Header ──────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-end justify-between mb-10"
        >
          <div>
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-[0.22em] px-3.5 py-1.5 rounded-full mb-4">
              <Trophy className="w-3 h-3" />
              Câu Lạc Bộ
            </div>
            <h2 className="font-display text-4xl md:text-5xl xl:text-6xl font-bold text-text-primary leading-none mb-2">
              MUA THEO CLB
            </h2>
            <p className="font-display text-lg font-bold text-primary mb-1">
              Trang bị đúng màu áo — Đúng đội bóng của bạn
            </p>
            <p className="text-text-muted text-sm">
              Áo đấu từ các CLB hàng đầu thế giới & đội tuyển quốc gia
            </p>
          </div>

          {/* Desktop nav arrows */}
          <div className="hidden lg:flex items-center gap-2">
            <motion.button
              onClick={() => scroll('left')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={!canScrollLeft}
              className="w-10 h-10 rounded-full border border-surface-border bg-surface flex items-center justify-center text-text-muted hover:border-primary/40 hover:text-primary disabled:opacity-30 transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>
            <motion.button
              onClick={() => scroll('right')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={!canScrollRight}
              className="w-10 h-10 rounded-full border border-surface-border bg-surface flex items-center justify-center text-text-muted hover:border-primary/40 hover:text-primary disabled:opacity-30 transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>

        {/* ── Carousel ────────────────────────────────────────────── */}
        <div className="relative">
          <div
            ref={scrollRef}
            onScroll={checkScroll}
            className="flex gap-6 overflow-x-auto pb-4 scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {CLUBS.map((club, i) => (
              <ClubCard key={club.id} club={club} index={i} />
            ))}
          </div>

          {/* Edge fade masks */}
          {canScrollLeft && (
            <div className="hidden lg:block absolute left-0 top-0 bottom-4 w-16 bg-gradient-to-r from-bg-elevated to-transparent pointer-events-none z-10" />
          )}
          {canScrollRight && (
            <div className="hidden lg:block absolute right-0 top-0 bottom-4 w-16 bg-gradient-to-l from-bg-elevated to-transparent pointer-events-none z-10" />
          )}
        </div>

        {/* Mobile arrows */}
        <div className="flex lg:hidden items-center justify-center gap-3 mt-6">
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className="w-9 h-9 rounded-full border border-surface-border bg-surface flex items-center justify-center text-text-muted disabled:opacity-30 active:scale-95 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className="w-9 h-9 rounded-full border border-surface-border bg-surface flex items-center justify-center text-text-muted disabled:opacity-30 active:scale-95 transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default ShopByClub;
