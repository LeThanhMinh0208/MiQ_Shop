import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Search, ArrowLeft } from 'lucide-react';

// ── Animated football illustration ────────────────────────────────────────────
const FootballScene = () => (
  <div className="relative w-72 h-44 mx-auto mb-2">

    {/* Goalpost */}
    <svg
      viewBox="0 0 288 176"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute inset-0 w-full h-full"
    >
      {/* Ground */}
      <line x1="0" y1="160" x2="288" y2="160" stroke="#E5E7EB" strokeWidth="2" />

      {/* Left post */}
      <rect x="28" y="72" width="6" height="88" rx="3" fill="#D1D5DB" />
      {/* Right post */}
      <rect x="254" y="72" width="6" height="88" rx="3" fill="#D1D5DB" />
      {/* Crossbar */}
      <rect x="28" y="72" width="232" height="6" rx="3" fill="#D1D5DB" />

      {/* Net lines (horizontal) */}
      {[85, 100, 116, 132, 148].map((y) => (
        <line key={y} x1="28" y1={y} x2="260" y2={y} stroke="#F3F4F6" strokeWidth="1" />
      ))}
      {/* Net lines (vertical) */}
      {[60, 92, 124, 156, 188, 220, 252].map((x) => (
        <line key={x} x1={x} y1="78" x2={x} y2="160" stroke="#F3F4F6" strokeWidth="1" />
      ))}
    </svg>

    {/* Animated football — shoots wide right */}
    <motion.div
      className="absolute w-10 h-10 text-2xl select-none"
      style={{ top: '120px', left: '10px' }}
      animate={{
        x:    [0, 90, 230, 280],
        y:    [0, -60, -45, 20],
        rotate: [0, 180, 360, 540],
      }}
      transition={{
        duration: 2.2,
        repeat: Infinity,
        repeatDelay: 1.8,
        ease: [0.25, 0.46, 0.45, 0.94],
        times: [0, 0.3, 0.65, 1],
      }}
    >
      ⚽
    </motion.div>

    {/* Miss spark */}
    <motion.div
      className="absolute right-4 top-14 text-base"
      animate={{ opacity: [0, 0, 0, 1, 0], scale: [0.5, 0.5, 0.5, 1.2, 0.5] }}
      transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 1.8, times: [0, 0.6, 0.85, 0.92, 1] }}
    >
      💥
    </motion.div>
  </div>
);

// ── Digit animation ────────────────────────────────────────────────────────────
const AnimatedDigit = ({ digit, delay }) => (
  <motion.span
    initial={{ opacity: 0, y: 40, rotateX: -25 }}
    animate={{ opacity: 1, y: 0, rotateX: 0 }}
    transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
    className="inline-block"
  >
    {digit}
  </motion.span>
);

// ── Main 404 page ──────────────────────────────────────────────────────────────
const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[90vh] bg-bg-base flex flex-col items-center justify-center px-6 text-center py-16">

      {/* 404 heading */}
      <motion.p
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="text-xs font-bold uppercase tracking-[0.4em] text-primary mb-4"
      >
        Lỗi trang
      </motion.p>

      <h1
        className="font-display font-bold leading-none mb-2"
        style={{
          fontSize: 'clamp(5rem, 20vw, 10rem)',
          perspective: '600px',
          background: 'linear-gradient(135deg, #C2410C 0%, #E8590C 50%, #FB923C 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        <AnimatedDigit digit="4" delay={0.1} />
        <AnimatedDigit digit="0" delay={0.2} />
        <AnimatedDigit digit="4" delay={0.3} />
      </h1>

      {/* Football scene */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <FootballScene />
      </motion.div>

      {/* Text */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
      >
        <h2 className="font-display text-2xl md:text-3xl font-bold mb-3">
          Trang không tồn tại
        </h2>
        <p className="text-text-muted max-w-sm leading-relaxed mb-8">
          Đường dẫn bạn truy cập không còn tồn tại hoặc đã được di chuyển.
          Hãy thử tìm kiếm hoặc quay về trang chủ.
        </p>
      </motion.div>

      {/* CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.85 }}
        className="flex flex-wrap items-center justify-center gap-3"
      >
        <button
          onClick={() => navigate(-1)}
          className="btn-outline flex items-center gap-2 !py-3"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại
        </button>
        <Link to="/" className="btn-primary flex items-center gap-2 !py-3">
          <Home className="w-4 h-4" />
          Trang chủ
        </Link>
        <Link
          to="/products"
          className="flex items-center gap-2 px-5 py-3 rounded-xl border-2 border-surface-border font-bold text-sm uppercase tracking-wide hover:border-primary hover:text-primary text-text-secondary transition"
        >
          <Search className="w-4 h-4" />
          Xem sản phẩm
        </Link>
      </motion.div>

      {/* Popular links */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1 }}
        className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
      >
        <span className="text-xs font-semibold uppercase tracking-wide text-text-muted">
          Trang phổ biến:
        </span>
        {[
          { label: 'Giày bóng đá', to: '/products?category=boots' },
          { label: 'Áo đấu',       to: '/products?category=kits' },
          { label: 'Giỏ hàng',     to: '/cart' },
          { label: 'Tài khoản',    to: '/profile' },
        ].map(({ label, to }) => (
          <Link
            key={to}
            to={to}
            className="text-xs font-semibold text-primary hover:underline underline-offset-2"
          >
            {label}
          </Link>
        ))}
      </motion.div>
    </div>
  );
};

export default NotFound;
