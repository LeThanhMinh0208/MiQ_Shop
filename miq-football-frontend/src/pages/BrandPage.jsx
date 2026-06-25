import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Star, ShoppingBag, ArrowLeft, Package } from 'lucide-react';
import { fetchProducts } from '../services/productService.js';
import ProductCard from '../components/product/ProductCard.jsx';
import { useLanguageStore } from '../store/languageStore.js';

// ─── Brand catalog ───────────────────────────────────────────────────────────
const BRAND_INFO = {
  miq: {
    name: 'MiQ Brand',
    apiQuery: 'MiQ',
    exclusive: true,
    taglineVi: 'Thương hiệu độc quyền — Thiết kế tại Việt Nam',
    taglineEn: 'Exclusive brand — Designed in Vietnam',
    descVi: 'Bộ sưu tập MiQ là dòng sản phẩm độc quyền được thiết kế và sản xuất riêng cho MiQ Sport. Mỗi sản phẩm mang bản sắc riêng biệt, chất liệu cao cấp và giá trị Việt Nam.',
    descEn: 'The MiQ collection is an exclusive line designed and produced exclusively for MiQ Sport. Each product carries a unique identity, premium materials and Vietnamese heritage.',
    accent: '#10B981',
    badge: '★ EXCLUSIVE',
    gradient: 'from-emerald-950 via-[#0A1A12] to-black',
    bannerBg: 'radial-gradient(ellipse at 60% 40%, rgba(16,185,129,0.22) 0%, transparent 70%), linear-gradient(135deg, #0A1A12 0%, #000000 100%)',
  },
  nike: {
    name: 'Nike',
    apiQuery: 'Nike',
    exclusive: false,
    taglineVi: 'Just Do It',
    taglineEn: 'Just Do It',
    descVi: 'Bộ sưu tập giày đá bóng, áo đấu và phụ kiện Nike chính hãng. Công nghệ Flyknit, ACC và đế sân cỏ cao cấp.',
    descEn: 'Authentic Nike football boots, jerseys and accessories. Flyknit, ACC technology and premium firm-ground outsoles.',
    accent: '#FF3C3C',
    badge: 'OFFICIAL',
    gradient: 'from-red-950 via-zinc-900 to-black',
    bannerBg: 'radial-gradient(ellipse at 50% 30%, rgba(255,60,60,0.18) 0%, transparent 65%), linear-gradient(135deg, #1a0000 0%, #000000 100%)',
  },
  adidas: {
    name: 'Adidas',
    apiQuery: 'Adidas',
    exclusive: false,
    taglineVi: 'Impossible is Nothing',
    taglineEn: 'Impossible is Nothing',
    descVi: 'Giày đá bóng, áo đấu và trang phục Adidas với công nghệ Primeknit và đế Boost độc quyền.',
    descEn: 'Adidas football boots, jerseys and apparel featuring Primeknit technology and exclusive Boost soles.',
    accent: '#000000',
    badge: 'OFFICIAL',
    gradient: 'from-zinc-900 via-zinc-800 to-black',
    bannerBg: 'radial-gradient(ellipse at 40% 40%, rgba(255,255,255,0.06) 0%, transparent 60%), linear-gradient(135deg, #111111 0%, #000000 100%)',
  },
  puma: {
    name: 'Puma',
    apiQuery: 'Puma',
    exclusive: false,
    taglineVi: 'Forever Faster',
    taglineEn: 'Forever Faster',
    descVi: 'Trang phục và giày đá bóng Puma — nhẹ, bền và được tin dùng bởi các ngôi sao thế giới.',
    descEn: 'Puma football footwear and apparel — light, durable and trusted by world stars.',
    accent: '#FFD700',
    badge: 'OFFICIAL',
    gradient: 'from-yellow-950 via-zinc-900 to-black',
    bannerBg: 'radial-gradient(ellipse at 50% 30%, rgba(255,215,0,0.15) 0%, transparent 65%), linear-gradient(135deg, #1a1400 0%, #000000 100%)',
  },
  'new-balance': {
    name: 'New Balance',
    apiQuery: 'New Balance',
    exclusive: false,
    taglineVi: 'Run Your Way',
    taglineEn: 'Run Your Way',
    descVi: 'Giày đá bóng New Balance với thiết kế tinh tế và hiệu năng vượt trội cho mọi mặt sân.',
    descEn: 'New Balance football boots with refined design and superior performance on every pitch.',
    accent: '#CF142B',
    badge: 'OFFICIAL',
    gradient: 'from-red-950 via-zinc-900 to-black',
    bannerBg: 'radial-gradient(ellipse at 50% 30%, rgba(207,20,43,0.15) 0%, transparent 65%), linear-gradient(135deg, #1a0005 0%, #000000 100%)',
  },
  mizuno: {
    name: 'Mizuno',
    apiQuery: 'Mizuno',
    exclusive: false,
    taglineVi: 'Chuyên Biệt — Chính Xác',
    taglineEn: 'Specialised — Precise',
    descVi: 'Công nghệ Morelia và Rebula của Mizuno mang lại cảm giác kiểm soát bóng hoàn hảo cho tiền đạo.',
    descEn: "Mizuno's Morelia and Rebula technology delivers perfect ball control for forwards.",
    accent: '#002D6E',
    badge: 'OFFICIAL',
    gradient: 'from-blue-950 via-zinc-900 to-black',
    bannerBg: 'radial-gradient(ellipse at 50% 30%, rgba(0,45,110,0.25) 0%, transparent 65%), linear-gradient(135deg, #00061a 0%, #000000 100%)',
  },
  umbro: {
    name: 'Umbro',
    apiQuery: 'Umbro',
    exclusive: false,
    taglineVi: 'Bóng Đá Là Đam Mê',
    taglineEn: 'Football Is A Passion',
    descVi: 'Thương hiệu lâu đời từ Anh Quốc — áo đấu truyền thống và phụ kiện sân cỏ chất lượng cao.',
    descEn: 'The iconic British brand — traditional kits and high-quality pitch accessories.',
    accent: '#E30613',
    badge: 'OFFICIAL',
    gradient: 'from-red-950 via-zinc-900 to-black',
    bannerBg: 'radial-gradient(ellipse at 50% 30%, rgba(227,6,19,0.15) 0%, transparent 65%), linear-gradient(135deg, #1a0000 0%, #000000 100%)',
  },
};

