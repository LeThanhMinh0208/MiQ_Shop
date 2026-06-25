import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shirt, ChevronLeft, Loader, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore.js';
import { useLanguageStore } from '../store/languageStore.js';
import { createPrintOrder } from '../services/printOrderService.js';

const JERSEY_TYPES = [
  { value: 'club', labelKey: 'jerseyDesignClub' },
  { value: 'national', labelKey: 'jerseyDesignNational' },
  { value: 'custom', labelKey: 'jerseyDesignCustom' },
];

const FONT_OPTIONS = ['BLOCK', 'BOLD', 'ITALIC', 'RETRO', 'SLIM'];

const COLOR_OPTIONS = [
  { label: 'Đỏ', value: '#DC2626' },
  { label: 'Xanh lá', value: '#16A34A' },
  { label: 'Xanh dương', value: '#2563EB' },
  { label: 'Vàng', value: '#CA8A04' },
  { label: 'Trắng', value: '#F9FAFB' },
  { label: 'Đen', value: '#111827' },
  { label: 'Tím', value: '#7C3AED' },
  { label: 'Cam', value: '#EA580C' },
];

const EMPTY_FORM = {
  jerseyType: 'club',
  playerName: '',
  playerNumber: '',
  font: 'BLOCK',
  quantity: 1,
  color: '#DC2626',
  logoUrl: '',
  notes: '',
  contactPhone: '',
  deliveryAddress: '',
};

const JerseyPrintPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const t = useLanguageStore((s) => s.t);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading]   = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Auto-fill contact info from user profile
  useEffect(() => {
    if (!user) return;
    const defaultAddr = user.addresses?.find((a) => a.isDefault) || user.addresses?.[0];
    setForm((f) => ({
      ...f,
      contactPhone:    f.contactPhone    || defaultAddr?.phone || '',
      deliveryAddress: f.deliveryAddress || (defaultAddr
        ? [defaultAddr.street, defaultAddr.ward, defaultAddr.district, defaultAddr.city].filter(Boolean).join(', ')
        : ''),
    }));
  }, [user]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để đặt in áo');
      navigate('/login');
      return;
    }
    if (!form.contactPhone.trim()) {
      toast.error('Vui lòng nhập số điện thoại liên hệ');
      return;
    }
    if (!form.deliveryAddress.trim()) {
      toast.error('Vui lòng nhập địa chỉ giao hàng');
      return;
    }

    setLoading(true);
    try {
      await createPrintOrder({
        ...form,
        quantity: Number(form.quantity) || 1,
      });
      setSubmitted(true);
      toast.success(t('jerseySuccess'));
    } catch (err) {
      toast.error(err.message || 'Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-bg-raised flex items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-bg-elevated rounded-3xl border border-surface-border p-10 max-w-md w-full text-center shadow-depth-lg"
        >
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-primary" />
          </div>
          <h2 className="font-display text-3xl font-bold mb-3">ĐẶT HÀNG THÀNH CÔNG!</h2>
          <p className="text-text-muted mb-6">{t('jerseySuccess')}</p>
          <div className="flex gap-3">
            <button onClick={() => navigate('/')} className="btn-outline flex-1">Về trang chủ</button>
            <button onClick={() => { setSubmitted(false); setForm(EMPTY_FORM); }} className="btn-primary flex-1">Đặt thêm</button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-raised py-8">
      <div className="max-w-3xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-text-muted hover:text-primary transition mb-4 text-sm font-medium">
            <ChevronLeft className="w-4 h-4" />
            Quay lại
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Shirt className="w-5 h-5 text-primary" />
            </div>
            <span className="text-primary text-xs font-bold uppercase tracking-widest">{t('jerseyPrintBadge')}</span>
          </div>
          <h1 className="font-display text-4xl font-bold text-text-primary">{t('jerseyPrintTitle')}</h1>
          <p className="text-text-muted mt-2">Điền thông tin bên dưới, chúng tôi sẽ liên hệ xác nhận trong vòng 24h.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Jersey Type */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-bg-elevated rounded-2xl border border-surface-border p-6"
          >
            <h3 className="font-display font-bold text-lg mb-4">{t('jerseyType')}</h3>
            <div className="flex gap-3 flex-wrap">
              {JERSEY_TYPES.map((jt) => (
                <button
                  key={jt.value}
                  type="button"
                  onClick={() => set('jerseyType', jt.value)}
                  className={`px-5 py-2.5 rounded-xl border-2 font-semibold text-sm transition ${
                    form.jerseyType === jt.value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-surface-border text-text-primary hover:border-primary/40'
                  }`}
                >
                  {t(jt.labelKey)}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Player info */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-bg-elevated rounded-2xl border border-surface-border p-6"
          >
            <h3 className="font-display font-bold text-lg mb-4">Thông tin in ấn</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-text-muted mb-1.5">{t('jerseyName')}</label>
                <input
                  value={form.playerName}
                  onChange={(e) => set('playerName', e.target.value.toUpperCase())}
                  placeholder="VD: NGUYEN VAN A"
                  className="w-full px-4 py-3 rounded-xl border border-surface-border bg-bg-raised text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 font-bold tracking-wider"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-text-muted mb-1.5">{t('jerseyNumber')}</label>
                <input
                  type="number"
                  min="1"
                  max="99"
                  value={form.playerNumber}
                  onChange={(e) => set('playerNumber', e.target.value)}
                  placeholder="VD: 10"
                  className="w-full px-4 py-3 rounded-xl border border-surface-border bg-bg-raised text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 font-bold text-2xl text-center"
                />
              </div>
            </div>

            {/* Font */}
            <div className="mt-4">
              <label className="block text-xs font-bold uppercase tracking-wide text-text-muted mb-2">{t('jerseyFont')}</label>
              <div className="flex gap-2 flex-wrap">
                {FONT_OPTIONS.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => set('font', f)}
                    className={`px-4 py-2 rounded-lg border-2 text-sm font-bold uppercase tracking-wider transition ${
                      form.font === f
                        ? 'border-primary bg-primary text-white'
                        : 'border-surface-border text-text-primary hover:border-primary/40'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Color + Quantity */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-bg-elevated rounded-2xl border border-surface-border p-6"
          >
            <h3 className="font-display font-bold text-lg mb-4">Màu sắc & Số lượng</h3>
            <div className="grid sm:grid-cols-2 gap-6">
              {/* Color */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-text-muted mb-2">{t('jerseyColor')}</label>
                <div className="flex gap-2 flex-wrap">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => set('color', c.value)}
                      title={c.label}
                      className={`w-9 h-9 rounded-full border-4 transition ${
                        form.color === c.value ? 'border-primary scale-110 shadow-lg' : 'border-surface-border hover:scale-105'
                      }`}
                      style={{ backgroundColor: c.value }}
                    />
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-text-muted mb-2">{t('jerseyQuantity')}</label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => set('quantity', Math.max(1, form.quantity - 1))}
                    className="w-10 h-10 rounded-xl border-2 border-surface-border text-text-primary hover:border-primary transition font-bold text-lg"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={form.quantity}
                    onChange={(e) => set('quantity', Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 text-center px-3 py-2 rounded-xl border-2 border-surface-border bg-bg-raised text-text-primary focus:border-primary focus:outline-none font-bold text-lg"
                  />
                  <button
                    type="button"
                    onClick={() => set('quantity', form.quantity + 1)}
                    className="w-10 h-10 rounded-xl border-2 border-surface-border text-text-primary hover:border-primary transition font-bold text-lg"
                  >
                    +
                  </button>
                </div>
                {form.quantity >= 10 && (
                  <p className="text-xs text-primary mt-1.5 font-medium">Giảm 10% cho đơn từ 10 áo!</p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Extra info */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-bg-elevated rounded-2xl border border-surface-border p-6 space-y-4"
          >
            <h3 className="font-display font-bold text-lg">{t('jerseyNotes')} & Liên hệ</h3>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-text-muted mb-1.5">{t('jerseyLogoUrl')}</label>
              <input
                value={form.logoUrl}
                onChange={(e) => set('logoUrl', e.target.value)}
                placeholder="https://..."
                type="url"
                className="w-full px-4 py-3 rounded-xl border border-surface-border bg-bg-raised text-text-primary focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-text-muted mb-1.5">{t('jerseyNotes')}</label>
              <textarea
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
                rows={3}
                placeholder="Ghi chú thêm về thiết kế, yêu cầu đặc biệt..."
                className="w-full px-4 py-3 rounded-xl border border-surface-border bg-bg-raised text-text-primary focus:border-primary focus:outline-none resize-none"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-text-muted mb-1.5">
                  {t('jerseyContactPhone')} <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  value={form.contactPhone}
                  onChange={(e) => set('contactPhone', e.target.value)}
                  placeholder="0900 000 000"
                  type="tel"
                  className="w-full px-4 py-3 rounded-xl border border-surface-border bg-bg-raised text-text-primary focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-text-muted mb-1.5">
                  {t('jerseyDeliveryAddr')} <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  value={form.deliveryAddress}
                  onChange={(e) => set('deliveryAddress', e.target.value)}
                  placeholder="Số nhà, đường, quận, tỉnh..."
                  className="w-full px-4 py-3 rounded-xl border border-surface-border bg-bg-raised text-text-primary focus:border-primary focus:outline-none"
                />
              </div>
            </div>
          </motion.div>

          {/* Price estimate */}
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">Báo giá tham khảo</p>
              <p className="font-display text-2xl font-bold text-text-primary">
                {form.quantity >= 10
                  ? `${new Intl.NumberFormat('vi-VN').format(Math.round(120000 * 0.9))}đ`
                  : '120.000đ'} / áo
              </p>
              <p className="text-xs text-text-muted mt-0.5">
                × {form.quantity} áo = <span className="font-bold text-primary">
                  {new Intl.NumberFormat('vi-VN').format(Math.round(120000 * (form.quantity >= 10 ? 0.9 : 1) * form.quantity))}đ
                </span>
                {form.quantity >= 10 && <span className="ml-1 text-primary">(đã giảm 10%)</span>}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-text-muted">Giá có thể thay đổi</p>
              <p className="text-xs text-text-muted">theo yêu cầu thiết kế</p>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full !py-4 !text-base flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? <Loader className="w-5 h-5 animate-spin" /> : <Shirt className="w-5 h-5" />}
            {loading ? 'Đang gửi...' : t('jerseySubmit')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default JerseyPrintPage;
