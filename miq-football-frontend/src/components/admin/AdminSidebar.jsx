import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, Users, LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/authStore.js';
import { useNavigate } from 'react-router-dom';

const AdminSidebar = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);

  const links = [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/admin/products', icon: Package, label: 'Sản phẩm' },
    { to: '/admin/orders', icon: ShoppingBag, label: 'Đơn hàng' },
    { to: '/admin/segmentation', icon: Users, label: 'Phân cụm KH' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <aside className="w-64 bg-white border-r border-cream-200 min-h-screen p-4 sticky top-0">
      <div className="mb-8 px-2">
        <h2 className="font-display text-2xl font-bold">
          Mi<span className="text-primary">Q</span> Admin
        </h2>
      </div>

      <nav className="space-y-1">
        {links.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${
                isActive
                  ? 'bg-primary text-white shadow-md shadow-primary/30'
                  : 'text-ink hover:bg-cream'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            <span className="font-semibold">{label}</span>
          </NavLink>
        ))}
      </nav>

      <button
        onClick={handleLogout}
        className="absolute bottom-6 left-4 right-4 flex items-center gap-3 px-3 py-2.5 rounded-lg text-ink hover:bg-red-50 hover:text-red-600 transition"
      >
        <LogOut className="w-5 h-5" />
        <span className="font-semibold">Đăng xuất</span>
      </button>
    </aside>
  );
};

export default AdminSidebar;