import { motion } from 'framer-motion';
import { ArrowRight, Calendar, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguageStore } from '../../store/languageStore.js';

const NEWS = [
  {
    id: 1,
    category: 'GIẢI ĐẤU',
    date: '14 Tháng 6, 2025',
    title: 'EURO 2025: Những đôi giày nổi bật nhất vòng bảng',
    excerpt: 'Từ Adidas Predator Elite đến Nike Phantom GX2, điểm qua những mẫu giày được các ngôi sao lựa chọn tại EURO 2025.',
    img: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&q=80',
    categoryColor: '#F97316',
    featured: true,
  },
  {
    id: 2,
    category: 'SẢN PHẨM',
    date: '11 Tháng 6, 2025',
    title: 'MiQ x Adidas Predator: Phiên bản giới hạn chính thức ra mắt',
    excerpt: 'Thiết kế độc quyền kết hợp công nghệ Zones của Adidas với bản sắc của MiQ Sport.',
    img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=700&q=80',
    categoryColor: '#10B981',
  },
  {
    id: 3,
    category: 'HẬU TRƯỜNG',
    date: '8 Tháng 6, 2025',
    title: 'Hành trình từ sân phủi đến Cup Quốc gia cùng MiQ Sport',
    excerpt: 'Đội bóng phủi Sài Gòn United chia sẻ hành trình 3 năm chinh phục giải đấu cùng trang bị từ MiQ.',
    img: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=700&q=80',
    categoryColor: '#8B5CF6',
  },
  {
    id: 4,
    category: 'TIPS',
    date: '5 Tháng 6, 2025',
    title: '5 bí quyết chọn giày đá bóng đúng cho từng loại sân',
    excerpt: 'FG, SG, AG hay IN? Bài viết phân tích chi tiết để bạn không còn nhầm lẫn khi mua giày.',
    img: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=700&q=80',
    categoryColor: '#F43F5E',
  },
];

const CategoryBadge = ({ label, color }) => (
  <span
    className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full whitespace-nowrap"
    style={{ color, backgroundColor: `${color}18`, border: `1px solid ${color}30` }}
  >
    <Tag className="w-2.5 h-2.5 flex-shrink-0" />
    {label}
  </span>
);

const ReadMoreBtn = () => {
  const t = useLanguageStore((s) => s.t);
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary group-hover:gap-2.5 transition-all">
      {t('readMore')} <ArrowRight className="w-3.5 h-3.5 flex-shrink-0 transition-transform group-hover:translate-x-0.5" />
    </span>
  );
};

const NewsCard = ({ article, index, featured = false }) => (
  <motion.article
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.45, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
    className="group bg-bg-elevated border border-surface-border rounded-2xl overflow-hidden hover:border-primary/30 hover:shadow-[0_12px_40px_rgba(0,0,0,0.18)] transition-all duration-400 cursor-pointer flex flex-col h-full"
  >
    {/* Image */}
    <div className={`relative overflow-hidden flex-shrink-0 ${featured ? 'aspect-[16/9]' : 'aspect-[16/9]'}`}>
      <img
        src={article.img}
        alt={article.title}
        loading="lazy"
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-600"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      {/* Category badge overlay */}
      <div className="absolute top-3 left-3">
        <CategoryBadge label={article.category} color={article.categoryColor} />
      </div>
    </div>

    {/* Content */}
    <div className="p-5 flex flex-col flex-1">
      <div className="flex items-center gap-1.5 text-text-muted text-xs mb-3">
        <Calendar className="w-3 h-3 flex-shrink-0" />
        <span>{article.date}</span>
      </div>

      <h3 className={`font-viet font-bold text-text-primary leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2 ${featured ? 'text-base lg:text-lg' : 'text-sm lg:text-base'}`}>
        {article.title}
      </h3>

      <p className="text-text-muted text-sm leading-relaxed line-clamp-2 flex-1 mb-4">
        {article.excerpt}
      </p>

      <ReadMoreBtn />
    </div>
  </motion.article>
);

const NewsSection = () => {
  const [featured, ...rest] = NEWS;
  const t = useLanguageStore((s) => s.t);

  return (
    <section className="py-14 lg:py-20 bg-bg-base">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-20">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10"
        >
          <div>
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.22em] px-3.5 py-1.5 rounded-full mb-3">
              <Tag className="w-3 h-3" />
              {t('newsBadge')}
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-text-primary">{t('newsTitle')}</h2>
            <p className="text-text-muted mt-1 text-sm">{t('newsSubtitle')}</p>
          </div>
          <Link
            to="/products"
            className="self-start sm:self-auto inline-flex items-center gap-2 border border-surface-border text-text-muted hover:border-primary hover:text-primary font-semibold text-sm px-5 py-2.5 rounded-full transition whitespace-nowrap"
          >
            {t('viewAllNews')} <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {/* Layout: featured large top-left + 3 equal cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Featured — spans 2 rows on large screens */}
          <div className="lg:col-span-1 lg:row-span-2">
            <div className="h-full">
              <motion.article
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="group relative rounded-2xl overflow-hidden cursor-pointer border border-surface-border hover:border-primary/30 hover:shadow-[0_16px_48px_rgba(0,0,0,0.2)] transition-all duration-400 h-full min-h-[400px] lg:min-h-[520px]"
              >
                <img
                  src={featured.img}
                  alt={featured.title}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                <div className="absolute top-4 left-4">
                  <CategoryBadge label={featured.category} color={featured.categoryColor} />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-center gap-1.5 text-white/50 text-xs mb-3">
                    <Calendar className="w-3 h-3" />
                    {featured.date}
                  </div>
                  <h3 className="font-viet font-bold text-white text-xl lg:text-2xl leading-snug mb-2 line-clamp-3">
                    {featured.title}
                  </h3>
                  <p className="text-white/70 text-sm leading-relaxed line-clamp-2 mb-4">
                    {featured.excerpt}
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-white/80 group-hover:text-white group-hover:gap-2.5 transition-all">
                    {t('readMore')} <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </motion.article>
            </div>
          </div>

          {/* 3 small cards in 2 columns */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-5">
            {rest.map((article, i) => (
              <div key={article.id} className={i === 0 ? 'sm:col-span-2 lg:col-span-2' : ''}>
                <NewsCard article={article} index={i + 1} />
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default NewsSection;
