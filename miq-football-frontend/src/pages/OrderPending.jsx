import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, Package, RefreshCw, CheckCircle } from 'lucide-react';
import { fetchOrderById } from '../services/orderService.js';

/**
 * Landing page after a Stripe payment is submitted.
 *
 * Two arrival paths:
 *   1. stripe.confirmPayment with redirect:'if_required' completed in-place
 *      → navigate('/order-pending', { state: { orderId } })
 *   2. Stripe 3DS redirect back to return_url
 *      → /order-pending?orderId=xxx&redirect_status=succeeded
 *
 * The order's isPaid flag is set by the webhook, NOT by this page.
 * We poll GET /orders/:id every 3 s (max 30 attempts = 90 s) until
 * isPaid flips, then transition to a confirmed state.
 */

const POLL_INTERVAL_MS = 3000;
const POLL_MAX_ATTEMPTS = 30; // 90 s total

const OrderPending = () => {
  const { state }      = useLocation();
  const [searchParams] = useSearchParams();
  const navigate       = useNavigate();

  const orderId        = state?.orderId || searchParams.get('orderId');
  const redirectStatus = searchParams.get('redirect_status'); // 'succeeded' | 'failed' | null

  const [pollState, setPollState] = useState('polling'); // 'polling' | 'confirmed' | 'timeout'
  const attemptsRef = useRef(0);
  const timerRef    = useRef(null);

  useEffect(() => {
    if (!orderId) { navigate('/', { replace: true }); return; }

    // Don't poll on the failure branch
    const failed = redirectStatus && redirectStatus !== 'succeeded';
    if (failed) return;

    const poll = async () => {
      attemptsRef.current += 1;
      try {
        const order = await fetchOrderById(orderId);
        if (order?.payment?.isPaid) {
          setPollState('confirmed');
          return; // stop
        }
      } catch {
        // auth error / network blip — keep polling
      }

      if (attemptsRef.current >= POLL_MAX_ATTEMPTS) {
        setPollState('timeout');
        return;
      }
      timerRef.current = setTimeout(poll, POLL_INTERVAL_MS);
    };

    timerRef.current = setTimeout(poll, POLL_INTERVAL_MS);
    return () => clearTimeout(timerRef.current);
  }, [orderId, redirectStatus, navigate]);

  if (!orderId) return null;

  const failed = redirectStatus && redirectStatus !== 'succeeded';

  // ── Confirmed ─────────────────────────────────────────────────────────────
  if (pollState === 'confirmed') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-bg-elevated rounded-3xl p-12 text-center max-w-md w-full border border-surface-border"
        >
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: 'spring' }}
            className="inline-block mb-6"
          >
            <CheckCircle className="w-24 h-24 text-primary mx-auto" />
          </motion.div>
          <h1 className="font-display text-3xl font-bold mb-3 text-primary">Đặt hàng thành công!</h1>
          <p className="text-text-muted mb-4">
            Thanh toán đã được xác nhận. Bạn sẽ nhận được email xác nhận sớm.
          </p>
          {orderId && (
            <p className="text-sm text-primary font-mono mb-6">
              Mã đơn hàng #{orderId.slice(-8).toUpperCase()}
            </p>
          )}
          <div className="flex flex-col gap-3">
            <Link
              to="/profile" state={{ tab: 'orders' }}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <Package className="w-4 h-4" />
              Xem đơn hàng của tôi
            </Link>
            <div className="flex gap-3">
              <Link to="/" className="btn-outline flex-1">Trang chủ</Link>
              <Link to="/products" className="btn-outline flex-1">Tiếp tục mua sắm</Link>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Payment failed ────────────────────────────────────────────────────────
  if (failed) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-bg-elevated rounded-3xl p-12 text-center max-w-md w-full border border-surface-border"
        >
          <div className="text-5xl mb-6">❌</div>
          <h1 className="font-display text-2xl font-bold text-red-400 mb-3">Thanh toán thất bại</h1>
          <p className="text-text-muted mb-3">
            Giao dịch không hoàn thành. Vui lòng thử lại hoặc chọn phương thức thanh toán khác.
          </p>
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3 mb-6 text-left">
            <p className="text-amber-400 text-xs font-semibold">
              Nếu tiền đã bị trừ, đơn hàng sẽ tự động được xác nhận qua webhook — vui lòng không thanh toán lại. Đơn hàng sẽ tự cập nhật.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Link to="/checkout" className="btn-primary w-full flex items-center justify-center gap-2">
              Thử lại
            </Link>
            <Link
              to="/profile"
              state={{ tab: 'orders' }}
              className="btn-outline w-full flex items-center justify-center gap-2"
            >
              <Package className="w-4 h-4" />
              Xem đơn hàng của tôi
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Polling / timeout ─────────────────────────────────────────────────────
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-bg-elevated rounded-3xl p-12 text-center max-w-md w-full border border-surface-border shadow-pedestal"
      >
        {pollState === 'timeout' ? (
          <>
            <div className="text-5xl mb-6">⏳</div>
            <h1 className="font-display text-2xl font-bold mb-3">Đang chờ xác nhận</h1>
            <p className="text-text-muted mb-3">
              Thanh toán đang được xử lý. Kiểm tra email của bạn để xác nhận đơn hàng.
            </p>
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3 mb-4 text-left">
              <p className="text-amber-400 text-xs font-semibold">
                Thanh toán của bạn đang được xác nhận — vui lòng không thanh toán lại. Đơn hàng sẽ tự cập nhật.
              </p>
            </div>
            {orderId && (
              <p className="text-sm text-primary font-mono mb-6">
                Mã đơn hàng #{orderId.slice(-8).toUpperCase()}
              </p>
            )}
            <div className="flex flex-col gap-3">
              <Link
                to="/profile" state={{ tab: 'orders' }}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <Package className="w-4 h-4" />
                Xem đơn hàng của tôi
              </Link>
              <Link to="/" className="btn-outline w-full">Trang chủ</Link>
            </div>
          </>
        ) : (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="inline-block mb-6"
            >
              <div className="relative">
                <Clock className="w-24 h-24 text-primary mx-auto" />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <RefreshCw className="w-8 h-8 text-primary/40" />
                </motion.div>
              </div>
            </motion.div>

            <h1 className="font-display text-3xl font-bold mb-3">Đang xử lý thanh toán</h1>
            <p className="text-text-muted mb-2">
              Thanh toán của bạn đang được xác nhận — vui lòng không thanh toán lại. Đơn hàng sẽ tự cập nhật.
            </p>
            <p className="text-text-muted text-sm mb-4">
              Trang sẽ tự động cập nhật khi thanh toán hoàn tất.
            </p>

            {orderId && (
              <p className="text-sm text-primary font-mono mb-6">
                Mã đơn hàng #{orderId.slice(-8).toUpperCase()}
              </p>
            )}

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
                <Link to="/" className="btn-outline flex-1">Trang chủ</Link>
                <Link to="/products" className="btn-outline flex-1">Tiếp tục mua sắm</Link>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default OrderPending;
