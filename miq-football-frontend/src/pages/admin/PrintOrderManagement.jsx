import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Printer, Trash2, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { getAllPrintOrders, updatePrintOrderStatus, deletePrintOrder } from '../../services/printOrderService.js';
import toast from 'react-hot-toast';

const STATUS_MAP = {
  cho_xac_nhan: { label: 'Chờ xác nhận', cls: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' },
  da_xac_nhan:  { label: 'Đã xác nhận',  cls: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  dang_in:      { label: 'Đang in',       cls: 'bg-purple-500/15 text-purple-400 border-purple-500/30' },
  hoan_thanh:   { label: 'Hoàn thành',   cls: 'bg-green-500/15 text-green-400 border-green-500/30' },
  huy:          { label: 'Huỷ',           cls: 'bg-red-500/15 text-red-400 border-red-500/30' },
};

const JERSEY_LABELS = {
  sublimation: 'Sublimation',
  heat_press:  'Heat Press',
  embroidery:  'Thêu',
};

const fmt = (n) => Number(n).toLocaleString('vi-VN') + '₫';

const SIZE_ORDER = ['S', 'M', 'L', 'XL', 'XXL', '3XL'];

// ── Row ───────────────────────────────────────────────────────────────────────
const PrintOrderRow = ({ order, onUpdateStatus, onDelete }) => {
  const [expanded, setExpanded]           = useState(false);
  const [deletingConfirm, setDeletingConfirm] = useState(false);

  const status = STATUS_MAP[order.status] || { label: order.status, cls: 'bg-surface text-text-muted border-surface-border' };

  return (
    <>
      <tr className="hover:bg-bg-raised transition-colors align-top">
        {/* Contact */}
        <td className="px-4 py-3">
          <p className="font-semibold text-text-primary text-sm">{order.contactName || order.name || '—'}</p>
          <p className="text-text-muted text-xs font-mono">{order.phone}</p>
          {order.email && <p className="text-text-muted text-xs">{order.email}</p>}
        </td>

        {/* Team */}
        <td className="px-4 py-3">
          <p className="text-text-secondary text-sm font-medium">{order.teamName || '—'}</p>
          <p className="text-text-muted text-xs">{JERSEY_LABELS[order.jerseyType] || order.jerseyType}</p>
        </td>

        {/* Players count + expand */}
        <td className="px-4 py-3">
          {order.players?.length > 0 ? (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="flex items-center gap-1 text-sm font-bold text-primary hover:underline"
            >
              {order.players.length} áo
              {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          ) : (
            <span className="text-text-muted text-sm">—</span>
          )}
        </td>

        {/* Price */}
        <td className="px-4 py-3">
          <p className="font-bold text-primary text-sm">{order.totalPrice ? fmt(order.totalPrice) : '—'}</p>
          {order.unitPrice > 0 && (
            <p className="text-text-muted text-xs">{fmt(order.unitPrice)}/áo</p>
          )}
        </td>

        {/* Status */}
        <td className="px-4 py-3">
          <select
            value={order.status}
            onChange={(e) => onUpdateStatus(order._id, e.target.value)}
            className="bg-transparent border border-surface-border rounded-lg px-2 py-1.5 text-xs font-semibold text-text-primary focus:outline-none focus:border-primary cursor-pointer"
          >
            {Object.entries(STATUS_MAP).map(([val, { label }]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </td>

        {/* Date */}
        <td className="px-4 py-3 text-text-muted text-xs whitespace-nowrap">
          {new Date(order.createdAt).toLocaleDateString('vi-VN')}
        </td>

        {/* Delete */}
        <td className="px-4 py-3">
          {deletingConfirm ? (
            <div className="flex flex-col gap-1">
              <button onClick={() => onDelete(order._id)} className="text-[11px] font-bold text-red-400 hover:text-red-300">Xác nhận</button>
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

      {/* Expanded player list */}
      {expanded && order.players?.length > 0 && (
        <tr>
          <td colSpan={7} className="px-4 pb-4 pt-0 bg-bg-raised/50">
            <div className="ml-2 border border-surface-border rounded-xl overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-bg-raised border-b border-surface-border">
                    <th className="text-left px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-text-muted">#</th>
                    <th className="text-left px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-text-muted">Tên in</th>
                    <th className="text-left px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-text-muted">Số áo</th>
                    <th className="text-left px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-text-muted">Cỡ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {order.players.map((pl, i) => (
                    <tr key={i} className="hover:bg-bg-raised/60">
                      <td className="px-3 py-2 text-text-muted">{i + 1}</td>
                      <td className="px-3 py-2 font-bold tracking-wide text-text-primary">{pl.playerName}</td>
                      <td className="px-3 py-2 font-mono font-bold text-primary text-center">{pl.jerseyNumber}</td>
                      <td className="px-3 py-2">
                        <span className="bg-surface border border-surface-border px-2 py-0.5 rounded-md font-semibold text-text-secondary">
                          {pl.size}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Size summary */}
              <div className="flex flex-wrap gap-2 px-3 py-2 border-t border-surface-border bg-bg-raised">
                <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted mr-1">Tổng hợp cỡ:</span>
                {SIZE_ORDER.map((sz) => {
                  const count = order.players.filter((p) => p.size === sz).length;
                  if (!count) return null;
                  return (
                    <span key={sz} className="text-xs font-bold text-text-secondary">
                      {sz}×{count}
                    </span>
                  );
                })}
              </div>
              {order.notes && (
                <div className="px-3 py-2 border-t border-surface-border text-xs text-text-muted">
                  <span className="font-bold text-text-secondary">Ghi chú: </span>{order.notes}
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────
const PrintOrderManagement = () => {
  const qc = useQueryClient();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['print-orders'],
    queryFn: getAllPrintOrders,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => updatePrintOrderStatus(id, status),
    onSuccess: () => { qc.invalidateQueries(['print-orders']); toast.success('Đã cập nhật trạng thái'); },
    onError:   () => toast.error('Cập nhật thất bại'),
  });

  const deleteMutation = useMutation({
    mutationFn: deletePrintOrder,
    onSuccess: () => { qc.invalidateQueries(['print-orders']); toast.success('Đã xóa đơn in'); },
    onError:   () => toast.error('Xóa thất bại'),
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Printer className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-text-primary">Đơn In Theo Đội</h1>
          <p className="text-text-muted text-sm">{orders.length} đơn hàng</p>
        </div>
        <button
          onClick={() => qc.invalidateQueries(['print-orders'])}
          className="ml-auto w-9 h-9 rounded-xl border border-surface-border flex items-center justify-center text-text-muted hover:text-primary hover:border-primary/40 transition"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 rounded-full border-4 border-surface-border border-t-primary animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 text-text-muted">
          <Printer className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-semibold">Chưa có đơn in nào</p>
        </div>
      ) : (
        <div className="bg-surface border border-surface-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-border bg-bg-raised">
                  {['Liên hệ', 'Đội / Loại in', 'Số áo', 'Tổng tiền', 'Trạng thái', 'Ngày', ''].map((h) => (
                    <th key={h} className="text-left px-4 py-3.5 text-xs font-bold uppercase tracking-widest text-text-muted whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {orders.map((order) => (
                  <PrintOrderRow
                    key={order._id}
                    order={order}
                    onUpdateStatus={(id, status) => statusMutation.mutate({ id, status })}
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

export default PrintOrderManagement;
