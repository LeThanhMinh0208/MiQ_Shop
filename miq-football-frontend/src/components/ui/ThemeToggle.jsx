import { Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeStore } from '../../store/themeStore.js';

const ThemeToggle = ({ className = '' }) => {
  const { dark, toggle } = useThemeStore();

  return (
    <motion.button
      onClick={toggle}
      whileTap={{ scale: 0.85 }}
      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
        dark
          ? 'bg-gray-700 text-amber-400 hover:bg-gray-600'
          : 'bg-surface hover:bg-bg-raised text-text-muted hover:text-text-primary'
      } ${className}`}
      aria-label={dark ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
    >
      <AnimatePresence mode="wait" initial={false}>
        {dark ? (
          <motion.span
            key="moon"
            initial={{ rotate: -40, opacity: 0, scale: 0.7 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 40, opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.18 }}
            className="flex items-center justify-center"
          >
            <Moon className="w-[18px] h-[18px]" />
          </motion.span>
        ) : (
          <motion.span
            key="sun"
            initial={{ rotate: 40, opacity: 0, scale: 0.7 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: -40, opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.18 }}
            className="flex items-center justify-center"
          >
            <Sun className="w-[18px] h-[18px]" />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

export default ThemeToggle;
