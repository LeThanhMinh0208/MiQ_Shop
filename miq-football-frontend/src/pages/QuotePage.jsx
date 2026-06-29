import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Users, ArrowLeft, Send, Phone } from 'lucide-react';
import { submitQuote } from '../services/quoteService.js';
import toast from 'react-hot-toast';

const REQUEST_TYPES = [
  { id: 'in_ao',     name: 'In áo đội bóng' },
  { id: 'combo_doi', name: 'Combo đội bóng' },
  { id: 'mua_si',   name: 'Mua sỉ số lượng lớn' },
  { id: 'khac',     name: 'Khác' },
];

const INITIAL = {
  teamName:    '',
  contactName: '',
  phone:       '',
  email:       '',
  requestType: '',
  quantity:    '',
  note:        '',
};

const QuotePage = () => {
  const [params] = useSearchParams();
  const [form, setForm] = useState({
    ...INITIAL,
    requestType: params.get('package') || '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await submitQuote({
        teamName:    form.teamName,
        name:        form.contactName,
        phone:       form.phone,
        email:       form.email,
        requestType: form.requestType,
        quantity:    Number(form.quantity) || 1,
        note:        form.note,
      });
      setSubmitted(true);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'w-full bg-surface border border-surface-border rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition text-sm';
  const labelCls = 'block text-xs font-bold uppercase tracking-widest text-text-muted mb-1.5';

  if (submitted) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-primary" />
          </div>
          <h2 className="font-display text-3xl font-bold text-text-primary mb-3">Đã nhận yêu cầu!</h2>
          <p className="text-text-secondary text-base mb-2">
            Cảm ơn <strong className="text-text-primary">{form.teamName || form.contactName}</strong>! Đội ngũ MiQ sẽ liên hệ trong vòng <strong className="text-primary">24 giờ</strong>.
          </p>
          <p className="text-text-muted text-sm mb-8">Kiểm tra email / điện thoại để nhận báo giá chi tiết.</p>
          <div className="flex gap-3 justify-center">
            <Link
              to="/"
              className="flex items-center gap-2 border-2 border-surface-border text-text-primary font-bold px-6 py-3 rounded-xl hover:border-primary hover:text-primary transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Trang chủ
            </Link>
            <Link
              to="/products"
              className="flex items-center gap-2 bg-primary text-white font-bold px-6 py-3 rounded-xl hover:shadow-neon transition"
            >
              Xem sản phẩm
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-base py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">

        {/* Back link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-text-muted hover:text-primary text-sm font-semibold mb-8 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-[0.22em] px-3.5 py-1.5 rounded-full mb-4">
            <Users className="w-3 h-3" />
            Báo Giá Đội Bóng
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-text-primary mb-3">
            NHẬN BÁO GIÁ
          </h1>
          <p className="text-text-secondary">
            Điền thông tin bên dưới — đội ngũ MiQ sẽ liên hệ trong 24h với báo giá tốt nhất cho đội bạn.
          </p>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="space-y-5 bg-surface border border-surface-border rounded-3xl p-7 shadow-[0_8px_40px_rgba(0,0,0,0.3)]"
        >
          {/* Team name */}
          <div>
            <label className={labelCls}>Tên đội bóng</label>
            <input
              value={form.teamName}
              onChange={set('teamName')}
              placeholder="VD: FC Thống Nhất"
              className={inputCls}
            />
          </div>

          {/* Contact + phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Người liên hệ *</label>
              <input
                required
                value={form.contactName}
                onChange={set('contactName')}
                placeholder="Họ và tên"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Số điện thoại *</label>
              <input
                required
                type="tel"
                value={form.phone}
                onChange={set('phone')}
                placeholder="0912 345 678"
                className={inputCls}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className={labelCls}>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={set('email')}
              placeholder="email@example.com"
              className={inputCls}
            />
          </div>

          {/* Request type + quantity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Loại yêu cầu *</label>
              <select required value={form.requestType} onChange={set('requestType')} className={inputCls}>
                <option value="">-- Chọn loại --</option>
                {REQUEST_TYPES.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Số lượng *</label>
              <input
                required
                type="number"
                min="1"
                max="9999"
                value={form.quantity}
                onChange={set('quantity')}
                placeholder="VD: 18"
                className={inputCls}
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className={labelCls}>Yêu cầu thêm</label>
            <textarea
              rows={3}
              value={form.note}
              onChange={set('note')}
              placeholder="Màu sắc, thiết kế áo, thời gian cần giao, v.v."
              className={`${inputCls} resize-none`}
            />
          </div>

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold uppercase tracking-wider py-4 rounded-2xl hover:shadow-neon transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4" />
                Gửi yêu cầu báo giá
              </>
            )}
          </motion.button>
        </motion.form>

        {/* Direct contact */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 flex items-center justify-center gap-3 text-sm text-text-muted"
        >
          <Phone className="w-4 h-4 text-primary flex-shrink-0" />
          Hoặc gọi ngay:{' '}
          <a href="tel:0123456789" className="font-bold text-primary hover:underline">
            0123.456.789
          </a>
        </motion.div>
      </div>
    </div>
  );
};

export default QuotePage;
