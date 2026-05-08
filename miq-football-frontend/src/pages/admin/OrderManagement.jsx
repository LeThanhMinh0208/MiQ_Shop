import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminGetAllOrders, adminUpdateOrderStatus } from '../../services/adminService.js';
import { formatCurrency } from '../../utils/formatCurrency.js';

const STATUS_CONFIG = {
  pending: { label: 'Chờ xử lý', color: 'bg-amber-100 text-amber-700' },
  confirmed: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-700' },
  shipping: { label: 'Đang giao', color: 'bg-purple-100 text-purple-700' },
  delivered: { label: 'Đã giao', color: 'bg-emerald-100 text-emerald-700' },
  cancelled: { label: 'Đã huỷ', color: 'bg-red-100 text-red-700' },
};

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await adminGetAllOrders();
      setOrders(data.orders || []);
    } catch (error) {
      toast.error('Lỗi tải đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, status) => {
    try {
      await adminUpdateOrderStatus(orderId, status, `Cập nhật bởi admin`);
      toast.success('Cập nhật trạng thái thành công');
      loadOrders();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div>
      <h1 className="font-display text-3xl font-bold mb-2">Quản lý đơn hàng</h1>
      <p className="text-ink-muted mb-6">{orders.length} đơn hàng</p>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader className="w-10 h-10 text-primary animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 text-ink-muted bg-white rounded-2xl">
          Chưa có đơn hàng nào
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order, i) => (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl p-5 border border-cream-200"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-mono text-xs text-ink-muted">
                    #{order._id.slice(-8).toUpperCase()}
                  </p>
                  <p className="font-bold">{order.user?.name || 'Khách'}</p>
                  <p className="text-xs text-ink-muted">{order.user?.email}</p>
                </div>

                <div className="text-right">
                  <p className="font-display text-xl font-bold text-primary">
                    {formatCurrency(order.totalPrice)}
                  </p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-bold mt-1 ${
                      STATUS_CONFIG[order.status]?.color
                    }`}
                  >
                    {STATUS_CONFIG[order.status]?.label}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-cream-200">
                <div className="text-sm text-ink-muted">
                  {order.items.length} sản phẩm | {order.payment.method.toUpperCase()}
                  {order.payment.isPaid && <span className="text-primary ml-2">✓ Đã thanh toán</span>}
                </div>
                <select
                  value={order.status}
                  onChange={(e) => handleStatusChange(order._id, e.target.value)}
                  className="px-3 py-2 rounded-lg border border-cream-200 text-sm font-semibold focus:border-primary focus:outline-none"
                >
                  {Object.entries(STATUS_CONFIG).map(([key, { label }]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderManagement;