import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Users, Zap, ArrowRight, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/formatCurrency.js';

const PACKAGES = [
  {
    id: 1,
    name: 'Academy Kit',
    tagline: 'Cho đội trẻ & phong trào',
    badge: null,
    savePercent: 20,
    originalPrice: 980000,
    discountedPrice: 784000,
    minPlayers: 10,
    accentColor: '#10B981',
    items: ['Áo đấu (in tên + số)', 'Quần short', 'Tất bóng đá', 'Bib tập luyện (5 cái)'],
  },
  {
    id: 2,
    name: 'Pro Team Kit',
    tagline: 'Chuẩn thi đấu chuyên nghiệp',
    badge: 'PHỔ BIẾN',
    badgeClass: 'bg-orange-500',
    savePercent: 20,
    originalPrice: 1200000,
    discountedPrice: 960000,
    minPlayers: 15,
    accentColor: '#F97316',
    items: ['Áo đấu premium (in tên + số)', 'Quần short thi đấu', 'Tất chính hãng', 'In logo CLB miễn phí'],
  },
  {
    id: 3,
    name: 'Champion Combo',
    tagline: 'Trang bị đầy đủ cả mùa giải',
    badge: 'GIÁ TRỊ NHẤT',
    badgeClass: 'bg-primary',
    savePercent: 20,
    originalPrice: 1850000,
    discountedPrice: 1480000,
    minPlayers: 15,
    accentColor: '#10B981',
    items: ['Áo home + away (2 bộ)', 'Quần short + quần tập', 'Tất (3 đôi)', 'In cao cấp + Thêu logo CLB'],
  },
  {
    id: 4,
    name: 'Ultimate Bundle',
    tagline: 'Toàn bộ gear cho đội chuyên nghiệp',
    badge: 'PREMIUM',
    badgeClass: 'bg-purple-600',
    savePercent: 25,
    originalPrice: 2500000,
    discountedPrice: 1875000,
    minPlayers: 20,
    accentColor: '#A855F7',
    items: ['2x Áo home + away', 'Quần short x2 + Quần tập', 'Tất bundle + Bib tập luyện', 'In premium + Túi riêng CLB', 'Dashboard quản lý đội bóng'],
  },
];

