import { useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Plus, Minus, Trash2, ArrowRight, Truck } from 'lucide-react';
import { useCartStore } from '../../store/cartStore.js';
import { useUIStore } from '../../store/uiStore.js';
import { formatCurrency } from '../../utils/formatCurrency.js';

const MobileCartDrawer = () => {
  const items        = useCartStore((s) => s.items);
  const updateQty    = useCartStore((s) => s.updateQuantity);
  const removeItem   = useCartStore((s) => s.removeItem);
  const getTotalPrice = useCartStore((s) => s.getTotalPrice);
  const isOpen       = useUIStore((s) => s.isCartOpen);
  const closeCart    = useUIStore((s) => s.closeCart);
  const drawerRef    = useRef(null);
  const touchStartX  = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') closeCart(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [closeCart]);

  const onTouchStart = useCallback((e) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const onTouchEnd = useCallback((e) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (delta > 60) closeCart();
  }, [closeCart]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="cart-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/50 z-40"
          />

          <motion.div
            key="cart-drawer"
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Giỏ hàng"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-bg-elevated z-50 flex flex-col shadow-2xl border-l border-surface-border"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-primary" />
                <h2 className="font-display text-xl font-bold text-text-primary">Giỏ hàng</h2>
                {items.length > 0 && (
                  <span className="bg-primary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {items.reduce((s, i) => s + i.quantity, 0)}
                  </span>
                )}
              </div>
              <button
                onClick={closeCart}
                className="p-2 hover:bg-surface rounded-xl transition min-w-[44px] min-h-[44px] flex items-center justify-center text-text-muted hover:text-text-primary"
                aria-label="Đóng giỏ hàng"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto py-3 px-4 space-y-3">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-16">
                  <ShoppingCart className="w-16 h-16 text-text-muted/30 mb-4" />
                  <p className="font-bold text-text-primary mb-2">Giỏ hàng trống</p>
                  <p className="text-sm text-text-muted mb-6">Thêm sản phẩm vào giỏ để tiếp tục</p>
                  <button onClick={closeCart} className="btn-primary text-sm px-6 py-2.5">
                    Khám phá sản phẩm
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={`${item.productId}-${item.size}`}
                    className="flex items-center gap-3 bg-bg-raised rounded-2xl p-3 border border-surface-border"
                  >
                    {/* Image */}
                    <div className="w-16 h-16 bg-bg-elevated rounded-xl flex-shrink-0 overflow-hidden border border-surface-border p-1.5">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full bg-surface-border rounded-lg" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-text-primary line-clamp-1">{item.name}</p>
                      <p className="text-xs text-text-muted mb-2">Size {item.size}</p>
                      <p className="text-sm font-bold text-primary">{formatCurrency(item.price)}</p>
                    </div>

                    {/* Qty controls + remove */}
                    <div className="flex flex-col items-end gap-2">
                      <button
                        onClick={() => removeItem(item.cartItemId)}
                        className="p-1.5 text-text-muted hover:text-red-500 transition min-w-[36px] min-h-[36px] flex items-center justify-center"
                        aria-label="Xoá sản phẩm"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <div className="flex items-center gap-1 bg-bg-elevated rounded-lg border border-surface-border">
                        <button
                          onClick={() => updateQty(item.cartItemId, item.quantity - 1)}
                          className="min-w-[36px] min-h-[36px] flex items-center justify-center hover:bg-surface rounded-l-lg transition text-text-secondary"
                          aria-label="Giảm số lượng"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm font-bold w-6 text-center text-text-primary">{item.quantity}</span>
                        <button
                          onClick={() => updateQty(item.cartItemId, item.quantity + 1)}
                          className="min-w-[36px] min-h-[36px] flex items-center justify-center hover:bg-surface rounded-r-lg transition text-text-secondary"
                          aria-label="Tăng số lượng"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-surface-border p-4 space-y-3">
                {/* Shipping progress */}
                {(() => {
                  const subtotal = getTotalPrice();
                  const remaining = Math.max(0, 500000 - subtotal);
                  const pct = Math.min(100, (subtotal / 500000) * 100);
                  return (
                    <div className={`rounded-xl p-3 text-xs ${remaining === 0 ? 'bg-primary/5 border border-primary/20' : 'bg-bg-raised border border-surface-border'}`}>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Truck className={`w-3.5 h-3.5 ${remaining === 0 ? 'text-primary' : 'text-text-muted'}`} />
                        <span className="font-semibold text-text-secondary">
                          {remaining === 0
                            ? <span className="text-primary">Miễn phí vận chuyển!</span>
                            : <>Mua thêm <span className="font-bold text-primary">{formatCurrency(remaining)}</span> để miễn ship</>
                          }
                        </span>
                      </div>
                      <div className="h-1.5 bg-surface-border rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-primary rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        />
                      </div>
                    </div>
                  );
                })()}
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-text-muted">Tổng cộng</span>
                  <span className="font-display text-2xl font-bold text-primary">
                    {formatCurrency(getTotalPrice())}
                  </span>
                </div>
                <Link
                  to="/checkout"
                  onClick={closeCart}
                  className="w-full bg-primary text-white font-bold uppercase tracking-wider py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-primary-dark transition shadow-lg shadow-primary/30"
                >
                  Thanh toán <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/cart"
                  onClick={closeCart}
                  className="w-full text-center text-sm font-semibold text-primary hover:underline py-1 block"
                >
                  Xem giỏ hàng đầy đủ
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileCartDrawer;
