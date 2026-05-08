import { Link, NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, ShoppingCart, User, Heart } from 'lucide-react';
import { useCartStore } from '../../store/cartStore.js';

const Navbar = () => {
  const totalItems = useCartStore((state) => state.getTotalItems());

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Kits', path: '/products?category=kits' },
    { label: 'Boots', path: '/products?category=boots' },
    { label: 'Apparel', path: '/products?category=apparel' },
    { label: 'Brands', path: '/brands' },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-cream-200"
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-6">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <span className="font-display text-3xl font-bold text-ink">
            Mi<span className="text-primary">Q</span>
          </span>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `font-medium uppercase tracking-wide text-sm transition-colors ${
                  isActive ? 'text-primary border-b-2 border-primary pb-1' : 'text-ink hover:text-primary'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        {/* Search */}
        <div className="hidden lg:flex flex-1 max-w-md relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
          <input
            type="text"
            placeholder="Tìm áo đấu, giày, phụ kiện..."
            className="w-full pl-11 pr-4 py-2 bg-cream rounded-full border border-cream-200 focus:border-primary focus:outline-none text-sm"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-cream rounded-full transition">
            <User className="w-5 h-5 text-ink" />
          </button>
          <button className="p-2 hover:bg-cream rounded-full transition">
            <Heart className="w-5 h-5 text-ink" />
          </button>
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
  );
};

export default Navbar;