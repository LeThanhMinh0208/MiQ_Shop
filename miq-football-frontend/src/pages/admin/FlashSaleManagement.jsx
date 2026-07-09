import { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Pencil, X, Zap, ToggleLeft, ToggleRight, Loader, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAdminFlashSaleProducts, setProductFlashSale, fetchProducts,
} from '../../services/productService.js';

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (n) => n != null ? n.toLocaleString('vi-VN') + '₫' : '—';
const fmtDT = (d) => d
  ? new Date(d).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  : 'Không giới hạn';
const toLocalDT = (d) => d ? new Date(new Date(d).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : '';
const pct = (price, sale) => price > 0 ? Math.round((1 - sale / price) * 100) : 0;

const saleStatus = (p) => {
  if (!p.flashSale?.active) return 'inactive';
  if (!p.flashSale?.endAt) return 'active';
  return new Date(p.flashSale.endAt) > new Date() ? 'active' : 'expired';
};

const StatusBadge = ({ p }) => {
  const s = saleStatus(p);
  if (s === 'active') return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Đang chạy</span>;
  if (s === 'expired') return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">Hết hạn</span>;
  return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-surface-border text-text-muted">Tạm dừng</span>;
};

// ── Overlay ───────────────────────────────────────────────────────────────────
const Overlay = ({ onClose, children }) => (
  <motion.div
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
    onClick={onClose}
  >
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="w-full max-w-md bg-bg-elevated rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </motion.div>
  </motion.div>
);

// ── Flash Sale Form (shared between Add and Edit) ─────────────────────────────
const SaleForm = ({ product, initial, onSubmit, onCancel, submitting }) => {
  const [form, setForm] = useState({
    salePrice: initial?.salePrice ?? '',
    endAt:     toLocalDT(initial?.flashSale?.endAt),
    totalLimit: initial?.flashSale?.totalLimit ?? 100,
    active:    initial?.flashSale?.active ?? true,
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const discount = form.salePrice && product?.price ? pct(product.price, Number(form.salePrice)) : 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.salePrice || Number(form.salePrice) <= 0) { toast.error('Giá sale phải > 0'); return; }
    if (Number(form.salePrice) >= product.price) { toast.error('Giá sale phải nhỏ hơn giá gốc'); return; }
    onSubmit({
      salePrice: Number(form.salePrice),
      flashSale: {
        active:     form.active,
        endAt:      form.endAt || null,
        totalLimit: Number(form.totalLimit) || 100,
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Product info */}
      <div className="flex items-center gap-3 p-3 bg-bg-raised rounded-xl">
        {product.images?.[0]?.url && (
          <img src={product.images[0].url} alt={product.name} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
        )}
        <div className="min-w-0">
          <p className="font-semibold text-sm text-text-primary truncate">{product.name}</p>
          <p className="text-xs text-text-muted">{product.brand} · Giá gốc: {fmt(product.price)}</p>
        </div>
      </div>

      {/* salePrice */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1.5">
          Giá sale <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type="number"
            min={1}
            value={form.salePrice}
            onChange={(e) => set('salePrice', e.target.value)}
            placeholder="VD: 450000"
            className="w-full px-3 py-2 rounded-xl border border-surface-border bg-bg-base text-sm focus:outline-none focus:border-primary"
          />
          {discount > 0 && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-green-600 dark:text-green-400">
              −{discount}%
            </span>
          )}
        </div>
      </div>

      {/* endAt */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1.5">Ngày kết thúc</label>
        <input
          type="datetime-local"
          value={form.endAt}
          onChange={(e) => set('endAt', e.target.value)}
          className="w-full px-3 py-2 rounded-xl border border-surface-border bg-bg-base text-sm focus:outline-none focus:border-primary"
        />
        <p className="text-xs text-text-muted mt-1">Để trống = không giới hạn thời gian</p>
      </div>

      {/* totalLimit */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1.5">Giới hạn số lượng bán</label>
        <input
          type="number"
          min={1}
          value={form.totalLimit}
          onChange={(e) => set('totalLimit', e.target.value)}
          className="w-full px-3 py-2 rounded-xl border border-surface-border bg-bg-base text-sm focus:outline-none focus:border-primary"
        />
      </div>

      {/* active toggle */}
      <div className="flex items-center justify-between p-3 bg-bg-raised rounded-xl">
        <div>
          <p className="text-sm font-medium text-text-primary">Kích hoạt ngay</p>
          <p className="text-xs text-text-muted">Hiển thị trên trang Flash Sale</p>
        </div>
        <button type="button" onClick={() => set('active', !form.active)}>
          {form.active
            ? <ToggleRight className="w-8 h-8 text-primary" />
            : <ToggleLeft  className="w-8 h-8 text-text-muted" />}
        </button>
      </div>

      {/* Buttons */}
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl border border-surface-border text-sm font-semibold text-text-primary hover:bg-bg-raised transition"
        >
          {initial ? 'Hủy' : '← Quay lại'}
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {submitting ? <Loader className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
          Lưu
        </button>
      </div>
    </form>
  );
};

// ── Add Modal ─────────────────────────────────────────────────────────────────
const AddModal = ({ existingIds, onSaved, onClose }) => {
  const [search, setSearch]     = useState('');
  const [selected, setSelected] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { data: result } = useQuery({
    queryKey: ['products-picker'],
    queryFn:  () => fetchProducts({ limit: 100 }),
    staleTime: 60_000,
  });
  const allProducts = result?.products ?? [];

  const filtered = useMemo(() =>
    allProducts.filter((p) =>
      !existingIds.has(String(p._id)) &&
      (!search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.brand || '').toLowerCase().includes(search.toLowerCase()))
    ),
    [allProducts, existingIds, search]
  );

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    try {
      await onSaved(selected._id, formData);
      toast.success('Đã thêm vào flash sale');
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Lỗi thêm sản phẩm');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Overlay onClose={onClose}>
      <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-surface-border">
        <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
          <Zap className="w-4 h-4 text-orange-500" />
          {selected ? 'Cài đặt Flash Sale' : 'Thêm sản phẩm'}
        </h2>
        <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-bg-raised text-text-muted hover:text-text-primary transition">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-5">
        {!selected ? (
          <>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                autoFocus
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm theo tên hoặc thương hiệu..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-surface-border bg-bg-base text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div className="space-y-1 max-h-80 overflow-y-auto">
              {filtered.length === 0 && (
                <p className="text-center text-sm text-text-muted py-8">
                  {search ? 'Không tìm thấy sản phẩm phù hợp' : 'Tất cả sản phẩm đã trong flash sale'}
                </p>
              )}
              {filtered.map((p) => (
                <button
                  key={p._id}
                  onClick={() => setSelected(p)}
                  className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-bg-raised transition text-left"
                >
                  {p.images?.[0]?.url
                    ? <img src={p.images[0].url} alt={p.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                    : <div className="w-10 h-10 rounded-lg bg-bg-raised flex-shrink-0" />}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-text-primary truncate">{p.name}</p>
                    <p className="text-xs text-text-muted">{p.brand} · {fmt(p.price)}</p>
                  </div>
                </button>
              ))}
            </div>
          </>
        ) : (
          <SaleForm
            product={selected}
            initial={null}
            onSubmit={handleSubmit}
            onCancel={() => setSelected(null)}
            submitting={submitting}
          />
        )}
      </div>
    </Overlay>
  );
};

// ── Edit Modal ────────────────────────────────────────────────────────────────
const EditModal = ({ product, onSaved, onClose }) => {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    try {
      await onSaved(product._id, formData);
      toast.success('Đã cập nhật flash sale');
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Lỗi cập nhật');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Overlay onClose={onClose}>
      <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-surface-border">
        <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
          <Pencil className="w-4 h-4 text-primary" />
          Chỉnh sửa Flash Sale
        </h2>
        <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-bg-raised text-text-muted hover:text-text-primary transition">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="p-5">
        <SaleForm
          product={product}
          initial={product}
          onSubmit={handleSubmit}
          onCancel={onClose}
          submitting={submitting}
        />
      </div>
    </Overlay>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const FlashSaleManagement = () => {
  const qc = useQueryClient();
  const [modal,    setModal]    = useState(null); // { type: 'add' } | { type: 'edit', product }
  const [removeId, setRemoveId] = useState(null);

  const { data: flashProducts = [], isLoading } = useQuery({
    queryKey: ['admin-flash-sale'],
    queryFn:  getAdminFlashSaleProducts,
  });

  const saveMutation = useMutation({
    mutationFn: ({ id, data }) => setProductFlashSale(id, data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['admin-flash-sale'] }),
  });

  const removeMutation = useMutation({
    mutationFn: (id) => setProductFlashSale(id, {
      salePrice: null,
      flashSale: { active: false, endAt: null, totalLimit: 100 },
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-flash-sale'] });
      toast.success('Đã xóa khỏi flash sale');
      setRemoveId(null);
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Lỗi'),
  });

  const handleToggle = (p) => {
    const active = !p.flashSale?.active;
    saveMutation.mutate(
      { id: p._id, data: { flashSale: { active } } },
      { onSuccess: () => toast.success(active ? 'Đã kích hoạt' : 'Đã tạm dừng'),
        onError: (err) => toast.error(err?.response?.data?.message || 'Lỗi') },
    );
  };

  const handleSave = (id, data) => saveMutation.mutateAsync({ id, data });

  const existingIds = useMemo(() => new Set(flashProducts.map((p) => String(p._id))), [flashProducts]);

  const stats = useMemo(() => ({
    total:   flashProducts.length,
    active:  flashProducts.filter((p) => saleStatus(p) === 'active').length,
    expired: flashProducts.filter((p) => saleStatus(p) === 'expired').length,
  }), [flashProducts]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
            <Zap className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary">Flash Sale</h1>
            <p className="text-sm text-text-muted">Quản lý giá sale và chương trình khuyến mãi</p>
          </div>
        </div>
        <button
          onClick={() => setModal({ type: 'add' })}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition"
        >
          <Plus className="w-4 h-4" />
          Thêm sản phẩm
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Tổng sản phẩm', value: stats.total,   color: 'text-text-primary' },
          { label: 'Đang chạy',     value: stats.active,  color: 'text-green-600 dark:text-green-400' },
          { label: 'Hết hạn',       value: stats.expired, color: 'text-red-500' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-bg-elevated rounded-xl p-4 border border-surface-border">
            <p className="text-xs text-text-muted font-medium">{label}</p>
            <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-bg-elevated rounded-2xl border border-surface-border overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : flashProducts.length === 0 ? (
          <div className="text-center py-20 text-text-muted">
            <Zap className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p className="font-medium">Chưa có sản phẩm flash sale</p>
            <p className="text-sm mt-1">Nhấn "Thêm sản phẩm" để bắt đầu</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-border bg-bg-raised/40">
                  <th className="text-left px-4 py-3 text-xs font-bold text-text-muted uppercase tracking-wide">Sản phẩm</th>
                  <th className="text-right px-4 py-3 text-xs font-bold text-text-muted uppercase tracking-wide">Giá gốc</th>
                  <th className="text-right px-4 py-3 text-xs font-bold text-text-muted uppercase tracking-wide">Giá sale</th>
                  <th className="text-right px-4 py-3 text-xs font-bold text-text-muted uppercase tracking-wide">Giảm</th>
                  <th className="px-4 py-3 text-xs font-bold text-text-muted uppercase tracking-wide">Kết thúc</th>
                  <th className="text-right px-4 py-3 text-xs font-bold text-text-muted uppercase tracking-wide">Đã bán / Limit</th>
                  <th className="px-4 py-3 text-xs font-bold text-text-muted uppercase tracking-wide">Trạng thái</th>
                  <th className="px-4 py-3 text-xs font-bold text-text-muted uppercase tracking-wide">Kích hoạt</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {flashProducts.map((p) => (
                  <tr key={p._id} className="border-b border-surface-border/50 hover:bg-bg-raised/50 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {p.images?.[0]?.url
                          ? <img src={p.images[0].url} alt={p.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                          : <div className="w-10 h-10 rounded-lg bg-bg-raised flex-shrink-0" />}
                        <div className="min-w-0">
                          <p className="font-semibold text-text-primary truncate max-w-[160px]">{p.name}</p>
                          <p className="text-xs text-text-muted">{p.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-text-muted whitespace-nowrap">{fmt(p.price)}</td>
                    <td className="px-4 py-3 text-right font-bold text-primary whitespace-nowrap">{fmt(p.salePrice)}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
                        -{pct(p.price, p.salePrice)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-muted text-xs whitespace-nowrap">{fmtDT(p.flashSale?.endAt)}</td>
                    <td className="px-4 py-3 text-right text-text-muted text-xs whitespace-nowrap">
                      {p.flashSale?.soldCount ?? 0} / {p.flashSale?.totalLimit ?? 100}
                    </td>
                    <td className="px-4 py-3"><StatusBadge p={p} /></td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggle(p)}
                        disabled={saveMutation.isPending}
                        className="text-text-muted hover:text-primary transition disabled:opacity-50"
                        title={p.flashSale?.active ? 'Tạm dừng' : 'Kích hoạt'}
                      >
                        {p.flashSale?.active
                          ? <ToggleRight className="w-7 h-7 text-primary" />
                          : <ToggleLeft  className="w-7 h-7" />}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setModal({ type: 'edit', product: p })}
                          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-bg-raised text-text-muted hover:text-primary transition"
                          title="Chỉnh sửa"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setRemoveId(p._id)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/20 text-text-muted hover:text-red-500 transition"
                          title="Xóa khỏi flash sale"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {modal?.type === 'add' && (
          <AddModal
            key="add"
            existingIds={existingIds}
            onSaved={handleSave}
            onClose={() => setModal(null)}
          />
        )}
        {modal?.type === 'edit' && (
          <EditModal
            key="edit"
            product={modal.product}
            onSaved={handleSave}
            onClose={() => setModal(null)}
          />
        )}
        {removeId && (
          <Overlay key="remove" onClose={() => setRemoveId(null)}>
            <div className="p-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto">
                <X className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <p className="font-bold text-text-primary">Xóa khỏi Flash Sale?</p>
                <p className="text-sm text-text-muted mt-1">Sản phẩm sẽ trở về giá gốc và không còn hiển thị trong chương trình</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setRemoveId(null)}
                  className="flex-1 py-2.5 rounded-xl border border-surface-border text-sm font-semibold text-text-primary hover:bg-bg-raised transition"
                >
                  Hủy
                </button>
                <button
                  onClick={() => removeMutation.mutate(removeId)}
                  disabled={removeMutation.isPending}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {removeMutation.isPending ? <Loader className="w-4 h-4 animate-spin" /> : 'Xóa'}
                </button>
              </div>
            </div>
          </Overlay>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FlashSaleManagement;
