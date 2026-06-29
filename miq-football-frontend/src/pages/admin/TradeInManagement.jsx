import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2, RefreshCw, X, ChevronRight } from 'lucide-react';
import { getTradeIns, updateTradeIn, deleteTradeIn } from '../../services/tradeInService.js';
import toast from 'react-hot-toast';

const STATUS_MAP = {
  cho_dinh_gia: { label: 'Chờ định giá',  cls: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' },
  da_dinh_gia:  { label: 'Đã định giá',   cls: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  da_dong_y:    { label: 'Đã đồng ý',     cls: 'bg-green-500/15 text-green-400 border-green-500/30' },
  tu_choi:      { label: 'Từ chối',        cls: 'bg-red-500/15 text-red-400 border-red-500/30' },
  hoan_thanh:   { label: 'Hoàn thành',    cls: 'bg-primary/15 text-primary border-primary/30' },
};

const CONDITION_MAP = {
  nhu_moi:    'Như mới (95%+)',
  tot:        'Tốt (80–95%)',
  trung_binh: 'Trung bình (60–80%)',
  cu:         'Cũ (dưới 60%)',
};

const formatVND = (n) =>
  n != null ? Number(n).toLocaleString('vi-VN') + '₫' : '—';

// ── Photo viewer modal ────────────────────────────────────────────────────────
const PhotoModal = ({ images, onClose }) => (
  <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70" onClick={onClose}>
    <div
      className="bg-bg-elevated rounded-2xl p-6 max-w-2xl w-full shadow-2xl border border-surface-border"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-bold text-text-primary">Ảnh sản phẩm</h3>
        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface text-text-muted transition">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="flex gap-4 flex-wrap">
        {images.map((img, i) => (
          <a key={i} href={img.url} target="_blank" rel="noreferrer">
            <img
              src={img.url}
              alt={`Ảnh ${i + 1}`}
              className="w-40 h-40 object-cover rounded-xl border border-surface-border hover:opacity-90 transition cursor-zoom-in"
            />
          </a>
        ))}
        {images.length === 0 && (
          <p className="text-text-muted text-sm">Không có ảnh</p>
        )}
      </div>
    </div>
  </div>
);

// ── Row component ─────────────────────────────────────────────────────────────
const TradeInRow = ({ item, onUpdate, onDelete }) => {
  const [priceInput, setPriceInput] = useState(item.offeredPrice ?? '');
  const [showPhotos, setShowPhotos] = useState(false);
  const [deletingConfirm, setDeletingConfirm] = useState(false);

  const status  = STATUS_MAP[item.status]  || { label: item.status,  cls: 'bg-surface text-text-muted border-surface-border' };
  const thumb   = item.images?.[0]?.url;

  const handlePriceSave = () => {
    const val = Number(priceInput);
    if (priceInput === '' || isNaN(val)) { toast.error('Nhập số hợp lệ'); return; }
    onUpdate(item._id, { offeredPrice: val });
  };

  return (
    <>
      <tr className="hover:bg-bg-raised transition-colors align-top">
        {/* Thumbnail */}
        <td className="px-4 py-3">
          {thumb ? (
            <button onClick={() => setShowPhotos(true)} className="relative group">
              <img src={thumb} alt="thumb" className="w-12 h-12 object-cover rounded-lg border border-surface-border group-hover:opacity-80 transition" />
              {item.images.length > 1 && (
                <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary text-white text-[8px] font-black rounded-full flex items-center justify-center">
                  {item.images.length}
                </span>
              )}
            </button>
          ) : (
            <div className="w-12 h-12 rounded-lg border border-surface-border bg-surface flex items-center justify-center text-text-muted">
              <span className="text-[10px]">—</span>
            </div>
          )}
        </td>

        {/* Info */}
        <td className="px-4 py-3">
          <p className="font-semibold text-text-primary text-sm">{item.name}</p>
          <p className="text-text-muted text-xs font-mono">{item.phone}</p>
        </td>

        <td className="px-4 py-3">
          <p className="text-text-secondary text-sm font-medium">{item.productType}</p>
          <p className="text-text-muted text-xs">{CONDITION_MAP[item.condition] || item.condition}</p>
        </td>

        {/* Description */}
        <td className="px-4 py-3 max-w-[160px]">
          <p className="text-text-muted text-xs line-clamp-2">{item.description || '—'}</p>
        </td>

        {/* Offered price */}
        <td className="px-4 py-3">
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min="0"
              value={priceInput}
              onChange={(e) => setPriceInput(e.target.value)}
              placeholder="0"
              className="w-28 bg-surface border border-surface-border rounded-lg px-2.5 py-1.5 text-xs text-text-primary focus:outline-none focus:border-primary"
            />
            <button
              onClick={handlePriceSave}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition flex-shrink-0"
              title="Lưu giá"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          {item.offeredPrice != null && (
            <p className="text-xs text-primary font-semibold mt-1">{formatVND(item.offeredPrice)}</p>
          )}
        </td>

        {/* Status */}
        <td className="px-4 py-3">
          <select
            value={item.status}
            onChange={(e) => onUpdate(item._id, { status: e.target.value })}
            className="bg-transparent border border-surface-border rounded-lg px-2 py-1.5 text-xs font-semibold text-text-primary focus:outline-none focus:border-primary cursor-pointer"
          >
            {Object.entries(STATUS_MAP).map(([val, { label }]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </td>

        {/* Date */}
        <td className="px-4 py-3 text-text-muted text-xs whitespace-nowrap">
          {new Date(item.createdAt).toLocaleDateString('vi-VN')}
        </td>

        {/* Delete */}
        <td className="px-4 py-3">
          {deletingConfirm ? (
            <div className="flex flex-col gap-1">
              <button onClick={() => onDelete(item._id)} className="text-[11px] font-bold text-red-400 hover:text-red-300">Xác nhận</button>
              <button onClick={() => setDeletingConfirm(false)} className="text-[11px] font-bold text-text-muted hover:text-text-secondary">Huỷ</button>
            </div>
          ) : (
            <button
              onClick={() => setDeletingConfirm(true)}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-text-muted hover:bg-red-500/10 hover:text-red-400 transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </td>
      </tr>

      {showPhotos && <PhotoModal images={item.images || []} onClose={() => setShowPhotos(false)} />}
    </>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────
const TradeInManagement = () => {
  const qc = useQueryClient();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['trade-ins'],
    queryFn: getTradeIns,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }) => updateTradeIn(id, body),
    onSuccess: () => { qc.invalidateQueries(['trade-ins']); toast.success('Đã cập nhật'); },
    onError:   () => toast.error('Cập nhật thất bại'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTradeIn,
    onSuccess: () => { qc.invalidateQueries(['trade-ins']); toast.success('Đã xóa'); },
    onError:   () => toast.error('Xóa thất bại'),
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <RefreshCw className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-text-primary">Thu Cũ Đổi Mới</h1>
          <p className="text-text-muted text-sm">{items.length} yêu cầu</p>
        </div>
        <button
          onClick={() => qc.invalidateQueries(['trade-ins'])}
          className="ml-auto w-9 h-9 rounded-xl border border-surface-border flex items-center justify-center text-text-muted hover:text-primary hover:border-primary/40 transition"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 rounded-full border-4 border-surface-border border-t-primary animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 text-text-muted">
          <RefreshCw className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-semibold">Chưa có yêu cầu thu đổi nào</p>
        </div>
      ) : (
        <div className="bg-surface border border-surface-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-border bg-bg-raised">
                  {['Ảnh', 'Khách hàng', 'Sản phẩm', 'Mô tả', 'Giá đề nghị (₫)', 'Trạng thái', 'Ngày', ''].map((h) => (
                    <th key={h} className="text-left px-4 py-3.5 text-xs font-bold uppercase tracking-widest text-text-muted whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {items.map((item) => (
                  <TradeInRow
                    key={item._id}
                    item={item}
                    onUpdate={(id, body) => updateMutation.mutate({ id, body })}
                    onDelete={(id) => deleteMutation.mutate(id)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default TradeInManagement;
