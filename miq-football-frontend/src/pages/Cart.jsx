import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, ShoppingBag, Truck, ArrowRight, Package, RotateCcw } from 'lucide-react';
import QuantityStepper from '../components/ui/QuantityStepper.jsx';
import toast from 'react-hot-toast';
import { useCartStore } from '../store/cartStore.js';
import { useAuthStore } from '../store/authStore.js';
import { formatCurrency } from '../utils/formatCurrency.js';
import { useLanguageStore } from '../store/languageStore.js';

const FREE_SHIPPING_THRESHOLD = 500000;

// ── Free shipping progress bar ─────────────────────────────────────────────────
const ShippingProgress = ({ subtotal, t }) => {
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const pct = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);
  const isFree = remaining === 0;

  return (
    <div className={`rounded-xl p-3.5 mb-4 border ${isFree ? 'bg-primary/5 border-primary/20' : 'bg-surface border-surface-border'}`}>
      <div className="flex items-center gap-2 mb-2">
        <Truck className={`w-4 h-4 flex-shrink-0 ${isFree ? 'text-primary' : 'text-text-muted'}`} />
        <p className="text-xs font-semibold text-text-secondary">
          {isFree ? (
            <span className="text-primary">{t('freeShippingMsg')}</span>
          ) : (
            <span>
              Thêm{' '}<span className="font-bold text-primary">{formatCurrency(remaining)}</span>{' '}nữa để được miễn phí vận chuyển
            </span>
          )}
        </p>
      </div>
      <div className="h-1.5 bg-bg-raised rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  );
};

// ── Cart item row ──────────────────────────────────────────────────────────────
const CartItem = ({ item, updateQuantity, removeItem }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, x: -80, transition: { duration: 0.2 } }}
    className="bg-surface rounded-2xl p-4 flex gap-4 border border-surface-border hover:border-primary/30 transition-colors"
  >
    {/* Image */}
    <Link
      to={`/products/${item.productId}`}
      className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl w-24 h-24 sm:w-28 sm:h-28 p-2 flex-shrink-0 border border-primary/20 overflow-hidden"
    >
      <img
        src={item.image}
        alt={item.name}
        loading="lazy"
        decoding="async"
        className="w-full h-full object-contain hover:scale-110 transition-transform duration-500"
      />
    </Link>

    {/* Info */}
    <div className="flex-1 min-w-0">
      <Link to={`/products/${item.productId}`} className="block">
        {item.brand && <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-0.5">{item.brand}</p>}
        <h3 className="font-display font-bold uppercase line-clamp-2 text-sm sm:text-base text-text-primary hover:text-primary transition-colors">
          {item.name}
        </h3>
      </Link>
      <p className="text-xs text-text-muted mt-1">Size: <span className="font-semibold text-text-secondary">{item.size}</span></p>
      {item.customization && (item.customization.name || item.customization.number) && (
        <p className="text-xs text-blue-400 font-semibold mt-0.5">
          In: {item.customization.name}{item.customization.number ? ` #${item.customization.number}` : ''}
        </p>
      )}
      <p className="font-bold text-primary mt-1.5 text-sm">{formatCurrency(item.price)}</p>
    </div>

    {/* Controls */}
    <div className="flex flex-col items-end justify-between gap-3">
      {/* Item total */}
      <p className="text-sm font-bold text-text-primary">
        {formatCurrency(item.price * item.quantity)}
      </p>

      <div className="flex items-center gap-2">
        {/* Quantity */}
        <QuantityStepper
          value={item.quantity}
          onDecrement={() => updateQuantity(item.cartItemId, item.quantity - 1)}
          onIncrement={() => updateQuantity(item.cartItemId, item.quantity + 1)}
        />

        {/* Remove */}
        <button
          onClick={() => removeItem(item.cartItemId)}
          className="w-11 h-11 flex items-center justify-center text-text-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
          aria-label="Xóa sản phẩm"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  </motion.div>
);

