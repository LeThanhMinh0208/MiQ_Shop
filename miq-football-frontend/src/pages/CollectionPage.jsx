import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight, ShoppingBag } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchProducts } from '../services/productService.js';
import ProductCard from '../components/product/ProductCard.jsx';
import { PageSpinner } from '../components/ui/Skeleton.jsx';

// ── Brand data ────────────────────────────────────────────────────────────────
const BRAND_DATA = {
  miq: {
    displayName: 'MiQ Sport',
    brandParam: 'MiQ',
    tagline: 'Thương hiệu thể thao Việt Nam — Chất lượng không biên giới',
    description: 'MiQ Sport được sinh ra từ tình yêu bóng đá Việt Nam. Chúng tôi mang đến những sản phẩm cao cấp với thiết kế độc quyền, phù hợp từ sân phủi đến giải chuyên nghiệp.',
    accentColor: '#10B981',
    slides: [
      { img: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=1400&q=80', caption: 'MiQ 2025/26 — Flagship Collection' },
      { img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1400&q=80', caption: 'Tinh hoa công nghệ Việt' },
      { img: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1400&q=80', caption: 'Dành cho mọi mặt sân' },
      { img: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=1400&q=80', caption: 'Từ sân phủi đến giải chuyên' },
    ],
    editorialPhotos: [
      { img: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80', title: 'MiQ Predator Series', desc: 'Kiểm soát tuyệt đối' },
      { img: 'https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=800&q=80', title: 'MiQ Speed Pro', desc: 'Tốc độ đỉnh cao' },
      { img: 'https://images.unsplash.com/photo-1516478177764-9fe5bd7e9717?w=800&q=80', title: 'MiQ Team Kit', desc: 'Đồng phục thi đấu' },
    ],
  },
  adidas: {
    displayName: 'Adidas',
    brandParam: 'Adidas',
    tagline: 'Impossible Is Nothing',
    description: 'Adidas — thương hiệu thể thao hàng đầu thế giới. Từ Predator Elite đến X Speedportal, mỗi đôi giày mang trong mình công nghệ tiên tiến nhất.',
    accentColor: '#000000',
    slides: [
      { img: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=1400&q=80', caption: 'Adidas Predator Elite 2025' },
      { img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1400&q=80', caption: 'X Speedportal — Tốc độ tuyệt đỉnh' },
      { img: 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=1400&q=80', caption: 'Copa Mundial — Huyền thoại sống' },
      { img: 'https://images.unsplash.com/photo-1543508282-6319a3e2621f?w=1400&q=80', caption: 'Adidas Football — Đam mê không giới hạn' },
    ],
    editorialPhotos: [
      { img: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&q=80', title: 'Predator Elite', desc: 'Kiểm soát đỉnh cao' },
      { img: 'https://images.unsplash.com/photo-1584735175315-9d5df23be620?w=800&q=80', title: 'X Speedportal', desc: 'Tốc độ thuần túy' },
      { img: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=800&q=80', title: 'Copa Collection', desc: 'Cảm giác bóng hoàn hảo' },
    ],
  },
  nike: {
    displayName: 'Nike',
    brandParam: 'Nike',
    tagline: 'Just Do It',
    description: 'Nike Football — từ Phantom GX2 đến Mercurial Vapor, những đôi giày được các ngôi sao hàng đầu thế giới tin chọn.',
    accentColor: '#FF6B00',
    slides: [
      { img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1400&q=80', caption: 'Nike Phantom GX2 — Chinh phục mọi giới hạn' },
      { img: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1400&q=80', caption: 'Mercurial Vapor — Nhanh như sét đánh' },
      { img: 'https://images.unsplash.com/photo-1512374382149-233c42b6a83b?w=1400&q=80', caption: 'Tiempo Legend — Cảm giác chân thuần túy' },
      { img: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=1400&q=80', caption: 'Nike Football 2025 Collection' },
    ],
    editorialPhotos: [
      { img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80', title: 'Phantom GX2', desc: 'Kỹ thuật tuyệt hảo' },
      { img: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80', title: 'Mercurial Vapor', desc: 'Tốc độ không ai sánh bằng' },
      { img: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80', title: 'Tiempo Legend', desc: 'Kiểm soát hoàn toàn' },
    ],
  },
  puma: {
    displayName: 'Puma',
    brandParam: 'Puma',
    tagline: 'Forever Faster',
    description: 'Puma Football — thương hiệu của tốc độ. Ultra, Future và King là những dòng giày được thiết kế để vượt giới hạn.',
    accentColor: '#FFD700',
    slides: [
      { img: 'https://images.unsplash.com/photo-1575537302964-96cd47c06b1b?w=1400&q=80', caption: 'Puma Ultra 5 — Nhẹ không tưởng' },
      { img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1400&q=80', caption: 'Future 7 Pro — Thích nghi mọi điều kiện' },
      { img: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=1400&q=80', caption: 'King Pro — Biểu tượng bóng đá' },
      { img: 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=1400&q=80', caption: 'Puma 2025 Football Collection' },
    ],
    editorialPhotos: [
      { img: 'https://images.unsplash.com/photo-1575537302964-96cd47c06b1b?w=800&q=80', title: 'Ultra 5 Ultimate', desc: 'Siêu nhẹ, siêu nhanh' },
      { img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80', title: 'Future 7 Pro', desc: 'Linh hoạt tối đa' },
      { img: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=800&q=80', title: 'King Pro', desc: 'Di sản bóng đá' },
    ],
  },
  'new-balance': {
    displayName: 'New Balance',
    brandParam: 'New Balance',
    tagline: 'Fearlessly Independent',
    description: 'New Balance Football — kết hợp hoàn hảo giữa công nghệ hiện đại và tính thẩm mỹ cao. Furon và Tekela là lựa chọn của các tiền vệ sáng tạo.',
    accentColor: '#C8102E',
    slides: [
      { img: 'https://images.unsplash.com/photo-1556906781-9a412961a28c?w=1400&q=80', caption: 'New Balance Furon V7 — Kiểm soát và tốc độ' },
      { img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1400&q=80', caption: 'Tekela V4 — Phong cách độc đáo' },
      { img: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=1400&q=80', caption: 'NB Football 2025 — Không sợ khác biệt' },
      { img: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=1400&q=80', caption: 'Vải vóc — Chất lượng từng đường may' },
    ],
    editorialPhotos: [
      { img: 'https://images.unsplash.com/photo-1556906781-9a412961a28c?w=800&q=80', title: 'Furon V7', desc: 'Tốc độ và kiểm soát' },
      { img: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=800&q=80', title: 'Tekela V4', desc: 'Phong cách riêng' },
      { img: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=800&q=80', title: 'NB Kit Collection', desc: 'Đồng phục thi đấu' },
    ],
  },
  mizuno: {
    displayName: 'Mizuno',
    brandParam: 'Mizuno',
    tagline: 'Running is a feeling',
    description: 'Mizuno Football — thương hiệu Nhật Bản nổi tiếng với chất lượng thủ công và cảm giác bóng chân thực nhất. Morelia Neo III là kiệt tác.',
    accentColor: '#003087',
    slides: [
      { img: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=1400&q=80', caption: 'Mizuno Morelia Neo III — Kiệt tác từ Nhật Bản' },
      { img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1400&q=80', caption: 'Wave Cup Legend — Di sản thủ công' },
      { img: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=1400&q=80', caption: 'Alpha Select — Thi đấu chuyên nghiệp' },
      { img: 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=1400&q=80', caption: 'Mizuno Football 2025' },
    ],
    editorialPhotos: [
      { img: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=800&q=80', title: 'Morelia Neo III', desc: 'Cảm giác bóng tuyệt đỉnh' },
      { img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80', title: 'Wave Cup Legend', desc: 'Thủ công Nhật Bản' },
      { img: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=800&q=80', title: 'Alpha Select', desc: 'Sân cỏ nhân tạo' },
    ],
  },
};

// ── Hero Slideshow ─────────────────────────────────────────────────────────────
const HeroSlideshow = ({ slides, accentColor }) => {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef(null);

  const go = (idx) => {
    setCurrent((idx + slides.length) % slides.length);
  };

  const resetTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrent((c) => (c + 1) % slides.length);
    }, 4000);
  };

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCurrent((c) => (c + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timerRef.current);
  }, [slides.length]);

  const handleNav = (dir) => {
    go(current + dir);
    resetTimer();
  };

  // Swipe support
  const touchStart = useRef(null);
  const handleTouchStart = (e) => { touchStart.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (touchStart.current === null) return;
    const diff = touchStart.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) { handleNav(diff > 0 ? 1 : -1); }
    touchStart.current = null;
  };

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
            src={slides[current].img}
            alt={slides[current].caption}
            className="w-full h-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Caption */}
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

      {/* Arrow navigation */}
      <button
        onClick={() => handleNav(-1)}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/60 transition border border-white/20"
        aria-label="Slide trước"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={() => handleNav(1)}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/60 transition border border-white/20"
        aria-label="Slide tiếp"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => { go(i); resetTimer(); }}
            className="h-1.5 rounded-full transition-all duration-300"
            style={{
              width: i === current ? 28 : 8,
              backgroundColor: i === current ? accentColor : 'rgba(255,255,255,0.4)',
            }}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

// ── Editorial photo card ───────────────────────────────────────────────────────
const EditorialCard = ({ photo, brandSlug, brandName, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
    className="relative group overflow-hidden rounded-2xl aspect-[3/4] cursor-pointer"
  >
    <img
      src={photo.img}
      alt={photo.title}
      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
      loading="lazy"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
    <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
      <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-1">{brandName}</p>
      <h3 className="text-white font-display text-lg font-bold mb-1">{photo.title}</h3>
      <p className="text-white/70 text-sm mb-3">{photo.desc}</p>
      <Link
        to={`/products?brand=${encodeURIComponent(brandName)}`}
        className="inline-flex items-center gap-2 text-xs font-bold text-white bg-white/15 backdrop-blur-sm border border-white/25 px-4 py-2 rounded-full hover:bg-white/25 transition"
      >
        Xem sản phẩm <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  </motion.div>
);

// ── Main Page ──────────────────────────────────────────────────────────────────
const CollectionPage = () => {
  const { brand } = useParams();
  const data = BRAND_DATA[brand] || BRAND_DATA.miq;

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['collection-products', data.brandParam],
    queryFn: () => fetchProducts({ brand: data.brandParam, limit: 8 }),
    staleTime: 5 * 60 * 1000,
  });

  const products = productsData?.products ?? [];

  return (
    <div className="bg-bg-base min-h-screen">
      {/* ── Hero Slideshow ─────────────────────────────────────────────── */}
      <HeroSlideshow slides={data.slides} accentColor={data.accentColor} />

      {/* ── Brand header ──────────────────────────────────────────────── */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-20 py-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-14"
        >
          <div
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.25em] px-4 py-1.5 rounded-full mb-4 border"
            style={{ color: data.accentColor, borderColor: `${data.accentColor}40`, backgroundColor: `${data.accentColor}10` }}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Bộ sưu tập chính thức
          </div>
          <h1 className="font-display text-5xl md:text-7xl font-black text-text-primary uppercase mb-3">
            {data.displayName}
          </h1>
          <p className="font-display text-lg font-bold mb-4" style={{ color: data.accentColor }}>
            {data.tagline}
          </p>
          <p className="text-text-muted text-base max-w-2xl mx-auto leading-relaxed">
            {data.description}
          </p>
        </motion.div>

        {/* ── Editorial Grid ─────────────────────────────────────────── */}
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
            {data.editorialPhotos.map((photo, i) => (
              <EditorialCard
                key={i}
                photo={photo}
                brandSlug={brand}
                brandName={data.displayName}
                delay={i * 0.12}
              />
            ))}
          </div>
        </section>

        {/* ── Products section ───────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="font-display text-3xl md:text-4xl font-bold text-text-primary uppercase"
            >
              Sản phẩm {data.displayName}
            </motion.h2>
            <Link
              to={`/products?brand=${encodeURIComponent(data.brandParam)}`}
              className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80 transition"
            >
              Xem tất cả <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-surface rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 text-text-muted">
              <ShoppingBag className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="font-display text-xl font-bold mb-2">Chưa có sản phẩm</p>
              <p className="text-sm">Sản phẩm {data.displayName} đang được cập nhật.</p>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 mt-6 bg-primary text-white font-bold px-6 py-3 rounded-xl hover:bg-primary/90 transition"
              >
                Xem tất cả sản phẩm <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
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
          )}

          {products.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="flex justify-center mt-10"
            >
              <Link
                to={`/products?brand=${encodeURIComponent(data.brandParam)}`}
                className="inline-flex items-center gap-2 bg-primary text-white font-bold px-8 py-3.5 rounded-full hover:bg-primary/90 transition shadow-lg"
              >
                Xem tất cả {data.displayName} <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          )}
        </section>
      </div>
    </div>
  );
};

export default CollectionPage;
