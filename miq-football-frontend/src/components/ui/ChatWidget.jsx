import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Loader } from 'lucide-react';
import { useAuthStore } from '../../store/authStore.js';
import { useChatStore } from '../../store/chatStore.js';
import { getOrCreateRoom, getMessages } from '../../services/chatService.js';
import { getSocket } from '../../services/socketService.js';
import { useLanguageStore } from '../../store/languageStore.js';

const ChatWidget = () => {
  const { isAuthenticated } = useAuthStore();
  const { isOpen, room, messages, unread, setRoom, setMessages, addMessage, setOpen, clearUnread } =
    useChatStore();
  const t = useLanguageStore((s) => s.t);

  const [content, setContent]   = useState('');
  const [loading, setLoading]   = useState(false);
  const [sending, setSending]   = useState(false);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  const loadRoom = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const r    = await getOrCreateRoom();
      const msgs = await getMessages(r._id);
      setRoom(r);
      setMessages(msgs);
    } catch {}
    finally { setLoading(false); }
  }, [isAuthenticated, setRoom, setMessages]);

  useEffect(() => { loadRoom(); }, [loadRoom]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !room) return;

    socket.emit('chat:join-room', { roomId: room._id });

    const handler = (msg) => {
      const msgRoomId = msg.room?._id || msg.room;
      if (msgRoomId === room._id) addMessage(msg);
    };
    socket.on('chat:message', handler);
    return () => socket.off('chat:message', handler);
  }, [room?._id, addMessage]);

  useEffect(() => {
    if (isOpen && room) {
      clearUnread();
      const socket = getSocket();
      if (socket) socket.emit('chat:read', { roomId: room._id });
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, room?._id, clearUnread]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: messages.length > 5 ? 'smooth' : 'auto' });
  }, [messages]);

  const send = () => {
    const text = content.trim();
    if (!text || !room || sending) return;
    setContent('');
    setSending(true);
    try {
      const socket = getSocket();
      if (socket) socket.emit('chat:send', { roomId: room._id, content: text });
    } finally {
      setSending(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3 pointer-events-none">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="w-80 h-[420px] bg-bg-elevated dark:bg-gray-800 rounded-2xl shadow-depth-lg border border-surface-border dark:border-gray-700 flex flex-col overflow-hidden pointer-events-auto"
          >
            {/* Header */}
            <div className="bg-primary px-4 py-3 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-bg-elevated/70 animate-pulse" />
                <span className="text-white font-bold text-sm">{t('chatSupport')}</span>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label={t('closeChat')}
                className="text-white/70 hover:text-white transition p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader className="w-6 h-6 text-primary animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-text-muted dark:text-gray-400 gap-2">
                  <MessageCircle className="w-10 h-10 opacity-25" />
                  <p className="text-sm">{t('chatWelcome')}</p>
                </div>
              ) : (
                messages.map((msg, i) => {
                  const isMe = msg.senderRole === 'user';
                  return (
                    <div key={msg._id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[76%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                        isMe
                          ? 'bg-primary text-white rounded-br-sm'
                          : 'bg-surface-border dark:bg-gray-700 text-text-primary dark:text-gray-200 rounded-bl-sm'
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-3 pb-3 pt-2 border-t border-surface-border dark:border-gray-700 flex-shrink-0">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                  placeholder={t('chatPlaceholder')}
                  className="flex-1 px-3 py-2 bg-surface-border dark:bg-gray-700 rounded-full text-sm border border-surface-border dark:border-gray-600 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 transition dark:text-white placeholder:text-text-muted/60 dark:placeholder:text-gray-500"
                  maxLength={1000}
                />
                <button
                  onClick={send}
                  disabled={!content.trim() || sending}
                  aria-label={t('chatSend')}
                  className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 disabled:opacity-40 hover:bg-primary-600 transition"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating toggle */}
      <motion.button
        whileTap={{ scale: 0.88 }}
        onClick={() => setOpen(!isOpen)}
        aria-label={isOpen ? t('closeChat') : t('openChat')}
        className="relative w-14 h-14 rounded-full bg-primary text-white shadow-neon flex items-center justify-center hover:bg-primary-600 transition pointer-events-auto"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.span
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="w-6 h-6" />
            </motion.span>
          ) : (
            <motion.span
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <MessageCircle className="w-6 h-6" />
            </motion.span>
          )}
        </AnimatePresence>

        {!isOpen && unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[20px] h-5 px-1 bg-red-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center leading-none">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </motion.button>
    </div>
  );
};

export default ChatWidget;