// ── Main Cart ──────────────────────────────────────────────────────────────────
const Cart = () => {
  const { items, updateQuantity, removeItem, addItem, getTotalPrice } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const t = useLanguageStore((s) => s.t);
  const subtotal = getTotalPrice();
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 30000;
  const total = subtotal + shipping;

  const handleUpdateQuantity = (cartItemId, newQty) => {
    if (newQty <= 0) {
      const item = items.find((i) => i.cartItemId === cartItemId);
      if (!item) return;
      removeItem(cartItemId);
      toast(
        (toastRef) => (
          <span className="flex items-center gap-3 text-sm">
            <span className="text-text-primary">Đã xóa <strong>{item.name}</strong></span>
            <button
              className="flex items-center gap-1 text-primary font-bold hover:underline flex-shrink-0"
              onClick={() => {
                addItem(
                  { _id: item.productId, name: item.name, brand: item.brand, price: item.price, salePrice: null, images: [{ url: item.image }] },
                  item.size,
                  item.quantity,
                  item.customization,
                );
                toast.dismiss(toastRef.id);
              }}
            >
              <RotateCcw className="w-3.5 h-3.5" /> Hoàn tác
            </button>
          </span>
        ),
        { duration: 4000 },
      );
      return;
    }
    updateQuantity(cartItemId, newQty);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center py-20">
        <div className="relative mb-8">
          <div className="w-32 h-32 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <ShoppingBag className="w-14 h-14 text-primary/30 stroke-[1.5]" />
          </div>
          <motion.div
            animate={{ scale: [1, 1.06, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
            className="absolute -inset-3 rounded-3xl border-2 border-dashed border-primary/20"
          />
        </div>
        <h2 className="font-display text-3xl font-bold text-text-primary mb-3">{t('cartEmpty')}</h2>
        <p className="text-text-muted mb-2 max-w-xs leading-relaxed">
          {t('emptyCartMsg')}
        </p>
        <p className="text-xs text-text-muted mb-8 bg-primary/5 px-4 py-2 rounded-full border border-primary/20">
          <Truck className="inline w-3.5 h-3.5 text-primary mr-1" />
          {t('freeShipping')}{' '}
          <span className="text-primary font-bold">500.000đ</span>
        </p>
        <Link to="/products" className="btn-primary inline-flex items-center gap-2">
          <ShoppingBag className="w-5 h-5" />
          {t('emptyCartSub')}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-base py-8">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-20">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-4xl font-bold text-text-primary">{t('cart').toUpperCase()}</h1>
            <p className="text-text-muted text-sm mt-1">{items.length} {t('products').toLowerCase()}</p>
          </div>
          <Link
            to="/products"
            className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-text-muted hover:text-primary transition"
          >
            {t('continueShopping')}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid lg:grid-cols-[1fr_380px] gap-6">

          {/* Items list */}
          <div>
            <AnimatePresence mode="popLayout">
              {items.map((item) => (
                <div key={item.cartItemId} className="mb-3">
                  <CartItem
                    item={item}
                    updateQuantity={handleUpdateQuantity}
                    removeItem={removeItem}
                  />
                </div>
              ))}
            </AnimatePresence>
          </div>

          {/* Summary sidebar */}
          <aside className="h-fit lg:sticky lg:top-24">
            <div className="bg-surface rounded-2xl p-6 border border-surface-border">
              <h2 className="font-display text-xl font-bold text-text-primary mb-5">{t('orderSummary').toUpperCase()}</h2>

              {/* Shipping progress */}
              <ShippingProgress subtotal={subtotal} t={t} />

              {/* Line items */}
              <div className="space-y-3 mb-4 pb-4 border-b border-surface-border">
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">{t('subtotal')} ({items.reduce((s, i) => s + i.quantity, 0)} {t('products').toLowerCase()})</span>
                  <span className="font-bold text-text-primary">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">{t('shipping')}</span>
                  <span className={`font-bold ${shipping === 0 ? 'text-primary' : 'text-text-primary'}`}>
                    {shipping === 0 ? (
                      <span className="flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5" />
                        {t('free')}
                      </span>
                    ) : formatCurrency(shipping)}
                  </span>
                </div>
              </div>

              {/* Total */}
              <div className="flex items-baseline justify-between mb-6">
                <span className="font-display text-lg font-bold uppercase text-text-primary">{t('total')}</span>
                <span className="font-display text-2xl font-bold text-primary">
                  {formatCurrency(total)}
                </span>
              </div>

              {/* CTA */}
              {!isAuthenticated && (
                <p className="text-xs text-amber-400 text-center mb-2 flex items-center justify-center gap-1.5">
                  <span>⚠</span> Vui lòng đăng nhập để thanh toán
                </p>
              )}
              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    navigate('/login', { state: { from: { pathname: '/checkout' } } });
                    return;
                  }
                  navigate('/checkout');
                }}
                className="btn-primary w-full text-center flex items-center justify-center gap-2 !py-4"
              >
                <Package className="w-5 h-5" />
                {isAuthenticated ? t('checkout') : 'Đăng nhập để thanh toán'}
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Payment icons */}
              <div className="mt-4 flex items-center justify-center gap-3 text-text-muted">
                <span className="text-[10px] font-semibold uppercase tracking-wide">{t('apply')}:</span>
                {['COD', 'Stripe'].map((m) => (
                  <span key={m} className="text-[10px] font-bold border border-surface-border px-1.5 py-0.5 rounded text-text-muted">
                    {m}
                  </span>
                ))}
              </div>
            </div>

            {/* Continue shopping — mobile */}
            <Link
              to="/products"
              className="sm:hidden mt-3 flex items-center justify-center gap-1.5 text-sm font-semibold text-text-muted hover:text-primary transition py-2"
            >
              {t('continueShopping')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Cart;
