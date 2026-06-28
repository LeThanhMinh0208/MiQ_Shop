import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Grid3X3, List, ChevronRight, Package } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchCategories, fetchCategoryFeatured } from '../../services/categoryService.js';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { useLanguageStore } from '../../store/languageStore.js';
import { optimizeImg } from '../../utils/cloudinary.js';

// Bento slot config: boots = large left (col-span-7, row-span-3), 3 others stacked right (col-span-5, row-span-1 each)
const BENTO_CONFIG = [
  { cols: 7, rows: 3, height: 'min-h-[480px]' },
  { cols: 5, rows: 1, height: 'min-h-[150px]' },
  { cols: 5, rows: 1, height: 'min-h-[150px]' },
  { cols: 5, rows: 1, height: 'min-h-[150px]' },
];

const GRADIENTS = [
  'from-emerald-600 to-green-800',
  'from-blue-600 to-indigo-800',
  'from-purple-600 to-violet-800',
  'from-orange-500 to-red-600',
  'from-teal-500 to-cyan-700',
  'from-rose-500 to-pink-700',
  'from-violet-600 to-purple-800',
  'from-amber-500 to-yellow-600',
];

const ACCENT_COLORS = [
  '#10B981', '#3B82F6', '#8B5CF6', '#F97316', '#14B8A6', '#F43F5E', '#7C3AED', '#F59E0B',
];

const COL_SPAN = {
  4: 'col-span-4',
  5: 'col-span-5',
  6: 'col-span-6',
  7: 'col-span-7',
  12: 'col-span-12',
};

