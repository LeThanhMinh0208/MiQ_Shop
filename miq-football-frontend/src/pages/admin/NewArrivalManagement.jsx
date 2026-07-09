import { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, X, Loader, Search, Sparkles, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAdminNewArrivalProducts, setProductNewArrival, fetchProducts,
} from '../../services/productService.js';
import { formatCurrency } from '../../utils/formatCurrency.js';

const STOREFRONT_LIMIT = 5;

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
      className="w-full max-w-md bg-bg-elevated rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </motion.div>
  </motion.div>
);

// ── Add Modal — pick products to mark as new arrival ──────────────────────────
const AddModal = ({ existingIds, onAdd, onClose }) => {
  const [search, setSearch] = useState('');

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

  return (
    <Overlay onClose={onClose}>
      <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-surface-border flex-shrink-0">
        <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          Thêm vào Sản phẩm mới
        </h2>
        <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-bg-raised text-text-muted hover:text-text-primary transition">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 flex-shrink-0">
        <div className="relative">
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
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-1">
        {filtered.length === 0 && (
          <p className="text-center text-sm text-text-muted py-10">
            {search ? 'Không tìm thấy sản phẩm' : 'Tất cả sản phẩm đã trong danh sách'}
          </p>
        )}
        {filtered.map((p) => (
          <button
            key={p._id}
            onClick={() => { onAdd(p._id); onClose(); }}
            className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-bg-raised transition text-left"
          >
            {p.images?.[0]?.url
              ? <img src={p.images[0].url} alt={p.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
              : <div className="w-10 h-10 rounded-lg bg-bg-raised flex-shrink-0" />}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-text-primary truncate">{p.name}</p>
              <p className="text-xs text-text-muted">{p.brand} · {formatCurrency(p.price)}</p>
            </div>
            <Plus className="w-4 h-4 text-primary flex-shrink-0" />
          </button>
        ))}
      </div>
    </Overlay>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const NewArrivalManagement = () => {
  const qc = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [removeId, setRemoveId] = useState(null);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['admin-new-arrivals'],
    queryFn:  getAdminNewArrivalProducts,
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, val }) => setProductNewArrival(id, val),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['admin-new-arrivals'] }),
    onError:    (err) => toast.error(err?.response?.data?.message || 'Lỗi'),
  });

  const handleAdd = (id) => {
    toggleMutation.mutate(
      { id, val: true },
      { onSuccess: () => toast.success('Đã thêm vào Sản phẩm mới') },
    );
  };

  const handleRemove = (id) => {
    toggleMutation.mutate(
      { id, val: false },
      {
        onSuccess: () => { toast.success('Đã xóa khỏi Sản phẩm mới'); setRemoveId(null); },
      },
    );
  };

  const existingIds = useMemo(() => new Set(products.map((p) => String(p._id))), [products]);
  const overLimit = products.length > STOREFRONT_LIMIT;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary">Sản phẩm mới</h1>
            <p className="text-sm text-text-muted">Chọn sản phẩm hiển thị trong mục "New Arrivals" trên trang chủ</p>
          </div>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition"
        >
          <Plus className="w-4 h-4" />
          Thêm sản phẩm
        </button>
      </div>

      {/* Over-limit warning */}
      {overLimit && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-700 dark:text-amber-300">
            Trang chủ chỉ hiển thị tối đa <strong>{STOREFRONT_LIMIT} sản phẩm</strong>. Bạn đang đánh dấu {products.length} sản phẩm — chỉ {STOREFRONT_LIMIT} sản phẩm đầu tiên (mới nhất) sẽ hiển thị.
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-bg-elevated rounded-xl p-4 border border-surface-border">
          <p className="text-xs text-text-muted font-medium">Đã chọn</p>
          <p className="text-2xl font-bold mt-1 text-text-primary">{products.length}</p>
        </div>
        <div className="bg-bg-elevated rounded-xl p-4 border border-surface-border">
          <p className="text-xs text-text-muted font-medium">Hiển thị trên trang chủ</p>
          <p className="text-2xl font-bold mt-1 text-primary">{Math.min(products.length, STOREFRONT_LIMIT)}</p>
        </div>
      </div>

      {/* Info note */}
      <div className="text-xs text-text-muted bg-bg-raised rounded-xl px-4 py-3 border border-surface-border">
        Nếu không có sản phẩm nào được đánh dấu, trang chủ sẽ tự động hiển thị {STOREFRONT_LIMIT} sản phẩm mới nhất theo ngày tạo.
      </div>

      {/* Product list */}
      <div className="bg-bg-elevated rounded-2xl border border-surface-border overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 text-text-muted">
            <Sparkles className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p className="font-medium">Chưa có sản phẩm được chọn</p>
            <p className="text-sm mt-1">Nhấn "Thêm sản phẩm" để curate danh sách New Arrivals</p>
          </div>
        ) : (
          <div className="divide-y divide-surface-border/50">
            {products.map((p, idx) => (
              <div key={p._id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-bg-raised/50 transition">
                {/* Position indicator */}
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  idx < STOREFRONT_LIMIT
                    ? 'bg-primary/10 text-primary'
                    : 'bg-surface-border text-text-muted'
                }`}>
                  {idx + 1}
                </span>

                {/* Product info */}
                {p.images?.[0]?.url
                  ? <img src={p.images[0].url} alt={p.name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                  : <div className="w-12 h-12 rounded-xl bg-bg-raised flex-shrink-0" />}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm text-text-primary truncate">{p.name}</p>
                    {idx < STOREFRONT_LIMIT && (
                      <span className="flex-shrink-0 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        Hiển thị
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-text-muted mt-0.5">{p.brand} · {formatCurrency(p.salePrice ?? p.price)}</p>
                </div>

                {/* Remove */}
                <button
                  onClick={() => setRemoveId(p._id)}
                  disabled={toggleMutation.isPending}
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/20 text-text-muted hover:text-red-500 transition disabled:opacity-50 flex-shrink-0"
                  title="Xóa khỏi New Arrivals"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showAdd && (
          <AddModal
            key="add"
            existingIds={existingIds}
            onAdd={handleAdd}
            onClose={() => setShowAdd(false)}
          />
        )}
        {removeId && (
          <Overlay key="remove" onClose={() => setRemoveId(null)}>
            <div className="p-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto">
                <X className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <p className="font-bold text-text-primary">Xóa khỏi New Arrivals?</p>
                <p className="text-sm text-text-muted mt-1">Sản phẩm sẽ không còn hiển thị trong mục Sản phẩm mới trên trang chủ</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setRemoveId(null)}
                  className="flex-1 py-2.5 rounded-xl border border-surface-border text-sm font-semibold text-text-primary hover:bg-bg-raised transition"
                >
                  Hủy
                </button>
                <button
                  onClick={() => handleRemove(removeId)}
                  disabled={toggleMutation.isPending}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {toggleMutation.isPending ? <Loader className="w-4 h-4 animate-spin" /> : 'Xóa'}
                </button>
              </div>
            </div>
          </Overlay>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NewArrivalManagement;
