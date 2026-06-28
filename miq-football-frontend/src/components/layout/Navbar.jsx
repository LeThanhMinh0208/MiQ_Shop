import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, ShoppingCart, User, Heart, X, Globe,
  Sun, Moon, LogOut, Package, ChevronDown, ChevronRight,
  LayoutDashboard, Star, Menu,
} from 'lucide-react';
import { useCartStore } from '../../store/cartStore.js';
import { useAuthStore } from '../../store/authStore.js';
import { useLanguageStore } from '../../store/languageStore.js';
import { useThemeStore } from '../../store/themeStore.js';
import { fetchProducts } from '../../services/productService.js';
import { formatCurrency } from '../../utils/formatCurrency.js';
import Logo from '../ui/Logo.jsx';
import useFocusTrap from '../../hooks/useFocusTrap.js';

// ─── Static nav data ────────────────────────────────────────────────────────
const BRANDS = [
  { label: 'MiQ Brand', path: '/brands/miq', special: true },
  { label: 'Nike',       path: '/brands/nike' },
  { label: 'Adidas',     path: '/brands/adidas' },
  { label: 'Puma',       path: '/brands/puma' },
  { label: 'New Balance',path: '/brands/new-balance' },
  { label: 'Mizuno',     path: '/brands/mizuno' },
  { label: 'Umbro',      path: '/brands/umbro' },
];

const NAV_CONFIG = [
  {
    key: 'kits',
    labelVi: 'ÁO ĐẤU', labelEn: 'KITS',
    path: '/products?category=kits',
    items: [
      { vi: 'Áo CLB',       en: 'Club Kits',    icon: '⚽', path: '/products?category=kits&tag=club' },
      { vi: 'Áo đội tuyển', en: 'National Kits', icon: '🏆', path: '/products?category=kits&tag=national' },
      { vi: 'Áo tập',       en: 'Training Kits', icon: '🏃', path: '/products?category=kits&tag=training' },
      { vi: 'Áo thủ môn',   en: 'Goalkeeper',   icon: '🧤', path: '/products?category=kits&tag=goalkeeper' },
    ],
  },
  {
    key: 'boots',
    labelVi: 'GIÀY ĐÁ BÓNG', labelEn: 'BOOTS',
    path: '/products?category=boots',
    items: [
      { vi: 'Sân cỏ tự nhiên FG', en: 'Firm Ground', icon: '🌱', path: '/products?category=boots&tag=fg' },
      { vi: 'Sân nhân tạo TF',    en: 'Turf',         icon: '🔲', path: '/products?category=boots&tag=tf' },
      { vi: 'Giày futsal',        en: 'Futsal',        icon: '🏟️', path: '/products?category=boots&tag=futsal' },
      { vi: 'Giày tập luyện',     en: 'Training',      icon: '👟', path: '/products?category=boots&tag=training' },
    ],
  },
  {
    key: 'apparel',
    labelVi: 'TRANG PHỤC', labelEn: 'APPAREL',
    path: '/products?category=apparel',
    items: [
      { vi: 'Quần thể thao', en: 'Shorts',      icon: '🩳', path: '/products?category=apparel&tag=shorts' },
      { vi: 'Bộ tracksuit',  en: 'Tracksuits',  icon: '🧥', path: '/products?category=apparel&tag=tracksuit' },
      { vi: 'Phụ kiện',      en: 'Accessories', icon: '⌚', path: '/products?category=accessories' },
    ],
  },
  {
    key: 'collections',
    labelVi: 'BỘ SƯU TẬP', labelEn: 'COLLECTIONS',
    path: '/products',
    isBrands: true,
    items: BRANDS,
  },
];

