import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, animate, useReducedMotion } from 'framer-motion';
import {
  Star, ShoppingCart, Heart, Zap,
  Truck, RotateCcw, ShieldCheck,
  Ruler, X,
  Gift, CreditCard, MapPin, ZoomIn, ChevronLeft, ChevronRight,
} from 'lucide-react';
import QuantityStepper from '../components/ui/QuantityStepper.jsx';
import { optimizeImg } from '../utils/cloudinary.js';
import toast from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';
import { fetchProductById, fetchBoughtTogether } from '../services/productService.js';
import { formatCurrency } from '../utils/formatCurrency.js';
import { useCartStore } from '../store/cartStore.js';
import { useWishlistStore } from '../store/wishlistStore.js';
import { useAuthStore } from '../store/authStore.js';
import { toggleWishlistApi } from '../services/wishlistService.js';
import { useLanguageStore } from '../store/languageStore.js';
import ProductCustomizer from '../components/product/ProductCustomizer.jsx';
import ReviewSection from '../components/product/ReviewSection.jsx';
import { ProductDetailSkeleton } from '../components/ui/Skeleton.jsx';
import Shoe3DRotator from '../components/global/Shoe3DRotator.jsx';
import useFocusTrap from '../hooks/useFocusTrap.js';

// ── Constants ──────────────────────────────────────────────────────────────────
const SIZE_CHART = [
  { eu: '38', uk: '5',   us: '6',   cm: '23.5' },
  { eu: '39', uk: '5.5', us: '6.5', cm: '24'   },
  { eu: '40', uk: '6',   us: '7',   cm: '25'   },
  { eu: '41', uk: '7',   us: '8',   cm: '25.5' },
  { eu: '42', uk: '7.5', us: '8.5', cm: '26'   },
  { eu: '43', uk: '8.5', us: '9.5', cm: '27'   },
  { eu: '44', uk: '9',   us: '10',  cm: '27.5' },
  { eu: '45', uk: '10',  us: '11',  cm: '28.5' },
  { eu: '46', uk: '11',  us: '12',  cm: '29'   },
];
const RV_KEY = 'miq_recently_viewed';
// TABS is now built dynamically with t() inside the component

// ── Size recommendation logic ──────────────────────────────────────────────────
const recommendSize = (height, weight) => {
  const h = Number(height);
  const w = Number(weight);
  if (!h || !w) return null;
  const bmi = w / ((h / 100) ** 2);
  if (h <= 163 || (bmi < 20 && h <= 168)) return 'S';
  if (h <= 170 && bmi <= 23) return 'M';
  if (h <= 178 && bmi <= 26) return 'L';
  if (h <= 185 && bmi <= 29) return 'XL';
  return 'XXL';
};

