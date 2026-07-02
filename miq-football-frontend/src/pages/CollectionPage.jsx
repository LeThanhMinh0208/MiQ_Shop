import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight, ShoppingBag } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchProducts } from '../services/productService.js';
import { getCollectionBySlug } from '../services/collectionService.js';
import ProductCard from '../components/product/ProductCard.jsx';
import { PageSpinner } from '../components/ui/Skeleton.jsx';

// ── Fallback data when collection not yet in DB ───────────────────────────────
const BRAND_FALLBACK = {
  miq:           { displayName: 'MiQ Sport',    brand: 'MiQ',         tagline: 'Thương hiệu thể thao Việt Nam — Chất lượng không biên giới', description: 'MiQ Sport được sinh ra từ tình yêu bóng đá Việt Nam. Chúng tôi mang đến những sản phẩm cao cấp với thiết kế độc quyền, phù hợp từ sân phủi đến giải chuyên nghiệp.', accentColor: '#E8590C', slides: [{ url: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=1400&q=80', caption: 'MiQ 2025/26 — Flagship Collection' }], modelPhotos: [{ url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80', title: 'MiQ Predator Series', desc: 'Kiểm soát tuyệt đối' }] },
  adidas:        { displayName: 'Adidas',        brand: 'Adidas',      tagline: 'Impossible Is Nothing', description: 'Adidas — thương hiệu thể thao hàng đầu thế giới với những đôi giày mang công nghệ tiên tiến nhất.', accentColor: '#000000', slides: [{ url: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=1400&q=80', caption: 'Adidas Predator Elite 2025' }], modelPhotos: [{ url: 'https://images.unsplash.com/photo-1584735175315-9d5df23be620?w=800&q=80', title: 'Predator Elite', desc: 'Kiểm soát đỉnh cao' }] },
  nike:          { displayName: 'Nike',          brand: 'Nike',        tagline: 'Just Do It', description: 'Nike Football — từ Phantom GX2 đến Mercurial Vapor, những đôi giày được các ngôi sao hàng đầu thế giới tin chọn.', accentColor: '#FF6B00', slides: [{ url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1400&q=80', caption: 'Nike Phantom GX2 — Chinh phục mọi giới hạn' }], modelPhotos: [{ url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80', title: 'Mercurial Vapor', desc: 'Tốc độ không ai sánh bằng' }] },
  puma:          { displayName: 'Puma',          brand: 'Puma',        tagline: 'Forever Faster', description: 'Puma Football — thương hiệu của tốc độ. Ultra, Future và King là những dòng giày được thiết kế để vượt giới hạn.', accentColor: '#FFD700', slides: [{ url: 'https://images.unsplash.com/photo-1575537302964-96cd47c06b1b?w=1400&q=80', caption: 'Puma Ultra 5 — Nhẹ không tưởng' }], modelPhotos: [{ url: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=800&q=80', title: 'King Pro', desc: 'Di sản bóng đá' }] },
  'new-balance': { displayName: 'New Balance',  brand: 'New Balance', tagline: 'Fearlessly Independent', description: 'New Balance Football — kết hợp hoàn hảo giữa công nghệ hiện đại và tính thẩm mỹ cao.', accentColor: '#C8102E', slides: [{ url: 'https://images.unsplash.com/photo-1556906781-9a412961a28c?w=1400&q=80', caption: 'New Balance Furon V7' }], modelPhotos: [{ url: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=800&q=80', title: 'Tekela V4', desc: 'Phong cách riêng' }] },
  mizuno:        { displayName: 'Mizuno',        brand: 'Mizuno',      tagline: 'Running is a feeling', description: 'Mizuno Football — thương hiệu Nhật Bản nổi tiếng với chất lượng thủ công và cảm giác bóng chân thực nhất.', accentColor: '#003087', slides: [{ url: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=1400&q=80', caption: 'Mizuno Morelia Neo III' }], modelPhotos: [{ url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80', title: 'Wave Cup Legend', desc: 'Thủ công Nhật Bản' }] },
  umbro:         { displayName: 'Umbro',         brand: 'Umbro',       tagline: 'The Game Lives Here', description: 'Umbro — thương hiệu Anh quốc với lịch sử lâu đời trong bóng đá. Những chiếc áo đấu huyền thoại.', accentColor: '#E30613', slides: [{ url: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=1400&q=80', caption: 'Umbro Classic Collection' }], modelPhotos: [{ url: 'https://images.unsplash.com/photo-1516478177764-9fe5bd7e9717?w=800&q=80', title: 'Umbro Team Kit', desc: 'Đồng phục thi đấu' }] },
};

// ── Dark background palette for carousel — shifts per active product ──────────
const HERO_BG_COLORS = [
  '#0c0c14', // deep blue-purple
  '#14080c', // deep burgundy
  '#08100c', // deep forest
  '#100c08', // deep umber
  '#0a0c14', // deep navy
];

// ── Old slideshow — kept as fallback for N=0 / loading state ─────────────────
const HeroSlideshow = ({ slides, accentColor }) => {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef(null);

  const go = (idx) => setCurrent((idx + slides.length) % slides.length);

  const resetTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setCurrent((c) => (c + 1) % slides.length), 4500);
  };

  useEffect(() => {
    if (slides.length < 2) return;
    timerRef.current = setInterval(() => setCurrent((c) => (c + 1) % slides.length), 4500);
    return () => clearInterval(timerRef.current);
  }, [slides.length]);

  const touchStart = useRef(null);
  const handleTouchStart = (e) => { touchStart.current = e.touches[0].clientX; };
  const handleTouchEnd   = (e) => {
    if (touchStart.current === null) return;
    const diff = touchStart.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) { go(current + (diff > 0 ? 1 : -1)); resetTimer(); }
    touchStart.current = null;
  };

  if (!slides.length) return (
    <div className="w-full h-[40vh] bg-bg-raised flex items-center justify-center text-text-muted">
      <ShoppingBag className="w-12 h-12 opacity-20" />
    </div>
  );

  return (
    <div
      className="relative w-full h-[60vh] md:h-[75vh] overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0"
        >
          <img
            src={slides[current].url}
            alt={slides[current].caption}
            className="w-full h-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {slides[current].caption && (
        <div className="absolute bottom-12 left-8 md:left-16 z-10">
          <AnimatePresence mode="wait">
            <motion.p
              key={current}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="text-white font-display text-lg md:text-2xl font-bold drop-shadow-lg"
            >
              {slides[current].caption}
            </motion.p>
          </AnimatePresence>
        </div>
      )}

      {slides.length > 1 && (
        <>
          <button
            onClick={() => { go(current - 1); resetTimer(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/60 transition border border-white/20"
            aria-label="Slide trước"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => { go(current + 1); resetTimer(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/60 transition border border-white/20"
            aria-label="Slide tiếp"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => { go(i); resetTimer(); }}
                className="h-1.5 rounded-full transition-all duration-300"
                style={{ width: i === current ? 28 : 8, backgroundColor: i === current ? accentColor : 'rgba(255,255,255,0.4)' }}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// ── 3D Product Carousel — replaces HeroSlideshow ──────────────────────────────
const ProductCarousel3D = ({ products, prodLoading, brandName, accentColor, fallbackSlides }) => {
  const navigate = useNavigate();

  // Pad to ≥4 so carousel math is always clean.
  // N < 4 → repeat products to fill 4 slots.
  // N == 0 → handled by early return below.
  const items = useMemo(() => {
    if (!products || products.length === 0) return [];
    if (products.length < 4) {
      return Array.from({ length: 4 }, (_, i) => products[i % products.length]);
    }
    return products;
  }, [products]);

  const N = items.length;

  const [active,      setActive]   = useState(0);
  const [isAnimating, setIsAnim]   = useState(false);
  const [bgColor,     setBgColor]  = useState(HERO_BG_COLORS[0]);
  const [isMobile,    setIsMobile] = useState(
    typeof window !== 'undefined' && window.innerWidth < 640
  );

  // Detect prefers-reduced-motion once at mount
  const reducedMotion = useRef(
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ).current;

  // Responsive listener
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  // Reset position when the product list changes (brand switch)
  useEffect(() => {
    setActive(0);
    setBgColor(HERO_BG_COLORS[0]);
  }, [items]);

  // ── All hooks called — early returns are safe below ──────────────────────

  // While products are loading or there are none, fall back to the old slideshow
  if (prodLoading || N === 0) {
    return <HeroSlideshow slides={fallbackSlides || []} accentColor={accentColor} />;
  }

  // ── Slot indices ─────────────────────────────────────────────────────────
  const slots = {
    center: active,
    right:  (active + 1) % N,
    back:   (active + 2) % N,
    left:   (active - 1 + N) % N,
  };

  const getRole = (idx) => {
    if (idx === slots.center) return 'center';
    if (idx === slots.left)   return 'left';
    if (idx === slots.right)  return 'right';
    if (idx === slots.back)   return 'back';
    return 'hidden';
  };

  // ── Position/style tables for desktop vs mobile ──────────────────────────
  const ROLES = isMobile ? {
    center: { x: 0,    s: 1.0,  z: 4, o: 1,    blur: 0   },
    left:   { x: -148, s: 0.68, z: 3, o: 0.78, blur: 2   },
    right:  { x:  148, s: 0.68, z: 3, o: 0.78, blur: 2   },
    back:   { x: 0,    s: 0.46, z: 1, o: 0.22, blur: 7   },
    hidden: { x: 0,    s: 0.18, z: 0, o: 0,    blur: 8   },
  } : {
    center: { x: 0,    s: 1.15, z: 4, o: 1,    blur: 0   },
    left:   { x: -286, s: 0.76, z: 3, o: 0.8,  blur: 2.5 },
    right:  { x:  286, s: 0.76, z: 3, o: 0.8,  blur: 2.5 },
    back:   { x: 0,    s: 0.52, z: 1, o: 0.2,  blur: 8   },
    hidden: { x: 0,    s: 0.18, z: 0, o: 0,    blur: 8   },
  };

  const ITEM_W   = isMobile ? 158 : 240;
  const ITEM_H   = isMobile ? 198 : 300;
  const STAGE_H  = isMobile ? 420 : 580;
  const EASE_CSS = 'cubic-bezier(0.4,0,0.2,1)';
  const DUR      = '650ms';
  const TRANSITION = reducedMotion
    ? 'none'
    : `transform ${DUR} ${EASE_CSS}, opacity ${DUR} ${EASE_CSS}, filter ${DUR} ${EASE_CSS}`;

  const centeredProduct = items[active];
  const centeredImgUrl  = centeredProduct && centeredProduct.images && centeredProduct.images[0]
    ? centeredProduct.images[0].url : '';

  const rotate = (dir) => {
    if (isAnimating) return;
    const next = (active + dir + N) % N;
    if (!reducedMotion) {
      setIsAnim(true);
      setTimeout(() => setIsAnim(false), 660);
    }
    setActive(next);
    setBgColor(HERO_BG_COLORS[next % HERO_BG_COLORS.length]);
  };

  return (
    <div
      className="relative w-full overflow-hidden select-none"
      style={{
        height: `${STAGE_H}px`,
        backgroundColor: bgColor,
        transition: reducedMotion ? 'none' : `background-color ${DUR} ${EASE_CSS}`,
      }}
    >
      {/* Giant ghost brand name — Oswald font, nearly transparent */}
      <div
        className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none"
        aria-hidden="true"
        style={{ zIndex: 0 }}
      >
        <span
          className="font-display font-black uppercase text-white"
          style={{
            fontSize: isMobile ? '30vw' : '21vw',
            opacity: 0.042,
            letterSpacing: '-0.02em',
            lineHeight: 1,
            userSelect: 'none',
          }}
        >
          {brandName}
        </span>
      </div>

      {/* Radial accent glow behind center */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 0,
          background: `radial-gradient(ellipse 55% 45% at 50% 52%, ${accentColor}1a 0%, transparent 68%)`,
          transition: reducedMotion ? 'none' : `opacity ${DUR} ${EASE_CSS}`,
        }}
      />

      {/* Brand label — top left */}
      <div className="absolute top-5 left-5 md:left-10" style={{ zIndex: 30 }}>
        <span
          className="font-display text-[10px] font-bold uppercase tracking-[0.22em]"
          style={{ color: accentColor }}
        >
          {brandName} Collection
        </span>
      </div>

      {/* ── Carousel stage ─────────────────────────────────────────────── */}
      <div className="absolute inset-0" style={{ zIndex: 10 }}>
        {items.map((product, i) => {
          const role = getRole(i);
          const r    = ROLES[role] || ROLES.hidden;
          const imgUrl = product && product.images && product.images[0]
            ? product.images[0].url : '';

          return (
            <div
              key={String(i)}
              style={{
                position: 'absolute',
                left:   '50%',
                top:    '50%',
                width:  `${ITEM_W}px`,
                height: `${ITEM_H}px`,
                transform: `translate(-50%, -50%) translateX(${r.x}px) scale(${r.s})`,
                zIndex:     r.z,
                opacity:    r.o,
                filter:    `blur(${r.blur}px)`,
                transition: TRANSITION,
                pointerEvents: r.o === 0 ? 'none' : 'auto',
                willChange: 'transform, opacity, filter',
              }}
              onClick={role === 'center' && product._id
                ? () => navigate('/products/' + product._id)
                : undefined}
            >
              {/* Product card */}
              <div
                className="w-full h-full rounded-2xl overflow-hidden"
                style={{
                  cursor: role === 'center' ? 'pointer' : 'default',
                  backgroundColor: '#1c1c1c',
                  border: role === 'center'
                    ? `2px solid ${accentColor}55`
                    : '1px solid rgba(255,255,255,0.09)',
                  boxShadow: role === 'center'
                    ? `0 24px 64px rgba(0,0,0,0.65), 0 0 48px ${accentColor}1a`
                    : '0 8px 28px rgba(0,0,0,0.45)',
                  transition: reducedMotion ? 'none' : `border-color ${DUR} ${EASE_CSS}, box-shadow ${DUR} ${EASE_CSS}`,
                }}
              >
                {imgUrl ? (
                  <img
                    src={imgUrl}
                    alt={product.name || brandName}
                    className="w-full h-full object-cover"
                    draggable={false}
                    loading={i < 4 ? 'eager' : 'lazy'}
                  />
                ) : (
                  /* Placeholder when product has no image */
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${accentColor}28 0%, ${accentColor}0c 100%)`,
                    }}
                  >
                    <span
                      className="font-display font-black uppercase text-center"
                      style={{ color: accentColor, fontSize: 12, letterSpacing: '0.12em' }}
                    >
                      {brandName}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Center product info (name + price) ─────────────────────────── */}
      {centeredProduct && (
        <div
          className="absolute left-1/2 pointer-events-none text-center"
          style={{
            bottom: isMobile ? '52px' : '62px',
            zIndex: 30,
            transform: 'translateX(-50%)',
            width: isMobile ? '200px' : '280px',
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            >
              {centeredProduct.name && (
                <p className="font-display font-bold uppercase text-white text-xs md:text-sm drop-shadow-md tracking-wide line-clamp-1 mb-0.5">
                  {centeredProduct.name}
                </p>
              )}
              {centeredProduct.price != null && (
                <p
                  className="font-display font-bold text-sm md:text-base"
                  style={{ color: accentColor }}
                >
                  {centeredProduct.price.toLocaleString('vi-VN')} ₫
                </p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* ── Prev / Next arrows ─────────────────────────────────────────── */}
      <button
        onClick={() => rotate(-1)}
        disabled={isAnimating}
        aria-label="Sản phẩm trước"
        className="absolute top-1/2 flex items-center justify-center"
        style={{
          left: isMobile ? '10px' : '28px',
          zIndex: 30,
          transform: 'translateY(-50%)',
          width: 44, height: 44,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.10)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.15)',
          color: 'white',
          cursor: isAnimating ? 'default' : 'pointer',
          opacity: isAnimating ? 0.45 : 1,
          transition: 'opacity 200ms, background 200ms',
        }}
      >
        <ChevronLeft style={{ width: 20, height: 20 }} />
      </button>
      <button
        onClick={() => rotate(1)}
        disabled={isAnimating}
        aria-label="Sản phẩm tiếp"
        className="absolute top-1/2 flex items-center justify-center"
        style={{
          right: isMobile ? '10px' : '28px',
          zIndex: 30,
          transform: 'translateY(-50%)',
          width: 44, height: 44,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.10)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.15)',
          color: 'white',
          cursor: isAnimating ? 'default' : 'pointer',
          opacity: isAnimating ? 0.45 : 1,
          transition: 'opacity 200ms, background 200ms',
        }}
      >
        <ChevronRight style={{ width: 20, height: 20 }} />
      </button>

      {/* ── Dot indicators ─────────────────────────────────────────────── */}
      <div
        className="absolute left-1/2 flex items-center gap-2"
        style={{
          bottom: isMobile ? '18px' : '22px',
          zIndex: 30,
          transform: 'translateX(-50%)',
        }}
      >
        {items.map((_, dotIdx) => (
          <button
            key={dotIdx}
            aria-label={`Sản phẩm ${dotIdx + 1}`}
            onClick={() => {
              if (!isAnimating) {
                setActive(dotIdx);
                setBgColor(HERO_BG_COLORS[dotIdx % HERO_BG_COLORS.length]);
              }
            }}
            style={{
              height: 6,
              borderRadius: 3,
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              width: dotIdx === active ? 24 : 8,
              backgroundColor: dotIdx === active
                ? accentColor
                : 'rgba(255,255,255,0.28)',
              transition: reducedMotion ? 'none' : 'width 300ms, background-color 300ms',
            }}
          />
        ))}
      </div>
    </div>
  );
};

// ── Model photo card ───────────────────────────────────────────────────────────
const ModelPhotoCard = ({ photo, brandName, brandParam, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
    className="relative group overflow-hidden rounded-2xl aspect-[3/4] cursor-pointer"
  >
    <img
      src={photo.url}
      alt={photo.title}
      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
      loading="lazy"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
    <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
      <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-1">{brandName}</p>
      {photo.title && <h3 className="text-white font-display text-lg font-bold mb-1">{photo.title}</h3>}
      {photo.desc  && <p className="text-white/70 text-sm mb-3">{photo.desc}</p>}
      <Link
        to={`/products?brand=${encodeURIComponent(brandParam)}`}
        className="inline-flex items-center gap-2 text-xs font-bold text-white bg-white/15 backdrop-blur-sm border border-white/25 px-4 py-2 rounded-full hover:bg-white/25 transition"
      >
        Xem sản phẩm <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  </motion.div>
);

// ── Main Page ──────────────────────────────────────────────────────────────────
const CollectionPage = () => {
  const { slug } = useParams();

  // Try to load from DB first
  const { data: dbCollection, isLoading: colLoading } = useQuery({
    queryKey: ['collection', slug],
    queryFn: () => getCollectionBySlug(slug),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  // Fallback to hardcoded data if collection not in DB yet
  const fb = BRAND_FALLBACK[slug] || BRAND_FALLBACK.miq;
  const col = dbCollection || fb;

  const displayName  = col.name        || fb.displayName;
  const brand        = col.brand       || fb.brand;
  const tagline      = col.tagline     || fb.tagline;
  const description  = col.description || fb.description;
  const accentColor  = col.accentColor || fb.accentColor;
  const slides       = (col.slides?.length      ? col.slides      : fb.slides)      || [];
  const modelPhotos  = (col.modelPhotos?.length  ? col.modelPhotos : fb.modelPhotos) || [];

  const { data: productsData, isLoading: prodLoading } = useQuery({
    queryKey: ['collection-products', brand],
    queryFn: () => fetchProducts({ brand, limit: 8 }),
    staleTime: 5 * 60 * 1000,
    enabled: !!brand,
  });

  const products = productsData?.products ?? [];

  if (colLoading) return <PageSpinner />;

  return (
    <div className="bg-bg-base min-h-screen">
      {/* Section 1: 3D Product Carousel (replaces old slideshow) */}
      <ProductCarousel3D
        products={products}
        prodLoading={prodLoading}
        brandName={brand}
        accentColor={accentColor}
        fallbackSlides={slides}
      />

      {/* Brand header */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-20 py-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-14"
        >
          <div
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.25em] px-4 py-1.5 rounded-full mb-4 border"
            style={{ color: accentColor, borderColor: `${accentColor}40`, backgroundColor: `${accentColor}10` }}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Bộ sưu tập chính thức
          </div>
          <h1 className="font-display text-5xl md:text-7xl font-black text-text-primary uppercase mb-3">
            {displayName}
          </h1>
          {tagline && (
            <p className="font-display text-lg font-bold mb-4" style={{ color: accentColor }}>
              {tagline}
            </p>
          )}
          {description && (
            <p className="text-text-muted text-base max-w-2xl mx-auto leading-relaxed">
              {description}
            </p>
          )}
        </motion.div>

        {/* Section 2: Model photos */}
        {modelPhotos.length > 0 && (
          <section className="mb-20">
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="font-display text-3xl md:text-4xl font-bold text-text-primary uppercase mb-8"
            >
              Ảnh Editorial
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {modelPhotos.map((photo, i) => (
                <ModelPhotoCard
                  key={photo._id || i}
                  photo={photo}
                  brandName={displayName}
                  brandParam={brand}
                  delay={i * 0.12}
                />
              ))}
            </div>
          </section>
        )}

        {/* Section 3: Products */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="font-display text-3xl md:text-4xl font-bold text-text-primary uppercase"
            >
              Sản phẩm {displayName}
            </motion.h2>
            <Link
              to={`/products?brand=${encodeURIComponent(brand)}`}
              className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80 transition"
            >
              Xem tất cả <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {prodLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-surface rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 text-text-muted">
              <ShoppingBag className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="font-display text-xl font-bold mb-2">Chưa có sản phẩm</p>
              <p className="text-sm">Sản phẩm {displayName} đang được cập nhật.</p>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 mt-6 bg-primary text-white font-bold px-6 py-3 rounded-xl hover:bg-primary/90 transition"
              >
                Xem tất cả sản phẩm <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {products.map((product, i) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </div>
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="flex justify-center mt-10"
              >
                <Link
                  to={`/products?brand=${encodeURIComponent(brand)}`}
                  className="inline-flex items-center gap-2 bg-primary text-white font-bold px-8 py-3.5 rounded-full hover:bg-primary/90 transition shadow-lg"
                >
                  Xem tất cả {displayName} <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default CollectionPage;