// ─── Component ───────────────────────────────────────────────────────────────
const BrandPage = () => {
  const { slug } = useParams();
  const lang = useLanguageStore((s) => s.lang);

  const brand = BRAND_INFO[slug] ?? null;

  const { data, isLoading } = useQuery({
    queryKey: ['brand-products', brand?.apiQuery],
    queryFn: () => fetchProducts({ brand: brand.apiQuery, limit: 24 }),
    enabled: !!brand,
    staleTime: 5 * 60 * 1000,
  });

  const products = data?.products ?? [];

  if (!brand) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5 text-text-primary">
        <Package className="w-16 h-16 opacity-20" />
        <p className="text-2xl font-bold">{lang === 'vi' ? 'Thương hiệu không tồn tại' : 'Brand not found'}</p>
        <Link to="/products" className="text-primary font-bold hover:underline flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          {lang === 'vi' ? 'Về trang sản phẩm' : 'Back to products'}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-base">
      {/* ── Hero banner ───────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{ background: brand.bannerBg, minHeight: '340px' }}
      >
        {/* Watermark */}
        <span
          className="absolute right-0 top-1/2 -translate-y-1/2 font-display text-[160px] font-black uppercase select-none pointer-events-none leading-none"
          style={{ color: `${brand.accent}08`, letterSpacing: '-0.03em', right: '-20px' }}
        >
          {brand.name}
        </span>

        <div className="relative z-10 max-w-[1600px] mx-auto px-6 py-20">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-sm font-bold text-white/60 hover:text-white transition mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            {lang === 'vi' ? 'Tất cả sản phẩm' : 'All Products'}
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            {brand.exclusive ? (
              <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.25em] mb-4 px-3 py-1.5 rounded-full border"
                style={{ color: brand.accent, borderColor: `${brand.accent}55`, background: `${brand.accent}18` }}>
                <Star className="w-3.5 h-3.5 fill-current" />
                {brand.badge}
              </div>
            ) : (
              <span className="text-xs font-black uppercase tracking-[0.25em] text-white/40 mb-4 block">
                {brand.badge}
              </span>
            )}

            <h1
              className="font-display text-6xl md:text-8xl font-black uppercase leading-none mb-3"
              style={{
                color: brand.exclusive ? brand.accent : '#ffffff',
                textShadow: brand.exclusive
                  ? `0 0 40px ${brand.accent}88, 0 0 80px ${brand.accent}44`
                  : 'none',
              }}
            >
              {brand.name}
            </h1>

            <p className="text-xl font-bold text-white/70 mb-3">
              {lang === 'vi' ? brand.taglineVi : brand.taglineEn}
            </p>
            <p className="text-sm text-white/50 max-w-xl leading-relaxed">
              {lang === 'vi' ? brand.descVi : brand.descEn}
            </p>
          </motion.div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-bg-base to-transparent pointer-events-none" />
      </section>

      {/* ── Products ─────────────────────────────────────────────────── */}
      <section className="max-w-[1600px] mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display text-2xl font-bold text-text-primary">
              {lang === 'vi' ? 'Sản phẩm' : 'Products'} — {brand.name}
            </h2>
            {!isLoading && (
              <p className="text-sm text-text-muted mt-1">
                {products.length} {lang === 'vi' ? 'sản phẩm' : 'items'}
              </p>
            )}
          </div>

          <Link
            to={`/products?brand=${encodeURIComponent(brand.apiQuery)}`}
            className="flex items-center gap-2 text-sm font-bold border-2 border-primary/30 text-primary hover:bg-primary hover:text-white hover:border-primary px-5 py-2.5 rounded-full transition"
          >
            <ShoppingBag className="w-4 h-4" />
            {lang === 'vi' ? 'Xem tất cả' : 'View all'}
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 animate-pulse">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-bg-raised rounded-2xl" style={{ aspectRatio: '3/4' }} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-text-muted">
            <Package className="w-14 h-14 opacity-20" />
            <p className="font-bold text-lg">
              {lang === 'vi' ? 'Chưa có sản phẩm cho thương hiệu này' : 'No products for this brand yet'}
            </p>
            <Link to="/products" className="text-primary font-bold hover:underline text-sm">
              {lang === 'vi' ? 'Xem tất cả sản phẩm →' : 'Browse all products →'}
            </Link>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5"
          >
            {products.map((product, i) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: Math.min(i * 0.04, 0.4) }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>
    </div>
  );
};

export default BrandPage;
