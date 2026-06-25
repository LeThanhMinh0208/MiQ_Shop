import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Calendar, BookOpen, ArrowRight } from 'lucide-react';

const ARTICLES = [
  {
    id: 1,
    thumbnail: 'https://placehold.co/600x380/141416/10B981?text=Gear+Review',
    date: '02 Jun 2026',
    category: 'Gear Review',
    categoryColor: '#10B981',
    title: 'Chọn Giày Đá Bóng Nhân Tạo Đúng Cách — Không Chỉ Là Style',
    excerpt: 'Sân cỏ nhân tạo đòi hỏi đế giày khác hoàn toàn. Chúng tôi test 8 mẫu giày phổ biến nhất 2026 và đây là kết quả thực tế.',
    readTime: '5 phút đọc',
    to: '/products?category=football-boots',
  },
  {
    id: 2,
    thumbnail: 'https://placehold.co/600x380/141416/F97316?text=Training+Tips',
    date: '28 May 2026',
    category: 'Training Tips',
    categoryColor: '#F97316',
    title: '5 Bài Tập Kỹ Thuật Dứt Điểm Chuẩn Premier League',
    excerpt: 'Kỹ thuật dứt điểm không phải thiên bẩm. Với 5 bài tập này, bất kỳ ai cũng có thể nâng tỷ lệ chuyển hóa cơ hội trong 4 tuần.',
    readTime: '7 phút đọc',
    to: '/products?category=trang-phuc-the-thao',
  },
  {
    id: 3,
    thumbnail: 'https://placehold.co/600x380/141416/8B5CF6?text=Team+Style',
    date: '20 May 2026',
    category: 'Team Style',
    categoryColor: '#8B5CF6',
    title: 'Xu Hướng Đồng Phục Đội Bóng 2026 — Bold, Dark & Neon',
    excerpt: 'Từ gradient tối đến neon accent — các đội bóng phong trào đang mặc đẹp như CLB chuyên nghiệp. Top 10 thiết kế viral nhất năm.',
    readTime: '4 phút đọc',
    to: '/products?category=ao-dau-clb',
  },
];

// ── Article card ───────────────────────────────────────────────────────────
const ArticleCard = ({ article, index }) => (
  <motion.article
    initial={{ opacity: 0, y: 32 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.55, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
    className="group bg-surface border border-surface-border rounded-3xl overflow-hidden hover:border-primary/30 transition-all duration-300 hover:shadow-[0_16px_48px_rgba(0,0,0,0.5)] flex flex-col"
  >
    {/* Thumbnail */}
    <div className="relative overflow-hidden" style={{ aspectRatio: '16/10' }}>
      <img
        src={article.thumbnail}
        alt={article.title}
        loading="lazy"
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        onError={(e) => { e.target.style.display = 'none'; }}
      />
      {/* Category tag */}
      <div
        className="absolute top-4 left-4 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full"
        style={{
          background: `${article.categoryColor}22`,
          color: article.categoryColor,
          border: `1px solid ${article.categoryColor}44`,
          backdropFilter: 'blur(6px)',
        }}
      >
        {article.category}
      </div>
    </div>

    {/* Content */}
    <div className="p-6 flex flex-col flex-1">
      {/* Meta row */}
      <div className="flex items-center gap-4 text-[11px] text-text-muted mb-4">
        <span className="flex items-center gap-1.5">
          <Calendar className="w-3 h-3" />
          {article.date}
        </span>
        <span className="flex items-center gap-1.5">
          <BookOpen className="w-3 h-3" />
          {article.readTime}
        </span>
      </div>

      {/* Title */}
      <h3 className="font-display text-xl lg:text-2xl font-bold text-text-primary group-hover:text-primary transition-colors leading-tight mb-3 flex-1">
        {article.title}
      </h3>

      {/* Excerpt */}
      <p className="text-text-muted text-sm leading-relaxed line-clamp-2 mb-5">
        {article.excerpt}
      </p>

      {/* Read more */}
      <Link
        to={article.to}
        className="inline-flex items-center gap-2 text-sm font-bold text-primary group-hover:gap-3 transition-all duration-200"
      >
        Đọc tiếp
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  </motion.article>
);

// ── Main ───────────────────────────────────────────────────────────────────
const FootballJournal = () => (
  <section className="py-10 lg:py-12 bg-bg-base overflow-hidden">
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-20">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10"
      >
        <div>
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-[0.22em] px-3.5 py-1.5 rounded-full mb-4">
            <BookOpen className="w-3 h-3" />
            Tin Tức & Hướng Dẫn
          </div>
          <h2 className="font-display text-4xl md:text-5xl xl:text-6xl font-bold text-text-primary mb-2">
            FOOTBALL JOURNAL
          </h2>
          <p className="text-text-muted text-sm">Kiến thức bóng đá · Gear đỉnh · Phong cách riêng</p>
        </div>

        <Link
          to="/products"
          className="flex-shrink-0 inline-flex items-center gap-2 border border-surface-border hover:border-primary/40 text-text-secondary hover:text-primary font-bold text-sm uppercase tracking-wide px-6 py-3 rounded-2xl transition-all duration-200"
        >
          Xem tất cả bài viết
          <ArrowRight className="w-4 h-4" />
        </Link>
      </motion.div>

      {/* 3-column grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {ARTICLES.map((article, i) => (
          <ArticleCard key={article.id} article={article} index={i} />
        ))}
      </div>
    </div>
  </section>
);

export default FootballJournal;
