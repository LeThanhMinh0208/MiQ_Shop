import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden min-h-[700px]">
      {/* Stadium background */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1522778526097-ce0a22ceb253?w=1920&q=80"
          alt="Stadium"
          className="w-full h-full object-cover"
        />
        {/* Green overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-200/85 via-emerald-100/75 to-emerald-50/85" />
        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-cream to-transparent" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-24 grid lg:grid-cols-2 gap-12 items-center">
        {/* Text content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="font-display text-6xl md:text-8xl font-bold text-ink leading-[0.95] mb-6">
            BỨT TỐC TRÊN
            <br />
            MỌI MẶT <span className="text-primary-dark">CỎ</span>
          </h1>
          <p className="text-ink-light text-lg mb-8 max-w-md font-medium">
            Khám phá bộ sưu tập mùa giải mới với công nghệ đột phá, đưa hiệu suất của bạn lên tầm cao mới.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 bg-primary text-white font-bold uppercase tracking-wider px-8 py-4 rounded-lg shadow-lg shadow-primary/40 hover:shadow-neon hover:bg-primary-dark transition-all"
          >
            SHOP NOW
          </Link>
        </motion.div>

        {/* 3D Floating Shoe with Energy Effect */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="relative flex items-center justify-center min-h-[500px]"
        >
          {/* Energy spiral - vòng năng lượng xoay quanh giày */}
          <svg
            className="absolute w-[600px] h-[600px] z-0"
            viewBox="0 0 600 600"
          >
            <defs>
              <linearGradient id="energyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10B981" stopOpacity="0" />
                <stop offset="50%" stopColor="#10B981" stopOpacity="1" />
                <stop offset="100%" stopColor="#34D399" stopOpacity="0.3" />
              </linearGradient>
              <linearGradient id="energyGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#00C853" stopOpacity="0" />
                <stop offset="50%" stopColor="#00C853" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#10B981" stopOpacity="0.2" />
              </linearGradient>
            </defs>

            {/* Outer rotating ring */}
            <motion.ellipse
              cx="300"
              cy="300"
              rx="260"
              ry="100"
              fill="none"
              stroke="url(#energyGrad)"
              strokeWidth="3"
              strokeDasharray="20 10"
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              style={{ transformOrigin: '300px 300px' }}
            />

            {/* Middle ring tilted */}
            <motion.ellipse
              cx="300"
              cy="300"
              rx="220"
              ry="220"
              fill="none"
              stroke="url(#energyGrad2)"
              strokeWidth="2"
              animate={{ rotate: -360 }}
              transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
              style={{ transformOrigin: '300px 300px' }}
            />

            {/* Diagonal energy beam */}
            <motion.ellipse
              cx="300"
              cy="300"
              rx="280"
              ry="60"
              fill="none"
              stroke="#10B981"
              strokeWidth="4"
              opacity="0.6"
              animate={{ rotate: [25, 30, 25] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              style={{ transformOrigin: '300px 300px' }}
            />
          </svg>

          {/* Center glow */}
          <div className="absolute w-80 h-80 rounded-full bg-primary/40 blur-3xl animate-glow-pulse" />

          {/* Shoe image - Adidas X SpeedPortal xanh lá */}
          <motion.div
            animate={{ y: [0, -25, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="relative z-10"
          >
          <img
  src="/boot.png"
  alt="Adidas X SpeedPortal"
  className="w-[450px] h-[400px] object-contain drop-shadow-[0_25px_60px_rgba(16,185,129,0.7)]"
  style={{ transform: 'rotate(-15deg)' }}
/>
          </motion.div>

          {/* Pedestal shadow under shoe */}
          <div className="absolute bottom-12 w-72 h-8 bg-primary/40 rounded-full blur-2xl" />

          {/* Sparkle particles */}
          <motion.div
            className="absolute top-20 right-10 w-3 h-3 bg-primary rounded-full"
            animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0 }}
          />
          <motion.div
            className="absolute bottom-32 left-12 w-2 h-2 bg-primary-light rounded-full"
            animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.7 }}
          />
          <motion.div
            className="absolute top-40 left-20 w-2.5 h-2.5 bg-primary rounded-full"
            animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 1.4 }}
          />
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;