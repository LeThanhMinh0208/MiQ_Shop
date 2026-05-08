import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useCartStore } from '../store/cartStore.js';
import { formatCurrency } from '../utils/formatCurrency.js';

const Cart = () => {
  const { items, updateQuantity, removeItem, getTotalPrice } = useCartStore();
  const subtotal = getTotalPrice();
  const shipping = subtotal >= 500000 ? 0 : 30000;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-6">
        <ShoppingBag className="w-20 h-20 text-cream-200 mb-4" />
        <h2 className="font-display text-2xl font-bold mb-2">Giỏ hàng trống</h2>
        <p className="text-ink-muted mb-6">Hãy khám phá các sản phẩm tuyệt vời của MiQ</p>
        <Link to="/products" className="btn-primary">Mua sắm ngay</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream py-8">
      <div className="max-w-7xl mx-auto px-6">
        <h1 className="font-display text-4xl font-bold mb-8">GIỎ HÀNG CỦA BẠN</h1>

        <div className="grid lg:grid-cols-[1fr_380px] gap-6">
          {/* Items list */}
          <div className="space-y-3">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={`${item.productId}-${item.size}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  className="bg-white rounded-2xl p-4 flex gap-4 border border-cream-200"
                >
                  {/* Image với pedestal */}
                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl w-28 h-28 p-2 flex-shrink-0 border border-primary/20">
                    <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <h3 className="font-display font-bold uppercase line-clamp-1">{item.name}</h3>
                    <p className="text-sm text-ink-muted mb-2">Size: {item.size}</p>
                    <p className="font-bold text-primary">{formatCurrency(item.price)}</p>
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center bg-cream rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center hover:text-primary"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-bold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center hover:text-primary"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.productId, item.size)}
                      className="text-ink-muted hover:text-red-500 transition"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Summary */}
          <aside className="bg-white rounded-2xl p-6 h-fit sticky top-24 border border-cream-200">
            <h2 className="font-display text-xl font-bold mb-4">TÓM TẮT ĐƠN HÀNG</h2>

            <div className="space-y-2 mb-4 pb-4 border-b border-cream-200">
              <div className="flex justify-between text-sm">
                <span className="text-ink-muted">Tạm tính</span>
                <span className="font-bold">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-ink-muted">Phí vận chuyển</span>
                <span className="font-bold">
                  {shipping === 0 ? 'Miễn phí' : formatCurrency(shipping)}
                </span>
              </div>
            </div>

            <div className="flex justify-between mb-6">
              <span className="font-display text-lg font-bold">TỔNG CỘNG</span>
              <span className="font-display text-2xl font-bold text-primary">
                {formatCurrency(total)}
              </span>
            </div>

            <Link
              to="/checkout"
              className="btn-primary w-full text-center block"
            >
              THANH TOÁN NGAY
            </Link>

            <p className="text-xs text-center text-ink-muted mt-3">
              {subtotal < 500000 && `Mua thêm ${formatCurrency(500000 - subtotal)} để được miễn ship!`}
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Cart;