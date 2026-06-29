import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Eye, X, Minus, Plus, Star, Zap, ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchNewArrivals } from '../../services/productService.js';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { useCartStore } from '../../store/cartStore.js';
import toast from 'react-hot-toast';
import { useLanguageStore } from '../../store/languageStore.js';

// ── Try-On Modal ───────────────────────────────────────────────────────────────
const TryOnModal = ({ product, onClose }) => {
  const [selectedSize, setSelectedSize] = useState(null);
  const [qty, setQty]                   = useState(1);
  const addItem  = useCartStore((s) => s.addItem);
  const navigate = useNavigate();

  const inStock = product.variants?.filter((v) => v.stock > 0) ?? [];
  const maxQty  = product.variants?.find((v) => v.size === selectedSize)?.stock ?? 10;

  const t = useLanguageStore((s) => s.t);

  const handleAdd = () => {
    if (!selectedSize) { toast.error(t('pleaseSelectSize')); return; }
    addItem(product, selectedSize, qty);
    toast.success(t('addedToCart'));
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[999] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1,   y: 0  }}
        exit={{ opacity: 0, scale: 0.9, y: 12 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="relative bg-bg-elevated border border-surface-border rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden"
      >
        <button onClick={onClose} aria-label={t('cancel')}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-bg-raised hover:bg-bg-overlay flex items-center justify-center transition">
          <X className="w-4 h-4 text-text-muted" />
        </button>

        <div className="grid md:grid-cols-2">
          <div className="bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center p-8 min-h-[260px] relative overflow-hidden">
            <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 50% 60%, rgba(255,255,255,0.05) 0%, transparent 70%)' }} />
            <motion.img
              src={product.images?.[0]?.url}
              alt={product.name}
              animate={{ rotate: [0, -5, 5, -5, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="relative z-10 w-44 h-44 object-contain drop-shadow-2xl"
            />
          </div>
          <div className="p-6 flex flex-col">
            <p className="text-[11px] font-bold uppercase tracking-widest text-primary mb-1">{product.brand}</p>
            <h2 className="font-display text-xl font-bold mb-2 leading-tight text-text-primary">{product.name}</h2>
            <div className="flex items-center gap-1.5 mb-3">
              <div className="flex">
                {[1,2,3,4,5].map((s) => (
                  <Star key={s} className={`w-3.5 h-3.5 ${s <= Math.round(product.ratings?.average ?? 0) ? 'fill-amber-400 text-amber-400' : 'text-text-muted'}`} />
                ))}
              </div>
              <span className="text-xs text-text-muted">({product.ratings?.count ?? 0})</span>
            </div>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-2xl font-bold text-primary">{formatCurrency(product.salePrice || product.price)}</span>
              {product.salePrice && <span className="text-sm text-text-muted line-through">{formatCurrency(product.price)}</span>}
            </div>
            <p className="text-xs font-bold uppercase tracking-wide mb-2 text-text-secondary">{t('size')}</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {product.variants?.map((v) => (
                <button key={v.size} disabled={v.stock === 0}
                  onClick={() => { if (v.stock > 0) { setSelectedSize(v.size); setQty(1); } }}
                  className={`px-3 py-1.5 rounded-lg border-2 text-sm font-semibold transition ${
                    selectedSize === v.size ? 'border-primary bg-primary text-white'
                      : v.stock === 0 ? 'border-surface-border text-text-muted cursor-not-allowed line-through'
                      : 'border-surface-border hover:border-primary text-text-primary'
                  }`}>
                  {v.size}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3 mb-5">
              <span className="text-xs font-bold uppercase tracking-wide text-text-secondary">{t('quantity')}</span>
              <div className="flex items-center border border-surface-border rounded-lg overflow-hidden">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-8 h-8 flex items-center justify-center hover:bg-bg-overlay transition text-text-muted"><Minus className="w-3 h-3" /></button>
                <span className="w-8 text-center text-sm font-bold border-x border-surface-border text-text-primary">{qty}</span>
                <button onClick={() => setQty((q) => Math.min(maxQty, q + 1))} disabled={!selectedSize || qty >= maxQty} className="w-8 h-8 flex items-center justify-center hover:bg-bg-overlay transition text-text-muted disabled:opacity-30"><Plus className="w-3 h-3" /></button>
              </div>
            </div>
            <div className="flex flex-col gap-2 mt-auto">
              <button onClick={handleAdd} disabled={inStock.length === 0}
                className="flex items-center justify-center gap-2 bg-primary text-white font-bold rounded-xl py-3 hover:bg-primary/90 transition disabled:opacity-40">
                <ShoppingCart className="w-4 h-4" /> {t('addToCart')}
              </button>
              <Link to={`/products/${product._id}`} onClick={onClose}
                className="flex items-center justify-center gap-2 border-2 border-surface-border hover:border-primary text-text-primary hover:text-primary font-bold rounded-xl py-3 transition">
                <Eye className="w-4 h-4" /> {t('viewDetail')}
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ── Featured card — static shoe on desktop ─────────────────────────────────────
const FeaturedCard = ({ product, onOpenModal }) => {
  const [hovered, setHovered] = useState(false);
  const t = useLanguageStore((s) => s.t);

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 280, damping: 24 }}
      className="relative rounded-2xl overflow-hidden cursor-pointer border border-surface-border shadow-depth-md h-full"
      onClick={onOpenModal}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-bg-elevated via-bg-raised to-bg-elevated" />

      {/* Shoe display zone — top 68% */}
      <div
        id="new-arrivals-dock-slot"
        className="absolute top-0 left-0 right-0"
        style={{ height: '68%' }}
      >
        {/* Radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(circle at 50% 55%, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 55%, transparent 78%)' }}
        />

        {/* Shoe: drops in from hero above, levitates, flies back up when scrolled away */}
        <motion.div
          initial={{ y: -90, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: false, amount: 0.25 }}
          transition={{ type: 'spring', stiffness: 120, damping: 18, delay: 0.15 }}
          className="absolute inset-0 flex items-center justify-center p-6"
        >
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ animation: 'levitate 3.8s ease-in-out infinite' }}
          >
            <motion.img
              src={product.images?.[0]?.url}
              alt={product.name}
              loading="lazy"
              animate={{ rotate: hovered ? 4 : -6, scale: hovered ? 1.08 : 1 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="w-full h-full object-contain"
              style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.50))' }}
            />
          </div>
        </motion.div>
      </div>

      {/* Info bar — bottom 32% */}
      <div className="absolute bottom-0 left-0 right-0 z-10 px-4 py-3 lg:px-5 lg:py-4 bg-gradient-to-t from-bg-elevated via-bg-elevated/90 to-transparent">
        <div className="flex items-center gap-2 mb-1.5">
          <motion.span
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="bg-primary text-white text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
          >
            {t('newArrivalBadge')}
          </motion.span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary/70">{product.brand}</span>
        </div>
        <h3 className="font-display text-sm lg:text-base font-bold uppercase line-clamp-1 mb-2 text-text-primary">
          {product.name}
        </h3>
        <div className="flex items-center justify-between">
          <span className="text-base lg:text-lg font-bold text-primary">
            {formatCurrency(product.salePrice || product.price)}
          </span>
          <span className="text-xs font-semibold text-primary bg-primary/15 border border-primary/30 px-3 py-1 rounded-full">
            {t('exploreNow')} →
          </span>
        </div>
      </div>
    </motion.div>
  );
};

// ── Satellite card ─────────────────────────────────────────────────────────────
const SatelliteCard = ({ product, delay = 0 }) => {
  const addItem = useCartStore((s) => s.addItem);
  const t = useLanguageStore((s) => s.t);

  const handleQuickCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const v = product.variants?.find((v) => v.stock > 0);
    if (!v) { toast.error(t('outOfStockToast')); return; }
    addItem(product, v.size, 1);
    toast.success(t('addedToCart'));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.38, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -3 }}
      className="group bg-bg-elevated rounded-xl border border-surface-border overflow-hidden hover:border-primary/30 hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all duration-300 flex flex-col"
    >
      <Link to={`/products/${product._id}`} className="flex flex-col flex-1">
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 relative overflow-hidden flex-1 min-h-0">
          <motion.span
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
            className="absolute top-2 left-2 z-10 bg-primary text-white text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full"
          >
            {t('newBadge')}
          </motion.span>
          <img
            src={product.images?.[0]?.url}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-contain p-3 group-hover:scale-110 transition-transform duration-500"
            style={{ maxHeight: '100%' }}
          />
        </div>
        <div className="p-2.5 flex-shrink-0">
          <p className="text-[9px] font-bold uppercase tracking-widest text-text-muted mb-0.5">{product.brand}</p>
          <h4 className="font-display font-bold text-xs uppercase line-clamp-2 text-text-primary group-hover:text-primary transition-colors leading-tight mb-1.5">
            {product.name}
          </h4>
          <div className="flex items-center justify-between gap-1">
            <span className="font-bold text-primary text-xs">{formatCurrency(product.salePrice || product.price)}</span>
            <button
              onClick={handleQuickCart}
              className="w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-lg bg-surface hover:bg-primary hover:text-white transition"
              aria-label={t('addToCart')}
            >
              <ShoppingCart className="w-3 h-3" />
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

// ── Skeleton ───────────────────────────────────────────────────────────────────
const Skeleton = () => (
  <div className="flex flex-col h-full animate-pulse gap-4">
    <div className="flex items-center justify-between h-10">
      <div className="h-7 bg-surface-light rounded-full w-52" />
      <div className="h-9 bg-surface-light rounded-full w-28" />
    </div>
    <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
      <div className="col-span-12 lg:col-span-5 bg-surface-light rounded-2xl" />
      <div className="col-span-12 lg:col-span-7 grid grid-cols-2 gap-3">
        {[...Array(4)].map((_, i) => <div key={i} className="bg-surface-light rounded-xl" />)}
      </div>
    </div>
  </div>
);

// ── Main section ───────────────────────────────────────────────────────────────
const NewArrivals = () => {
  const t = useLanguageStore((s) => s.t);
  const [modalProduct, setModalProduct] = useState(null);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['new-arrivals'],
    queryFn:  () => fetchNewArrivals(5),
    staleTime: 5 * 60 * 1000,
  });

  const featured = products[0];
  const satCards  = products.slice(1, 5);

  return (
    // h-full so the section fills its snap slide exactly
    <section className="min-h-screen lg:min-h-0 lg:h-full flex flex-col bg-bg-base overflow-hidden">
      <div className="flex-1 flex flex-col min-h-0 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-12 xl:px-20 py-5 lg:py-6">

        {/* ── Compact header row ── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center justify-between mb-4 flex-shrink-0"
        >
          <div className="flex items-center gap-3">
            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-[0.18em] px-3 py-1 rounded-full">
              <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.4, repeat: Infinity }}>
                <Zap className="w-3 h-3 fill-primary" />
              </motion.span>
              New Arrivals
            </div>
            {/* Title */}
            <h2 className="font-display text-xl lg:text-2xl xl:text-3xl font-bold text-text-primary leading-none">
              {t('newArrivalsTitle')}
            </h2>
          </div>

          {/* Xem thêm button — always visible */}
          <Link
            to="/products?sort=newest"
            className="inline-flex items-center gap-2 bg-primary text-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full hover:bg-primary/90 transition shadow-md"
          >
            {t('viewMore')} <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </motion.div>

        {/* ── Product grid — fills remaining height ── */}
        {isLoading ? (
          <Skeleton />
        ) : products.length === 0 ? null : (
          <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">

            {/* Featured card with static shoe */}
            {featured && (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="col-span-12 lg:col-span-5 min-h-0"
              >
                <FeaturedCard product={featured} onOpenModal={() => setModalProduct(featured)} />
              </motion.div>
            )}

            {/* 2×2 satellite grid */}
            <div className="col-span-12 lg:col-span-7 grid grid-cols-2 grid-rows-2 gap-3 min-h-0">
              {satCards.map((product, i) => (
                <SatelliteCard key={product._id} product={product} delay={i * 0.08 + 0.1} />
              ))}
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {modalProduct && (
          <TryOnModal product={modalProduct} onClose={() => setModalProduct(null)} />
        )}
      </AnimatePresence>
    </section>
  );
};

export default NewArrivals;
