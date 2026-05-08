import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Star, Sparkles, AlertTriangle, Snowflake, Loader } from 'lucide-react';
import { adminGetSegmentation } from '../../services/adminService.js';
import { formatCurrency } from '../../utils/formatCurrency.js';

const SEGMENT_CONFIG = {
  vip: { label: 'VIP', icon: Crown, color: 'from-amber-400 to-amber-600', desc: 'Khách hàng cao cấp' },
  loyal: { label: 'Loyal', icon: Star, color: 'from-purple-400 to-purple-600', desc: 'Khách trung thành' },
  new: { label: 'New', icon: Sparkles, color: 'from-emerald-400 to-emerald-600', desc: 'Khách mới' },
  at_risk: { label: 'At Risk', icon: AlertTriangle, color: 'from-orange-400 to-orange-600', desc: 'Có nguy cơ rời bỏ' },
  cold: { label: 'Cold', icon: Snowflake, color: 'from-slate-400 to-slate-600', desc: 'Ít tương tác' },
};

const CustomerSegmentation = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const result = await adminGetSegmentation();
      setData(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader className="w-10 h-10 text-primary animate-spin mx-auto mt-20" />;
  if (!data) return null;

  return (
    <div>
      <h1 className="font-display text-3xl font-bold mb-2">Phân cụm khách hàng</h1>
      <p className="text-ink-muted mb-6">
        Thuật toán K-Means dựa trên RFM (Recency - Frequency - Monetary) | Tổng: {data.total} khách hàng
      </p>

      {/* Segment Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {Object.entries(SEGMENT_CONFIG).map(([key, { label, icon: Icon, color, desc }]) => (
          <motion.div
            key={key}
            whileHover={{ y: -3 }}
            className={`bg-gradient-to-br ${color} rounded-2xl p-5 text-white`}
          >
            <Icon className="w-6 h-6 mb-2" />
            <p className="text-3xl font-bold">{data.summary[key] || 0}</p>
            <p className="font-bold uppercase text-sm">{label}</p>
            <p className="text-xs opacity-80">{desc}</p>
          </motion.div>
        ))}
      </div>

      {/* Customer Table */}
      <div className="bg-white rounded-2xl border border-cream-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-cream">
            <tr>
              <th className="text-left p-3 text-sm uppercase font-bold">Khách hàng</th>
              <th className="text-left p-3 text-sm uppercase font-bold">Recency</th>
              <th className="text-left p-3 text-sm uppercase font-bold">Frequency</th>
              <th className="text-left p-3 text-sm uppercase font-bold">Monetary</th>
              <th className="text-left p-3 text-sm uppercase font-bold">Segment</th>
            </tr>
          </thead>
          <tbody>
            {data.data.map((u, i) => {
              const config = SEGMENT_CONFIG[u.segment];
              return (
                <tr key={u.userId} className="border-t border-cream-200 hover:bg-cream/50">
                  <td className="p-3">
                    <p className="font-semibold">{u.name}</p>
                    <p className="text-xs text-ink-muted">{u.email}</p>
                  </td>
                  <td className="p-3 text-sm">{u.recency} ngày</td>
                  <td className="p-3 text-sm">{u.frequency} đơn</td>
                  <td className="p-3 text-sm font-bold">{formatCurrency(u.monetary)}</td>
                  <td className="p-3">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${config.color}`}
                    >
                      <config.icon className="w-3 h-3" />
                      {config.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomerSegmentation;