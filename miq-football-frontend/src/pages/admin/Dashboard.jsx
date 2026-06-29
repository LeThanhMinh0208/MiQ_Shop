import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Package, ShoppingBag, Users, TrendingUp, TrendingDown,
  RefreshCw, Download, ArrowUpRight, ArrowDownRight,
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import * as XLSX from 'xlsx';
import {
  fetchOverview,
  fetchRevenueChart,
  fetchTopProducts,
  fetchTopCustomers,
} from '../../services/adminStatsService.js';
import { adminGetSegmentation } from '../../services/adminService.js';
import { formatCurrency } from '../../utils/formatCurrency.js';

// ─── Colors ─────────────────────────────────────────────────────────────────
const PRIMARY = '#E8590C';
const COLORS = {
  pending: '#F59E0B',
  confirmed: '#3B82F6',
  shipping: '#8B5CF6',
  delivered: '#10B981',
  cancelled: '#EF4444',
};
const STATUS_LABELS = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  shipping: 'Đang giao',
  delivered: 'Đã giao',
  cancelled: 'Đã hủy',
};
const SEG_COLORS = {
  vip: '#F59E0B',
  loyal: '#8B5CF6',
  new: '#10B981',
  at_risk: '#F97316',
  cold: '#94A3B8',
};
const SEG_LABELS = {
  vip: 'VIP',
  loyal: 'Loyal',
  new: 'New',
  at_risk: 'At Risk',
  cold: 'Cold',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmtDate = (iso) => {
  const [, m, d] = iso.split('-');
  return `${d}/${m}`;
};

const fmtMillions = (v) => {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
  return v;
};

// ─── Glassmorphism Tooltip ────────────────────────────────────────────────────
const RevenueTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-bg-elevated/80 backdrop-blur-md border border-surface-border rounded-xl p-3 shadow-glass text-sm">
      <p className="font-bold mb-1 text-text-primary">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: {p.dataKey === 'revenue' ? formatCurrency(p.value) : p.value}
        </p>
      ))}
    </div>
  );
};

// ─── Sparkline mini-chart ────────────────────────────────────────────────────
const Sparkline = ({ data, color = PRIMARY }) => {
  const gradId = `sg${color.replace(/[^a-z0-9]/gi, '')}`;
  return (
    <ResponsiveContainer width="100%" height={44}>
      <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={color} stopOpacity={0.25} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={1.5}
          fill={`url(#${gradId})`}
          dot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

// ─── StatCard ─────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, subValue, change, color, delay = 0, sparkData, sparkColor }) => {
  const isPositive = change >= 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)' }}
      className="bg-bg-elevated rounded-2xl p-5 border border-surface-border shadow-sm"
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {change !== undefined && (
          <span className={`flex items-center gap-0.5 text-xs font-bold px-2 py-1 rounded-full ${
            isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
          }`}>
            {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {Math.abs(change)}%
          </span>
        )}
      </div>
      <p className="text-xs text-text-muted uppercase font-bold mb-1">{label}</p>
      <p className="font-display text-2xl font-bold leading-tight text-text-primary">{value}</p>
      {subValue && <p className="text-xs text-text-muted mt-1">{subValue}</p>}
      {sparkData?.length > 1 && (
        <div className="mt-3 -mx-1">
          <Sparkline data={sparkData} color={sparkColor || PRIMARY} />
        </div>
      )}
    </motion.div>
  );
};

// ─── Section wrapper ──────────────────────────────────────────────────────────
const Section = ({ title, children, action }) => (
  <div className="bg-bg-elevated rounded-2xl border border-surface-border p-5">
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-display text-lg font-bold text-text-primary">{title}</h3>
      {action}
    </div>
    {children}
  </div>
);

