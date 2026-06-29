import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2, RefreshCw, FileText } from 'lucide-react';
import { getQuotes, updateQuoteStatus, deleteQuote } from '../../services/quoteService.js';
import toast from 'react-hot-toast';

const STATUS_LABELS = {
  cho_xu_ly:  { label: 'Chờ xử lý',  cls: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' },
  da_lien_he: { label: 'Đã liên hệ', cls: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  da_bao_gia: { label: 'Đã báo giá', cls: 'bg-green-500/15 text-green-400 border-green-500/30' },
  huy:        { label: 'Huỷ',        cls: 'bg-red-500/15 text-red-400 border-red-500/30' },
};

const REQUEST_TYPE_LABELS = {
  in_ao:     'In áo đội bóng',
  combo_doi: 'Combo đội bóng',
  mua_si:    'Mua sỉ',
  khac:      'Khác',
};

const StatusBadge = ({ status }) => {
  const s = STATUS_LABELS[status] || { label: status, cls: 'bg-surface text-text-muted border-surface-border' };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border ${s.cls}`}>
      {s.label}
    </span>
  );
};

const QuoteManagement = () => {
  const qc = useQueryClient();
  const [deletingId, setDeletingId] = useState(null);

  const { data: quotes = [], isLoading } = useQuery({
    queryKey: ['quotes'],
    queryFn: getQuotes,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => updateQuoteStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries(['quotes']);
      toast.success('Đã cập nhật trạng thái');
    },
    onError: () => toast.error('Cập nhật thất bại'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteQuote,
    onSuccess: () => {
      qc.invalidateQueries(['quotes']);
      setDeletingId(null);
      toast.success('Đã xóa yêu cầu');
    },
    onError: () => toast.error('Xóa thất bại'),
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <FileText className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-text-primary">Yêu cầu báo giá</h1>
          <p className="text-text-muted text-sm">{quotes.length} yêu cầu</p>
        </div>
        <button
          onClick={() => qc.invalidateQueries(['quotes'])}
          className="ml-auto w-9 h-9 rounded-xl border border-surface-border flex items-center justify-center text-text-muted hover:text-primary hover:border-primary/40 transition"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 rounded-full border-4 border-surface-border border-t-primary animate-spin" />
        </div>
      ) : quotes.length === 0 ? (
        <div className="text-center py-20 text-text-muted">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-semibold">Chưa có yêu cầu báo giá nào</p>
        </div>
      ) : (
        <div className="bg-surface border border-surface-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-border bg-bg-raised">
                  <th className="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-widest text-text-muted">Đội / Liên hệ</th>
                  <th className="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-widest text-text-muted">Điện thoại</th>
                  <th className="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-widest text-text-muted">Loại</th>
                  <th className="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-widest text-text-muted">SL</th>
                  <th className="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-widest text-text-muted">Ghi chú</th>
                  <th className="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-widest text-text-muted">Trạng thái</th>
                  <th className="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-widest text-text-muted">Ngày</th>
                  <th className="px-5 py-3.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {quotes.map((q) => (
                  <tr key={q._id} className="hover:bg-bg-raised transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-text-primary">{q.name}</p>
                      {q.teamName && <p className="text-text-muted text-xs">{q.teamName}</p>}
                      {q.email && <p className="text-text-muted text-xs">{q.email}</p>}
                    </td>
                    <td className="px-5 py-4 text-text-secondary font-mono">{q.phone}</td>
                    <td className="px-5 py-4 text-text-secondary">
                      {REQUEST_TYPE_LABELS[q.requestType] || q.requestType}
                    </td>
                    <td className="px-5 py-4 text-text-secondary">{q.quantity}</td>
                    <td className="px-5 py-4 max-w-[180px]">
                      <p className="text-text-muted text-xs line-clamp-2">{q.note || '—'}</p>
                    </td>
                    <td className="px-5 py-4">
                      <select
                        value={q.status}
                        onChange={(e) => statusMutation.mutate({ id: q._id, status: e.target.value })}
                        className="bg-transparent border border-surface-border rounded-lg px-2 py-1.5 text-xs font-semibold text-text-primary focus:outline-none focus:border-primary cursor-pointer"
                      >
                        {Object.entries(STATUS_LABELS).map(([val, { label }]) => (
                          <option key={val} value={val}>{label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-4 text-text-muted text-xs whitespace-nowrap">
                      {new Date(q.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-5 py-4">
                      {deletingId === q._id ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => deleteMutation.mutate(q._id)}
                            disabled={deleteMutation.isPending}
                            className="text-[11px] font-bold text-red-400 hover:text-red-300 transition"
                          >
                            Xác nhận
                          </button>
                          <button
                            onClick={() => setDeletingId(null)}
                            className="text-[11px] font-bold text-text-muted hover:text-text-secondary transition"
                          >
                            Huỷ
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeletingId(q._id)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-text-muted hover:bg-red-500/10 hover:text-red-400 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuoteManagement;