// ─── Dropdown panel ──────────────────────────────────────────────────────────
const DropdownPanel = ({ item, lang, onClose }) => (
  <motion.div
    initial={{ opacity: 0, y: 8, scale: 0.97 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: 8, scale: 0.97 }}
    transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
    className="absolute top-full left-0 mt-1 bg-bg-elevated border border-surface-border rounded-2xl shadow-depth-lg overflow-hidden z-50 min-w-[220px]"
  >
    {item.isBrands ? (
      <div className="py-2">
        <p className="px-4 pt-2 pb-1.5 text-[10px] font-black uppercase tracking-widest text-text-muted">
          {lang === 'vi' ? 'Thương Hiệu' : 'Brands'}
        </p>
        {item.items.map((brand) => (
          <Link
            key={brand.path}
            to={brand.path}
            onClick={onClose}
            className={`flex items-center justify-between px-4 py-2.5 text-sm font-bold transition-colors ${
              brand.special
                ? 'text-primary hover:bg-primary/10'
                : 'text-text-primary hover:bg-bg-raised hover:text-primary'
            }`}
          >
            <span className="flex items-center gap-2.5">
              {brand.special && <Star className="w-3.5 h-3.5 fill-primary text-primary flex-shrink-0" />}
              {brand.label}
            </span>
            {brand.special && (
              <span className="text-[9px] bg-primary/15 text-primary font-black px-1.5 py-0.5 rounded-full flex-shrink-0">
                {lang === 'vi' ? 'ĐỘC QUYỀN' : 'EXCLUSIVE'}
              </span>
            )}
          </Link>
        ))}
        <div className="border-t border-surface-border mx-3 mt-1 pt-1">
          <Link to="/products" onClick={onClose}
            className="flex items-center justify-center py-2 text-xs font-bold text-text-muted hover:text-primary transition">
            {lang === 'vi' ? 'Xem tất cả →' : 'View all →'}
          </Link>
        </div>
      </div>
    ) : (
      <div className="py-2">
        <p className="px-4 pt-2 pb-1.5 text-[10px] font-black uppercase tracking-widest text-text-muted">
          {lang === 'vi' ? item.labelVi : item.labelEn}
        </p>
        {item.items.map((sub) => (
          <Link
            key={sub.path}
            to={sub.path}
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-text-primary hover:bg-bg-raised hover:text-primary transition-colors"
          >
            <span>{lang === 'vi' ? sub.vi : sub.en}</span>
          </Link>
        ))}
        <div className="border-t border-surface-border mx-3 mt-1 pt-1">
          <Link to={item.path} onClick={onClose}
            className="flex items-center justify-center py-2 text-xs font-bold text-text-muted hover:text-primary transition">
            {lang === 'vi' ? 'Xem tất cả →' : 'View all →'}
          </Link>
        </div>
      </div>
    )}
  </motion.div>
);

