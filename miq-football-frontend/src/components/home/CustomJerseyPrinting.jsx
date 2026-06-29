import { motion } from 'framer-motion';
import { Palette, Users, Printer, Truck, ShieldCheck, Star, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const STEPS = [
  {
    step: '01',
    icon: Palette,
    title: 'Chọn Thiết Kế',
    desc: 'Chọn từ 50+ mẫu thiết kế có sẵn hoặc gửi file thiết kế riêng của đội bạn.',
    accent: '#E8590C',
  },
  {
    step: '02',
    icon: Users,
    title: 'Gửi Danh Sách Đội',
    desc: 'Cung cấp danh sách cầu thủ — tên, số áo và kích cỡ cụ thể cho từng người.',
    accent: '#F97316',
  },
  {
    step: '03',
    icon: Printer,
    title: 'In Ấn Cao Cấp',
    desc: 'Công nghệ sublimation nhiệt độ cao — màu sắc sắc nét, không bong tróc, không phai.',
    accent: '#8B5CF6',
  },
  {
    step: '04',
    icon: Truck,
    title: 'Giao Tận Nơi',
    desc: 'Đóng gói chuyên nghiệp, giao toàn quốc trong 3–5 ngày làm việc có theo dõi.',
    accent: '#F43F5E',
  },
];

const GUARANTEES = [
  { icon: ShieldCheck, label: 'Không bong tróc' },
  { icon: Star,        label: 'Màu bền vĩnh cửu' },
  { icon: Users,       label: 'Tối thiểu 10 áo'   },
  { icon: Truck,       label: 'Giao 3–5 ngày'      },
  { icon: Zap,         label: 'In trong 48 giờ'    },
];

// ── Step card ──────────────────────────────────────────────────────────────
const StepCard = ({ step, index, total }) => {
  const Icon = step.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] }}
      className="relative flex-1 min-w-0"
    >
      {/* Connector line + arrowhead (desktop) */}
      {index < total - 1 && (
        <div
          className="hidden xl:flex absolute top-8 items-center pointer-events-none z-10"
          style={{ left: 'calc(100% + 12px)', width: 24 }}
        >
          <div className="h-px bg-surface-border flex-1" />
          <div
            className="w-0 h-0"
            style={{
              borderTop: '4px solid transparent',
              borderBottom: '4px solid transparent',
              borderLeft: '5px solid #2A2A2D',
            }}
          />
        </div>
      )}

      <div className="relative p-7 rounded-3xl bg-surface border border-surface-border hover:border-primary/30 hover:shadow-neon-xs transition-all duration-300 h-full group">
        {/* Big step watermark */}
        <div
          className="absolute top-4 right-5 font-display text-6xl font-black select-none pointer-events-none opacity-[0.07]"
          style={{ color: step.accent }}
        >
          {step.step}
        </div>

        {/* Icon */}
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-105"
          style={{ background: `${step.accent}18`, border: `1.5px solid ${step.accent}30` }}
        >
          <Icon className="w-6 h-6" style={{ color: step.accent }} />
        </div>

        {/* Label */}
        <div
          className="text-[10px] font-black uppercase tracking-[0.25em] mb-2"
          style={{ color: step.accent }}
        >
          Bước {step.step}
        </div>

        <h3 className="font-display text-xl font-bold text-text-primary mb-2.5">{step.title}</h3>
        <p className="text-text-muted text-sm leading-relaxed">{step.desc}</p>
      </div>
    </motion.div>
  );
};

// ── Main ───────────────────────────────────────────────────────────────────
const CustomJerseyPrinting = () => (
  <section
    className="py-16 lg:py-20 overflow-hidden relative"
    style={{ background: 'linear-gradient(180deg, #0A0A0B 0%, #0D1F17 45%, #0A0A0B 100%)' }}
  >
    {/* Subtle pitch grid */}
    <div
      className="absolute inset-0 opacity-[0.025] pointer-events-none"
      style={{
        backgroundImage:
          'linear-gradient(#E8590C 1px, transparent 1px), linear-gradient(90deg, #E8590C 1px, transparent 1px)',
        backgroundSize: '44px 44px',
      }}
    />

    <div className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-20">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-[0.22em] px-3.5 py-1.5 rounded-full mb-5">
          <Printer className="w-3 h-3" />
          Dịch Vụ In Ấn
        </div>
        <h2 className="font-display text-4xl md:text-5xl xl:text-6xl font-black text-text-primary mb-3">
          IN ĐẶT THEO ĐỘI
        </h2>
        <p className="font-display text-lg font-bold text-primary mb-3">
          Áo đấu riêng — Bản sắc riêng — Đội bóng riêng
        </p>
        <p className="text-text-muted text-sm max-w-lg mx-auto">
          Từ 10 áo trở lên. Công nghệ sublimation không bong tróc — bảo hành trọn đời chất lượng in.
        </p>
      </motion.div>

      {/* 4 steps */}
      <div className="flex flex-col sm:grid sm:grid-cols-2 xl:flex xl:flex-row gap-5 lg:gap-6 mb-14">
        {STEPS.map((step, i) => (
          <StepCard key={i} step={step} index={i} total={STEPS.length} />
        ))}
      </div>

      {/* Guarantee bar + CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="flex flex-col lg:flex-row items-center justify-between gap-7 p-7 rounded-3xl border border-primary/20 bg-primary/5"
      >
        <div className="flex flex-wrap justify-center lg:justify-start gap-3">
          {GUARANTEES.map((g, i) => {
            const GIcon = g.icon;
            return (
              <div key={i} className="flex items-center gap-2 bg-surface border border-surface-border px-4 py-2.5 rounded-full text-sm text-text-secondary font-semibold">
                <GIcon className="w-4 h-4 text-primary flex-shrink-0" />
                {g.label}
              </div>
            );
          })}
        </div>

        <Link
          to="/print-order"
          className="flex-shrink-0 inline-flex items-center gap-3 bg-primary hover:bg-primary-600 text-white font-black text-sm uppercase tracking-wide px-8 py-4 rounded-2xl transition-all duration-200 shadow-neon hover:shadow-neon-lg whitespace-nowrap"
        >
          Đặt In Ngay
          <Printer className="w-4 h-4" />
        </Link>
      </motion.div>
    </div>
  </section>
);

export default CustomJerseyPrinting;
