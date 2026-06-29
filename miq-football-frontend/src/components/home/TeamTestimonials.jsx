import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const TESTIMONIALS = [
  {
    id: 1,
    teamName: 'FC Thống Nhất',
    league: 'Giải phong trào TP.HCM',
    photo: 'https://placehold.co/400x260/141416/10B981?text=FC+Thống+Nhất',
    quote: 'Vải cực kỳ thoáng mát và nhẹ. Cả đội mặc thoải mái suốt 90 phút mà không thấm mồ hôi. Đội vô địch mùa này với bộ áo MiQ!',
    stars: 5,
    season: 'Mùa giải 2024–25',
    accentColor: '#E8590C',
  },
  {
    id: 2,
    teamName: 'Rồng Vàng FC',
    league: 'Giải 7 người Hà Nội',
    photo: 'https://placehold.co/400x260/141416/F97316?text=Rồng+Vàng+FC',
    quote: 'Đặt 18 áo, giao trong 4 ngày. In số tên sắc nét, không bong tróc sau nhiều lần giặt. Dịch vụ tư vấn nhiệt tình, sẽ đặt lại mùa sau!',
    stars: 5,
    season: 'Đặt tháng 5/2025',
    accentColor: '#F97316',
  },
  {
    id: 3,
    teamName: 'Sao Biển FC',
    league: 'Giải công nhân Bình Dương',
    photo: 'https://placehold.co/400x260/141416/8B5CF6?text=Sao+Biển+FC',
    quote: 'Chất lượng vải vượt xa kỳ vọng. Màu sắc đẹp, đường may chắc chắn. Đội được nhiều người hỏi mua áo — quảng cáo miễn phí luôn!',
    stars: 5,
    season: 'Mùa giải 2025',
    accentColor: '#8B5CF6',
  },
  {
    id: 4,
    teamName: 'Hổ Trắng FC',
    league: 'Giải 5 người Đà Nẵng',
    photo: 'https://placehold.co/400x260/141416/F43F5E?text=Hổ+Trắng+FC',
    quote: 'Tư vấn thiết kế chuyên nghiệp, logo in rất đẹp và sắc nét. Giá cả hợp lý cho chất lượng premium. 5 sao chưa đủ để mô tả!',
    stars: 5,
    season: 'Đặt tháng 3/2025',
    accentColor: '#F43F5E',
  },
  {
    id: 5,
    teamName: 'Bão Lửa FC',
    league: 'Giải phong trào Cần Thơ',
    photo: 'https://placehold.co/400x260/141416/EAB308?text=Bão+Lửa+FC',
    quote: 'Đã đặt 3 mùa liên tiếp tại MiQ. Chất lượng ngày càng tốt hơn, giá không đổi. Đây là địa chỉ tin cậy của đội chúng tôi.',
    stars: 5,
    season: 'Khách hàng thân thiết 3 năm',
    accentColor: '#EAB308',
  },
  {
    id: 6,
    teamName: 'Thanh Long FC',
    league: 'Giải cơ quan Nha Trang',
    photo: 'https://placehold.co/400x260/141416/14B8A6?text=Thanh+Long+FC',
    quote: 'Giao nhanh, đóng gói đẹp. Cả đội mặc đồng phục mới ra sân ai cũng khen. Tinh thần đội đang lên cao vòi vọi!',
    stars: 5,
    season: 'Mùa giải 2025',
    accentColor: '#14B8A6',
  },
];

// ── Star row ───────────────────────────────────────────────────────────────
const Stars = ({ count = 5 }) => (
  <div className="flex items-center gap-0.5">
    {Array.from({ length: count }, (_, i) => (
      <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
    ))}
  </div>
);

// ── Testimonial card ───────────────────────────────────────────────────────
const TestimonialCard = ({ item }) => (
  <div className="flex-shrink-0 w-80 sm:w-96 bg-surface border border-surface-border rounded-3xl overflow-hidden select-none">
    <div className="relative h-44 bg-bg-raised overflow-hidden">
      <img
        src={item.photo}
        alt={item.teamName}
        loading="lazy"
        draggable={false}
        className="w-full h-full object-cover"
        onError={(e) => { e.target.style.display = 'none'; }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-surface/80 to-transparent" />
      <div
        className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center border"
        style={{ background: `${item.accentColor}22`, borderColor: `${item.accentColor}44` }}
      >
        <Quote className="w-3.5 h-3.5" style={{ color: item.accentColor }} />
      </div>
    </div>

    <div className="p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-display font-bold text-text-primary text-base leading-tight">{item.teamName}</h3>
          <p className="text-[11px] text-text-muted mt-0.5">{item.league}</p>
        </div>
        <Stars count={item.stars} />
      </div>
      <p className="text-text-secondary text-sm leading-relaxed line-clamp-3 mb-3">
        "{item.quote}"
      </p>
      <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{item.season}</span>
    </div>
  </div>
);

// ── Main ───────────────────────────────────────────────────────────────────
const TeamTestimonials = () => {
  const scrollRef = useRef(null);
  const animRef   = useRef(null);
  const pausedRef = useRef(false);

  // Infinite auto-scroll — same RAF pattern as FlashSale
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let last = null;
    const SPEED = 0.5;
    const step = (ts) => {
      if (last !== null && !pausedRef.current) {
        el.scrollLeft += SPEED * (ts - last);
        if (el.scrollLeft >= el.scrollWidth / 2) el.scrollLeft = 0;
      }
      last = ts;
      animRef.current = requestAnimationFrame(step);
    };
    animRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return (
    <section className="py-10 lg:py-12 bg-bg-elevated overflow-hidden">

      {/* Header */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-20 mb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6"
        >
          <div>
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-[0.22em] px-3.5 py-1.5 rounded-full mb-4">
              <Star className="w-3 h-3 fill-primary" />
              Đánh Giá Thực Tế
            </div>
            <h2 className="font-display text-4xl md:text-5xl xl:text-6xl font-bold text-text-primary mb-2">
              ĐỘI BÓNG NÓI GÌ
            </h2>
            <p className="font-display text-lg font-bold text-primary">về áo đấu MiQ Sport</p>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-8">
            <div className="text-center">
              <div className="font-display text-4xl font-black text-primary">1,200+</div>
              <div className="text-[11px] text-text-muted uppercase tracking-widest mt-0.5">Đội đã đặt</div>
            </div>
            <div className="w-px h-12 bg-surface-border" />
            <div className="text-center">
              <div className="font-display text-4xl font-black text-yellow-400">4.9★</div>
              <div className="text-[11px] text-text-muted uppercase tracking-widest mt-0.5">Trung bình</div>
            </div>
            <div className="hidden sm:block w-px h-12 bg-surface-border" />
            <div className="hidden sm:block text-center">
              <div className="font-display text-4xl font-black text-text-primary">98%</div>
              <div className="text-[11px] text-text-muted uppercase tracking-widest mt-0.5">Đặt lại</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Infinite carousel */}
      <div
        ref={scrollRef}
        className="flex gap-5 overflow-x-hidden pb-2 px-4 sm:px-6 lg:px-12 xl:px-20"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        onMouseEnter={() => { pausedRef.current = true; }}
        onMouseLeave={() => { pausedRef.current = false; }}
        onTouchStart={() => { pausedRef.current = true; }}
        onTouchEnd={() => { pausedRef.current = false; }}
      >
        {[...TESTIMONIALS, ...TESTIMONIALS].map((item, i) => (
          <TestimonialCard key={`${item.id}-${i}`} item={item} />
        ))}
      </div>
    </section>
  );
};

export default TeamTestimonials;
