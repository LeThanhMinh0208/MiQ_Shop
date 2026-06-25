import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, Eye, X, Star, BarChart2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { useWishlistStore } from '../../store/wishlistStore.js';
import { useCartStore }     from '../../store/cartStore.js';
import { useAuthStore }     from '../../store/authStore.js';
import { useLanguageStore } from '../../store/languageStore.js';
import { toggleWishlistApi } from '../../services/wishlistService.js';
import { useCompareStore }  from '../../store/compareStore.js';
import useFocusTrap from '../../hooks/useFocusTrap.js';
import { optimizeImg } from '../../utils/cloudinary.js';
import { showCartToast } from '../../utils/cartToast.jsx';

// ── Quick View Modal ───────────────────────────────────────────────────────────
const QuickViewModal = ({ product, onClose }) => {
  const [activeImg, setActiveImg] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const addItem = useCartStore((s) => s.addItem);
  const navigate = useNavigate();
  const t = useLanguageStore((s) => s.t);
  const dialogRef = useRef(null);
  useFocusTrap(dialogRef, true, onClose);

  const finalPrice = product.salePrice || product.price;
  const inStockVariants = product.variants?.filter((v) => v.stock > 0) ?? [];

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (!selectedSize) {
      toast.error(t('pleaseSelectSize'));
      return;
    }
    addItem(product, selectedSize, 1);
    onClose();
    showCartToast(t('addedToCart'));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="quick-view-title"
        initial={{ opacity: 0, scale: 0.93, y: 20 }}
        animate={{ opacity: 1, scale: 1,    y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="relative bg-bg-elevated rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-11 h-11 rounded-full bg-surface hover:bg-bg-overlay flex items-center justify-center transition"
          aria-label={t('cancel')}
        >
          <X className="w-4 h-4 text-text-muted" />
        </button>

        <div className="grid sm:grid-cols-2">
          {/* Image */}
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-6 flex flex-col gap-3">
            <div className="aspect-square relative overflow-hidden rounded-2xl">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImg}
                  src={product.images?.[activeImg]?.url}
                  alt={product.name}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="w-full h-full object-contain"
                />
              </AnimatePresence>
            </div>
            {product.images?.length > 1 && (
              <div className="flex gap-2 justify-center">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`w-10 h-10 rounded-lg overflow-hidden border-2 transition flex-shrink-0 ${
                      activeImg === i ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img.url} alt="" loading="lazy" decoding="async" className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-6 flex flex-col">
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">{product.brand}</p>
            <h3 id="quick-view-title" className="font-display text-xl font-bold uppercase leading-tight mb-2">{product.name}</h3>

            {product.ratings?.count > 0 && (
              <div className="flex items-center gap-1.5 mb-3">
                <div className="flex">
                  {[1,2,3,4,5].map((s) => (
                    <Star key={s} className={`w-3.5 h-3.5 ${
                      s <= Math.round(product.ratings.average)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-surface-border'
                    }`} />
                  ))}
                </div>
                <span className="text-xs text-text-muted">({product.ratings.count})</span>
              </div>
            )}

            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-2xl font-bold text-primary">{formatCurrency(finalPrice)}</span>
              {product.salePrice && (
                <span className="text-sm text-text-muted line-through">{formatCurrency(product.price)}</span>
              )}
            </div>

            <div className="mb-5">
              <p className="text-xs font-bold uppercase tracking-wide text-text-muted mb-2">{t('size')}</p>
              <div className="flex flex-wrap gap-2">
                {product.variants?.map((v) => (
                  <button
                    key={v.size}
                    onClick={() => v.stock > 0 && setSelectedSize(v.size)}
                    disabled={v.stock === 0}
                    className={`min-w-[42px] px-3 py-1.5 rounded-lg text-sm font-semibold border-2 transition ${
                      selectedSize === v.size
                        ? 'border-primary bg-primary text-white'
                        : v.stock === 0
                          ? 'border-surface-border text-text-muted cursor-not-allowed line-through'
                          : 'border-surface-border hover:border-primary text-text-primary'
                    }`}
                  >
                    {v.size}
                  </button>
                ))}
              </div>
              {inStockVariants.length === 0 && (
                <p className="text-xs text-red-500 mt-1 font-medium">{t('outOfStockToast')}</p>
              )}
            </div>

            <div className="mt-auto space-y-2">
              <button
                onClick={handleAddToCart}
                disabled={inStockVariants.length === 0}
                className="w-full bg-primary text-white font-bold uppercase tracking-wider py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-primary-dark transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="w-4 h-4" />
                {t('addToCart')}
              </button>
              <button
                onClick={() => { onClose(); navigate(`/products/${product._id}`); }}
                className="w-full text-sm font-semibold text-primary hover:underline py-1"
              >
                {t('viewDetail')} →
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ── Badge stack ────────────────────────────────────────────────────────────────
const BadgeStack = ({ product, isNew }) => {
  const t = useLanguageStore((s) => s.t);
  const badges = [];
  if (product?.salePrice) {
    const pct = Math.round((1 - product.salePrice / product.price) * 100);
    badges.push(
      <span key="sale" className="flex items-center gap-0.5 bg-gradient-to-r from-red-500 to-rose-600 text-white text-xs font-bold uppercase px-2.5 py-1 rounded-lg shadow-[0_2px_8px_rgba(239,68,68,0.4)]">
        -{pct}%
      </span>
    );
  } else if (product?.isFeatured) {
    badges.push(
      <span key="hot" className="flex items-center gap-0.5 bg-gradient-to-r from-amber-400 to-yellow-500 text-white text-xs font-bold uppercase px-2.5 py-1 rounded-lg shadow-[0_2px_8px_rgba(245,158,11,0.4)]">
        HOT
      </span>
    );
  }
  if (isNew && !product?.salePrice) {
    badges.push(
      <span key="new" className="bg-gradient-to-r from-primary to-primary-600 text-white text-xs font-bold uppercase px-2.5 py-1 rounded-lg shadow-neon-xs">
        {t('newBadge')}
      </span>
    );
  }
  if (!badges.length) return null;
  return (
    <div className="absolute top-2.5 left-2.5 z-20 flex flex-col gap-1">
      {badges}
    </div>
  );
};

// ── Main ProductCard ───────────────────────────────────────────────────────────
const ProductCard = ({ product, isNew = false }) => {
  const img1 = optimizeImg(product?.images?.[0]?.url ?? '');
  const img2 = optimizeImg(product?.images?.[1]?.url ?? '');
  const finalPrice = product?.salePrice || product?.price || 0;

  const { toggle, isWishlisted } = useWishlistStore();
  const addItem               = useCartStore((s) => s.addItem);
  const { isAuthenticated }   = useAuthStore();
  const t                     = useLanguageStore((s) => s.t);
  const { toggle: toggleCompare, isInCompare, products: compareProducts } = useCompareStore();

  const shouldReduce = useReducedMotion();
  const [heartAnim, setHeartAnim]     = useState(false);
  const [imageHover, setImageHover]   = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);

  const wishlisted = isWishlisted(product?._id);
  const inCompare = isInCompare(product?._id);
  const compareFull = compareProducts.length >= 2 && !inCompare;

  const handleCompare = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (compareFull) { toast.error(t('compareHint')); return; }
    toggleCompare(product);
  }, [product, toggleCompare, compareFull, t]);

  const handleWishlist = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const added = toggle(product);
    setHeartAnim(true);
    setTimeout(() => setHeartAnim(false), 400);
    toast.success(added ? `❤️ ${t('addedToWishlist')}` : t('removedFromWishlist'), { duration: 1500 });
    if (isAuthenticated) {
      try { await toggleWishlistApi(product._id); }
      catch { toggle(product); }
    }
  }, [product, toggle, isAuthenticated, t]);

  const handleQuickCart = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    const firstInStock = product?.variants?.find((v) => v.stock > 0);
    if (!firstInStock) { toast.error(t('outOfStockToast')); return; }
    if (product.variants.length > 1) {
      setShowQuickView(true);
      return;
    }
    addItem(product, firstInStock.size, 1);
    showCartToast(t('addedToCart'));
  }, [product, addItem, t]);

  const handleQuickView = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowQuickView(true);
  }, []);

  return (
    <>
      <motion.div
        data-testid="product-card"
        whileHover={shouldReduce ? undefined : { y: -10 }}
        transition={{ type: 'spring', stiffness: 320, damping: 22 }}
        className="group relative"
        onMouseEnter={() => setImageHover(true)}
        onMouseLeave={() => setImageHover(false)}
      >
        <Link to={`/products/${product?._id || '#'}`} className="block">

          <div className="pedestal aspect-[4/5] p-4 mb-3 relative overflow-hidden">
            <BadgeStack product={product} isNew={isNew} />
            <div className="pedestal-glow" />

            <div className="relative z-10 w-full h-full">
              <motion.img
                src={img1}
                alt={product?.name ?? 'Product'}
                loading="lazy"
                decoding="async"
                className={`absolute inset-0 w-full h-full object-contain transition-all duration-500 ${
                  imageHover && img2 ? 'opacity-0' : 'opacity-100'
                }`}
                whileHover={shouldReduce ? undefined : { scale: img2 ? 1 : 1.1, rotate: img2 ? 0 : -3 }}
                transition={{ type: 'spring', stiffness: 200 }}
              />
              {img2 && (
                <img
                  src={img2}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  decoding="async"
                  className={`absolute inset-0 w-full h-full object-contain transition-all duration-500 ${
                    imageHover ? 'opacity-100 scale-105' : 'opacity-0 scale-100'
                  }`}
                />
              )}
            </div>

            {/* Quick actions — always visible on mobile, hover-slide on desktop */}
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-2 sm:translate-x-14 sm:group-hover:translate-x-0 transition-transform duration-300 ease-out-expo">
              <motion.button
                onClick={handleWishlist}
                animate={heartAnim ? { scale: [1, 1.4, 1] } : { scale: 1 }}
                transition={{ duration: 0.35 }}
                className={`w-11 h-11 rounded-full flex items-center justify-center shadow-depth-md transition-colors ${
                  wishlisted ? 'bg-red-500 text-white' : 'bg-bg-elevated text-text-muted hover:text-red-500'
                }`}
                aria-label={t('wishlist')}
              >
                <Heart className={`w-4 h-4 ${wishlisted ? 'fill-white' : ''}`} />
              </motion.button>
              <button
                onClick={handleQuickView}
                className="w-11 h-11 rounded-full bg-bg-elevated flex items-center justify-center shadow-depth-md text-text-muted hover:text-primary transition-colors"
                aria-label={t('viewDetail')}
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={handleCompare}
                className={`w-11 h-11 rounded-full flex items-center justify-center shadow-depth-md transition-colors ${
                  inCompare ? 'bg-primary text-white' : 'bg-bg-elevated text-text-muted hover:text-primary'
                }`}
                aria-label={t('compare')}
              >
                <BarChart2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleQuickCart}
                className="w-11 h-11 rounded-full bg-bg-elevated text-text-muted hover:text-primary flex items-center justify-center shadow-depth-md transition-colors"
                aria-label={t('addToCart')}
              >
                <ShoppingCart className="w-4 h-4" />
              </button>
            </div>

            {/* Price pill */}
            <div className="absolute bottom-2.5 right-2.5 bg-bg-elevated text-text-primary font-bold text-xs px-3 py-1.5 rounded-full shadow-depth-sm border border-surface-border">
              {formatCurrency(finalPrice)}
            </div>
          </div>

          <div className="px-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-0.5">
              {product?.brand}
            </p>
            <h3 className="font-display text-sm font-bold uppercase line-clamp-2 mb-2 group-hover:text-primary transition-colors duration-200">
              {product?.name}
            </h3>

            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-bold text-primary">
                {formatCurrency(finalPrice)}
              </span>
              {product?.salePrice && (
                <span className="text-xs text-text-muted line-through">
                  {formatCurrency(product.price)}
                </span>
              )}
            </div>

            <div className="sm:h-8 sm:overflow-hidden">
              <div className="sm:translate-y-8 sm:group-hover:translate-y-0 transition-transform duration-300 ease-out-expo">
                <button
                  onClick={handleQuickCart}
                  className="w-full bg-primary text-white text-xs font-bold uppercase tracking-wider py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-primary-dark transition-colors"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  {t('addToCart')}
                </button>
              </div>
            </div>
          </div>
        </Link>
      </motion.div>

      <AnimatePresence>
        {showQuickView && product && (
          <QuickViewModal product={product} onClose={() => setShowQuickView(false)} />
        )}
      </AnimatePresence>
    </>
  );
};

export default ProductCard;
