import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Truck, CreditCard, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCartStore } from '../store/cartStore.js';
import { useAuthStore } from '../store/authStore.js';
import { formatCurrency } from '../utils/formatCurrency.js';
import AddressForm from '../components/checkout/AddressForm.jsx';
import { createOrder, createPaymentIntent, markOrderPaid } from '../services/orderService.js';

const Checkout = () => {
  const navigate = useNavigate();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod'); // cod hoặc stripe
  const [address, setAddress] = useState({
    fullName: '',
    phone: '',
    street: '',
    ward: '',
    district: '',
    city: '',
  });
  const [notes, setNotes] = useState('');

  const subtotal = getTotalPrice();
  const shipping = subtotal >= 500000 ? 0 : 30000;
  const total = subtotal + shipping;

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để đặt hàng');
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      // 1. Tạo đơn hàng
      const orderData = {
        items: items.map((i) => ({
          product: i.productId,
          name: i.name,
          image: i.image,
          price: i.price,
          size: i.size,
          quantity: i.quantity,
        })),
        shippingAddress: address,
        paymentMethod,
        notes,
      };
      const order = await createOrder(orderData);

      // 2. Nếu chọn Stripe → tạo payment intent (giả lập)
      if (paymentMethod === 'stripe') {
        await createPaymentIntent(order._id);
        // Giả lập thanh toán thành công ngay (vì là test mode)
        await markOrderPaid(order._id);
        toast.success('Thanh toán Stripe thành công!');
      } else {
        toast.success('Đặt hàng COD thành công!');
      }

      clearCart();
      navigate('/order-success', { state: { orderId: order._id } });
    } catch (error) {
      toast.error(error.message || 'Đặt hàng thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream py-8">
      <div className="max-w-6xl mx-auto px-6">
        <h1 className="font-display text-4xl font-bold mb-8">THANH TOÁN</h1>

        <form onSubmit={handleSubmit} className="grid lg:grid-cols-[1fr_400px] gap-6">
          {/* LEFT: Form */}
          <div className="space-y-6">
            {/* Shipping Address */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-6 border border-cream-200"
            >
              <div className="flex items-center gap-2 mb-4">
                <Truck className="w-5 h-5 text-primary" />
                <h2 className="font-display text-xl font-bold">ĐỊA CHỈ GIAO HÀNG</h2>
              </div>
              <AddressForm data={address} onChange={setAddress} />
              <textarea
                placeholder="Ghi chú (tuỳ chọn)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full mt-3 px-4 py-3 rounded-lg border border-cream-200 focus:border-primary focus:outline-none resize-none"
              />
            </motion.div>

            {/* Payment Method */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-6 border border-cream-200"
            >
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-primary" />
                <h2 className="font-display text-xl font-bold">PHƯƠNG THỨC THANH TOÁN</h2>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* COD */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-4 rounded-xl border-2 transition text-left ${
                    paymentMethod === 'cod'
                      ? 'border-primary bg-emerald-50'
                      : 'border-cream-200 hover:border-primary/50'
                  }`}
                >
                  <div className="font-bold mb-1">COD</div>
                  <div className="text-xs text-ink-muted">Thanh toán khi nhận hàng</div>
                </button>

                {/* Stripe */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('stripe')}
                  className={`p-4 rounded-xl border-2 transition text-left ${
                    paymentMethod === 'stripe'
                      ? 'border-primary bg-emerald-50'
                      : 'border-cream-200 hover:border-primary/50'
                  }`}
                >
                  <div className="font-bold mb-1">Thẻ tín dụng</div>
                  <div className="text-xs text-ink-muted">Stripe (test mode)</div>
                </button>
              </div>

              {paymentMethod === 'stripe' && (
                <div className="mt-4 p-4 bg-cream rounded-lg text-sm text-ink-muted">
                  💳 Đây là chế độ test - thanh toán sẽ tự động được duyệt thành công.
                </div>
              )}
            </motion.div>
          </div>

          {/* RIGHT: Summary */}
          <aside className="bg-white rounded-2xl p-6 h-fit sticky top-24 border border-cream-200">
            <h2 className="font-display text-xl font-bold mb-4">ĐƠN HÀNG ({items.length})</h2>

            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
              {items.map((item) => (
                <div key={`${item.productId}-${item.size}`} className="flex gap-3">
                  <div className="w-14 h-14 bg-cream rounded-lg p-1 flex-shrink-0">
                    <img src={item.image} alt="" className="w-full h-full object-contain" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold line-clamp-1">{item.name}</p>
                    <p className="text-xs text-ink-muted">Size {item.size} × {item.quantity}</p>
                    <p className="text-sm font-bold">{formatCurrency(item.price * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2 py-4 border-y border-cream-200 text-sm">
              <div className="flex justify-between">
                <span className="text-ink-muted">Tạm tính</span>
                <span className="font-bold">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Vận chuyển</span>
                <span className="font-bold">
                  {shipping === 0 ? 'Miễn phí' : formatCurrency(shipping)}
                </span>
              </div>
            </div>

            <div className="flex justify-between mt-4 mb-6">
              <span className="font-bold">TỔNG CỘNG</span>
              <span className="text-2xl font-bold text-primary">{formatCurrency(total)}</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader className="w-5 h-5 animate-spin" /> : 'ĐẶT HÀNG'}
            </button>
          </aside>
        </form>
      </div>
    </div>
  );
};

export default Checkout;