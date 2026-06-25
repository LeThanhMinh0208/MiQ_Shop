import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Trophy } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useLanguageStore } from '../../store/languageStore.js';
import { getSiteAssets } from '../../services/siteAssetService.js';

const CLUBS = [
  { id: 'man-utd',     name: 'Man United',    logo: 'https://api.fcweb.top/static/images/clubs/manchester-united.png', country: 'ENG', color: '#DA291C' },
  { id: 'real-madrid', name: 'Real Madrid',   logo: 'https://api.fcweb.top/static/images/clubs/real-madrid.png',       country: 'ESP', color: '#FEBE10' },
  { id: 'barcelona',   name: 'Barcelona',     logo: 'https://api.fcweb.top/static/images/clubs/barcelona.png',         country: 'ESP', color: '#A50044' },
  { id: 'man-city',    name: 'Man City',      logo: 'https://api.fcweb.top/static/images/clubs/manchester-city.png',   country: 'ENG', color: '#6CABDD' },
  { id: 'arsenal',     name: 'Arsenal',       logo: 'https://api.fcweb.top/static/images/clubs/arsenal.png',           country: 'ENG', color: '#EF0107' },
  { id: 'liverpool',   name: 'Liverpool',     logo: 'https://api.fcweb.top/static/images/clubs/liverpool.png',         country: 'ENG', color: '#C8102E' },
  { id: 'bayern',      name: 'Bayern Munich', logo: 'https://api.fcweb.top/static/images/clubs/bayern-munich.png',     country: 'GER', color: '#DC052D' },
  { id: 'psg',         name: 'PSG',           logo: 'https://api.fcweb.top/static/images/clubs/psg.png',               country: 'FRA', color: '#003090' },
  { id: 'chelsea',     name: 'Chelsea',       logo: 'https://api.fcweb.top/static/images/clubs/chelsea.png',           country: 'ENG', color: '#034694' },
  { id: 'juventus',    name: 'Juventus',      logo: 'https://api.fcweb.top/static/images/clubs/juventus.png',          country: 'ITA', color: '#000000' },
  { id: 'inter',       name: 'Inter Milan',   logo: 'https://api.fcweb.top/static/images/clubs/inter-milan.png',       country: 'ITA', color: '#010E80' },
  { id: 'atletico',    name: 'Atlético',      logo: 'https://api.fcweb.top/static/images/clubs/atletico-madrid.png',   country: 'ESP', color: '#CB3524' },
  { id: 'vietnam',     name: 'Việt Nam',      logo: 'https://api.fcweb.top/static/images/clubs/vietnam.png',           country: 'VIE', color: '#DA251D' },
  { id: 'brazil',      name: 'Brazil',        logo: 'https://api.fcweb.top/static/images/clubs/brazil.png',            country: 'BRA', color: '#009C3B' },
  { id: 'argentina',   name: 'Argentina',     logo: 'https://api.fcweb.top/static/images/clubs/argentina.png',         country: 'ARG', color: '#74ACDF' },
];

// ── Club card ──────────────────────────────────────────────────────────────
const ClubCard = ({ club, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.4) }}
    className="flex-shrink-0 w-28 lg:w-36 group cursor-pointer"
  >
    <Link to={`/products?search=${encodeURIComponent(club.name)}`} className="flex flex-col items-center gap-3">
      {/* Logo circle with glow */}
      <div className="relative w-24 h-24 lg:w-32 lg:h-32">
        <div
          className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-400 blur-xl"
          style={{ background: `radial-gradient(circle, ${club.color}66, transparent 70%)` }}
        />
        <motion.div
          whileHover={{ scale: 1.12 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full h-full rounded-full bg-surface border-2 border-surface-border group-hover:border-primary/40 overflow-hidden flex items-center justify-center transition-colors duration-300 shadow-lg"
        >
          <img
            src={club.logo}
            alt={club.name}
            loading="lazy"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.style.background = `${club.color}22`;
            }}
          />
        </motion.div>
        {/* Country chip */}
        <div className="absolute -bottom-1 -right-1 bg-bg-base border border-surface-border text-[8px] font-black text-text-muted px-1.5 py-0.5 rounded-full uppercase tracking-widest">
          {club.country}
        </div>
      </div>

      {/* Name */}
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
  const t = useLanguageStore((s) => s.t);

  const { data: clubAssets = [] } = useQuery({
    queryKey: ['site-assets', 'club'],
    queryFn: () => getSiteAssets('club'),
    staleTime: 5 * 60 * 1000,
  });

  const assetMap = clubAssets.reduce((acc, a) => { acc[a.key] = a.imageUrl; return acc; }, {});

  const clubs = CLUBS.map((c) => ({
    ...c,
    logo: assetMap[`club/${c.id}`] || c.logo,
  }));

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
              {t('clubBadge')}
            </div>
            <h2 className="font-display text-4xl md:text-5xl xl:text-6xl font-bold text-text-primary leading-none mb-2">
              {t('shopByClubTitle')}
            </h2>
            <p className="font-display text-lg font-bold text-primary mb-1">
              {t('shopByClubTagline')}
            </p>
            <p className="text-text-muted text-sm">
              {t('shopByClubDesc')}
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
            {clubs.map((club, i) => (
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