// ── Bento Card ─────────────────────────────────────────────────────────────
const BentoCard = ({ category, config, index }) => {
  const [hovered, setHovered] = useState(false);
  const isLarge = config.rows >= 2;
  const t = useLanguageStore((s) => s.t);

  return (
    <motion.div
      className={`relative overflow-hidden rounded-2xl lg:rounded-3xl cursor-pointer h-full bg-gradient-to-br ${GRADIENTS[index % GRADIENTS.length]}`}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{ scale: 1.015 }}
      transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link to={`/products?category=${category.slug}`} className="absolute inset-0">
        {/* Background */}
        {category.image?.url ? (
          <>
            <motion.img
              src={optimizeImg(category.image.url)}
              alt={category.name}
              loading="lazy"
              decoding="async"
              animate={{ scale: hovered ? 1.1 : 1 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className={`absolute inset-0 bg-gradient-to-br ${GRADIENTS[index % GRADIENTS.length]} opacity-60 mix-blend-multiply`} />
          </>
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${GRADIENTS[index % GRADIENTS.length]}`} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        {/* Badges */}
        <div className="absolute top-4 left-4 right-4 flex items-start justify-between z-10">
          <span className="bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border border-white/20">
            {category.productCount ?? 0} {t('products')}
          </span>
          {isLarge && (
            <span className="bg-white/15 backdrop-blur-sm text-white/80 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border border-white/10">
              {t('featuredBadge')}
            </span>
          )}
        </div>

        {/* Text */}
        <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
          <motion.h3
            animate={{ y: hovered ? -4 : 0 }}
            transition={{ duration: 0.25 }}
            className={`font-display font-bold text-white uppercase tracking-tight leading-tight ${
              isLarge ? 'text-3xl lg:text-4xl' : 'text-lg lg:text-xl'
            }`}
          >
            {category.name}
          </motion.h3>
          <AnimatePresence>
            {hovered && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-1.5 mt-2 text-white/90 text-sm font-semibold"
              >
                {t('exploreNow')}
                <ChevronRight className="w-4 h-4" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Link>
    </motion.div>
  );
};

// ── List Row ────────────────────────────────────────────────────────────────
const ListRow = ({ category, index }) => {
  const t = useLanguageStore((s) => s.t);
  return (
  <motion.div
    initial={{ opacity: 0, x: -16 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.04, duration: 0.3 }}
    whileHover={{ x: 4 }}
    className="flex items-center gap-5 p-4 rounded-2xl border border-surface-border bg-bg-elevated hover:border-primary/30 hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all"
  >
    <div
      className="w-1.5 h-12 rounded-full flex-shrink-0"
      style={{ backgroundColor: ACCENT_COLORS[index % ACCENT_COLORS.length] }}
    />
    {category.image?.url ? (
      <img
        src={category.image.url}
        alt={category.name}
        loading="lazy"
        className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
      />
    ) : (
      <div
        className="w-16 h-16 rounded-xl flex-shrink-0 flex items-center justify-center"
        style={{ backgroundColor: `${ACCENT_COLORS[index % ACCENT_COLORS.length]}22` }}
      >
        <Package className="w-7 h-7" style={{ color: ACCENT_COLORS[index % ACCENT_COLORS.length] }} />
      </div>
    )}
    <div className="flex-1 min-w-0">
      <h3 className="font-display font-bold uppercase text-lg truncate">{category.name}</h3>
      <p className="text-sm text-text-muted">{category.productCount ?? 0} {t('products')}</p>
    </div>
    <Link
      to={`/products?category=${category.slug}`}
      className="flex items-center gap-2 text-sm font-bold text-primary border-2 border-primary/20 hover:bg-primary hover:text-white hover:border-primary px-4 py-2 rounded-full transition flex-shrink-0"
    >
      {t('shopNow')}
      <ChevronRight className="w-4 h-4" />
    </Link>
  </motion.div>
  );
};

// ── Mini Product Card ──────────────────────────────────────────────────────
const MiniProductCard = ({ product }) => (
  <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}>
    <Link to={`/products/${product._id}`} className="block group">
      <div
        className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl overflow-hidden mb-2.5 relative"
        style={{ aspectRatio: '3/4' }}
      >
        <img
          src={optimizeImg(product.images?.[0]?.url)}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-500"
        />
        {product.salePrice && (
          <span className="absolute top-2 right-2 bg-rose-500 text-white text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full">
            Sale
          </span>
        )}
      </div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-0.5 truncate">
        {product.brand}
      </p>
      <h4 className="font-display text-xs font-bold uppercase line-clamp-2 group-hover:text-primary transition-colors leading-tight mb-1">
        {product.name}
      </h4>
      <div className="flex items-baseline gap-1.5 flex-wrap">
        <span className="font-bold text-primary text-sm">
          {formatCurrency(product.salePrice || product.price)}
        </span>
        {product.salePrice && (
          <span className="text-[11px] text-text-muted line-through">
            {formatCurrency(product.price)}
          </span>
        )}
      </div>
    </Link>
  </motion.div>
);

// ── Featured Tabs ──────────────────────────────────────────────────────────
const FeaturedTabs = ({ categories }) => {
  const [activeSlug, setActiveSlug] = useState(categories[0]?.slug ?? '');
  const t = useLanguageStore((s) => s.t);

  useEffect(() => {
    if (categories.length > 0 && !activeSlug) setActiveSlug(categories[0].slug);
  }, [categories, activeSlug]);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['cat-featured', activeSlug],
    queryFn: () => fetchCategoryFeatured(activeSlug, 6),
    enabled: !!activeSlug,
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-2 flex-wrap mb-8">
        {categories.map((cat) => (
          <button
            key={cat.slug}
            onClick={() => setActiveSlug(cat.slug)}
            className={`px-5 py-2 rounded-full text-sm font-bold uppercase tracking-wide whitespace-nowrap transition-all duration-200 ${
              activeSlug === cat.slug
                ? 'bg-primary text-white shadow-md'
                : 'bg-surface text-text-muted hover:bg-surface-light hover:text-text-primary'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Products */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-surface-light rounded-2xl" style={{ aspectRatio: '3/4' }} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-text-muted">
          <Package className="w-12 h-12 mb-3 opacity-30" />
          <p className="font-semibold">{t('noProductsInCategory')}</p>
        </div>
      ) : (
        <motion.div
          key={activeSlug}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
        >
          {products.map((product) => (
            <MiniProductCard key={product._id} product={product} />
          ))}
        </motion.div>
      )}

      {activeSlug && products.length > 0 && (
        <div className="flex justify-center mt-8">
          <Link
            to={`/products?category=${activeSlug}`}
            className="flex items-center gap-2 text-sm font-bold border-2 border-primary/20 text-primary hover:bg-primary hover:text-white hover:border-primary px-6 py-3 rounded-full transition"
          >
            {t('viewAllProducts')}
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
};

// ── Bento skeleton ─────────────────────────────────────────────────────────
const BentoSkeleton = () => (
  <div className="grid grid-cols-12 gap-4 animate-pulse" style={{ gridTemplateRows: 'repeat(3, auto)' }}>
    <div className="col-span-7 row-span-3 min-h-[480px] bg-surface-light rounded-3xl" />
    <div className="col-span-5 min-h-[150px] bg-surface-light rounded-2xl" />
    <div className="col-span-5 min-h-[150px] bg-surface-light rounded-2xl" />
    <div className="col-span-5 min-h-[150px] bg-surface-light rounded-2xl" />
  </div>
);

// ── Main ───────────────────────────────────────────────────────────────────
const CategoriesShowcase = () => {
  const [viewMode, setViewMode] = useState('grid');
  const t = useLanguageStore((s) => s.t);

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => fetchCategories(false),
    staleTime: 10 * 60 * 1000,
  });

  const visible = categories.slice(0, 4);

  return (
    <section className="py-5 lg:py-6 bg-bg-elevated">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-20">

        {/* Header: badge → title → gradient → subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-end justify-between mb-6"
        >
          <div>
            {/* Badge chip */}
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-[0.22em] px-3.5 py-1.5 rounded-full mb-4">
              ✦ {t('categoryBadge')}
            </div>

            {/* Big title */}
            <h2 className="font-display text-4xl md:text-5xl xl:text-6xl font-bold text-text-primary leading-none mb-2">
              {t('exploreCategoryTitle')}
            </h2>

            {/* Gradient accent */}
            <p className="font-display text-lg font-bold text-luxury-gradient mb-2">
              {t('exploreCategoryTagline')}
            </p>

            {/* Subtitle */}
            <p className="text-text-muted text-sm">{t('exploreCategoryDesc')}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              aria-label="Xem lưới"
              className={`p-2.5 rounded-xl transition ${
                viewMode === 'grid'
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-surface text-text-muted hover:bg-surface-light'
              }`}
            >
              <Grid3X3 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              aria-label="Xem danh sách"
              className={`p-2.5 rounded-xl transition ${
                viewMode === 'list'
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-surface text-text-muted hover:bg-surface-light'
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        {/* Category view */}
        {isLoading ? (
          <BentoSkeleton />
        ) : viewMode === 'grid' ? (
          <AnimatePresence mode="wait">
            <motion.div
              key="grid-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-12 gap-4"
            >
              {visible.map((cat, i) => {
                const config = BENTO_CONFIG[i] ?? { cols: 4, rows: 1, height: 'min-h-[160px]' };
                return (
                  <motion.div
                    key={cat._id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                    className={`${COL_SPAN[config.cols] ?? 'col-span-4'} ${config.rows >= 3 ? 'row-span-3' : config.rows >= 2 ? 'row-span-2' : ''} ${config.height}`}
                  >
                    <BentoCard category={cat} config={config} index={i} />
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key="list-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-3"
            >
              {visible.map((cat, i) => (
                <ListRow key={cat._id} category={cat} index={i} />
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Divider */}
        <div className="my-8 border-t border-surface-border" />

        {/* Featured products per category */}
        {!isLoading && visible.length > 0 && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-8"
            >
              <p className="text-primary font-bold text-sm uppercase tracking-widest mb-2">{t('byCategory')}</p>
              <h2 className="font-display text-4xl md:text-5xl xl:text-6xl font-bold text-text-primary">{t('bestSellers')}</h2>
            </motion.div>
            <FeaturedTabs categories={visible} />
          </>
        )}
      </div>
    </section>
  );
};

export default CategoriesShowcase;
