import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, CheckCheck, ShoppingBag, Package, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotificationStore } from '../../store/notificationStore.js';
import { fetchNotifications, markNotificationRead, markAllNotificationsRead } from '../../services/notificationService.js';

// ── Helpers ───────────────────────────────────────────────────────────────────
const timeAgo = (d) => {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'Vừa xong';
  if (m < 60) return `${m} phút trước`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} giờ trước`;
  return `${Math.floor(h / 24)} ngày trước`;
};

const TYPE_ICON = {
  'new-order':           ShoppingBag,
  'order-status-update': Package,
  'chat':                MessageCircle,
};

// ── NotificationBell ──────────────────────────────────────────────────────────
const NotificationBell = ({ dark = false }) => {
  const [open, setOpen] = useState(false);
  const ref             = useRef(null);
  const navigate        = useNavigate();

  const { notifications, unreadCount, setNotifications, addNotification, markRead, markAllRead } =
    useNotificationStore();

  // Load from API
  const load = useCallback(async () => {
    try {
      const data = await fetchNotifications();
      setNotifications(data);
    } catch {}
  }, [setNotifications]);

  useEffect(() => { load(); }, [load]);

  // Click outside → close
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const handleClick = async (n) => {
    if (!n.read) {
      try { await markNotificationRead(n._id); } catch {}
      markRead(n._id);
    }
    setOpen(false);
    if (n.link) navigate(n.link);
  };

  const handleMarkAll = async () => {
    try { await markAllNotificationsRead(); } catch {}
    markAllRead();
  };

  const baseBtn = dark
    ? 'text-gray-300 hover:bg-gray-700'
    : 'text-text-muted hover:bg-surface hover:text-text-primary';

  return (
    <div ref={ref} className="relative">
      <motion.button
        whileTap={{ scale: 0.88 }}
        onClick={() => setOpen((o) => !o)}
        aria-label={`Thông báo${unreadCount > 0 ? ` (${unreadCount} chưa đọc)` : ''}`}
        className={`relative w-9 h-9 rounded-xl flex items-center justify-center transition ${baseBtn}`}
      >
        <Bell className="w-[18px] h-[18px]" />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              key={unreadCount}
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1,   opacity: 1 }}
              exit={{ scale: 0.4,    opacity: 0 }}
              className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -6 }}
            animate={{ opacity: 1, scale: 1,    y: 0 }}
            exit={{ opacity: 0, scale: 0.95,    y: -6 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 mt-2 w-80 bg-bg-elevated rounded-2xl shadow-depth-lg border border-surface-border z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-surface-border">
              <span className="font-display font-bold text-sm text-text-primary">Thông báo</span>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAll}
                  className="flex items-center gap-1 text-[11px] text-primary font-semibold hover:underline"
                >
                  <CheckCheck className="w-3 h-3" /> Đọc tất cả
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-surface-border">
              {notifications.length === 0 ? (
                <div className="py-10 text-center text-sm text-text-muted">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  Chưa có thông báo
                </div>
              ) : (
                notifications.slice(0, 10).map((n) => {
                  const Icon = TYPE_ICON[n.type] || Bell;
                  return (
                    <button
                      key={n._id || n.tempId}
                      onClick={() => handleClick(n)}
                      className={`w-full flex items-start gap-3 px-4 py-3 text-left transition hover:bg-surface ${
                        !n.read ? 'bg-primary/5' : ''
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center mt-0.5 ${
                        !n.read ? 'bg-primary/15 text-primary' : 'bg-surface text-text-muted'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-[13px] font-semibold leading-snug ${!n.read ? 'text-text-primary' : 'text-text-muted'}`}>
                          {n.title}
                        </p>
                        <p className="text-[12px] text-text-muted mt-0.5 line-clamp-2 leading-relaxed">
                          {n.message}
                        </p>
                        <p className="text-[10px] text-text-muted/60 mt-1">
                          {timeAgo(n.createdAt)}
                        </p>
                      </div>
                      {!n.read && (
                        <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
