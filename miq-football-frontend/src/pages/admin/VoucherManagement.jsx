import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Pencil, Trash2, X, Ticket, ToggleLeft, ToggleRight, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCoupons, createCoupon, updateCoupon, deleteCoupon,
} from '../../services/couponService.js';

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (n) => n?.toLocaleString('vi-VN') ?? '—';

const fmtDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const isExpired = (d) => d && new Date(d) < new Date();

const EMPTY_FORM = {
  code: '', type: 'percent', value: '', minOrder: '', maxDiscount: '',
  usageLimit: '', expiresAt: '', description: '', isActive: true,
};

// ── Form Modal ────────────────────────────────────────────────────────────────
const CouponModal = ({ initial, onClose, onSaved }) => {
  const isEdit = !!initial;
  const [form, setForm] = useState(() => {
    if (!initial) return EMPTY_FORM;
    return {
      code:         initial.code || '',
      type:         initial.type || 'percent',
      value:        initial.value ?? '',
      minOrder:     initial.minOrder || '',
      maxDiscount:  initial.maxDiscount || '',
      usageLimit:   initial.usageLimit || '',
      expiresAt:    initial.expiresAt ? initial.expiresAt.slice(0, 10) : '',
      description:  initial.description || '',
      isActive:     initial.isActive ?? true,
    };
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.code.trim()) e.code = 'Bắt buộc';
    if (!form.value || Number(form.value) <= 0) e.value = 'Phải > 0';
    if (form.type === 'percent' && Number(form.value) > 100) e.value = 'Phần trăm không quá 100';
    if (form.minOrder && Number(form.minOrder) < 0) e.minOrder = 'Phải >= 0';
    if (form.expiresAt && new Date(form.expiresAt) < new Date()) e.expiresAt = 'Ngày hết hạn phải trong tương lai';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    const payload = {
      code:        form.code.toUpperCase().trim(),
      type:        form.type,
      value:       Number(form.value),
      minOrder:    form.minOrder !== '' ? Number(form.minOrder) : 0,
      maxDiscount: form.maxDiscount !== '' ? Number(form.maxDiscount) : null,
      usageLimit:  form.usageLimit !== '' ? Number(form.usageLimit) : null,
      expiresAt:   form.expiresAt || null,
      description: form.description.trim(),
      isActive:    form.isActive,
    };
    try {
      const saved = isEdit
        ? await updateCoupon(initial._id, payload)
        : await createCoupon(payload);
      onSaved(saved);
    } catch (err) {
      toast.error(err.message || 'Lỗi lưu mã');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-bg-elevated rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-border">
          <h2 className="font-display font-black uppercase text-base">
            {isEdit ? 'Chỉnh sửa mã giảm giá' : 'Tạo mã giảm giá mới'}
          </h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-bg-raised">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Code */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1">Mã code *</label>
            <input
              value={form.code}
              onChange={(e) => set('code', e.target.value.toUpperCase())}
              disabled={isEdit}
              placeholder="VD: SALE10"
              className={`w-full px-3 py-2.5 rounded-xl border text-sm font-mono font-bold bg-bg-raised focus:outline-none focus:ring-2 focus:ring-primary/40 ${errors.code ? 'border-red-500' : 'border-surface-border'} ${isEdit ? 'opacity-60 cursor-not-allowed' : ''}`}
            />
            {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code}</p>}
          </div>

          {/* Type + Value */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1">Loại *</label>
              <select
                value={form.type}
                onChange={(e) => set('type', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-surface-border text-sm bg-bg-raised focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="percent">Phần trăm (%)</option>
                <option value="fixed">Số tiền cố định (₫)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1">
                Giá trị * {form.type === 'percent' ? '(%)' : '(₫)'}
              </label>
              <input
                type="number"
                min={0}
                max={form.type === 'percent' ? 100 : undefined}
                value={form.value}
                onChange={(e) => set('value', e.target.value)}
                placeholder={form.type === 'percent' ? '10' : '50000'}
                className={`w-full px-3 py-2.5 rounded-xl border text-sm bg-bg-raised focus:outline-none focus:ring-2 focus:ring-primary/40 ${errors.value ? 'border-red-500' : 'border-surface-border'}`}
              />
              {errors.value && <p className="text-red-500 text-xs mt-1">{errors.value}</p>}
            </div>
          </div>

          {/* Min Order + Max Discount */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1">Đơn tối thiểu (₫)</label>
              <input
                type="number" min={0} value={form.minOrder}
                onChange={(e) => set('minOrder', e.target.value)}
                placeholder="0 = không giới hạn"
                className="w-full px-3 py-2.5 rounded-xl border border-surface-border text-sm bg-bg-raised focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            {form.type === 'percent' && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1">Giảm tối đa (₫)</label>
                <input
                  type="number" min={0} value={form.maxDiscount}
                  onChange={(e) => set('maxDiscount', e.target.value)}
                  placeholder="Không giới hạn"
                  className="w-full px-3 py-2.5 rounded-xl border border-surface-border text-sm bg-bg-raised focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
            )}
          </div>

          {/* Usage limit + Expiry */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1">Số lần dùng tối đa</label>
              <input
                type="number" min={1} value={form.usageLimit}
                onChange={(e) => set('usageLimit', e.target.value)}
                placeholder="Không giới hạn"
                className="w-full px-3 py-2.5 rounded-xl border border-surface-border text-sm bg-bg-raised focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1">Hết hạn</label>
              <input
                type="date" value={form.expiresAt}
                onChange={(e) => set('expiresAt', e.target.value)}
                className={`w-full px-3 py-2.5 rounded-xl border text-sm bg-bg-raised focus:outline-none focus:ring-2 focus:ring-primary/40 ${errors.expiresAt ? 'border-red-500' : 'border-surface-border'}`}
              />
              {errors.expiresAt && <p className="text-red-500 text-xs mt-1">{errors.expiresAt}</p>}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1">Mô tả (hiển thị cho khách)</label>
            <input
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="VD: Giảm 10% cho đơn từ 500k"
              className="w-full px-3 py-2.5 rounded-xl border border-surface-border text-sm bg-bg-raised focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          {/* isActive */}
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => set('isActive', !form.isActive)}
              className={`w-11 h-6 rounded-full transition-colors ${form.isActive ? 'bg-primary' : 'bg-surface-border'} relative flex-shrink-0`}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.isActive ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </div>
            <span className="text-sm font-semibold">Kích hoạt ngay</span>
          </label>

          <div className="flex gap-3 pt-2">
            <button
              type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-surface-border text-sm font-semibold hover:bg-bg-raised transition"
            >
              Hủy
            </button>
            <button
              type="submit" disabled={submitting}
              className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {submitting && <Loader className="w-4 h-4 animate-spin" />}
              {isEdit ? 'Lưu thay đổi' : 'Tạo mã'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────
const VoucherManagement = () => {
  const qc = useQueryClient();
  const [modal, setModal]       = useState(null); // null | 'create' | coupon_object
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ['coupons-admin'],
    queryFn: getCoupons,
  });

  const toggleMut = useMutation({
    mutationFn: ({ id, isActive }) => updateCoupon(id, { isActive }),
    onSuccess: () => { qc.invalidateQueries(['coupons-admin']); toast.success('Đã cập nhật trạng thái'); },
    onError: (e) => toast.error(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: deleteCoupon,
    onSuccess: () => { qc.invalidateQueries(['coupons-admin']); toast.success('Đã xóa mã giảm giá'); setDeleteTarget(null); },
    onError: (e) => toast.error(e.message),
  });

  const handleSaved = () => {
    qc.invalidateQueries(['coupons-admin']);
    toast.success(modal && modal._id ? 'Đã cập nhật mã giảm giá' : 'Đã tạo mã giảm giá');
    setModal(null);
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-black text-2xl uppercase tracking-wide flex items-center gap-2">
            <Ticket className="w-6 h-6 text-primary" /> Mã giảm giá
          </h1>
          <p className="text-text-muted text-sm mt-0.5">{coupons.length} mã — server xác thực tất cả discount</p>
        </div>
        <button
          onClick={() => setModal('create')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90 transition"
        >
          <Plus className="w-4 h-4" /> Tạo mã mới
        </button>
      </div>

      {/* Table */}
      <div className="bg-bg-elevated rounded-2xl border border-surface-border overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-text-muted">
            <Loader className="w-6 h-6 animate-spin mr-2" /> Đang tải...
          </div>
        ) : coupons.length === 0 ? (
          <div className="text-center py-20 text-text-muted">
            <Ticket className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-semibold">Chưa có mã nào</p>
            <p className="text-sm">Tạo mã giảm giá đầu tiên cho shop</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-border bg-bg-raised">
                  {['Mã code', 'Loại / Giá trị', 'Đơn tối thiểu', 'Hết hạn', 'Lượt dùng', 'Trạng thái', 'Thao tác'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-text-muted whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {coupons.map((c) => {
                  const expired = isExpired(c.expiresAt);
                  return (
                    <tr key={c._id} className="hover:bg-bg-raised/50 transition">
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-mono font-black text-primary tracking-widest">{c.code}</span>
                          {c.description && <span className="text-text-muted text-xs truncate max-w-[180px]">{c.description}</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {c.type === 'percent' ? (
                          <div>
                            <span className="font-bold text-green-600 dark:text-green-400">{c.value}%</span>
                            {c.maxDiscount && <span className="text-text-muted text-xs ml-1">(tối đa {fmt(c.maxDiscount)}₫)</span>}
                          </div>
                        ) : (
                          <span className="font-bold text-green-600 dark:text-green-400">{fmt(c.value)}₫</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-text-muted whitespace-nowrap">
                        {c.minOrder ? `${fmt(c.minOrder)}₫` : 'Không yêu cầu'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {c.expiresAt ? (
                          <span className={expired ? 'text-red-500 font-semibold' : 'text-text-primary'}>
                            {fmtDate(c.expiresAt)}
                            {expired && ' (HH)'}
                          </span>
                        ) : (
                          <span className="text-text-muted">Không hết hạn</span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-text-muted">
                        {c.usedCount}
                        {c.usageLimit ? ` / ${c.usageLimit}` : ' / ∞'}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleMut.mutate({ id: c._id, isActive: !c.isActive })}
                          disabled={toggleMut.isPending}
                          className="flex items-center gap-1.5 text-xs font-semibold transition"
                        >
                          {c.isActive ? (
                            <><ToggleRight className="w-5 h-5 text-primary" /><span className="text-primary">Đang bật</span></>
                          ) : (
                            <><ToggleLeft className="w-5 h-5 text-text-muted" /><span className="text-text-muted">Đã tắt</span></>
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setModal(c)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-text-muted hover:bg-primary/10 hover:text-primary transition"
                            aria-label="Chỉnh sửa"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(c)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-text-muted hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition"
                            aria-label="Xóa"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit modal */}
      <AnimatePresence>
        {modal && (
          <CouponModal
            initial={modal === 'create' ? null : modal}
            onClose={() => setModal(null)}
            onSaved={handleSaved}
          />
        )}
      </AnimatePresence>

      {/* Delete confirm */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-bg-elevated rounded-2xl shadow-2xl p-6 max-w-sm w-full space-y-4"
            >
              <h3 className="font-display font-black text-base uppercase">Xóa mã giảm giá?</h3>
              <p className="text-text-muted text-sm">
                Mã <span className="font-mono font-bold text-primary">{deleteTarget.code}</span> sẽ bị xóa vĩnh viễn và không thể dùng tại checkout.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-surface-border text-sm font-semibold hover:bg-bg-raised transition"
                >
                  Hủy
                </button>
                <button
                  onClick={() => deleteMut.mutate(deleteTarget._id)}
                  disabled={deleteMut.isPending}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {deleteMut.isPending && <Loader className="w-4 h-4 animate-spin" />}
                  Xóa
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VoucherManagement;