// ── Package card ───────────────────────────────────────────────────────────
const PackageCard = ({ pkg, index, selected, onSelect }) => (
  <motion.div
    initial={{ opacity: 0, y: 32 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
    onClick={() => onSelect(pkg.id)}
    className={`relative flex flex-col rounded-3xl overflow-hidden border cursor-pointer transition-all duration-300 ${
      selected
        ? 'border-primary/70 shadow-neon bg-surface scale-[1.02]'
        : 'border-surface-border bg-surface hover:border-primary/40 hover:shadow-[0_16px_48px_rgba(0,0,0,0.4)] hover:scale-[1.01]'
    }`}
  >
    {/* Selected accent bar */}
    <AnimatePresence>
      {selected && (
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          exit={{ scaleX: 0 }}
          className="h-1 w-full bg-gradient-to-r from-primary/50 via-primary to-primary/50 origin-left"
        />
      )}
    </AnimatePresence>

    {/* Selection check */}
    <AnimatePresence>
      {selected && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          className="absolute top-4 left-4 z-20"
        >
          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-neon-xs">
            <Star className="w-3.5 h-3.5 fill-white text-white" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* Badge */}
    {pkg.badge && (
      <div className={`absolute top-5 right-5 ${pkg.badgeClass} text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full z-10`}>
        {pkg.badge}
      </div>
    )}

    <div className="p-6 lg:p-7 flex flex-col flex-1">
      {/* Save badge */}
      <div className="inline-flex items-center gap-1.5 bg-red-500/15 text-red-400 border border-red-500/20 text-[10px] font-black uppercase px-3 py-1 rounded-full mb-5 w-fit">
        <Zap className="w-3 h-3" />
        Tiết kiệm {pkg.savePercent}%
      </div>

      {/* Name + tagline */}
      <h3 className="font-display text-2xl font-bold text-text-primary mb-1">{pkg.name}</h3>
      <p className="text-text-muted text-sm mb-5">{pkg.tagline}</p>

      {/* Price */}
      <div className="flex items-baseline gap-3 mb-5">
        <span className="font-display text-3xl font-black" style={{ color: pkg.accentColor }}>
          {formatCurrency(pkg.discountedPrice)}
        </span>
        <span className="text-text-muted text-base line-through">{formatCurrency(pkg.originalPrice)}</span>
        <span className="text-text-muted text-xs">/bộ</span>
      </div>

      {/* Min players */}
      <div className="flex items-center gap-2 text-xs text-text-muted mb-5 pb-5 border-b border-surface-border">
        <Users className="w-3.5 h-3.5 flex-shrink-0" />
        Tối thiểu {pkg.minPlayers} cầu thủ
      </div>

      {/* Item checklist */}
      <ul className="space-y-3 flex-1 mb-7">
        {pkg.items.map((item, i) => (
          <li key={i} className="flex items-start gap-3">
            <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: pkg.accentColor }} />
            <span className="text-sm text-text-secondary">{item}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Link
        to={`/bao-gia?package=${pkg.id}`}
        onClick={(e) => e.stopPropagation()}
        className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm uppercase tracking-wide transition-all duration-200 ${
          selected
            ? 'bg-primary text-white shadow-neon hover:shadow-neon-lg'
            : 'border-2 border-surface-border text-text-primary hover:border-primary/50 hover:bg-primary/5'
        }`}
      >
        {selected ? 'Nhận báo giá ngay' : 'Chọn gói này'}
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  </motion.div>
);

// ── Main ───────────────────────────────────────────────────────────────────
const TeamComboPackages = () => {
  const [selectedPkg, setSelectedPkg] = useState(null);

  const handleSelect = (id) => setSelectedPkg((prev) => (prev === id ? null : id));

  return (
    <section className="py-10 lg:py-12 bg-bg-base overflow-hidden">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-20">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-[0.22em] px-3.5 py-1.5 rounded-full mb-5">
            <Users className="w-3 h-3" />
            Đặt Theo Nhóm
          </div>
          <h2 className="font-display text-4xl md:text-5xl xl:text-6xl font-bold text-text-primary mb-3">
            COMBO ĐỒNG PHỤC ĐỘI
          </h2>
          <p className="font-display text-lg font-bold text-primary mb-3">
            Trang bị cả đội — Tiết kiệm hơn, đẹp hơn
          </p>
          <p className="text-text-muted text-sm max-w-xl mx-auto">
            Chọn gói phù hợp với đội bạn. Bấm vào thẻ để chọn, sau đó nhận báo giá chi tiết.
          </p>
        </motion.div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 lg:gap-6">
          {PACKAGES.map((pkg, i) => (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              index={i}
              selected={selectedPkg === pkg.id}
              onSelect={handleSelect}
            />
          ))}
        </div>

        {/* Selected CTA banner */}
        <AnimatePresence>
          {selectedPkg && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-primary/10 border border-primary/30 rounded-2xl px-6 py-4"
            >
              <div>
                <p className="font-bold text-text-primary">
                  Đã chọn: <span className="text-primary">{PACKAGES.find(p => p.id === selectedPkg)?.name}</span>
                </p>
                <p className="text-sm text-text-muted">Nhấn nhận báo giá để chúng tôi liên hệ tư vấn chi tiết</p>
              </div>
              <Link
                to={`/bao-gia?package=${selectedPkg}`}
                className="flex-shrink-0 flex items-center gap-2 bg-primary text-white font-bold uppercase tracking-wider px-6 py-3 rounded-xl hover:shadow-neon transition-all"
              >
                Nhận báo giá ngay
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Trust footer */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-6 mt-10 pt-8 border-t border-surface-border"
        >
          {[
            'Giảm giá theo số lượng',
            'In ấn theo yêu cầu',
            'Giao hàng nhanh 3–5 ngày',
            'Bảo hành chất lượng in',
          ].map((text, i) => (
            <span key={i} className="flex items-center gap-2 text-sm text-text-muted">
              <span className="text-primary font-bold">✓</span>
              {text}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default TeamComboPackages;
