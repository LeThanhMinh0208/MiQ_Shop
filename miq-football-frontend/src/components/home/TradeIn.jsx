import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, ChevronDown, CheckCircle, X, Package, Star, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { useLanguageStore } from '../../store/languageStore.js';

// ── Trade-in rate table ────────────────────────────────────────────────────────
const RATES = {
  'Giày': {
    'Mới (95%+)':         [0.60, 0.70],
    'Tốt (80-95%)':       [0.40, 0.55],
    'Trung bình (60-80%)': [0.20, 0.35],
    'Cũ (dưới 60%)':      [0.05, 0.15],
  },
  'Áo đấu': {
    'Mới (95%+)':         [0.50, 0.60],
    'Tốt (80-95%)':       [0.30, 0.45],
    'Trung bình (60-80%)': [0.15, 0.25],
    'Cũ (dưới 60%)':      [0.05, 0.10],
  },
  'Phụ kiện': {
    'Mới (95%+)':         [0.40, 0.50],
    'Tốt (80-95%)':       [0.25, 0.35],
    'Trung bình (60-80%)': [0.10, 0.20],
    'Cũ (dưới 60%)':      [0.00, 0.05],
  },
};

const PRODUCT_TYPES = Object.keys(RATES);
const CONDITIONS = ['Mới (95%+)', 'Tốt (80-95%)', 'Trung bình (60-80%)', 'Cũ (dưới 60%)'];

const STEPS = [
  { icon: Package, label: 'Mang sản phẩm', sub: 'Đến cửa hàng MiQ gần nhất' },
  { icon: Star,    label: 'Kiểm tra & định giá', sub: 'Đội ngũ chuyên gia thẩm định' },
  { icon: RefreshCw, label: 'Đổi sản phẩm mới', sub: 'Áp dụng ngay vào đơn mua mới' },
];

// ── Success Modal ──────────────────────────────────────────────────────────────
const SuccessModal = ({ onClose }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[999] flex items-center justify-center p-4"
    onClick={onClose}
  >
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
    <motion.div
      initial={{ opacity: 0, scale: 0.88, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: 10 }}
      transition={{ type: 'spring', stiffness: 220, damping: 22 }}
      onClick={(e) => e.stopPropagation()}
      className="relative bg-bg-elevated border border-surface-border rounded-3xl shadow-2xl w-full max-w-md p-8 text-center"
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-surface hover:bg-bg-overlay transition text-text-muted"
      >
        <X className="w-4 h-4" />
      </button>

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
        className="w-20 h-20 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-5"
      >
        <CheckCircle className="w-10 h-10 text-primary" />
      </motion.div>

      <h3 className="font-display text-2xl font-bold text-text-primary mb-2">
        Đăng ký thành công!
      </h3>
      <p className="text-text-muted mb-6 text-sm leading-relaxed">
        Cảm ơn bạn đã đăng ký chương trình <span className="font-bold text-primary">Thu Cũ Đổi Mới</span>. Hãy mang sản phẩm đến một trong các cửa hàng MiQ Sport để được thẩm định và đổi ngay!
      </p>

      <div className="bg-surface rounded-2xl p-4 mb-6 text-left space-y-2">
        <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">Lưu ý khi đến cửa hàng</p>
        {['Mang theo sản phẩm cần đổi', 'Giữ nguyên trạng thái, không giặt/sửa', 'Mang theo hóa đơn mua hàng nếu có', 'Nhân viên sẽ thẩm định trong 15 phút'].map((note, i) => (
          <div key={i} className="flex items-center gap-2 text-sm text-text-secondary">
            <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
            {note}
          </div>
        ))}
      </div>

      <button
        onClick={onClose}
        className="w-full bg-primary text-white font-bold rounded-xl py-3 hover:bg-primary/90 transition"
      >
        Đã hiểu, đến cửa hàng ngay!
      </button>
    </motion.div>
  </motion.div>
);

