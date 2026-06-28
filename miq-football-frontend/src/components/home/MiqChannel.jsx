import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';

const YoutubeIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.75 15.5v-7l6.25 3.5-6.25 3.5z"/>
  </svg>
);

const VIDEOS = [
  { id: 'dQw4w9WgXcQ', title: 'MiQ Sport | BST 2025/26 Ra Mắt Chính Thức', views: '12K lượt xem' },
  { id: 'ScMzIvxBSi4', title: 'Review Giày Adidas Predator Elite FG | MiQ Sport', views: '8.5K lượt xem' },
  { id: 'kJQP7kiw5Fk', title: 'Áo Đấu Man United 2025/26 - Unboxing & Review', views: '15K lượt xem' },
  { id: 'JGwWNGJdvx8', title: 'Nike Phantom GX Elite - Đánh Giá Chi Tiết 2025', views: '6.2K lượt xem' },
  { id: '9bZkp7q19f0', title: 'Sự Kiện MiQ Sport Day 2025 - Highlights', views: '20K lượt xem' },
  { id: 'CevxZvSJLk8', title: 'Hướng Dẫn Chọn Giày Đá Bóng Phù Hợp | MiQ Sport', views: '9.8K lượt xem' },
];

// Facade: show a static YouTube thumbnail and only inject the heavy iframe
// when the user explicitly clicks Play. Each YouTube embed loads ~500 KB of
// player JS plus ~15 sub-requests; loading all 6 simultaneously on scroll
// was the source of the network avalanche in MiqChannel.
const VideoCard = ({ video, index }) => {
  const [active, setActive] = useState(false);
  // YouTube provides several thumbnail resolutions:
  //   mqdefault  = 320×180  (~10 KB)
  //   hqdefault  = 480×360  (~20 KB)
  //   maxresdefault = 1280×720 (may 404 for older videos; use hqdefault as safe fallback)
  const thumb = `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="group rounded-2xl overflow-hidden bg-surface border border-surface-border hover:border-red-500/30 hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all duration-300"
    >
      <div className="relative aspect-video bg-bg-raised overflow-hidden">
        {active ? (
          <iframe
            src={`https://www.youtube.com/embed/${video.id}?rel=0&modestbranding=1&autoplay=1`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        ) : (
          <button
            onClick={() => setActive(true)}
            aria-label={`Phát video: ${video.title}`}
            className="absolute inset-0 w-full h-full group/play"
          >
            <img
              src={thumb}
              alt={video.title}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover/play:scale-105"
            />
            {/* Dark overlay */}
            <span className="absolute inset-0 bg-black/30 group-hover/play:bg-black/20 transition-colors" />
            {/* Play button */}
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="w-14 h-14 rounded-full bg-red-600/90 group-hover/play:bg-red-500 flex items-center justify-center shadow-lg transition-all duration-200 group-hover/play:scale-110">
                <Play className="w-6 h-6 text-white fill-white ml-1" />
              </span>
            </span>
          </button>
        )}
      </div>
      <div className="p-3.5">
        <h4 className="font-bold text-sm text-text-primary line-clamp-2 group-hover:text-primary transition mb-1">{video.title}</h4>
        <p className="text-xs text-text-muted">{video.views}</p>
      </div>
    </motion.div>
  );
};

const MiqChannel = () => (
  <section className="py-10 lg:py-12 bg-bg-elevated">
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="flex items-end justify-between mb-8"
      >
        <div>
          <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold uppercase tracking-[0.22em] px-3.5 py-1.5 rounded-full mb-4">
            <YoutubeIcon className="w-3 h-3" />
            MiQ Channel
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-text-primary">MiQ CHANNEL</h2>
          <p className="text-text-muted text-sm mt-2">Review sản phẩm, sự kiện và hoạt động thương hiệu MiQ Sport</p>
        </div>
        <a
          href="https://youtube.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:flex items-center gap-2 border-2 border-red-500/30 text-red-500 font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-red-500 hover:text-white transition-all"
        >
          <YoutubeIcon className="w-4 h-4" />
          Đăng ký kênh
        </a>
      </motion.div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {VIDEOS.map((v, i) => (
          <VideoCard key={v.id} video={v} index={i} />
        ))}
      </div>
    </div>
  </section>
);

export default MiqChannel;
