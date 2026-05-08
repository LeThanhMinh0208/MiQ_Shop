import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

const OrderSuccess = () => {
  const { state } = useLocation();
  const orderId = state?.orderId;

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl p-12 text-center max-w-md w-full border border-cream-200 shadow-pedestal"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="inline-block mb-6"
        >
          <CheckCircle2 className="w-24 h-24 text-primary mx-auto" />
        </motion.div>

        <h1 className="font-display text-3xl font-bold mb-3">ĐẶT HÀNG THÀNH CÔNG!</h1>
        <p className="text-ink-muted mb-2">Cảm ơn bạn đã mua sắm tại MiQ.</p>
        {orderId && (
          <p className="text-sm text-primary font-mono mb-6">
            Mã đơn: #{orderId.slice(-8).toUpperCase()}
          </p>
        )}

        <div className="flex gap-3">
          <Link to="/" className="btn-outline flex-1">Về trang chủ</Link>
          <Link to="/products" className="btn-primary flex-1">Tiếp tục mua sắm</Link>
        </div>
      </motion.div>
    </div>
  );
};

export default OrderSuccess;