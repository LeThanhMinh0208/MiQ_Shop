import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, ChevronRight, Flame, Users, Zap } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { fetchFlashSale } from '../../services/productService.js';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { useCartStore } from '../../store/cartStore.js';
import { useLanguageStore } from '../../store/languageStore.js';

// ── Constants ──────────────────────────────────────────────────────────────
const CONFETTI_COLORS = ['#ef4444','#f97316','#eab308','#22c55e','#3b82f6','#a855f7','#ec4899','#fff'];
const FAKE_CITIES    = ['Hà Nội','TP.HCM','Đà Nẵng','Cần Thơ','Nha Trang','Huế','Hải Phòng','Bình Dương'];
const FAKE_BRANDS    = ['Nike','Adidas','Puma','New Balance','Mizuno'];
const FAKE_PRODUCTS  = ['Predator Elite','Mercurial Vapor','Future 7 Pro','King Pro','Morelia Neo III'];

// Get end of today as flash sale deadline
const getEndOfDay = () => {
  const d = new Date();
  d.setHours(23, 59, 59, 0);
  if (d <= Date.now()) d.setDate(d.getDate() + 1);
  return d;
};

// Deterministic mock sold data so it's stable per render
const getMockSale = (product, idx) => {
  if (product.flashSale?.active && product.flashSale?.totalLimit > 0) {
    return { sold: product.flashSale.soldCount, total: product.flashSale.totalLimit };
  }
  const total = 150 + ((idx * 37 + 53) % 100);
  const sold  = Math.floor(total * (0.45 + ((idx * 13 + 7) % 40) / 100));
  return { sold, total };
};

// ── Lightning bolt decoration ─────────────────────────────────────────────
const LightningBolt = ({ style, className }) => (
  <motion.svg
    viewBox="0 0 24 24"
    className={className}
    style={style}
    fill="currentColor"
  >
    <path d="M13 2L4.5 13.5H11L9 22L20 9.5H13.5L16 2z" />
  </motion.svg>
);

// ── Countdown digit card ───────────────────────────────────────────────────
const DigitCard = ({ value, label }) => {
  const padded = String(value).padStart(2, '0');
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-16 sm:w-20 h-16 sm:h-20 bg-white/15 backdrop-blur-md border-2 border-red-300/40 rounded-2xl overflow-hidden shadow-lg">
        {/* Horizontal divider line */}
        <div className="absolute inset-x-0 top-1/2 h-px bg-black/20 z-10" />
        <AnimatePresence mode="wait">
          <motion.span
            key={padded}
            initial={{ y: -28, opacity: 0 }}
            animate={{ y: 0,   opacity: 1 }}
            exit={{   y:  28, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute inset-0 flex items-center justify-center font-display text-3xl sm:text-4xl font-black text-white tabular-nums"
          >
            {padded}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="text-[10px] font-bold uppercase tracking-widest text-red-200/80">{label}</span>
    </div>
  );
};

// ── Progress bar ───────────────────────────────────────────────────────────
const ProgressBar = ({ sold, total }) => {
  const pct = Math.min(100, Math.round((sold / total) * 100));
  const t = useLanguageStore((s) => s.t);
  const urgency = pct >= 80;
  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-[10px] mb-1">
        <span className={`font-bold ${urgency ? 'text-red-500' : 'text-text-muted'}`}>
          {urgency ? t('almostSoldOut') : `${sold}/${total}`}
        </span>
        <span className="font-bold text-text-muted">{pct}%</span>
      </div>
      <div className="h-1.5 bg-surface rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
          className={`h-full rounded-full ${urgency ? 'bg-red-500' : 'bg-primary'}`}
        />
      </div>
    </div>
  );
};

// ── Confetti particle ──────────────────────────────────────────────────────
const Particle = ({ x, y, color, angle, size }) => (
  <motion.div
    className="fixed pointer-events-none z-[9999] rounded-sm"
    style={{ left: x, top: y, width: size, height: size * 0.45, backgroundColor: color, originX: '50%', originY: '50%' }}
    initial={{ opacity: 1, scale: 1, x: 0, y: 0, rotate: 0 }}
    animate={{
      opacity: 0,
      scale: [1, 1.3, 0.5],
      x: Math.cos(angle) * (120 + Math.random() * 80),
      y: Math.sin(angle) * (120 + Math.random() * 80) + 60,
      rotate: Math.random() * 720 - 360,
    }}
    transition={{ duration: 0.75, ease: 'easeOut' }}
  />
);