// ── Select button ──────────────────────────────────────────────────────────────
const SelectBtn = ({ label, selected, onClick }) => (
  <motion.button
    whileTap={{ scale: 0.96 }}
    onClick={onClick}
    className={`px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
      selected
        ? 'border-primary bg-primary/10 text-primary'
        : 'border-surface-border text-text-secondary hover:border-primary/40 hover:text-text-primary'
    }`}
  >
    {label}
  </motion.button>
);

// ── Animated value counter ─────────────────────────────────────────────────────
const AnimatedValue = ({ value, label }) => (
  <motion.div
    key={value}
    initial={{ opacity: 0, y: 8, scale: 0.92 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ type: 'spring', stiffness: 260, damping: 22 }}
    className="text-center"
  >
    <div className="font-display text-2xl lg:text-3xl font-black text-primary">
      {value}
    </div>
    <div className="text-xs text-text-muted mt-0.5">{label}</div>
  </motion.div>
);

// ── Main Component ─────────────────────────────────────────────────────────────
const TradeIn = () => {
  const t = useLanguageStore((s) => s.t);
  const navigate = useNavigate();
  const [productType, setProductType] = useState('');
  const [condition, setCondition] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [showModal, setShowModal] = useState(false);

  const rates = productType && condition ? RATES[productType]?.[condition] : null;
  const price = parseInt(originalPrice.replace(/[^\d]/g, '')) || 0;

  const minValue = rates && price ? Math.round(price * rates[0]) : null;
  const maxValue = rates && price ? Math.round(price * rates[1]) : null;

  const handlePriceInput = (e) => {
    const raw = e.target.value.replace(/[^\d]/g, '');
    setOriginalPrice(raw ? Number(raw).toLocaleString('vi-VN') : '');
  };

  const canSubmit = productType && condition && price > 0;

  return (
    <>
      <section className="py-12 lg:py-16 bg-bg-elevated overflow-hidden">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-20">

          {/* ── Header ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-[0.22em] px-3.5 py-1.5 rounded-full mb-4">
              <RefreshCw className="w-3 h-3" />
              Chương trình ưu đãi
            </div>
            <h2 className="font-display text-4xl md:text-5xl xl:text-6xl font-bold text-text-primary mb-3">
              {t('tradeIn')}
            </h2>
            <p className="font-display text-lg font-bold text-primary mb-2">
              Mang đồ cũ — Nhận giảm giá ngay hôm nay
            </p>
            <p className="text-text-muted text-sm max-w-lg mx-auto">
              Chương trình thu đổi giúp bạn tiết kiệm tối đa khi nâng cấp trang bị bóng đá
            </p>
          </motion.div>

          {/* ── Steps ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            {STEPS.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-4 bg-bg-raised rounded-2xl p-5 border border-surface-border"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <step.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-black text-primary">Bước {i + 1}</span>
                  </div>
                  <p className="font-bold text-text-primary text-sm">{step.label}</p>
                  <p className="text-xs text-text-muted">{step.sub}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* ── Main two-column layout ── */}
          <div className="grid lg:grid-cols-2 gap-8">

            {/* Left — info */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-3xl p-7 lg:p-8 border border-primary/20 flex flex-col justify-between"
            >
              <div>
                <h3 className="font-display text-2xl font-bold text-text-primary mb-3">
                  Tại sao chọn chương trình Thu Cũ Đổi Mới?
                </h3>
                <p className="text-text-muted text-sm leading-relaxed mb-6">
                  Thay vì để đồ cũ lãng phí, hãy mang chúng đến MiQ Sport. Chúng tôi thẩm định công bằng và cho bạn chiết khấu ngay vào đơn mua mới.
                </p>

                {/* Benefit list */}
                <ul className="space-y-3 mb-6">
                  {[
                    { v: 'Thẩm định minh bạch, công bằng' },
                    { v: 'Áp dụng cho hầu hết các thương hiệu' },
                    { v: 'Tiết kiệm đến 70% so với mua mới' },
                    { v: 'Không cần hóa đơn gốc' },
                  ].map((b, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-text-secondary">
                      <span className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-3 h-3 text-primary" />
                      </span>
                      {b.v}
                    </li>
                  ))}
                </ul>

                {/* Rate table preview */}
                <div className="bg-bg-elevated rounded-2xl p-4 border border-surface-border">
                  <p className="text-xs font-black uppercase tracking-widest text-text-muted mb-3">Tỷ lệ thu đổi</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      ['Giày mới 95%+', '60 – 70%'],
                      ['Giày tốt 80%+', '40 – 55%'],
                      ['Áo đấu mới', '50 – 60%'],
                      ['Phụ kiện mới', '40 – 50%'],
                    ].map(([label, rate], i) => (
                      <div key={i} className="flex justify-between bg-surface rounded-lg px-3 py-2">
                        <span className="text-text-muted">{label}</span>
                        <span className="font-bold text-primary">{rate}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right — calculator */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-bg-raised rounded-3xl p-7 lg:p-8 border border-surface-border"
            >
              <h3 className="font-display text-xl font-bold text-text-primary mb-6">
                Tính giá trị thu đổi
              </h3>

              {/* Product type */}
              <div className="mb-5">
                <p className="text-xs font-bold uppercase tracking-widest text-text-muted mb-3">
                  Loại sản phẩm
                </p>
                <div className="flex flex-wrap gap-2">
                  {PRODUCT_TYPES.map((t) => (
                    <SelectBtn
                      key={t}
                      label={t}
                      selected={productType === t}
                      onClick={() => setProductType(t)}
                    />
                  ))}
                </div>
              </div>

              {/* Condition */}
              <div className="mb-5">
                <p className="text-xs font-bold uppercase tracking-widest text-text-muted mb-3">
                  Tình trạng
                </p>
                <div className="flex flex-wrap gap-2">
                  {CONDITIONS.map((c) => (
                    <SelectBtn
                      key={c}
                      label={c}
                      selected={condition === c}
                      onClick={() => setCondition(c)}
                    />
                  ))}
                </div>
              </div>

              {/* Original price input */}
              <div className="mb-6">
                <p className="text-xs font-bold uppercase tracking-widest text-text-muted mb-2">
                  Giá gốc ước tính (₫)
                </p>
                <input
                  type="text"
                  inputMode="numeric"
                  value={originalPrice}
                  onChange={handlePriceInput}
                  placeholder="Ví dụ: 1.500.000"
                  className="w-full px-4 py-3 rounded-xl border border-surface-border bg-bg-elevated text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm transition"
                />
              </div>

              {/* Result panel */}
              <AnimatePresence mode="wait">
                {minValue !== null && maxValue !== null ? (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="bg-primary/10 border border-primary/25 rounded-2xl p-5 mb-5"
                  >
                    <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3 text-center">
                      Giá trị thu đổi ước tính
                    </p>
                    <div className="flex items-center justify-center gap-4">
                      <AnimatedValue
                        value={formatCurrency(minValue)}
                        label="Thấp nhất"
                      />
                      <span className="text-text-muted font-bold text-lg">–</span>
                      <AnimatedValue
                        value={formatCurrency(maxValue)}
                        label="Cao nhất"
                      />
                    </div>
                    <p className="text-center text-xs text-text-muted mt-3">
                      * Giá trị thực tế sau khi kiểm định trực tiếp
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="placeholder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-surface rounded-2xl p-5 mb-5 text-center text-text-muted text-sm"
                  >
                    <RefreshCw className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    Chọn loại sản phẩm, tình trạng và nhập giá gốc để xem ước tính
                  </motion.div>
                )}
              </AnimatePresence>

              {/* CTA */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/trade-in')}
                className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold rounded-xl py-3.5 hover:bg-primary/90 transition"
              >
                <RefreshCw className="w-4 h-4" />
                Đăng ký đổi ngay
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </motion.div>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {showModal && <SuccessModal onClose={() => setShowModal(false)} />}
      </AnimatePresence>
    </>
  );
};

export default TradeIn;
