import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Send, Loader, User } from 'lucide-react';
import { getAllRooms, getMessages } from '../../services/chatService.js';
import { getSocket } from '../../services/socketService.js';

const timeAgo = (d) => {
  if (!d) return '';
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'Vừa xong';
  if (m < 60) return `${m}p`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
};

const AdminChat = () => {
  const [rooms, setRooms]           = useState([]);
  const [selected, setSelected]     = useState(null);
  const [messages, setMessages]     = useState([]);
  const [content, setContent]       = useState('');
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingMsgs, setLoadingMsgs]   = useState(false);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  const loadRooms = useCallback(async () => {
    try {
      const data = await getAllRooms();
      setRooms(data);
    } catch {}
    finally { setLoadingRooms(false); }
  }, []);

  useEffect(() => { loadRooms(); }, [loadRooms]);

  // Socket: incoming message for any room
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handler = (msg) => {
      const roomId = msg.room?._id || msg.room;
      setRooms((prev) =>
        prev
          .map((r) =>
            r._id === roomId
              ? {
                  ...r,
                  lastMessage:    msg.content,
                  lastMessageAt:  msg.createdAt || new Date().toISOString(),
                  unreadAdmin:    r._id === selected?._id ? 0 : (r.unreadAdmin || 0) + 1,
                }
              : r
          )
          .sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt))
      );
      if (roomId === selected?._id) {
        setMessages((prev) => [...prev, msg]);
      }
    };
    socket.on('chat:message', handler);
    return () => socket.off('chat:message', handler);
  }, [selected?._id]);

  const selectRoom = async (room) => {
    if (selected?._id === room._id) return;
    setSelected(room);
    setMessages([]);
    setLoadingMsgs(true);
    try {
      const socket = getSocket();
      if (socket) {
        socket.emit('chat:join-room', { roomId: room._id });
        socket.emit('chat:read', { roomId: room._id });
      }
      const data = await getMessages(room._id);
      setMessages(data);
      setRooms((prev) => prev.map((r) => r._id === room._id ? { ...r, unreadAdmin: 0 } : r));
    } catch {}
    finally { setLoadingMsgs(false); }
    setTimeout(() => inputRef.current?.focus(), 150);
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = () => {
    const text = content.trim();
    if (!text || !selected) return;
    const socket = getSocket();
    if (socket) socket.emit('chat:send', { roomId: selected._id, content: text });
    setContent('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex h-[calc(100vh-120px)] bg-bg-elevated rounded-2xl border border-surface-border overflow-hidden shadow-sm"
    >
      {/* Left: room list */}
      <div className="w-72 flex-shrink-0 border-r border-surface-border flex flex-col">
        <div className="px-4 py-4 border-b border-surface-border">
          <h2 className="font-display font-bold text-lg text-text-primary">Chat hỗ trợ</h2>
          <p className="text-xs text-text-muted mt-0.5">
            {rooms.length} cuộc trò chuyện
          </p>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-surface-border">
          {loadingRooms ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="w-5 h-5 text-primary animate-spin" />
            </div>
          ) : rooms.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-text-muted text-sm gap-2">
              <MessageCircle className="w-8 h-8 opacity-25" />
              Chưa có cuộc trò chuyện
            </div>
          ) : (
            rooms.map((room) => (
              <button
                key={room._id}
                onClick={() => selectRoom(room)}
                className={`w-full flex items-start gap-3 px-4 py-3.5 text-left transition ${
                  selected?._id === room._id
                    ? 'bg-primary/5'
                    : 'hover:bg-bg-raised'
                }`}
              >
                <div className="w-9 h-9 rounded-full bg-primary/15 text-primary flex items-center justify-center flex-shrink-0 text-sm font-bold mt-0.5">
                  {room.user?.name?.[0]?.toUpperCase() || <User className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className={`text-sm font-semibold truncate text-text-primary ${!selected?._id === room._id && room.unreadAdmin > 0 ? 'font-bold' : ''}`}>
                      {room.user?.name || 'Khách'}
                    </p>
                    {room.lastMessageAt && (
                      <span className="text-[10px] text-text-muted flex-shrink-0">
                        {timeAgo(room.lastMessageAt)}
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] text-text-muted truncate mt-0.5">
                    {room.lastMessage || 'Chưa có tin nhắn'}
                  </p>
                </div>
                {room.unreadAdmin > 0 && (
                  <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-1">
                    {room.unreadAdmin > 9 ? '9+' : room.unreadAdmin}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right: conversation */}
      <div className="flex-1 flex flex-col min-w-0">
        {selected ? (
          <>
            {/* Chat header */}
            <div className="px-5 py-4 border-b border-surface-border flex items-center gap-3 flex-shrink-0">
              <div className="w-9 h-9 rounded-full bg-primary/15 text-primary flex items-center justify-center text-sm font-bold flex-shrink-0">
                {selected.user?.name?.[0]?.toUpperCase() || <User className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-text-primary truncate">{selected.user?.name || 'Khách'}</p>
                <p className="text-[11px] text-text-muted truncate">{selected.user?.email}</p>
              </div>
              <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex-shrink-0 ${
                selected.status === 'open'
                  ? 'bg-primary/10 text-primary'
                  : 'bg-bg-raised text-text-muted'
              }`}>
                {selected.status === 'open' ? 'Đang mở' : 'Đã đóng'}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {loadingMsgs ? (
                <div className="flex items-center justify-center h-full">
                  <Loader className="w-6 h-6 text-primary animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-text-muted text-sm">
                  Chưa có tin nhắn
                </div>
              ) : (
                messages.map((msg, i) => {
                  const isAdmin = msg.senderRole === 'admin';
                  return (
                    <div key={msg._id || i} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        isAdmin
                          ? 'bg-primary text-white rounded-br-sm'
                          : 'bg-bg-raised text-text-primary rounded-bl-sm'
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
            <div className="px-4 pb-4 pt-3 border-t border-surface-border flex-shrink-0">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                  placeholder="Trả lời..."
                  className="flex-1 px-4 py-2.5 bg-bg-raised text-text-primary rounded-full text-sm border border-surface-border focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 transition placeholder:text-text-muted"
                  maxLength={1000}
                />
                <button
                  onClick={send}
                  disabled={!content.trim()}
                  aria-label="Gửi"
                  className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 disabled:opacity-40 hover:bg-primary-600 transition"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-text-muted">
            <MessageCircle className="w-12 h-12 opacity-20" />
            <p className="text-sm">Chọn cuộc trò chuyện để bắt đầu</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AdminChat;
