import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { X, BarChart2 } from 'lucide-react';
import { useCompareStore } from '../../store/compareStore.js';
import { useLanguageStore } from '../../store/languageStore.js';
import { formatCurrency } from '../../utils/formatCurrency.js';

const CompareBar = () => {
  const { products, remove, clear } = useCompareStore();
  const t = useLanguageStore((s) => s.t);
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {products.length > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 340, damping: 28 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[800] w-full max-w-xl px-4"
        >
          <div className="bg-bg-elevated border border-primary/30 rounded-2xl shadow-2xl p-4 flex items-center gap-4">
            {/* Slots */}
            <div className="flex-1 flex gap-3">
              {[0, 1].map((i) => {
                const p = products[i];
                return (
                  <div
                    key={i}
                    className={`flex-1 rounded-xl border-2 h-14 flex items-center gap-2 px-3 transition ${
                      p ? 'border-primary/40 bg-primary/5' : 'border-dashed border-surface-border'
                    }`}
                  >
                    {p ? (
                      <>
                        <img
                          src={p.images?.[0]?.url}
                          alt={p.name}
                          className="w-9 h-9 object-contain flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-text-primary line-clamp-1">{p.name}</p>
                          <p className="text-xs text-primary font-semibold">{formatCurrency(p.salePrice || p.price)}</p>
                        </div>
                        <button
                          onClick={() => remove(p._id)}
                          className="flex-shrink-0 text-text-muted hover:text-red-400 transition"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : (
                      <p className="text-xs text-text-muted text-center w-full">{t('compareHint').split(' ').slice(0, 3).join(' ')}…</p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 flex-shrink-0">
              <button
                onClick={() => navigate('/compare')}
                disabled={products.length < 2}
                className="btn-primary !py-2 !px-4 !text-xs flex items-center gap-1.5 disabled:opacity-40"
              >
                <BarChart2 className="w-3.5 h-3.5" />
                {t('compareNow')}
              </button>
              <button
                onClick={clear}
                className="text-xs text-text-muted hover:text-red-400 transition text-center"
              >
                {t('clearCompare')}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CompareBar;
