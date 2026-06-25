import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

const ConfirmModal = ({
  open = true,
  title,
  message,
  confirmLabel = 'Xác nhận',
  onConfirm,
  onCancel,
  danger = false,
}) => (
  <AnimatePresence>
    {open && (
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 24 }}
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="confirm-modal-title"
          aria-describedby="confirm-modal-desc"
          onClick={(e) => e.stopPropagation()}
          className="bg-bg-elevated border border-surface-border rounded-2xl p-6 max-w-sm w-full shadow-depth-lg"
        >
          <div className="flex items-start gap-3 mb-4">
            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${danger ? 'bg-red-500/15' : 'bg-amber-500/15'}`}>
              <AlertTriangle className={`w-5 h-5 ${danger ? 'text-red-400' : 'text-amber-400'}`} />
            </div>
            <div>
              <h3 id="confirm-modal-title" className="font-display font-bold text-text-primary">{title}</h3>
              <p id="confirm-modal-desc" className="text-sm text-text-muted mt-1">{message}</p>
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={onCancel} className="btn-outline !py-2 !px-4 text-sm">Quay lại</button>
            <button
              onClick={onConfirm}
              className={`!py-2 !px-4 text-sm font-semibold rounded-xl transition ${danger ? 'bg-red-500 hover:bg-red-600 text-white' : 'btn-primary'}`}
            >
              {confirmLabel}
            </button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default ConfirmModal;
