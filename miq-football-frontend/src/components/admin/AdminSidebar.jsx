import { NavLink, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Package, ShoppingBag, Users, Tag,
  LogOut, ChevronLeft, ChevronRight, MessageCircle,
  Newspaper, PlayCircle, ImagePlay, Layers, Home, Layers3, FileText, RefreshCw,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore.js';
import { useThemeStore } from '../../store/themeStore.js';
import ThemeToggle from '../ui/ThemeToggle.jsx';
import NotificationBell from '../layout/NotificationBell.jsx';
import Logo from '../ui/Logo.jsx';

const links = [
  { to: '/admin',              icon: LayoutDashboard, label: 'Dashboard',    end: true },
  { to: '/admin/products',     icon: Package,         label: 'Sản phẩm' },
  { to: '/admin/categories',   icon: Tag,             label: 'Danh mục' },
  { to: '/admin/orders',       icon: ShoppingBag,     label: 'Đơn hàng' },
  { to: '/admin/hero',         icon: ImagePlay,       label: 'Hero Section' },
  { to: '/admin/news',         icon: Newspaper,       label: 'Tin tức' },
  { to: '/admin/channel',      icon: PlayCircle,      label: 'MiQ Channel' },
  { to: '/admin/segmentation', icon: Users,           label: 'Khách hàng' },
  { to: '/admin/collections',  icon: Layers3,         label: 'Bộ sưu tập' },
  { to: '/admin/quotes',       icon: FileText,        label: 'Báo giá' },
  { to: '/admin/trade-ins',   icon: RefreshCw,       label: 'Thu cũ đổi mới' },
  { to: '/admin/site-assets',  icon: Layers,          label: 'Hình ảnh' },
  { to: '/admin/chat',         icon: MessageCircle,   label: 'Chat' },
];

// ── Desktop sidebar ───────────────────────────────────────────────────────────
const AdminSidebar = ({ collapsed = false, onToggle }) => {
  const navigate  = useNavigate();
  const logout    = useAuthStore((s) => s.logout);
  const dark      = useThemeStore((s) => s.dark);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <>
      <motion.aside
        animate={{ width: collapsed ? 64 : 256 }}
        initial={false}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className="hidden lg:flex flex-col bg-bg-elevated border-r border-surface-border min-h-screen sticky top-0 flex-shrink-0"
      >
        {/* Logo + notification bell + collapse toggle */}
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} px-3 py-4 mb-2`}>
          {!collapsed && (
            <div className="flex items-center gap-2 px-1">
              <Logo size="sm" variant="compact" asLink={false} white={dark} />
              <span className="font-display text-xs font-bold uppercase tracking-widest text-text-muted">Admin</span>
            </div>
          )}
          <div className="flex items-center gap-1 flex-shrink-0">
            <NotificationBell dark={dark} />
            <button
              onClick={onToggle}
              aria-label={collapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:bg-bg-raised hover:text-text-primary transition"
            >
              {collapsed
                ? <ChevronRight className="w-4 h-4" />
                : <ChevronLeft  className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Nav links */}
        <nav className="space-y-0.5 flex-1 px-2 overflow-y-auto overflow-x-hidden">
          {links.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              title={collapsed ? label : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 px-2.5 py-2.5 rounded-lg transition ${
                  isActive
                    ? 'bg-primary text-white shadow-md shadow-primary/30'
                    : 'text-text-primary hover:bg-bg-raised hover:text-text-primary'
                }`
              }
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && (
                <span className="font-semibold whitespace-nowrap">{label}</span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer: theme + logout */}
        <div className="px-2 pb-4 pt-3 mt-2 border-t border-surface-border space-y-0.5">
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} px-2 py-1.5`}>
            {!collapsed && (
              <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
                Giao diện
              </span>
            )}
            <ThemeToggle />
          </div>

          <Link
            to="/"
            title={collapsed ? 'Trang chủ' : undefined}
            className="flex items-center gap-3 px-2.5 py-2.5 rounded-lg text-text-primary hover:bg-bg-raised hover:text-primary transition"
          >
            <Home className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="font-semibold">Trang chủ</span>}
          </Link>

          <button
            onClick={handleLogout}
            title={collapsed ? 'Đăng xuất' : undefined}
            className="w-full flex items-center gap-3 px-2.5 py-2.5 rounded-lg text-text-primary hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="font-semibold">Đăng xuất</span>}
          </button>
        </div>
      </motion.aside>

      <AdminBottomNav onLogout={handleLogout} />
    </>
  );
};

// ── Mobile bottom navigation bar ─────────────────────────────────────────────
const AdminBottomNav = ({ onLogout }) => (
  <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-bg-elevated border-t border-surface-border flex items-center">
    {links.slice(0, 5).map(({ to, icon: Icon, label, end }) => (
      <NavLink
        key={to}
        to={to}
        end={end}
        className={({ isActive }) =>
          `flex-1 flex flex-col items-center justify-center py-2 gap-0.5 min-h-[56px] transition ${
            isActive ? 'text-primary' : 'text-text-muted hover:text-primary'
          }`
        }
      >
        {({ isActive }) => (
          <>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition ${isActive ? 'bg-primary/10' : ''}`}>
              <Icon className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-semibold leading-tight">{label}</span>
          </>
        )}
      </NavLink>
    ))}
    <button
      onClick={onLogout}
      className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 min-h-[56px] text-red-500 hover:text-red-600 transition"
    >
      <div className="w-8 h-8 rounded-xl flex items-center justify-center">
        <LogOut className="w-5 h-5" />
      </div>
      <span className="text-[10px] font-semibold leading-tight">Đăng xuất</span>
    </button>
  </nav>
);

export default AdminSidebar;
