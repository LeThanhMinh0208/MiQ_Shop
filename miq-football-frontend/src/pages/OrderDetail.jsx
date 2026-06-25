import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Truck, CheckCircle, Clock, XCircle, ArrowLeft, ShoppingBag, MapPin } from 'lucide-react';
import { fetchOrderById } from '../services/chatService.js';
import { getSocket } from '../services/socketService.js';
import { formatCurrency } from '../utils/formatCurrency.js';
import { useLanguageStore } from '../store/languageStore.js';

const STATUS_STEPS = [
  { key: 'pending',    icon: Clock,       labelKey: 'orderStatusPending' },
  { key: 'processing', icon: Package,     labelKey: 'orderStatusProcessing' },
  { key: 'shipped',    icon: Truck,       labelKey: 'orderStatusShipping' },
  { key: 'delivered',  icon: CheckCircle, labelKey: 'orderStatusDelivered' },
];

const STATUS_STYLE = {
  pending:    { bg: 'bg-yellow-50 dark:bg-yellow-900/20',  text: 'text-yellow-600 dark:text-yellow-400', ring: 'ring-yellow-200 dark:ring-yellow-800' },
  processing: { bg: 'bg-blue-50 dark:bg-blue-900/20',      text: 'text-blue-600 dark:text-blue-400',     ring: 'ring-blue-200 dark:ring-blue-800' },
  shipped:    { bg: 'bg-purple-50 dark:bg-purple-900/20',  text: 'text-purple-600 dark:text-purple-400', ring: 'ring-purple-200 dark:ring-purple-800' },
  delivered:  { bg: 'bg-primary/10 dark:bg-primary/20',    text: 'text-primary',                         ring: 'ring-primary/30' },
  cancelled:  { bg: 'bg-red-50 dark:bg-red-900/20',        text: 'text-red-500 dark:text-red-400',       ring: 'ring-red-200 dark:ring-red-800' },
};

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusChanged, setStatusChanged] = useState(false);
  const t = useLanguageStore((s) => s.t);

  useEffect(() => {
    fetchOrderById(id)
      .then(setOrder)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !id) return;
    const handler = ({ orderId, status }) => {
      if (orderId === id) {
        setOrder((prev) => prev ? { ...prev, status } : prev);
        setStatusChanged(true);
        setTimeout(() => setStatusChanged(false), 3500);
      }
    };
    socket.on('order:status-updated', handler);
    return () => socket.off('order:status-updated', handler);
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-bg-raised dark:bg-gray-900 flex items-center justify-center">
      <div className="w-10 h-10 border-[3px] border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );

  if (!order) return (
    <div className="min-h-screen bg-bg-raised dark:bg-gray-900 flex flex-col items-center justify-center gap-4">
      <ShoppingBag className="w-16 h-16 text-text-muted/60 opacity-30" />
      <p className="text-text-muted dark:text-gray-400">{t('orderNotFound')}</p>
      <Link to="/profile" className="text-primary font-semibold hover:underline text-sm">{t('backToProfile')}</Link>
    </div>
  );

  const currentStepIndex = STATUS_STEPS.findIndex((s) => s.key === order.status);
  const isCancelled = order.status === 'cancelled';
  const style = STATUS_STYLE[order.status] || STATUS_STYLE.pending;

  return (
    <div className="min-h-screen bg-bg-raised dark:bg-gray-900 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-5">

        <Link
          to="/profile"
          className="inline-flex items-center gap-2 text-sm font-semibold text-text-muted dark:text-gray-400 hover:text-text-primary dark:hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('myOrders')}
        </Link>

        <AnimatePresence>
          {statusChanged && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="bg-primary/10 border border-primary/30 rounded-xl px-4 py-3 text-primary text-sm font-semibold flex items-center gap-2"
            >
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              {t('orderUpdated')}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Order header */}
        <div className="bg-bg-elevated dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-surface-border dark:border-gray-700">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <p className="text-xs text-text-muted dark:text-gray-400 font-medium">{t('orderCode')}</p>
              <p className="font-mono font-bold text-text-primary mt-0.5">
                #{order._id.slice(-8).toUpperCase()}
              </p>
              <p className="text-xs text-text-muted dark:text-gray-400 mt-1">
                {new Date(order.createdAt).toLocaleDateString('vi-VN', {
                  day: '2-digit', month: '2-digit', year: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })}
              </p>
            </div>
            <motion.div
              key={order.status}
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`px-3 py-1.5 rounded-full text-xs font-bold ring-1 ${style.bg} ${style.text} ${style.ring}`}
            >
              {isCancelled ? t('orderStatusCancelled') : (STATUS_STEPS[currentStepIndex] ? t(STATUS_STEPS[currentStepIndex].labelKey) : order.status)}
            </motion.div>
          </div>

          {!isCancelled && (
            <div className="mt-7 flex items-start">
              {STATUS_STEPS.map((step, i) => {
                const Icon = step.icon;
                const done    = i <= currentStepIndex;
                const current = i === currentStepIndex;
                return (
                  <div key={step.key} className="flex-1 flex flex-col items-center relative">
                    {i < STATUS_STEPS.length - 1 && (
                      <div className="absolute top-4 left-1/2 w-full h-0.5 -z-0">
                        <div className={`h-full transition-all duration-700 ${
                          done && i < currentStepIndex ? 'bg-primary' : 'bg-surface-border dark:bg-gray-600'
                        }`} />
                      </div>
                    )}
                    <motion.div
                      key={`${step.key}-${current}`}
                      animate={current ? { scale: [1, 1.1, 1] } : {}}
                      transition={{ duration: 0.6, repeat: current ? Infinity : 0, repeatDelay: 2.5 }}
                      className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                        current  ? 'bg-primary border-primary text-white shadow-lg shadow-primary/40' :
                        done     ? 'bg-primary/15 border-primary text-primary' :
                        'bg-surface-border dark:bg-gray-700 border-surface-border dark:border-gray-600 text-text-muted/60 dark:text-gray-500'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </motion.div>
                    <p className={`text-[10px] font-semibold mt-2 text-center leading-tight ${
                      done ? 'text-primary' : 'text-text-muted dark:text-gray-500'
                    }`}>
                      {t(step.labelKey)}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          {isCancelled && (
            <div className="mt-4 flex items-center gap-2 text-red-500">
              <XCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-semibold">{t('orderCancelledMsg')}</span>
            </div>
          )}
        </div>

        {/* Items */}
        <div className="bg-bg-elevated dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-surface-border dark:border-gray-700">
          <h3 className="font-display font-bold text-base mb-4 dark:text-white">{t('products')}</h3>
          <div className="space-y-3">
            {order.items?.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-14 h-14 bg-surface-border dark:bg-gray-700 rounded-xl overflow-hidden flex-shrink-0 border border-surface-border dark:border-gray-600 p-1.5">
                  <img
                    src={item.product?.images?.[0]?.url}
                    alt={item.product?.name || item.name}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold line-clamp-1 dark:text-white">
                    {item.product?.name || item.name}
                  </p>
                  <p className="text-xs text-text-muted dark:text-gray-400">
                    {[item.size && `Size ${item.size}`, item.color].filter(Boolean).join(' · ')} · x{item.quantity}
                  </p>
                </div>
                <p className="text-sm font-bold text-text-primary flex-shrink-0">
                  {formatCurrency((item.price || 0) * item.quantity)}
                </p>
              </div>
            ))}
          </div>
          <div className="border-t border-surface-border dark:border-gray-700 mt-4 pt-4 flex items-center justify-between">
            <span className="text-sm font-semibold text-text-muted dark:text-gray-400">{t('total')}</span>
            <span className="text-lg font-bold text-primary">{formatCurrency(order.totalPrice)}</span>
          </div>
        </div>

        {/* Shipping */}
        {order.shippingAddress && (
          <div className="bg-bg-elevated dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-surface-border dark:border-gray-700">
            <h3 className="font-display font-bold text-base mb-3 dark:text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" /> {t('myAddresses')}
            </h3>
            <p className="text-sm font-semibold dark:text-white">{order.shippingAddress.fullName}</p>
            <p className="text-sm text-text-muted dark:text-gray-400 mt-0.5">{order.shippingAddress.phone}</p>
            <p className="text-sm text-text-muted dark:text-gray-400 mt-0.5">
              {[order.shippingAddress.address, order.shippingAddress.city, order.shippingAddress.country]
                .filter(Boolean).join(', ')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetail;
