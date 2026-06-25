import { motion } from 'framer-motion';
import { Heart, Search, Package, ShoppingCart, Frown, Inbox } from 'lucide-react';

// ── Animated illustrations ─────────────────────────────────────────────────────

const HeartIllustration = () => (
  <div className="relative w-24 h-24">
    {/* Floating mini hearts */}
    {[
      { size: 10, top: '0%',  left: '20%', delay: 0.2, dur: 2.2 },
      { size: 14, top: '10%', left: '60%', delay: 0.6, dur: 2.6 },
      { size: 8,  top: '30%', left: '80%', delay: 0.0, dur: 2.0 },
    ].map(({ size, top, left, delay, dur }, i) => (
      <motion.div
        key={i}
        className="absolute text-red-300"
        style={{ top, left, fontSize: size }}
        animate={{ y: [0, -18, -36], opacity: [0, 0.8, 0] }}
        transition={{ duration: dur, delay, repeat: Infinity, ease: 'easeOut' }}
      >
        ♥
      </motion.div>
    ))}
    {/* Main heart */}
    <motion.div
      className="absolute inset-0 flex items-center justify-center"
      animate={{ scale: [1, 1.08, 1] }}
      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
    >
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-50 to-rose-100 border border-red-200 flex items-center justify-center">
        <Heart className="w-9 h-9 text-red-300 stroke-[1.5]" />
      </div>
    </motion.div>
  </div>
);

const SearchIllustration = () => (
  <div className="relative w-24 h-24 flex items-center justify-center">
    <motion.div
      animate={{ rotate: [0, 15, -15, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1 }}
    >
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cream to-cream-200 border border-surface-border flex items-center justify-center">
        <Search className="w-9 h-9 text-text-muted/40 stroke-[1.5]" />
      </div>
    </motion.div>
    {/* Orbiting dot */}
    <motion.div
      className="absolute w-3 h-3 rounded-full bg-primary/30"
      animate={{ rotate: 360 }}
      transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
      style={{ transformOrigin: '48px 48px', top: 0, left: '50%', marginLeft: -6 }}
    />
  </div>
);

const PackageIllustration = () => (
  <motion.div
    animate={{ y: [0, -8, 0] }}
    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
  >
    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cream to-cream-200 border border-surface-border flex items-center justify-center">
      <Package className="w-9 h-9 text-text-muted/40 stroke-[1.5]" />
    </div>
  </motion.div>
);

const CartIllustration = () => (
  <motion.div
    animate={{ rotate: [-3, 3, -3] }}
    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
  >
    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-50 to-emerald-50 border border-primary/20 flex items-center justify-center">
      <ShoppingCart className="w-9 h-9 text-primary/30 stroke-[1.5]" />
    </div>
  </motion.div>
);

const GenericIllustration = () => (
  <motion.div
    animate={{ scale: [1, 1.05, 1] }}
    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
  >
    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cream to-cream-200 border border-surface-border flex items-center justify-center">
      <Inbox className="w-9 h-9 text-text-muted/40 stroke-[1.5]" />
    </div>
  </motion.div>
);

// ── Presets ────────────────────────────────────────────────────────────────────
const PRESETS = {
  wishlist: {
    illustration: <HeartIllustration />,
    title: 'Chưa có sản phẩm yêu thích',
    description: 'Nhấn ♥ trên bất kỳ sản phẩm nào để lưu vào danh sách yêu thích của bạn.',
  },
  search: {
    illustration: <SearchIllustration />,
    title: 'Không tìm thấy kết quả',
    description: 'Thử từ khóa khác hoặc điều chỉnh bộ lọc để tìm sản phẩm phù hợp.',
  },
  orders: {
    illustration: <PackageIllustration />,
    title: 'Chưa có đơn hàng nào',
    description: 'Khi bạn đặt hàng, thông tin đơn hàng sẽ xuất hiện tại đây.',
  },
  cart: {
    illustration: <CartIllustration />,
    title: 'Giỏ hàng trống',
    description: 'Thêm sản phẩm vào giỏ để tiếp tục mua sắm.',
  },
  generic: {
    illustration: <GenericIllustration />,
    title: 'Không có dữ liệu',
    description: 'Hiện tại chưa có nội dung nào để hiển thị.',
  },
};

// ── Main component ─────────────────────────────────────────────────────────────
/**
 * EmptyState renders an animated illustration + title + description + optional CTA.
 *
 * Props:
 *  variant     — 'wishlist' | 'search' | 'orders' | 'cart' | 'generic'
 *  title       — overrides the preset title
 *  description — overrides the preset description
 *  action      — { label, onClick } or a React node
 *  className   — wrapper class overrides
 */
const EmptyState = ({
  variant = 'generic',
  title,
  description,
  action,
  className = '',
}) => {
  const preset = PRESETS[variant] ?? PRESETS.generic;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={`flex flex-col items-center justify-center text-center py-16 px-6 ${className}`}
    >
      {/* Pulse ring behind illustration */}
      <div className="relative mb-7">
        <motion.div
          className="absolute -inset-4 rounded-3xl border-2 border-dashed border-surface-border"
          animate={{ scale: [1, 1.05, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
        {preset.illustration}
      </div>

      <h3 className="font-display text-2xl font-bold mb-2">
        {title ?? preset.title}
      </h3>
      <p className="text-sm text-text-muted max-w-xs leading-relaxed mb-6">
        {description ?? preset.description}
      </p>

      {action && (
        typeof action === 'object' && action.label ? (
          <button
            onClick={action.onClick}
            className="btn-primary text-sm !py-2.5 !px-6"
          >
            {action.label}
          </button>
        ) : action
      )}
    </motion.div>
  );
};

export default EmptyState;
