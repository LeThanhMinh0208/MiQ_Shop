import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Package, ShoppingBag, Users, TrendingUp } from 'lucide-react';
import api from '../../services/api.js';

const StatCard = ({ icon: Icon, label, value, color }) => (
  <motion.div
    whileHover={{ y: -3 }}
    className="bg-white rounded-2xl p-6 border border-cream-200 shadow-sm"
  >
    <div className="flex items-center justify-between mb-3">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <TrendingUp className="w-4 h-4 text-primary" />
    </div>
    <p className="text-sm text-ink-muted mb-1">{label}</p>
    <p className="font-display text-3xl font-bold">{value}</p>
  </motion.div>
);

const Dashboard = () => {
  const [stats, setStats] = useState({ products: 0, orders: 0, users: 0, revenue: 0 });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [products, orders] = await Promise.all([
        api.get('/products?limit=1'),
        api.get('/orders'),
      ]);
      const allOrders = orders.data.data.orders || [];
      const revenue = allOrders
        .filter((o) => o.payment.isPaid)
        .reduce((sum, o) => sum + o.totalPrice, 0);

      setStats({
        products: products.data.data.pagination.total,
        orders: allOrders.length,
        users: 0, // có thể thêm endpoint /users count sau
        revenue,
      });
    } catch (error) {
      console.error('Lỗi load stats:', error);
    }
  };

  return (
    <div>
      <h1 className="font-display text-3xl font-bold mb-2">Dashboard</h1>
      <p className="text-ink-muted mb-8">Tổng quan hệ thống MiQ Football Store</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Package}
          label="Tổng sản phẩm"
          value={stats.products}
          color="bg-emerald-500"
        />
        <StatCard
          icon={ShoppingBag}
          label="Tổng đơn hàng"
          value={stats.orders}
          color="bg-blue-500"
        />
        <StatCard
          icon={Users}
          label="Khách hàng"
          value={stats.users}
          color="bg-purple-500"
        />
        <StatCard
          icon={TrendingUp}
          label="Doanh thu (VND)"
          value={new Intl.NumberFormat('vi-VN').format(stats.revenue)}
          color="bg-amber-500"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-8 bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-8 text-white"
      >
        <h3 className="font-display text-2xl font-bold mb-2">🎯 Smart AI Recommendations</h3>
        <p className="opacity-90 mb-4">
          Hệ thống đang chạy thuật toán Apriori để gợi ý sản phẩm "thường mua cùng" và K-Means để
          phân cụm khách hàng theo RFM (Recency, Frequency, Monetary).
        </p>
        <div className="flex gap-4 text-sm">
          <span className="bg-white/20 px-3 py-1 rounded-full">Apriori Algorithm</span>
          <span className="bg-white/20 px-3 py-1 rounded-full">K-Means Clustering</span>
          <span className="bg-white/20 px-3 py-1 rounded-full">RFM Analysis</span>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;