// ── Size Guide Modal ───────────────────────────────────────────────────────────
const SizeGuideModal = ({ onClose }) => {
  const t = useLanguageStore((s) => s.t);
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const suggested = recommendSize(height, weight);
  const modalRef = useRef(null);
  useFocusTrap(modalRef, true, onClose);

  return (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
    onClick={onClose}
  >
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />
    <motion.div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="size-guide-title"
      initial={{ opacity: 0, scale: 0.95, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 8 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      onClick={(e) => e.stopPropagation()}
      className="relative bg-bg-elevated rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-surface-border"
    >
      <div className="flex items-center justify-between p-6 border-b border-surface-border">
        <div className="flex items-center gap-2">
          <Ruler className="w-5 h-5 text-primary" aria-hidden="true" />
          <h3 id="size-guide-title" className="font-display text-xl font-bold uppercase text-text-primary">{t('sizeChartTitle')}</h3>
        </div>
        <button
          onClick={onClose}
          aria-label="Đóng hướng dẫn chọn size"
          className="w-9 h-9 rounded-full bg-bg-raised hover:bg-bg-overlay flex items-center justify-center transition"
        >
          <X className="w-4 h-4 text-text-secondary" aria-hidden="true" />
        </button>
      </div>
      <div className="p-6 overflow-y-auto max-h-[75vh]">
        {/* Body measurement recommendation */}
        <div className="mb-5 p-4 bg-primary/5 rounded-2xl border border-primary/20">
          <p className="text-xs font-bold text-primary uppercase tracking-wider mb-3">{t('bodyMeasurement')}</p>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label htmlFor="size-guide-height" className="text-xs text-text-muted font-semibold block mb-1">{t('heightLabel')}</label>
              <input
                id="size-guide-height"
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="170"
                min="140" max="220"
                className="w-full px-3 py-2 rounded-xl border border-surface-border bg-bg-raised text-text-primary text-sm focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="size-guide-weight" className="text-xs text-text-muted font-semibold block mb-1">{t('weightLabel')}</label>
              <input
                id="size-guide-weight"
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="65"
                min="30" max="200"
                className="w-full px-3 py-2 rounded-xl border border-surface-border bg-bg-raised text-text-primary text-sm focus:border-primary focus:outline-none"
              />
            </div>
          </div>
          {suggested ? (
            <div className="flex items-center gap-3 bg-bg-elevated rounded-xl px-4 py-3 border border-primary/30">
              <span className="text-xs text-text-muted">{t('sizeResult')}:</span>
              <span className="font-display text-2xl font-bold text-primary">{suggested}</span>
            </div>
          ) : (
            <p className="text-xs text-text-muted">{t('checkSize')}</p>
          )}
        </div>

        <p className="text-sm text-text-muted mb-4">Đo chiều dài bàn chân (cm) để tìm size phù hợp nhất.</p>
        <div className="overflow-x-auto rounded-xl border border-surface-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-bg-raised text-xs font-bold uppercase tracking-wider text-text-muted">
                <th className="px-4 py-3 text-left">EU</th>
                <th className="px-4 py-3 text-center">UK</th>
                <th className="px-4 py-3 text-center">US</th>
                <th className="px-4 py-3 text-center">CM</th>
              </tr>
            </thead>
            <tbody>
              {SIZE_CHART.map((row, i) => (
                <tr key={row.eu} className={`border-t border-surface-border ${i % 2 === 1 ? 'bg-bg-raised/40' : ''}`}>
                  <td className="px-4 py-2.5 font-bold text-text-primary">{row.eu}</td>
                  <td className="px-4 py-2.5 text-center text-text-secondary">{row.uk}</td>
                  <td className="px-4 py-2.5 text-center text-text-secondary">{row.us}</td>
                  <td className="px-4 py-2.5 text-center font-semibold text-primary">{row.cm}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 p-3 bg-primary/5 rounded-xl border border-primary/20">
          <p className="text-xs text-text-muted">
            <span className="font-bold text-text-primary">Mẹo:</span> Đo vào buổi chiều khi bàn chân to nhất. Nếu giữa 2 size, hãy chọn size lớn hơn.
          </p>
        </div>
      </div>
    </motion.div>
  </motion.div>
  );
};

// ── Gallery lightbox (fullscreen zoom) ────────────────────────────────────────
const GalleryLightbox = ({ images, startIndex, onClose }) => {
  const [idx, setIdx] = useState(startIndex);
  const closeBtnRef = useRef(null);
  const overlayRef  = useRef(null);

  // WCAG 2.4.3 focus trap + Escape + scroll lock
  useEffect(() => {
    const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([aria-hidden="true"])';
    const getFocusable = () =>
      overlayRef.current ? [...overlayRef.current.querySelectorAll(FOCUSABLE)] : [];

    closeBtnRef.current?.focus();
    document.body.style.overflow = 'hidden';

    const handler = (e) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key !== 'Tab') return;

      const focusable = getFocusable();
      if (!focusable.length) return;

      const first = focusable[0];
      const last  = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };

    document.addEventListener('keydown', handler);
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const prev = useCallback(() => setIdx((i) => (i - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setIdx((i) => (i + 1) % images.length), [images.length]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowLeft')  prev();
      if (e.key === 'ArrowRight') next();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [prev, next]);

  return (
    <motion.div
      ref={overlayRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="dialog"
      aria-modal="true"
      aria-label="Xem ảnh phóng to"
      className="fixed inset-0 z-[2000] flex flex-col items-center justify-center bg-black/92 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Close button — first focusable element (focus trap anchor) */}
      <button
        ref={closeBtnRef}
        onClick={onClose}
        aria-label="Đóng"
        className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
      >
        <X className="w-5 h-5 text-white" />
      </button>

      {/* Image */}
      <div
        className="relative flex-1 flex items-center justify-center w-full px-16"
        onClick={(e) => e.stopPropagation()}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={idx}
            src={images[idx]?.url}
            alt=""
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.18 }}
            className="max-h-[80vh] max-w-full object-contain drop-shadow-2xl"
          />
        </AnimatePresence>

        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Ảnh trước"
              className="absolute left-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={next}
              aria-label="Ảnh tiếp"
              className="absolute right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div
          className="flex gap-2 pb-4 px-4"
          onClick={(e) => e.stopPropagation()}
        >
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition flex-shrink-0 ${i === idx ? 'border-primary' : 'border-white/20 hover:border-white/50'}`}
            >
              <img src={img.url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
};

// ── Policy info ────────────────────────────────────────────────────────────────
const PolicyInfo = () => (
  <div className="mt-5 space-y-3 border-t border-surface-border pt-5">
    {[
      { icon: Gift,       title: 'TẶNG QUÀ KÈM ĐƠN',         body: 'Tặng vớ dệt kim & túi đựng giày chống thấm với mỗi đơn hàng giày bóng đá.' },
      { icon: RotateCcw,  title: 'ĐỔI SIZE DỄ DÀNG',         body: 'Đổi size hoặc model trong 7 ngày (sản phẩm chưa sử dụng).' },
      { icon: Truck,      title: 'CHÍNH SÁCH VẬN CHUYỂN',    body: 'COD & miễn phí vận chuyển toàn quốc khi chuyển khoản cho đơn giày từ 100K.' },
      { icon: CreditCard, title: 'THANH TOÁN LINH HOẠT',     body: 'Chấp nhận thẻ, tiền mặt, chuyển khoản và ví điện tử.' },
    ].map(({ icon: Icon, title, body }) => (
      <div key={title} className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <div>
          <p className="text-xs font-black text-text-primary uppercase tracking-wider mb-0.5">{title}</p>
          <p className="text-xs text-text-muted leading-relaxed">{body}</p>
        </div>
      </div>
    ))}
  </div>
);

// ── Info tabs ──────────────────────────────────────────────────────────────────
const TabSection = ({ product }) => {
  const t = useLanguageStore((s) => s.t);
  const [active, setActive] = useState(0);
  const TABS = [t('description'), 'Thông số', 'Vận chuyển'];

  const specs = [
    { label: t('brand'),       value: product.brand },
    { label: t('category'),    value: product.category?.name || '—' },
    { label: 'Chất liệu mũi', value: 'Tổng hợp / Dệt kim' },
    { label: 'Đế giày',       value: 'Cao su tổng hợp' },
    { label: 'Đinh',          value: 'FG – sân cỏ tự nhiên' },
    { label: 'Xuất xứ',      value: 'Việt Nam' },
  ];

  return (
    <div className="mt-6">
      {/* Tab headers */}
      <div className="relative flex border-b border-surface-border mb-5">
        {TABS.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActive(i)}
            className={`relative px-4 py-2.5 text-sm font-bold uppercase tracking-wide transition-colors ${
              active === i ? 'text-text-primary' : 'text-text-muted hover:text-text-primary'
            }`}
          >
            {tab}
            {active === i && (
              <motion.div
                layoutId="tab-underline"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab panels */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.18 }}
        >
          {active === 0 && (
            <p className="text-text-secondary leading-relaxed text-sm">
              {product.description || t('noProducts')}
            </p>
          )}
          {active === 1 && (
            <div className="space-y-0 rounded-xl border border-surface-border overflow-hidden">
              {specs.map(({ label, value }, i) => (
                <div
                  key={label}
                  className={`flex items-center gap-4 px-4 py-3 ${i % 2 === 1 ? 'bg-bg-raised/50' : 'bg-bg-elevated'}`}
                >
                  <span className="text-xs font-bold uppercase tracking-wide text-text-muted w-36 flex-shrink-0">
                    {label}
                  </span>
                  <span className="text-sm font-medium text-text-primary">{value}</span>
                </div>
              ))}
            </div>
          )}
          {active === 2 && (
            <div className="space-y-5 text-sm text-text-secondary">
              {[
                {
                  icon: Truck,
                  title: t('freeShipping'),
                  body: 'Đơn hàng trên 500.000đ được miễn phí vận chuyển toàn quốc. Giao hàng trong 2–4 ngày làm việc.',
                },
                {
                  icon: RotateCcw,
                  title: 'Đổi trả trong 30 ngày',
                  body: 'Sản phẩm chưa sử dụng còn nguyên tem nhãn. Liên hệ hotline để được đổi size miễn phí.',
                },
                {
                  icon: ShieldCheck,
                  title: '100% Hàng Chính Hãng',
                  body: '100% sản phẩm có tem thương hiệu chính hãng và hóa đơn VAT. Hoàn tiền đầy đủ nếu phát hiện hàng giả.',
                },
              ].map(({ icon: Icon, title, body }) => (
                <div key={title} className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-text-primary mb-1">{title}</p>
                    <p>{body}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

// ── Recently Viewed ────────────────────────────────────────────────────────────
const RecentlyViewedSection = ({ currentId }) => {
  const t = useLanguageStore((s) => s.t);
  const [items, setItems] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(RV_KEY) || '[]');
    setItems(stored.filter((p) => p._id !== currentId).slice(0, 4));
  }, [currentId]);

  if (items.length === 0) return null;

  return (
    <section className="mt-16">
      <h2 className="font-display text-2xl font-bold mb-6 text-text-primary">{t('viewMore').toUpperCase()}</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((p) => (
          <Link
            key={p._id}
            to={`/products/${p._id}`}
            className="group block bg-surface rounded-2xl p-3 border border-surface-border hover:border-primary/30 hover:shadow-[0_8px_24px_rgba(0,0,0,0.3)] transition"
          >
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 aspect-square rounded-xl p-3 mb-2 overflow-hidden">
              <img
                src={p.images?.[0]?.url}
                alt={p.name}
                loading="lazy"
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-0.5">{p.brand}</p>
            <h4 className="text-xs font-bold uppercase line-clamp-2 group-hover:text-primary transition-colors text-text-primary">
              {p.name}
            </h4>
            <p className="text-sm font-bold text-primary mt-1">
              {formatCurrency(p.salePrice || p.price)}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
};

// ── Main component ─────────────────────────────────────────────────────────────
const ProductDetail = () => {
  const { id } = useParams();
  const shouldReduce = useReducedMotion();
  const [selectedSize, setSelectedSize] = useState(null);
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [customizer, setCustomizer] = useState({ name: '', number: '' });
  const [heartAnim, setHeartAnim] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [delivery, setDelivery] = useState('online');
  const [selectedAddressId, setSelectedAddressId] = useState('');

  // Zoom state (desktop only)
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [isZooming, setIsZooming] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // 3D viewer toggle (boots only)
  const [show3D, setShow3D] = useState(false);

  const addItem = useCartStore((s) => s.addItem);
  const { toggle, isWishlisted } = useWishlistStore();
  const { user, isAuthenticated } = useAuthStore();
  const t = useLanguageStore((s) => s.t);

  useEffect(() => {
    setSelectedSize(null);
    setQty(1);
    setActiveImage(0);
    setIsZooming(false);
    setShow3D(false);
  }, [id]);

  useEffect(() => {
    if (delivery !== 'store') return;
    const addrs = user?.addresses || [];
    if (!addrs.length) return;
    const def = addrs.find((a) => a.isDefault) || addrs[0];
    setSelectedAddressId((prev) => prev || def._id);
  }, [delivery, user]);

  const { data: product, isLoading, isError, refetch } = useQuery({
    queryKey: ['product', id],
    queryFn: () => fetchProductById(id),
    staleTime: 5 * 60 * 1000,
  });

  const { data: boughtTogether = [] } = useQuery({
    queryKey: ['bought-together', id],
    queryFn: () => fetchBoughtTogether(id).catch(() => []),
    staleTime: 10 * 60 * 1000,
    enabled: !!id,
  });

  // Persist to recently viewed
  useEffect(() => {
    if (!product) return;
    const entry = {
      _id: product._id,
      name: product.name,
      brand: product.brand,
      price: product.price,
      salePrice: product.salePrice,
      images: product.images?.slice(0, 1),
    };
    const stored = JSON.parse(localStorage.getItem(RV_KEY) || '[]');
    const updated = [entry, ...stored.filter((p) => p._id !== product._id)].slice(0, 6);
    localStorage.setItem(RV_KEY, JSON.stringify(updated));
  }, [product]);

  const handleAddToCart = () => {
    if (!selectedSize) { toast.error(t('selectSize')); return; }
    const hasCustom = isJersey && (customizer.name || customizer.number);
    addItem(product, selectedSize, qty, hasCustom ? customizer : null);
    toast.success(qty > 1 ? `${t('addToCart')} ×${qty}` : t('addToCart'));
  };

  const handleWishlist = async () => {
    const added = toggle(product);
    setHeartAnim(true);
    setTimeout(() => setHeartAnim(false), 400);
    toast.success(added ? t('addedToWishlist') : t('removeFromWishlist'), { duration: 1500 });
    if (isAuthenticated) {
      try { await toggleWishlistApi(product._id); }
      catch { toggle(product); }
    }
  };

  if (isLoading) return <ProductDetailSkeleton />;
  if (isError || !product) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center">
      <p className="font-display text-2xl font-bold">{t('noProducts')}</p>
      <div className="flex items-center gap-3">
        <button onClick={() => refetch()} className="btn-primary text-sm !py-2.5">Thử lại</button>
        <Link to="/products" className="btn-outline text-sm !py-2.5">{t('allProducts')}</Link>
      </div>
    </div>
  );

  const isJersey = product?.category?.slug === 'club-kits' ||
                   product?.tags?.includes('jersey');
  const isShoe = product?.category?.slug === 'football-boots' ||
                 product?.category?.slug === 'boots' ||
                 product?.tags?.includes('boot') ||
                 product?.tags?.includes('shoe');

  const finalPrice = product.salePrice || product.price;
  const images = (product.images || []).map((img) => ({ ...img, url: optimizeImg(img.url) }));
  const wishlisted = isWishlisted(product._id);
  const inStockVariants = product.variants?.filter((v) => v.stock > 0) ?? [];
  const selectedVariant = product.variants?.find((v) => v.size === selectedSize);
  const maxQty = selectedVariant?.stock ?? 10;
  const discountPct = product.salePrice
    ? Math.round((1 - product.salePrice / product.price) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-bg-base py-8 pb-28 lg:pb-8">
      <AnimatePresence>
        {lightboxOpen && (
          <GalleryLightbox
            images={images}
            startIndex={activeImage}
            onClose={() => setLightboxOpen(false)}
          />
        )}
      </AnimatePresence>
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-20">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-text-muted mb-6 flex-wrap">
          <Link to="/" className="hover:text-primary transition">{t('home')}</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-primary transition">{t('products')}</Link>
          {product.category?.name && (
            <>
              <span>/</span>
              <Link
                to={`/products?category=${product.category.name}`}
                className="hover:text-primary transition capitalize"
              >
                {product.category.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-text-primary font-medium truncate max-w-[160px]">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-10 lg:items-start">

          {/* ── LEFT: Sticky image gallery ──────────────────────────────── */}
          <div className="lg:sticky lg:top-24">

            {/* Mobile: swipe carousel */}
            <div className="lg:hidden">
              <SwipeCarousel
                images={images}
                activeImage={activeImage}
                setActiveImage={setActiveImage}
                productName={product.name}
              />
              {images.length > 1 && (
                <div className="flex justify-center gap-1.5 mt-3">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={`rounded-full transition-all ${
                        activeImage === i ? 'w-4 h-2 bg-primary' : 'w-2 h-2 bg-surface-border'
                      }`}
                      aria-label={`Ảnh ${i + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Desktop: hover-zoom image */}
            <div className="hidden lg:block">
              {/* View mode toggle for shoes */}
              {isShoe && (
                <div className="flex gap-2 mb-3">
                  <button
                    onClick={() => setShow3D(false)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                      !show3D
                        ? 'bg-primary text-white border-primary'
                        : 'bg-bg-raised text-text-muted border-surface-border hover:border-primary/40'
                    }`}
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/></svg>
                    Ảnh
                  </button>
                  <button
                    onClick={() => setShow3D(true)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                      show3D
                        ? 'bg-primary text-white border-primary'
                        : 'bg-bg-raised text-text-muted border-surface-border hover:border-primary/40'
                    }`}
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                    Xem 360°
                  </button>
                </div>
              )}

              {/* 3D viewer */}
              {isShoe && show3D ? (
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-3xl aspect-square relative overflow-hidden border border-primary/20">
                  {/* Spotlight ring — suppressed when prefers-reduced-motion */}
                  {!shouldReduce && (
                    <motion.div
                      aria-hidden="true"
                      className="absolute inset-8 rounded-full border-2 border-primary/20 border-dashed pointer-events-none z-0"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                    />
                  )}
                  <div className="absolute inset-0 p-6 z-10">
                    <Shoe3DRotator
                      mode="interactive"
                      width="100%"
                      height="100%"
                      filter="drop-shadow(0 24px 48px rgba(0,0,0,0.50)) drop-shadow(0 8px 20px rgba(0,0,0,0.22))"
                    />
                  </div>
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-3/4 h-3 bg-primary/25 rounded-full blur-md pointer-events-none z-0" />
                </div>
              ) : (
              <div
                className="group bg-gradient-to-br from-primary/10 to-primary/5 rounded-3xl aspect-square relative overflow-hidden border border-primary/20 cursor-crosshair"
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setZoomPos({
                    x: ((e.clientX - rect.left) / rect.width) * 100,
                    y: ((e.clientY - rect.top) / rect.height) * 100,
                  });
                }}
                onMouseEnter={() => setIsZooming(true)}
                onMouseLeave={() => setIsZooming(false)}
                onClick={() => images.length > 0 && setLightboxOpen(true)}
              >
                {/* Click-to-fullscreen button */}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setLightboxOpen(true); }}
                  aria-label="Phóng to ảnh"
                  className="absolute top-3 right-3 z-30 w-8 h-8 rounded-lg bg-bg-elevated/80 backdrop-blur-sm border border-surface-border text-text-muted hover:text-primary hover:border-primary/40 flex items-center justify-center transition opacity-0 group-hover:opacity-100 focus:opacity-100"
                  style={{ pointerEvents: 'auto' }}
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                {/* Spotlight ring — suppressed when prefers-reduced-motion */}
                {!shouldReduce && (
                  <motion.div
                    aria-hidden="true"
                    className="absolute inset-8 rounded-full border-2 border-primary/20 border-dashed pointer-events-none z-0"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  />
                )}

                {/* Product image — fades when switching, scales on hover zoom */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeImage}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="absolute inset-0 p-8 z-10"
                  >
                    <img
                      src={images[activeImage]?.url}
                      alt={product.name}
                      loading="lazy"
                      decoding="async"
                      style={{
                        transform: isZooming ? 'scale(2.2)' : 'scale(1)',
                        transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                        transition: 'transform 0.2s ease',
                        willChange: 'transform',
                      }}
                      className="w-full h-full object-contain drop-shadow-2xl"
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Pedestal shadow */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-3/4 h-3 bg-primary/25 rounded-full blur-md pointer-events-none z-0" />

                {/* Zoom hint */}
                <AnimatePresence>
                  {!isZooming && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute bottom-4 right-4 z-20 bg-bg-elevated/80 backdrop-blur-sm text-[10px] font-semibold text-text-muted px-2.5 py-1 rounded-full border border-surface-border pointer-events-none"
                    >
                      Hover to zoom
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              )}

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="grid grid-cols-5 gap-2 mt-3">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={`bg-bg-raised rounded-xl aspect-square p-2.5 border-2 transition overflow-hidden ${
                        activeImage === i
                          ? 'border-primary shadow-neon-xs'
                          : 'border-surface-border hover:border-primary/40'
                      }`}
                    >
                      <img
                        src={img.url}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-contain"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT: Product info ─────────────────────────────────────── */}
          <div>
            {/* Brand row */}
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-primary font-bold uppercase tracking-widest">{product.brand}</p>
              {discountPct > 0 ? (
                <span className="text-xs bg-red-500 text-white font-bold uppercase px-3 py-1 rounded-lg shadow-sm">
                  -{discountPct}% OFF
                </span>
              ) : product.isFeatured ? (
                <span className="text-xs bg-amber-400 text-white font-bold uppercase px-3 py-1 rounded-lg shadow-sm">
                  BEST SELLER
                </span>
              ) : null}
            </div>

            <h1 className="font-display text-3xl md:text-4xl font-bold mb-3 leading-tight">
              {product.name}
            </h1>

            {/* Rating row */}
            <div className="flex items-center gap-2 mb-5">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-4 h-4 ${
                      s <= Math.round(product.ratings?.average ?? 0)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-surface-border'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-bold text-text-primary">{(product.ratings?.average ?? 0).toFixed(1)}</span>
              <a
                href="#reviews"
                className="text-sm text-text-muted hover:text-primary transition underline-offset-2 hover:underline"
              >
                ({product.ratings?.count ?? 0} {t('reviews').toLowerCase()})
              </a>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-3xl md:text-4xl font-bold text-primary">{formatCurrency(finalPrice)}</span>
              {product.salePrice && (
                <span className="text-xl text-text-muted line-through">{formatCurrency(product.price)}</span>
              )}
            </div>

            {/* Savings badge */}
            {product.salePrice && (
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                  Tiết kiệm {formatCurrency(product.price - product.salePrice)} ({discountPct}%)
                </span>
              </div>
            )}

            {/* Size selector */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2.5">
                <h3 className="font-bold uppercase text-sm tracking-wide text-text-primary">
                  {t('size')}{selectedSize && <span className="font-normal ml-2 text-primary">— {selectedSize}</span>}
                </h3>
                <button
                  onClick={() => setShowSizeGuide(true)}
                  className="flex items-center gap-1 text-xs text-text-muted font-semibold hover:text-primary transition"
                >
                  <Ruler className="w-3.5 h-3.5" />
                  {t('sizeGuide')}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.variants?.map((v) => (
                  <div key={v.size} className="relative group">
                    <motion.button
                      data-testid="size-option"
                      onClick={() => { if (v.stock > 0) { setSelectedSize(v.size); setQty(1); } }}
                      disabled={v.stock === 0}
                      aria-disabled={v.stock === 0}
                      aria-label={v.stock === 0 ? `${v.size} — Hết hàng` : v.size}
                      whileTap={v.stock > 0 ? { scale: 0.93 } : {}}
                      className={`min-w-[52px] py-2.5 px-4 rounded-xl border-2 font-semibold text-sm transition ${
                        selectedSize === v.size
                          ? 'border-primary bg-primary text-white shadow-neon-xs'
                          : v.stock === 0
                            ? 'border-surface-border text-text-muted cursor-not-allowed opacity-50 relative overflow-hidden'
                            : 'border-surface-border hover:border-primary text-text-primary bg-bg-raised'
                      }`}
                    >
                      {v.stock === 0 && (
                        <span className="absolute inset-0 flex items-end justify-center pb-0.5 pointer-events-none">
                          <span className="block w-full h-px bg-text-muted/60 rotate-[20deg] absolute top-1/2" />
                        </span>
                      )}
                      {v.size}
                    </motion.button>
                    {v.stock === 0 && (
                      <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] font-bold text-red-400 whitespace-nowrap pointer-events-none">
                        Hết hàng
                      </span>
                    )}
                  </div>
                ))}
              </div>
              {/* Spacer for the "Hết hàng" labels */}
              {product.variants?.some((v) => v.stock === 0) && <div className="h-4" />}
              {inStockVariants.length === 0 ? (
                <p className="text-xs text-red-500 mt-2 font-medium">{t('outOfStockMsg')}</p>
              ) : !selectedSize && (
                <p className="text-xs text-amber-500 mt-1">Vui lòng chọn size để thêm vào giỏ</p>
              )}
            </div>

            {/* Delivery method */}
            <div className="mb-5">
              <h3 className="font-bold uppercase text-sm tracking-wide mb-2.5 text-text-primary">{t('address')}</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'online', label: t('freeShipping'), Icon: Truck },
                  { key: 'store', label: t('address'), Icon: MapPin },
                ].map(({ key, label, Icon }) => (
                  <button
                    key={key}
                    onClick={() => setDelivery(key)}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border-2 text-sm font-semibold transition ${
                      delivery === key
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-surface-border text-text-secondary hover:border-primary/40 bg-bg-raised'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </div>
              {delivery === 'store' && (() => {
                const savedAddresses = user?.addresses || [];
                if (!isAuthenticated) return (
                  <p className="mt-2 text-xs text-text-muted">
                    <Link to="/login" className="text-primary font-semibold hover:underline">Đăng nhập</Link> để chọn địa chỉ giao hàng.
                  </p>
                );
                if (savedAddresses.length === 0) return (
                  <p className="mt-2 text-xs text-text-muted">
                    Bạn chưa có địa chỉ đã lưu.{' '}
                    <Link to="/profile?tab=addresses" className="text-primary font-semibold hover:underline">Thêm địa chỉ</Link>
                  </p>
                );
                return (
                  <select
                    value={selectedAddressId}
                    onChange={(e) => setSelectedAddressId(e.target.value)}
                    className="mt-2 w-full px-3 py-2.5 rounded-xl border border-surface-border bg-bg-raised text-sm text-text-primary focus:outline-none focus:border-primary"
                  >
                    {savedAddresses.map((addr) => (
                      <option key={addr._id} value={addr._id}>
                        {addr.label ? `${addr.label} — ` : ''}
                        {[addr.street, addr.ward, addr.district, addr.city].filter(Boolean).join(', ')}
                        {addr.isDefault ? ' (Mặc định)' : ''}
                      </option>
                    ))}
                  </select>
                );
              })()}
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-4 mb-5">
              <span className="font-bold uppercase text-sm tracking-wide text-text-primary">{t('quantity')}</span>
              <QuantityStepper
                value={qty}
                onDecrement={() => setQty((q) => Math.max(1, q - 1))}
                onIncrement={() => setQty((q) => Math.min(maxQty, q + 1))}
                min={1}
                max={maxQty}
                disabled={!selectedSize}
              />
              {selectedSize && maxQty <= 5 && (
                <span className="text-xs text-amber-500 font-semibold bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                  {t('instock')}: {maxQty}
                </span>
              )}
            </div>

            {/* Customizer — jerseys only */}
            {isJersey && (
              <div className="my-5 p-4 bg-primary/5 border border-primary/15 rounded-2xl">
                <h3 className="font-bold text-sm uppercase tracking-wide text-text-primary mb-0.5">TÙY CHỈNH ÁO ĐẤU</h3>
                <p className="text-xs text-text-muted mb-4">In tên và số áo theo yêu cầu</p>
                <ProductCustomizer
                  name={customizer.name}
                  number={customizer.number}
                  onChange={setCustomizer}
                />
                {(customizer.name || customizer.number) && (
                  <p className="text-xs text-text-muted mt-3 flex items-center gap-1.5">
                    <span className="text-primary font-bold">+ 50.000₫</span>
                    <span>(đã bao gồm phí in)</span>
                  </p>
                )}
              </div>
            )}

            {/* CTA — desktop */}
            <div className="hidden lg:flex flex-col gap-3">
              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={inStockVariants.length === 0}
                  className="flex-1 bg-bg-raised border-2 border-primary text-primary font-bold uppercase tracking-wider py-4 rounded-xl transition hover:bg-primary/10 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {t('addToCart')}{qty > 1 && ` (${qty})`}
                </button>
                <motion.button
                  onClick={handleWishlist}
                  animate={heartAnim ? { scale: [1, 1.3, 1] } : { scale: 1 }}
                  transition={{ duration: 0.35 }}
                  className={`px-5 border-2 rounded-xl transition flex items-center gap-2 font-bold ${
                    wishlisted
                      ? 'border-red-400 bg-red-500/10 text-red-500'
                      : 'border-surface-border hover:border-red-400 hover:text-red-500 text-text-muted'
                  }`}
                  aria-label={t('wishlist')}
                >
                  <Heart className={`w-5 h-5 ${wishlisted ? 'fill-red-500' : ''}`} />
                </motion.button>
              </div>
              <Link
                to="/checkout"
                onClick={(e) => {
                  if (!selectedSize) { e.preventDefault(); toast.error(t('selectSize')); return; }
                  handleAddToCart();
                }}
                className="w-full bg-primary text-white font-bold uppercase tracking-wider py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-primary/90 transition shadow-[0_4px_20px_rgba(0,0,0,0.30)]"
              >
                <Zap className="w-5 h-5" /> {t('buyNow')}
              </Link>
            </div>

            {/* Policy info */}
            <PolicyInfo />

            {/* Info tabs */}
            <TabSection product={product} />
          </div>
        </div>

        {/* ── REVIEWS ─────────────────────────────────────────────────────── */}
        <div id="reviews">
          <ReviewSection
            productId={product._id}
            initialReviews={product.reviews || []}
            initialRatings={product.ratings}
          />
        </div>

        {/* ── SẢN PHẨM LIÊN QUAN ───────────────────────────────────────────── */}
        {boughtTogether.length > 0 && (
          <section className="mt-20">
            <div className="flex items-center gap-2 mb-6">
              <h2 className="font-display text-2xl md:text-3xl font-bold text-text-primary">{t('relatedProducts').toUpperCase()}</h2>
              <Zap className="w-6 h-6 text-primary fill-primary" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {boughtTogether.map((p) => (
                <Link
                  to={`/products/${p._id}`}
                  key={p._id}
                  className="group block bg-surface rounded-2xl p-3 border border-surface-border hover:border-primary/30 hover:shadow-[0_8px_24px_rgba(0,0,0,0.3)] transition"
                >
                  <div className="bg-gradient-to-br from-primary/10 to-primary/5 aspect-square rounded-xl p-3 mb-2 overflow-hidden">
                    <img
                      src={p.images?.[0]?.url}
                      alt={p.name}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <h4 className="text-xs font-bold uppercase line-clamp-2 group-hover:text-primary transition-colors text-text-primary">{p.name}</h4>
                  <p className="text-sm font-bold text-primary mt-1">
                    {formatCurrency(p.salePrice || p.price)}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── RECENTLY VIEWED ──────────────────────────────────────────────── */}
        <RecentlyViewedSection currentId={id} />
      </div>

      {/* Sticky mobile CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-bg-base/95 backdrop-blur-md border-t border-surface-border px-4 py-3 flex gap-3 safe-area-pb">
        <motion.button
          onClick={handleWishlist}
          animate={heartAnim ? { scale: [1, 1.3, 1] } : { scale: 1 }}
          transition={{ duration: 0.35 }}
          className={`min-w-[52px] min-h-[52px] rounded-xl border-2 flex items-center justify-center transition ${
            wishlisted
              ? 'border-red-400 bg-red-500/10 text-red-500'
              : 'border-surface-border text-text-muted hover:border-red-400 hover:text-red-500'
          }`}
          aria-label={t('wishlist')}
        >
          <Heart className={`w-5 h-5 ${wishlisted ? 'fill-red-500' : ''}`} />
        </motion.button>
        <button
          onClick={handleAddToCart}
          disabled={inStockVariants.length === 0}
          className="flex-1 bg-primary text-white font-bold uppercase tracking-wider py-3.5 rounded-xl flex items-center justify-center gap-2 min-h-[52px] disabled:opacity-40 hover:bg-primary/90 transition"
        >
          <ShoppingCart className="w-5 h-5" />
          {t('addToCart')}{qty > 1 && ` (${qty})`}
        </button>
      </div>

      {/* Size Guide Modal */}
      <AnimatePresence>
        {showSizeGuide && <SizeGuideModal onClose={() => setShowSizeGuide(false)} />}
      </AnimatePresence>
    </div>
  );
};

// ── Swipe carousel (mobile) ────────────────────────────────────────────────────
const SwipeCarousel = ({ images, activeImage, setActiveImage, productName }) => {
  const x = useMotionValue(0);
  const totalImages = images.length;
  const shouldReduce = useReducedMotion();

  const handleDragEnd = (_, info) => {
    if (info.offset.x < -50 && activeImage < totalImages - 1) setActiveImage(activeImage + 1);
    else if (info.offset.x > 50 && activeImage > 0) setActiveImage(activeImage - 1);
    animate(x, 0, { type: 'spring', stiffness: 400, damping: 40 });
  };

  return (
    <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-3xl aspect-square relative overflow-hidden border border-primary/20 touch-pan-y">
      <motion.div
        drag={totalImages > 1 ? 'x' : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        style={{ x }}
        className="w-full h-full flex items-center justify-center p-8 cursor-grab active:cursor-grabbing"
      >
        {/* Spotlight ring — decorative product-pedestal motif; suppressed when prefers-reduced-motion */}
        {!shouldReduce && (
          <motion.div
            aria-hidden="true"
            className="absolute inset-8 rounded-full border-2 border-primary/20 border-dashed pointer-events-none"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          />
        )}
        <motion.img
          key={activeImage}
          src={images[activeImage]?.url}
          alt={productName}
          loading="lazy"
          decoding="async"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          className="relative z-10 w-full h-full object-contain drop-shadow-2xl pointer-events-none"
        />
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-3/4 h-3 bg-primary/25 rounded-full blur-md pointer-events-none" />
      </motion.div>
    </div>
  );
};

export default ProductDetail;
