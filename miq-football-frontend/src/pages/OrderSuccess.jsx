import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Package, Mail, Truck, AlertCircle } from 'lucide-react';
import { useLanguageStore } from '../store/languageStore.js';
import { fetchOrderById } from '../services/orderService.js';
import { formatCurrency } from '../utils/formatCurrency.js';
import { OrderItemSkeleton } from '../components/ui/Skeleton.jsx';

const OrderSuccess = () => {
  const { state } = useLocation();
  const navigate   = useNavigate();
  const orderId    = state?.orderId;
  const t          = useLanguageStore((s) => s.t);

  const [order, setOrder]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [orderError, setOrderError] = useState(null);

  useEffect(() => {
    if (!orderId) { navigate('/', { replace: true }); return; }
    fetchOrderById(orderId)
      .then(setOrder)
      .catch((err) => setOrderError(err?.message || 'Không thể tải chi tiết đơn hàng'))
      .finally(() => setLoading(false));
  }, [orderId, navigate]);

  if (!orderId) return null;

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="bg-bg-elevated rounded-3xl p-8 sm:p-12 max-w-lg w-full border border-surface-border shadow-pedestal"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 260, damping: 20 }}
          className="flex justify-center mb-6"
        >
          <CheckCircle2 className="w-20 h-20 text-primary" />
        </motion.div>

        {/* Title */}
        <h1 className="font-display text-3xl font-bold mb-2 text-center">{t('orderSuccess')}</h1>

        {/* Order ref */}
        {orderId && (
          <p className="text-sm text-primary font-mono text-center mb-1">
            {t('orderRef')} #{orderId.slice(-8).toUpperCase()}
          </p>
        )}

        {/* Order confirmation notice — honest: email is conditional on backend env config */}
        <div className="flex items-start gap-2 bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 mt-4 mb-5">
          <Mail className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
          <p className="text-xs text-text-secondary leading-relaxed">
            Đơn hàng của bạn đã được xác nhận và đang được xử lý. Nếu hệ thống email đang hoạt động, bạn sẽ nhận được email xác nhận trong thời gian ngắn.
          </p>
        </div>

        {/* Delivery estimate */}
        <div className="flex items-start gap-2 bg-surface border border-surface-border rounded-xl px-4 py-3 mb-5">
          <Truck className="w-4 h-4 text-text-muted flex-shrink-0 mt-0.5" />
          <p className="text-xs text-text-muted leading-relaxed">
            Dự kiến giao hàng trong <span className="font-semibold text-text-primary">3–5 ngày làm việc</span>. Shipper sẽ liên hệ trước khi giao.
          </p>
        </div>

        {/* Itemized summary */}
        {loading ? (
          <OrderItemSkeleton rows={3} />
        ) : orderError ? (
          <div className="flex items-start gap-2 bg-red-500/8 border border-red-500/25 rounded-xl px-4 py-3 mb-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-400">{orderError}</p>
          </div>
        ) : order?.items?.length > 0 && (
          <div className="mb-5 border border-surface-border rounded-xl overflow-hidden">
            <p className="text-xs font-bold uppercase tracking-wider text-text-muted px-4 py-2 border-b border-surface-border bg-surface">
              Sản phẩm đã đặt
            </p>
            <div className="divide-y divide-surface-border">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 px-4 py-3">
                  {item.image && (
                    <div className="w-10 h-10 rounded-lg bg-surface flex-shrink-0 overflow-hidden p-1">
                      <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text-primary line-clamp-1">{item.name}</p>
                    <p className="text-xs text-text-muted">Size {item.size} × {item.quantity}</p>
                    {item.customization && (item.customization.name || item.customization.number) && (
                      <p className="text-[10px] text-blue-400 font-semibold">
                        In: {item.customization.name}{item.customization.number ? ` #${item.customization.number}` : ''}
                      </p>
                    )}
                  </div>
                  <p className="text-sm font-bold text-primary flex-shrink-0">
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
            {order.totalPrice && (
              <div className="flex justify-between px-4 py-2 bg-surface border-t border-surface-border">
                <span className="text-xs font-bold text-text-muted">Tổng cộng</span>
                <span className="text-sm font-bold text-primary">{formatCurrency(order.totalPrice)}</span>
              </div>
            )}
          </div>
        )}

        {/* CTAs */}
        <div className="flex flex-col gap-3">
          <Link
            to="/profile"
            state={{ tab: 'orders' }}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <Package className="w-4 h-4" />
            Xem đơn hàng của tôi
          </Link>
          <div className="flex gap-3">
            <Link to="/" className="btn-outline flex-1 text-center">{t('backHome')}</Link>
            <Link to="/products" className="btn-outline flex-1 text-center">{t('continueShopping2')}</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default OrderSuccess;
