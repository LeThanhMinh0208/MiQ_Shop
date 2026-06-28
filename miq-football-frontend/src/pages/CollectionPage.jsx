import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight, ShoppingBag } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchProducts } from '../services/productService.js';
import { getCollectionBySlug } from '../services/collectionService.js';
import ProductCard from '../components/product/ProductCard.jsx';
import { PageSpinner } from '../components/ui/Skeleton.jsx';

// ── Fallback data when collection not yet in DB ───────────────────────────────
const BRAND_FALLBACK = {
  miq:           { displayName: 'MiQ Sport',    brand: 'MiQ',         tagline: 'Thương hiệu thể thao Việt Nam — Chất lượng không biên giới', description: 'MiQ Sport được sinh ra từ tình yêu bóng đá Việt Nam. Chúng tôi mang đến những sản phẩm cao cấp với thiết kế độc quyền, phù hợp từ sân phủi đến giải chuyên nghiệp.', accentColor: '#10B981', slides: [{ url: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=1400&q=80', caption: 'MiQ 2025/26 — Flagship Collection' }], modelPhotos: [{ url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80', title: 'MiQ Predator Series', desc: 'Kiểm soát tuyệt đối' }] },
  adidas:        { displayName: 'Adidas',        brand: 'Adidas',      tagline: 'Impossible Is Nothing', description: 'Adidas — thương hiệu thể thao hàng đầu thế giới với những đôi giày mang công nghệ tiên tiến nhất.', accentColor: '#000000', slides: [{ url: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=1400&q=80', caption: 'Adidas Predator Elite 2025' }], modelPhotos: [{ url: 'https://images.unsplash.com/photo-1584735175315-9d5df23be620?w=800&q=80', title: 'Predator Elite', desc: 'Kiểm soát đỉnh cao' }] },
  nike:          { displayName: 'Nike',          brand: 'Nike',        tagline: 'Just Do It', description: 'Nike Football — từ Phantom GX2 đến Mercurial Vapor, những đôi giày được các ngôi sao hàng đầu thế giới tin chọn.', accentColor: '#FF6B00', slides: [{ url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1400&q=80', caption: 'Nike Phantom GX2 — Chinh phục mọi giới hạn' }], modelPhotos: [{ url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80', title: 'Mercurial Vapor', desc: 'Tốc độ không ai sánh bằng' }] },
  puma:          { displayName: 'Puma',          brand: 'Puma',        tagline: 'Forever Faster', description: 'Puma Football — thương hiệu của tốc độ. Ultra, Future và King là những dòng giày được thiết kế để vượt giới hạn.', accentColor: '#FFD700', slides: [{ url: 'https://images.unsplash.com/photo-1575537302964-96cd47c06b1b?w=1400&q=80', caption: 'Puma Ultra 5 — Nhẹ không tưởng' }], modelPhotos: [{ url: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=800&q=80', title: 'King Pro', desc: 'Di sản bóng đá' }] },
  'new-balance': { displayName: 'New Balance',  brand: 'New Balance', tagline: 'Fearlessly Independent', description: 'New Balance Football — kết hợp hoàn hảo giữa công nghệ hiện đại và tính thẩm mỹ cao.', accentColor: '#C8102E', slides: [{ url: 'https://images.unsplash.com/photo-1556906781-9a412961a28c?w=1400&q=80', caption: 'New Balance Furon V7' }], modelPhotos: [{ url: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=800&q=80', title: 'Tekela V4', desc: 'Phong cách riêng' }] },
  mizuno:        { displayName: 'Mizuno',        brand: 'Mizuno',      tagline: 'Running is a feeling', description: 'Mizuno Football — thương hiệu Nhật Bản nổi tiếng với chất lượng thủ công và cảm giác bóng chân thực nhất.', accentColor: '#003087', slides: [{ url: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=1400&q=80', caption: 'Mizuno Morelia Neo III' }], modelPhotos: [{ url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80', title: 'Wave Cup Legend', desc: 'Thủ công Nhật Bản' }] },
  umbro:         { displayName: 'Umbro',         brand: 'Umbro',       tagline: 'The Game Lives Here', description: 'Umbro — thương hiệu Anh quốc với lịch sử lâu đời trong bóng đá. Những chiếc áo đấu huyền thoại.', accentColor: '#E30613', slides: [{ url: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=1400&q=80', caption: 'Umbro Classic Collection' }], modelPhotos: [{ url: 'https://images.unsplash.com/photo-1516478177764-9fe5bd7e9717?w=800&q=80', title: 'Umbro Team Kit', desc: 'Đồng phục thi đấu' }] },
};

// ── Hero Slideshow ─────────────────────────────────────────────────────────────
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
              className="text-white text-lg md:text-2xl font-bold drop-shadow-lg"
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
      {/* Section 1: Slideshow */}
      <HeroSlideshow slides={slides} accentColor={accentColor} />

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