// ─── Main component ──────────────────────────────────────────────────────────
const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const totalItems = useCartStore((s) => s.getTotalItems());
  const { user, isAuthenticated, logout } = useAuthStore();
  const { lang, toggle, t } = useLanguageStore();
  const { dark, toggle: toggleTheme } = useThemeStore();

  const getNavActive = (item) => {
    if (item.isBrands) return location.pathname.startsWith('/brands');
    const cat = searchParams.get('category');
    return location.pathname === '/products' && cat === item.key;
  };

  const [query, setQuery]                   = useState('');
  const [results, setResults]               = useState([]);
  const [searchOpen, setSearchOpen]         = useState(false);
  const [searchLoading, setSearchLoading]   = useState(false);
  const [searchError, setSearchError]       = useState(null);
  const [activeMenu, setActiveMenu]         = useState(null);
  const [userOpen, setUserOpen]             = useState(false);
  const [mobileOpen, setMobileOpen]         = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState(null);

  const searchRef   = useRef(null);
  const userRef     = useRef(null);
  const debounceRef = useRef(null);
  const timerRef    = useRef(null);
  const drawerRef   = useRef(null);
  const touchStartX = useRef(null);

  // Mobile drawer: lock scroll + close on Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setMobileOpen(false); };
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', onKey);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
    };
  }, [mobileOpen]);

  // Mobile drawer: focus trap via shared hook (Tab cycles, Escape closes, restores trigger)
  useFocusTrap(drawerRef, mobileOpen, () => setMobileOpen(false));

  // Mobile drawer: swipe-left to close (mirrors MobileCartDrawer touch pattern)
  const onDrawerTouchStart = useCallback((e) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);
  const onDrawerTouchEnd = useCallback((e) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (delta < -60) setMobileOpen(false);
  }, []);

  // Close on outside click
  useEffect(() => {
    const close = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
      if (userRef.current   && !userRef.current.contains(e.target))   setUserOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  // Search debounce with loading + error states (Rules 37/41)
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSearchOpen(false);
      setSearchLoading(false);
      setSearchError(null);
      return;
    }
    setSearchLoading(true);
    setSearchError(null);
    setSearchOpen(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await fetchProducts({ search: query.trim(), limit: 6 });
        setResults(data.products || []);
        setSearchError(null);
      } catch {
        setResults([]);
        setSearchError('Không thể tìm kiếm, vui lòng thử lại');
      } finally {
        setSearchLoading(false);
      }
    }, 320);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/products?search=${encodeURIComponent(query.trim())}`);
    setSearchOpen(false);
    setQuery('');
  };

  const openMenu  = (key) => { clearTimeout(timerRef.current); setActiveMenu(key); };
  const delayClose = ()   => { timerRef.current = setTimeout(() => setActiveMenu(null), 130); };
  const keepOpen   = ()   => clearTimeout(timerRef.current);

  const handleLogout = () => {
    logout();
    setUserOpen(false);
    navigate('/');
  };

  return (
    <>
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 bg-bg-elevated/95 backdrop-blur-md border-b border-surface-border"
    >
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-4">

        {/* ── Logo ─────────────────────────────────── */}
        <Logo size="md" variant="full" white={dark} asLink={true} />

        {/* ── Nav with dropdowns ───────────────────── */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_CONFIG.map((item) => (
            <div
              key={item.key}
              className="relative"
              onMouseEnter={() => openMenu(item.key)}
              onMouseLeave={delayClose}
            >
              <Link
                to={item.path}
                aria-expanded={activeMenu === item.key}
                aria-haspopup="true"
                className={`flex items-center gap-1 font-black uppercase tracking-wider text-[11px] px-3 py-2 rounded-lg transition-all whitespace-nowrap ${
                  getNavActive(item) || activeMenu === item.key
                    ? 'text-primary bg-primary/10'
                    : 'text-text-primary hover:text-primary hover:bg-primary/5'
                }`}
              >
                {lang === 'vi' ? item.labelVi : item.labelEn}
                <ChevronDown className={`w-3 h-3 transition-transform duration-200 flex-shrink-0 ${activeMenu === item.key ? 'rotate-180' : ''}`} />
              </Link>

              <AnimatePresence>
                {activeMenu === item.key && (
                  <div onMouseEnter={keepOpen} onMouseLeave={delayClose}>
                    <DropdownPanel item={item} lang={lang} onClose={() => setActiveMenu(null)} />
                  </div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </nav>

        {/* ── Search ───────────────────────────────── */}
        <div ref={searchRef} className="hidden lg:flex flex-1 max-w-sm relative">
          <form onSubmit={handleSearch} className="w-full">
            {searchLoading
              ? <span className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10 w-4 h-4 rounded-full border-2 border-surface-border border-t-primary animate-spin" />
              : <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted z-10 pointer-events-none" />
            }
            <label htmlFor="navbar-search" className="sr-only">{t('searchPlaceholder')}</label>
            <input
              id="navbar-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => (results.length > 0 || searchError) && setSearchOpen(true)}
              type="text"
              placeholder={t('searchPlaceholder')}
              className="w-full pl-10 pr-9 py-2 bg-bg-raised rounded-full border border-surface-border focus:border-primary focus:outline-none text-sm text-text-primary"
            />
            {query && (
              <button tag="button"
                onClick={() => { setQuery(''); setResults([]); setSearchOpen(false); }}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          <AnimatePresence>
            {searchOpen && (results.length > 0 || searchError || searchLoading) && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full left-0 right-0 mt-2 bg-bg-elevated rounded-2xl border border-surface-border shadow-depth-lg overflow-hidden z-50"
              >
                {searchError ? (
                  <p className="px-4 py-3 text-xs text-red-400">Không thể tìm kiếm. Vui lòng thử lại.</p>
                ) : searchLoading ? (
                  <p className="px-4 py-3 text-xs text-text-muted">Đang tìm kiếm…</p>
                ) : (
                  <>
                    {results.map((product) => (
                      <button key={product._id} type="button"
                        onClick={() => { navigate(`/products/${product._id}`); setSearchOpen(false); setQuery(''); }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-bg-raised transition text-left border-b border-surface-border last:border-0"
                      >
                        <div className="w-10 h-10 bg-bg-raised rounded-lg p-1 flex-shrink-0">
                          {product.images?.[0]?.url && (
                            <img src={product.images[0].url} alt={product.name} className="w-full h-full object-contain" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-text-primary line-clamp-1">{product.name}</p>
                          <p className="text-xs text-text-muted">{product.brand}</p>
                        </div>
                        <span className="text-sm font-bold text-primary flex-shrink-0">
                          {formatCurrency(product.salePrice || product.price)}
                        </span>
                      </button>
                    ))}
                    {results.length === 0 && (
                      <p className="px-4 py-3 text-xs text-text-muted">Không tìm thấy kết quả cho "{query}"</p>
                    )}
                    <Link
                      to={`/products?search=${encodeURIComponent(query)}`}
                      onClick={() => { setSearchOpen(false); setQuery(''); }}
                      className="block px-4 py-2.5 text-xs text-center text-primary font-semibold hover:bg-bg-raised transition border-t border-surface-border"
                    >
                      {t('viewAllResults')} "{query}" →
                    </Link>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Actions ──────────────────────────────── */}
        <div className="flex items-center gap-1">
          {/* Hamburger — mobile only */}
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Mở menu"
            aria-expanded={mobileOpen}
            aria-controls="mobile-drawer"
            className="md:hidden p-2 hover:bg-bg-raised rounded-full transition"
          >
            <Menu className="w-5 h-5 text-text-primary" />
          </button>

          {/* Theme toggle */}
          <button onClick={toggleTheme}
            className="p-2 hover:bg-bg-raised rounded-full transition"
            title={dark ? 'Chế độ sáng' : 'Chế độ tối'}>
            {dark
              ? <Sun  className="w-5 h-5 text-text-primary" />
              : <Moon className="w-5 h-5 text-text-primary" />}
          </button>

          {/* Language */}
          <button onClick={toggle}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-black border border-surface-border text-text-muted hover:border-primary hover:text-primary transition tracking-wider">
            <Globe className="w-3.5 h-3.5" />
            {lang === 'vi' ? 'EN' : 'VI'}
          </button>

          {/* User dropdown */}
          <div ref={userRef} className="relative">
            <button
              onClick={() => setUserOpen((o) => !o)}
              className={`p-2 rounded-full transition ${userOpen ? 'bg-primary/10 text-primary' : 'hover:bg-bg-raised'}`}
            >
              <User className="w-5 h-5 text-text-primary" />
            </button>

            <AnimatePresence>
              {userOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.97 }}
                  transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute top-full right-0 mt-2 w-56 bg-bg-elevated border border-surface-border rounded-2xl shadow-depth-lg overflow-hidden z-50"
                >
                  {isAuthenticated ? (
                    <>
                      <div className="px-4 py-3 border-b border-surface-border bg-bg-raised">
                        <p className="font-black text-sm text-text-primary truncate">{user?.name}</p>
                        <p className="text-xs text-text-muted truncate">{user?.email}</p>
                      </div>
                      <div className="py-1.5">
                        <Link to="/profile" onClick={() => setUserOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-text-primary hover:bg-bg-raised hover:text-primary transition">
                          <User className="w-4 h-4" />
                          {lang === 'vi' ? 'Hồ sơ của tôi' : 'My Profile'}
                        </Link>
                        <Link to="/profile?tab=orders" onClick={() => setUserOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-text-primary hover:bg-bg-raised hover:text-primary transition">
                          <Package className="w-4 h-4" />
                          {lang === 'vi' ? 'Đơn hàng' : 'My Orders'}
                        </Link>
                        {user?.role === 'admin' && (
                          <Link to="/admin" onClick={() => setUserOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-primary hover:bg-primary/5 transition">
                            <LayoutDashboard className="w-4 h-4" />
                            Admin Panel
                          </Link>
                        )}
                      </div>
                      <div className="border-t border-surface-border py-1.5">
                        <button onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition">
                          <LogOut className="w-4 h-4" />
                          {lang === 'vi' ? 'Đăng xuất' : 'Log out'}
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="py-2">
                      <Link to="/login" onClick={() => setUserOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-text-primary hover:bg-bg-raised hover:text-primary transition">
                        <User className="w-4 h-4" />
                        {lang === 'vi' ? 'Đăng nhập' : 'Log in'}
                      </Link>
                      <Link to="/register" onClick={() => setUserOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-primary hover:bg-primary/5 transition">
                        <Star className="w-4 h-4" />
                        {lang === 'vi' ? 'Đăng ký' : 'Sign up'}
                      </Link>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link to="/wishlist" className="p-2 hover:bg-bg-raised rounded-full transition">
            <Heart className="w-5 h-5 text-text-primary" />
          </Link>

          <Link to="/cart" className="relative p-2 hover:bg-primary/10 rounded-full transition">
            <ShoppingCart className="w-5 h-5 text-primary" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>
    </motion.nav>

    {/* ── Mobile Drawer ─────────────────────────────────────────────────── */}
    <AnimatePresence>
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden fixed inset-0 bg-black/60 z-[60]"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer panel */}
          <motion.div
            id="mobile-drawer"
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Menu điều hướng"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 32 }}
            onTouchStart={onDrawerTouchStart}
            onTouchEnd={onDrawerTouchEnd}
            className="md:hidden fixed inset-y-0 left-0 w-[85vw] max-w-sm bg-bg-elevated z-[61] flex flex-col shadow-depth-lg overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border flex-shrink-0">
              <Logo size="sm" variant="full" white={dark} asLink={true} />
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Đóng menu"
                className="p-2 hover:bg-bg-raised rounded-full transition"
              >
                <X className="w-5 h-5 text-text-primary" />
              </button>
            </div>

            {/* Search */}
            <div className="px-4 py-3 border-b border-surface-border flex-shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!query.trim()) return;
                  navigate(`/products?search=${encodeURIComponent(query.trim())}`);
                  setMobileOpen(false);
                  setQuery('');
                }}
              >
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                  <label htmlFor="mobile-drawer-search" className="sr-only">{t('searchPlaceholder')}</label>
                  <input
                    id="mobile-drawer-search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    type="text"
                    placeholder={t('searchPlaceholder')}
                    className="w-full pl-9 pr-4 py-2.5 bg-bg-raised rounded-xl border border-surface-border focus:border-primary focus:outline-none text-sm text-text-primary"
                  />
                </div>
              </form>
            </div>

            {/* Nav items */}
            <nav className="flex-1 overflow-y-auto py-2" aria-label="Menu chính">
              {NAV_CONFIG.map((item) => (
                <div key={item.key}>
                  <button
                    className="w-full flex items-center justify-between px-5 py-3.5 text-left font-black uppercase tracking-wider text-sm text-text-primary hover:text-primary hover:bg-primary/5 transition"
                    onClick={() => setMobileExpanded(mobileExpanded === item.key ? null : item.key)}
                    aria-expanded={mobileExpanded === item.key}
                  >
                    {lang === 'vi' ? item.labelVi : item.labelEn}
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${mobileExpanded === item.key ? 'rotate-180' : ''}`}
                    />
                  </button>

                  <AnimatePresence>
                    {mobileExpanded === item.key && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden border-l-2 border-primary/20 ml-5"
                      >
                        {item.items.map((sub) => (
                          <Link
                            key={sub.path}
                            to={sub.path}
                            onClick={() => { setMobileOpen(false); setMobileExpanded(null); }}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-text-secondary hover:text-primary hover:bg-primary/5 rounded-lg mx-1 transition"
                          >
                            <ChevronRight className="w-3 h-3 text-text-muted" />
                            <span>{lang === 'vi' ? (sub.vi || sub.label) : (sub.en || sub.label)}</span>
                            {sub.special && (
                              <span className="ml-auto text-[9px] bg-primary/15 text-primary font-black px-1.5 py-0.5 rounded-full">
                                {lang === 'vi' ? 'ĐỘC QUYỀN' : 'EXCL'}
                              </span>
                            )}
                          </Link>
                        ))}
                        <Link
                          to={item.path}
                          onClick={() => { setMobileOpen(false); setMobileExpanded(null); }}
                          className="flex items-center justify-center py-2 text-xs font-bold text-text-muted hover:text-primary transition mx-4 mb-1"
                        >
                          {lang === 'vi' ? 'Xem tất cả →' : 'View all →'}
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}

              {/* Account + quick links */}
              <div className="mt-2 pt-2 border-t border-surface-border space-y-0.5 px-2">
                <Link
                  to="/wishlist"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-semibold text-text-primary hover:text-primary hover:bg-primary/5 transition"
                >
                  <Heart className="w-4 h-4" />
                  {lang === 'vi' ? 'Yêu thích' : 'Wishlist'}
                </Link>

                {isAuthenticated ? (
                  <>
                    <Link
                      to="/profile"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-semibold text-text-primary hover:text-primary hover:bg-primary/5 transition"
                    >
                      <User className="w-4 h-4" />
                      {lang === 'vi' ? 'Hồ sơ của tôi' : 'My Profile'}
                    </Link>
                    <Link
                      to="/profile?tab=orders"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-semibold text-text-primary hover:text-primary hover:bg-primary/5 transition"
                    >
                      <Package className="w-4 h-4" />
                      {lang === 'vi' ? 'Đơn hàng của tôi' : 'My Orders'}
                    </Link>
                    {user?.role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-semibold text-primary hover:bg-primary/5 transition"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={() => { handleLogout(); setMobileOpen(false); }}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-semibold text-red-500 hover:bg-red-500/5 transition text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      {lang === 'vi' ? 'Đăng xuất' : 'Log out'}
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-semibold text-text-primary hover:text-primary hover:bg-primary/5 transition"
                    >
                      <User className="w-4 h-4" />
                      {lang === 'vi' ? 'Đăng nhập' : 'Log in'}
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-semibold text-primary hover:bg-primary/5 transition"
                    >
                      <Star className="w-4 h-4" />
                      {lang === 'vi' ? 'Đăng ký' : 'Sign up'}
                    </Link>
                  </>
                )}
              </div>
            </nav>

            {/* Footer: theme + language */}
            <div className="flex items-center justify-between px-5 py-4 border-t border-surface-border flex-shrink-0">
              <button
                onClick={toggle}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black border border-surface-border text-text-muted hover:border-primary hover:text-primary transition tracking-wider"
              >
                <Globe className="w-3.5 h-3.5" />
                {lang === 'vi' ? 'EN' : 'VI'}
              </button>
              <button
                onClick={toggleTheme}
                className="p-2 hover:bg-bg-raised rounded-full transition"
                title={dark ? 'Chế độ sáng' : 'Chế độ tối'}
              >
                {dark ? <Sun className="w-5 h-5 text-text-primary" /> : <Moon className="w-5 h-5 text-text-primary" />}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
    </>
  );
};

export default Navbar;
