import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

const BackToTop = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = () => {
      const snapEl = document.querySelector('.snap-home-container');
      setVisible((snapEl ? snapEl.scrollTop : window.scrollY) > 400);
    };
    window.addEventListener('scroll', handler, { passive: true });
    const snapEl = document.querySelector('.snap-home-container');
    snapEl?.addEventListener('scroll', handler, { passive: true });
    return () => {
      window.removeEventListener('scroll', handler);
      document.querySelector('.snap-home-container')?.removeEventListener('scroll', handler);
    };
  }, []);

  const scrollToTop = () => {
    const snapEl = document.querySelector('.snap-home-container');
    if (snapEl) {
      snapEl.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 8 }}
          transition={{ duration: 0.2 }}
          onClick={scrollToTop}
          className="fixed bottom-24 right-5 z-50 w-11 h-11 bg-primary hover:bg-emerald-400 text-white rounded-full flex items-center justify-center shadow-neon transition-colors duration-200"
          aria-label="Về đầu trang"
        >
          <ArrowUp className="w-5 h-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default BackToTop;
