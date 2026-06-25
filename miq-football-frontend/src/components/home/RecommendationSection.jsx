import { useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { Zap, ShoppingCart, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchProducts } from '../../services/productService.js';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { ProductGridSkeleton } from '../ui/Skeleton.jsx';
import { useCartStore } from '../../store/cartStore.js';
import toast from 'react-hot-toast';
import { useLanguageStore } from '../../store/languageStore.js';

// ── Hover type 4: 3D perspective tilt card ────────────────────────────────────
const RecoCard = ({ product, i, addItem }) => {
  const cardRef  = useRef(null);
  const rotateX  = useMotionValue(0);
  const rotateY  = useMotionValue(0);
  const sRotateX = useSpring(rotateX, { stiffness: 180, damping: 18 });
  const sRotateY = useSpring(rotateY, { stiffness: 180, damping: 18 });

  const handleMouseMove = (e) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) / rect.width  - 0.5;
    const y = (e.clientY - rect.top)  / rect.height - 0.5;
    rotateY.set(x * 16);
    rotateX.set(-y * 16);
  };
  const handleMouseLeave = () => { rotateX.set(0); rotateY.set(0); };

  const t = useLanguageStore((s) => s.t);

  const handleQuickCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const firstVariant = product.variants?.find((v) => v.stock > 0);
    if (!firstVariant) { toast.error(t('outOfStockMsg')); return; }
    addItem(product, firstVariant.size, 1);
    toast.success(t('addToCart'));
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: i * 0.08 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX: sRotateX, rotateY: sRotateY, transformPerspective: 800 }}
      className="group cursor-pointer"
    >
      <Link to={`/products/${product._id}`}>
        <div className="pedestal aspect-square p-4 mb-3 relative overflow-hidden">
          {product.isFeatured && !product.salePrice && (
            <span className="absolute top-3 left-3 z-10 bg-amber-400 text-white text-[10px] font-bold uppercase px-2.5 py-1 rounded-full">
              HOT
            </span>
          )}
          {product.salePrice && (
            <span className="absolute top-3 left-3 z-10 bg-red-500 text-white text-[10px] font-bold uppercase px-2.5 py-1 rounded-full">
              SALE
            </span>
          )}
          <img
            src={product.images?.[0]?.url}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 relative z-10"
          />
          <div className="pedestal-glow" />
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-3/4 h-2 bg-primary/30 rounded-full blur-sm" />
        </div>

        <h3 className="font-display text-sm font-bold uppercase mb-1 line-clamp-2 group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        <p className="text-xs text-text-muted mb-2">{product.brand}</p>

        <div className="flex items-center justify-between gap-2">
          <div>
            <span className="text-sm font-bold text-primary">
              {formatCurrency(product.salePrice || product.price)}
            </span>
            {product.salePrice && (
              <span className="block text-xs text-text-muted line-through">
                {formatCurrency(product.price)}
              </span>
            )}
          </div>
          {/* Hover type 3: glow ring on cart button */}
          <button
            onClick={handleQuickCart}
            className="hover-glow p-2 rounded-lg bg-surface border border-surface-border hover:bg-primary hover:text-white transition min-w-[36px] min-h-[36px] flex items-center justify-center"
            aria-label={t('addToCart')}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
          </button>
        </div>
      </Link>
    </motion.div>
  );
};

// ── Main section ──────────────────────────────────────────────────────────────
const RecommendationSection = ({ title, category = '' }) => {
  const addItem = useCartStore((s) => s.addItem);
  const t = useLanguageStore((s) => s.t);
  const sectionTitle = title ?? t('topRated').toUpperCase();

  const { data, isLoading } = useQuery({
    queryKey: ['recommendations', category],
    queryFn: () => fetchProducts({
      limit: 5,
      sort: 'rating',
      ...(category && { category }),
    }),
    staleTime: 10 * 60 * 1000,
  });

  const products = data?.products ?? [];

  if (isLoading) {
    return (
      <section className="py-10 lg:py-12 bg-bg-base">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-20">
          <div className="h-10 bg-surface-light rounded-full w-72 animate-pulse mb-10" />
          <ProductGridSkeleton count={5} />
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="py-10 lg:py-12 bg-bg-base">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-20">

        {/* ── Section header: badge → title → gradient → subtitle ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10"
        >
          {/* Badge chip */}
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-[0.22em] px-3.5 py-1.5 rounded-full mb-4">
            <Sparkles className="w-3 h-3 fill-primary/60" />
            {t('viewAll')}
          </div>

          {/* Big display title */}
          <h2 className="font-display text-4xl md:text-5xl xl:text-6xl font-bold text-text-primary leading-none mb-2">
            {sectionTitle}
          </h2>

          {/* Gradient accent line */}
          <p className="font-display text-lg font-bold text-luxury-gradient mb-2">
            {t('heroTagline1')}
          </p>

          {/* Subtitle */}
          <p className="text-text-muted text-sm">
            {t('heroTagline2')}
          </p>
        </motion.div>

        {/* ── Product grid — 3D tilt cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {products.map((product, i) => (
            <RecoCard key={product._id} product={product} i={i} addItem={addItem} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecommendationSection;
