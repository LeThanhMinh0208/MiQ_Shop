import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Link } from 'react-router-dom';

const SESSION_KEY = 'miq-promo-seen';

const PromoPopup = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!sessionStorage.getItem(SESSION_KEY)) {
      const t = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(t);
    }
  }, []);

  const close = () => {
    sessionStorage.setItem(SESSION_KEY, '1');
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="promo-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          onClick={close}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />

          {/* Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 40 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{ opacity: 0, scale: 0.92,    y: 20 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24, delay: 0.05 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl rounded-3xl overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.7)]"
          >
            {/* Background image */}
            <div className="relative h-[420px] sm:h-[500px]">
              <img
                src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&q=85"
                alt="Sản phẩm mới MiQ Sport"
                className="absolute inset-0 w-full h-full object-cover"
              />
              {/* Dark gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-8">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 bg-primary/20 border border-primary/40 text-primary text-[10px] font-black uppercase tracking-[0.25em] px-4 py-1.5 rounded-full mb-4 w-fit">
                  <motion.span
                    animate={{ opacity: [1, 0.4, 1] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                    className="w-1.5 h-1.5 rounded-full bg-primary"
                  />
                  Ra mắt mới 2025/26
                </div>

                <h2
                  className="font-display font-bold text-white mb-3"
                  style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', lineHeight: 1.05 }}
                >
                  BST MiQ FLAGSHIP
                  <br />
                  <span
                    style={{
                      background: 'linear-gradient(135deg, #EA580C, #FB923C, #D4AF37)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    2025 / 2026
                  </span>
                </h2>

                <p className="text-white/70 text-sm mb-6 max-w-sm leading-relaxed">
                  Trang phục thi đấu cao cấp dành cho những người chiến thắng. Thiết kế độc quyền, chất lượng đỉnh cao.
                </p>

                <div className="flex items-center gap-3">
                  <Link
                    to="/products?sort=newest"
                    onClick={close}
                    className="flex items-center gap-2 bg-primary text-white font-bold uppercase tracking-wide px-8 py-3.5 rounded-xl hover:bg-primary/90 transition-all hover:shadow-[0_8px_24px_rgba(0,0,0,0.35)] text-sm"
                  >
                    Khám phá ngay
                  </Link>
                  <button
                    onClick={close}
                    className="px-6 py-3.5 border border-white/20 text-white/70 font-semibold rounded-xl hover:border-white/40 hover:text-white transition text-sm"
                  >
                    Để sau
                  </button>
                </div>
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={close}
              aria-label="Đóng"
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/50 border border-white/20 hover:bg-black/80 flex items-center justify-center transition"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PromoPopup;