// ─── Dashboard ────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const [overview, setOverview]         = useState(null);
  const [chartData, setChartData]       = useState([]);
  const [topProducts, setTopProducts]   = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const [segmentation, setSegmentation] = useState(null);
  const [chartDays, setChartDays]       = useState(30);
  const [refreshing, setRefreshing]     = useState(false);
  const [lastRefresh, setLastRefresh]   = useState(null);

  const loadAll = useCallback(async (showSpinner = false) => {
    if (showSpinner) setRefreshing(true);
    try {
      const [ov, chart, products, customers] = await Promise.all([
        fetchOverview(),
        fetchRevenueChart(chartDays),
        fetchTopProducts(),
        fetchTopCustomers(),
      ]);
      setOverview(ov);
      setChartData(chart);
      setTopProducts(products);
      setTopCustomers(customers);
      setLastRefresh(new Date());
    } catch (e) {
      console.error(e);
    } finally {
      if (showSpinner) setRefreshing(false);
    }
  }, [chartDays]);

  useEffect(() => { loadAll(); }, [loadAll]);

  useEffect(() => {
    const id = setInterval(() => loadAll(), 30_000);
    return () => clearInterval(id);
  }, [loadAll]);

  useEffect(() => {
    adminGetSegmentation().then(setSegmentation).catch(() => {});
  }, []);

  useEffect(() => {
    fetchRevenueChart(chartDays).then(setChartData).catch(() => {});
  }, [chartDays]);

  const handleExport = () => {
    if (!chartData.length) return;
    const rows = chartData.map((d) => ({
      'Ngày': d.date,
      'Doanh thu (VND)': d.revenue,
      'Số đơn': d.orders,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [{ wch: 14 }, { wch: 18 }, { wch: 10 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Doanh thu');
    XLSX.writeFile(wb, `MiQ-revenue-${chartDays}d.xlsx`);
  };

  // ── Derived data ─────────────────────────────────────────────────────────
  const statusPieData = overview
    ? Object.entries(overview.statusCounts).map(([k, v]) => ({
        name: STATUS_LABELS[k] || k, value: v, key: k,
      }))
    : [];

  const paymentPieData = overview
    ? [
        { name: 'COD',    value: overview.paymentCounts.cod    || 0 },
        { name: 'Stripe', value: overview.paymentCounts.stripe || 0 },
      ]
    : [];

  const segData = segmentation
    ? Object.entries(segmentation.summary || {}).map(([k, v]) => ({
        name: SEG_LABELS[k] || k, count: v, key: k,
      }))
    : [];

  const sparkRevenue = chartData.slice(-7).map((d) => ({ v: d.revenue }));
  const sparkOrders  = chartData.slice(-7).map((d) => ({ v: d.orders  }));

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-text-primary">Dashboard</h1>
          <p className="text-text-muted text-sm mt-1">
            {lastRefresh
              ? `Cập nhật lúc ${lastRefresh.toLocaleTimeString('vi-VN')}`
              : 'Đang tải...'}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-surface-border hover:border-primary text-text-muted text-sm font-semibold transition"
          >
            <Download className="w-4 h-4" />
            Xuất Excel
          </button>
          <button
            onClick={() => loadAll(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Làm mới
          </button>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={TrendingUp}
          label="Doanh thu tháng này"
          value={formatCurrency(overview?.thisMonthRevenue || 0)}
          subValue={`Tháng trước: ${formatCurrency(overview?.lastMonthRevenue || 0)}`}
          change={overview?.revenueChange}
          color="bg-emerald-500"
          delay={0}
          sparkData={sparkRevenue}
          sparkColor={PRIMARY}
        />
        <StatCard
          icon={ShoppingBag}
          label="Đơn hàng tháng này"
          value={overview?.thisMonthOrders ?? '—'}
          subValue={`Tổng: ${overview?.totalOrders ?? '—'} đơn`}
          color="bg-blue-500"
          delay={0.05}
          sparkData={sparkOrders}
          sparkColor="#3B82F6"
        />
        <StatCard
          icon={Package}
          label="Sản phẩm đang bán"
          value={overview?.totalProducts ?? '—'}
          color="bg-purple-500"
          delay={0.1}
        />
        <StatCard
          icon={Users}
          label="Khách hàng"
          value={overview?.totalUsers ?? '—'}
          subValue={`Tổng doanh thu: ${formatCurrency(overview?.totalRevenue || 0)}`}
          color="bg-amber-500"
          delay={0.15}
        />
      </div>

      {/* ── Revenue Line + Orders by Status Pie ── */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Section
          title={`Doanh thu ${chartDays} ngày qua`}
          action={
            <div className="flex gap-1">
              {[7, 30].map((d) => (
                <button
                  key={d}
                  onClick={() => setChartDays(d)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    chartDays === d ? 'bg-primary text-white' : 'bg-bg-raised hover:bg-bg-elevated text-text-muted'
                  }`}
                >
                  {d}N
                </button>
              ))}
            </div>
          }
        >
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tickFormatter={fmtDate}
                tick={{ fontSize: 10 }}
                interval={chartDays <= 7 ? 0 : Math.floor(chartDays / 6)}
              />
              <YAxis tickFormatter={fmtMillions} tick={{ fontSize: 10 }} width={40} />
              <Tooltip content={<RevenueTooltip />} />
              <Line
                type="monotone"
                dataKey="revenue"
                name="Doanh thu"
                stroke={PRIMARY}
                strokeWidth={2.5}
                dot={chartDays <= 7}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Section>

        <Section title="Đơn theo trạng thái">
          {statusPieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={statusPieData}
                  cx="50%" cy="45%"
                  innerRadius={55} outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {statusPieData.map((entry) => (
                    <Cell key={entry.key} fill={COLORS[entry.key] || '#94A3B8'} />
                  ))}
                </Pie>
                <Tooltip content={<RevenueTooltip />} formatter={(v, n) => [v + ' đơn', n]} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-text-muted text-sm">
              Chưa có dữ liệu
            </div>
          )}
        </Section>

        <Section title="Phương thức thanh toán">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={paymentPieData}
                cx="50%" cy="45%"
                innerRadius={55} outerRadius={85}
                paddingAngle={3}
                dataKey="value"
              >
                <Cell fill={PRIMARY} />
                <Cell fill="#6366F1" />
              </Pie>
              <Tooltip content={<RevenueTooltip />} formatter={(v, n) => [v + ' đơn', n]} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </Section>
      </div>

      {/* ── Orders Bar Chart ── */}
      <Section title={`Số đơn hàng theo ngày (${chartDays} ngày)`}>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={fmtDate}
              tick={{ fontSize: 10 }}
              interval={chartDays <= 7 ? 0 : Math.floor(chartDays / 6)}
            />
            <YAxis allowDecimals={false} tick={{ fontSize: 10 }} width={28} />
            <Tooltip content={<RevenueTooltip />} />
            <Bar dataKey="orders" name="Đơn hàng" fill={PRIMARY} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Section>

      {/* ── Top Products + Top Customers ── */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Section title="Top 5 sản phẩm bán chạy">
          <div className="space-y-3">
            {topProducts.length === 0 && (
              <p className="text-center text-text-muted text-sm py-8">Chưa có dữ liệu</p>
            )}
            {topProducts.map((p, i) => (
              <div key={p._id} className="flex items-center gap-3">
                <span className={`w-6 text-center text-xs font-bold ${i === 0 ? 'text-amber-500' : 'text-text-muted'}`}>
                  #{i + 1}
                </span>
                <div className="w-10 h-10 bg-bg-raised rounded-lg overflow-hidden flex-shrink-0">
                  <img src={p.image} alt="" loading="lazy" decoding="async" className="w-full h-full object-contain" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold line-clamp-1 text-text-primary">{p.name}</p>
                  <p className="text-xs text-text-muted">{formatCurrency(p.revenue)}</p>
                </div>
                <span className="text-sm font-bold text-primary flex-shrink-0">{p.quantity} đôi</span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Top 5 khách VIP">
          <div className="space-y-3">
            {topCustomers.length === 0 && (
              <p className="text-center text-text-muted text-sm py-8">Chưa có dữ liệu</p>
            )}
            {topCustomers.map((u, i) => (
              <div key={u._id} className="flex items-center gap-3">
                <span className={`w-6 text-center text-xs font-bold ${i === 0 ? 'text-amber-500' : 'text-text-muted'}`}>
                  #{i + 1}
                </span>
                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-primary/10">
                  {u.avatar?.url ? (
                    <img src={u.avatar.url} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                  ) : (
                    <span className="w-full h-full flex items-center justify-center text-primary font-bold text-sm">
                      {u.name?.[0]?.toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold line-clamp-1 text-text-primary">{u.name}</p>
                  <p className="text-xs text-text-muted">{u.stats?.orderCount || 0} đơn</p>
                </div>
                <span className="text-sm font-bold text-primary flex-shrink-0">
                  {formatCurrency(u.stats?.totalSpent || 0)}
                </span>
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* ── Segmentation Bar Chart ── */}
      {segData.length > 0 && (
        <Section title="Phân cụm khách hàng (K-Means RFM)">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={segData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: 600 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 10 }} width={28} />
              <Tooltip content={<RevenueTooltip />} formatter={(v) => [v + ' khách', 'Số lượng']} />
              <Bar dataKey="count" name="Khách hàng" radius={[6, 6, 0, 0]}>
                {segData.map((entry) => (
                  <Cell key={entry.key} fill={SEG_COLORS[entry.key] || PRIMARY} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Section>
      )}

      {/* ── AI Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-8 text-white"
      >
        <h3 className="font-display text-2xl font-bold mb-2">🎯 Smart AI Recommendations</h3>
        <p className="opacity-90 mb-4">
          Hệ thống đang chạy thuật toán Apriori để gợi ý sản phẩm "thường mua cùng" và K-Means để
          phân cụm khách hàng theo RFM (Recency, Frequency, Monetary).
        </p>
        <div className="flex flex-wrap gap-3 text-sm">
          <span className="bg-white/20 px-3 py-1 rounded-full">Apriori Algorithm</span>
          <span className="bg-white/20 px-3 py-1 rounded-full">K-Means Clustering</span>
          <span className="bg-white/20 px-3 py-1 rounded-full">RFM Analysis</span>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