// ── Flash product card ─────────────────────────────────────────────────────
const FlashCard = ({ product, idx, onConfetti }) => {
  const [hovered, setHovered] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const { sold, total } = getMockSale(product, idx);

  const discountPct = product.salePrice
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;

  const t = useLanguageStore((s) => s.t);

  const handleBuy = (e) => {
    e.preventDefault();
    const v = product.variants?.find((v) => v.stock > 0);
    if (!v) { toast.error(t('outOfStockToast')); return; }
    addItem(product, v.size, 1);
    toast.success(t('addedToCart'));
    const rect = e.currentTarget.getBoundingClientRect();
    onConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2);
  };

  return (
    <motion.div
      className="relative flex-shrink-0 w-52 sm:w-60 bg-bg-elevated rounded-3xl overflow-hidden border border-surface-border cursor-pointer"
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      animate={hovered ? { y: -6, boxShadow: '0 20px 40px rgba(239,68,68,0.25)' } : { y: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
      transition={{ duration: 0.25 }}
    >
      {/* HOT ribbon */}
      <div className="absolute top-0 right-0 z-10">
        <div className="bg-red-500 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-xl">
          HOT
        </div>
      </div>

      {/* Discount badge — rotating */}
      {discountPct > 0 && (
        <motion.div
          animate={{ rotate: [-8, -12, -8] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-3 left-3 z-10 w-12 h-12 bg-red-500 rounded-full flex flex-col items-center justify-center shadow-lg"
        >
          <span className="text-white font-black text-[13px] leading-none">-{discountPct}%</span>
        </motion.div>
      )}

      {/* Product image — hover-shimmer: type 2 */}
      <Link to={`/products/${product._id}`} className="block">
        <div className="hover-shimmer relative bg-gradient-to-br from-red-500/10 to-orange-500/10 overflow-hidden" style={{ aspectRatio: '1' }}>
          <motion.img
            src={product.images?.[0]?.url}
            alt={product.name}
            loading="lazy"
            decoding="async"
            animate={{ scale: hovered ? 1.08 : 1 }}
            transition={{ duration: 0.4 }}
            className="w-full h-full object-contain p-5"
          />
          {/* Glow on hover */}
          <motion.div
            animate={{ opacity: hovered ? 0.6 : 0 }}
            className="absolute inset-0 bg-gradient-to-t from-red-400/30 to-transparent pointer-events-none"
          />
        </div>
      </Link>

      {/* Info */}
      <div className="p-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-0.5 truncate">{product.brand}</p>
        <Link to={`/products/${product._id}`}>
          <h3 className="font-display font-bold text-sm uppercase line-clamp-2 leading-tight mb-3 text-text-primary hover:text-red-500 transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-2xl font-black text-red-500">
            {formatCurrency(product.salePrice || product.price)}
          </span>
          {product.salePrice && (
            <span className="text-sm text-text-muted line-through">{formatCurrency(product.price)}</span>
          )}
        </div>

        {/* Progress */}
        <div className="mb-3">
          <ProgressBar sold={sold} total={total} />
        </div>

        {/* CTA */}
        <motion.button
          onClick={handleBuy}
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-black text-sm uppercase tracking-wide rounded-xl py-2.5 transition shadow-md shadow-red-500/30"
        >
          <ShoppingCart className="w-4 h-4" />
          {t('buyNow')}
        </motion.button>
      </div>
    </motion.div>
  );
};

// ── Main section ───────────────────────────────────────────────────────────
const FlashSale = () => {
  const t = useLanguageStore((s) => s.t);
  const scrollRef   = useRef(null);
  const animRef     = useRef(null);
  const pausedRef   = useRef(false);
  const [confetti, setConfetti] = useState([]);
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });
  const [viewers, setViewers] = useState(18);
  const endTime = useRef(getEndOfDay());

  // Countdown ticker
  useEffect(() => {
    const tick = () => {
      const diff = endTime.current - Date.now();
      if (diff <= 0) { setTimeLeft({ h: 0, m: 0, s: 0 }); return; }
      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1_000);
      setTimeLeft({ h, m, s });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Fake viewer drift
  useEffect(() => {
    const id = setInterval(() => {
      setViewers((v) => Math.max(8, Math.min(60, v + (Math.random() > 0.45 ? 1 : -1))));
    }, 3500);
    return () => clearInterval(id);
  }, []);

  // Fake purchase toast every 10s
  useEffect(() => {
    const fire = () => {
      const city    = FAKE_CITIES[Math.floor(Math.random() * FAKE_CITIES.length)];
      const brand   = FAKE_BRANDS[Math.floor(Math.random() * FAKE_BRANDS.length)];
      const product = FAKE_PRODUCTS[Math.floor(Math.random() * FAKE_PRODUCTS.length)];
      toast.custom(() => (
        <motion.div
          initial={{ x: -80, opacity: 0 }}
          animate={{ x: 0,   opacity: 1 }}
          exit={{   x: -80,  opacity: 0 }}
          className="bg-bg-elevated border border-surface-border rounded-2xl px-4 py-3 shadow-xl flex items-center gap-3 max-w-xs"
        >
          <span className="text-xl">🛒</span>
          <div>
            <p className="font-bold text-xs text-text-primary"><span className="text-red-500">{city}</span></p>
            <p className="text-[11px] text-text-muted mt-0.5">{brand} {product}</p>
          </div>
        </motion.div>
      ), { position: 'bottom-left', duration: 4000 });
    };
    const id = setInterval(fire, 10_000);
    return () => clearInterval(id);
  }, []);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['flash-sale'],
    queryFn: () => fetchFlashSale(8),
    staleTime: 5 * 60 * 1000,
  });

  // Infinite auto-scroll at ~0.4 px/ms — resets seamlessly at the halfway mark
  useEffect(() => {
    if (products.length === 0) return;
    const el = scrollRef.current;
    if (!el) return;
    let last = null;
    const SPEED = 0.09;
    const step = (ts) => {
      if (last !== null && !pausedRef.current) {
        el.scrollLeft += SPEED * (ts - last);
        if (el.scrollLeft >= el.scrollWidth / 2) el.scrollLeft = 0;
      }
      last = ts;
      animRef.current = requestAnimationFrame(step);
    };
    animRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animRef.current);
  }, [products.length]);

  const triggerConfetti = useCallback((x, y) => {
    const pieces = Array.from({ length: 28 }, (_, i) => ({
      id: Date.now() + i,
      x, y,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      angle: (i / 28) * Math.PI * 2,
      size: 7 + (i % 4) * 2,
    }));
    setConfetti(pieces);
    setTimeout(() => setConfetti([]), 900);
  }, []);

  const isLowTime = timeLeft.h === 0;

  return (
    <section className="relative overflow-hidden py-10 lg:py-12"
      style={{ background: 'linear-gradient(135deg, #b91c1c 0%, #dc2626 25%, #ea580c 60%, #f59e0b 100%)' }}
    >
      {/* ── Decorative lightning bolts ──────────────────────────────── */}
      {[
        { top: '8%',  left: '3%',  size: 28, dur: 3.2, delay: 0 },
        { top: '60%', left: '1%',  size: 18, dur: 2.5, delay: 0.8 },
        { top: '20%', left: '95%', size: 22, dur: 2.8, delay: 0.4 },
        { top: '70%', left: '92%', size: 32, dur: 3.8, delay: 1.2 },
        { top: '45%', left: '5%',  size: 14, dur: 2.1, delay: 1.6 },
        { top: '85%', left: '88%', size: 16, dur: 2.6, delay: 0.6 },
      ].map((b, i) => (
        <motion.div
          key={i}
          className="absolute text-white/25 pointer-events-none"
          style={{ top: b.top, left: b.left, width: b.size, height: b.size }}
          animate={{ y: [-6, 6, -6], rotate: [-5, 5, -5], opacity: [0.15, 0.35, 0.15] }}
          transition={{ duration: b.dur, delay: b.delay, repeat: Infinity, ease: 'easeInOut' }}
        >
          <LightningBolt className="w-full h-full" />
        </motion.div>
      ))}

      {/* ── Sparkle particles ────────────────────────────────────────── */}
      {Array.from({ length: 14 }, (_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white/30 pointer-events-none"
          style={{
            top:    `${10 + (i * 6.3) % 80}%`,
            left:   `${5  + (i * 7.1) % 90}%`,
            width:  3 + (i % 3),
            height: 3 + (i % 3),
          }}
          animate={{ opacity: [0, 0.8, 0], scale: [0.5, 1.4, 0.5] }}
          transition={{ duration: 1.8 + (i % 4) * 0.4, delay: (i * 0.3) % 3, repeat: Infinity }}
        />
      ))}

      <div className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-20">

        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-5 mb-8">

          {/* Title */}
          <div className="text-center lg:text-left">
            <motion.div
              className="flex items-center justify-center lg:justify-start gap-3 mb-2"
              animate={{ x: [0, -2, 2, -1, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
            >
              <motion.div
                animate={{ rotate: [0, -15, 15, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 2 }}
              >
                <Zap className="w-9 h-9 text-yellow-300 fill-yellow-300" />
              </motion.div>
              <h2
                className="font-display text-5xl md:text-6xl font-black uppercase tracking-tight"
                style={{
                  background: 'linear-gradient(90deg, #ffffff 0%, #fef08a 50%, #ffffff 100%)',
                  backgroundSize: '200% auto',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {t('flashSaleTitle')}
              </h2>
              <motion.div
                animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 2, delay: 0.15 }}
              >
                <Zap className="w-9 h-9 text-yellow-300 fill-yellow-300" />
              </motion.div>
            </motion.div>
            <p className="text-red-100/90 text-base font-medium">
              {t('flashSaleSubtitle')}
            </p>
            {/* Viewer badge */}
            <div className="flex items-center justify-center lg:justify-start gap-2 mt-3">
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                className="w-2 h-2 rounded-full bg-green-400"
              />
              <span className="text-white/80 text-xs font-semibold flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                <span className="text-white font-black">{viewers}</span>
              </span>
            </div>
          </div>

          {/* Countdown */}
          <div className="flex flex-col items-center gap-3">
            <p className="text-red-200/80 text-[11px] font-bold uppercase tracking-widest">{t('endsIn')}</p>
            <motion.div
              className="flex items-end gap-2 sm:gap-3"
              animate={isLowTime ? { scale: [1, 1.03, 1] } : {}}
              transition={{ duration: 0.8, repeat: Infinity }}
            >
              <DigitCard value={timeLeft.h} label={t('hours')} />
              <span className="text-4xl font-black text-white/60 mb-5 leading-none">:</span>
              <DigitCard value={timeLeft.m} label={t('minutes')} />
              <span className="text-4xl font-black text-white/60 mb-5 leading-none">:</span>
              <DigitCard value={timeLeft.s} label={t('seconds')} />
            </motion.div>
          </div>
        </div>

        {/* ── Product carousel — infinite auto-scroll marquee ────────── */}
        <div className="relative">
          {/* Cards — duplicated for seamless loop */}
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-hidden pb-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            onMouseEnter={() => { pausedRef.current = true; }}
            onMouseLeave={() => { pausedRef.current = false; }}
          >
            {isLoading
              ? Array.from({ length: 6 }, (_, i) => (
                  <div key={i} className="flex-shrink-0 w-52 sm:w-60 h-80 bg-white/20 rounded-3xl animate-pulse" />
                ))
              : products.length === 0
                ? (
                  <div className="flex-1 flex flex-col items-center justify-center py-16 text-white/60 gap-3">
                    <Zap className="w-12 h-12 opacity-40" />
                    <p className="font-semibold">{t('noFlashSaleProducts')}</p>
                  </div>
                )
                : [...products, ...products].map((p, i) => (
                    <FlashCard key={`${p._id}-${i}`} product={p} idx={i % products.length} onConfetti={triggerConfetti} />
                  ))
            }
          </div>
        </div>

        {/* ── View all link ───────────────────────────────────────────── */}
        {products.length > 0 && (
          <div className="flex justify-center mt-8">
            <Link
              to="/products?sort=price_asc"
              className="flex items-center gap-2 bg-white text-red-500 hover:bg-yellow-300 hover:text-red-700 font-black text-sm uppercase tracking-wide px-7 py-3 rounded-full transition shadow-lg"
            >
              {t('viewAllDeals')}
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>

      {/* ── Confetti particles ──────────────────────────────────────────── */}
      {confetti.map((p) => (
        <Particle key={p.id} {...p} />
      ))}
    </section>
  );
};

export default FlashSale;
