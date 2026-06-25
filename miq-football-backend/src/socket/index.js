import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ChatMessage from '../models/ChatMessage.js';
import ChatRoom from '../models/ChatRoom.js';

let _io = null;

export const getIO = () => _io;

export const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
      methods: ['GET', 'POST'],
    },
  });

  // ── JWT auth middleware ───────────────────────────────────────────────────────
  io.use(async (socket, next) => {
    try {
      const cookies = socket.handshake.headers.cookie || '';
      let token = cookies.match(/(?:^|;\s*)token=([^;]+)/)?.[1];
      if (!token) token = socket.handshake.auth?.token;

      if (!token) {
        socket.userId   = null;
        socket.userRole = 'guest';
        return next();
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('name email role avatar');
      if (!user) {
        socket.userId   = null;
        socket.userRole = 'guest';
        return next();
      }

      socket.userId   = user._id.toString();
      socket.userRole = user.role;
      socket.user     = { id: user._id.toString(), name: user.name, role: user.role };
      next();
    } catch {
      socket.userId   = null;
      socket.userRole = 'guest';
      next();
    }
  });

  // ── Connection handler ────────────────────────────────────────────────────────
  io.on('connection', (socket) => {
    const { userId, userRole } = socket;

    if (userId) {
      socket.join(`user-${userId}`);
      if (userRole === 'admin') socket.join('admin-room');
    }

    // ── Chat: join a room ─────────────────────────────────────────────────────
    socket.on('chat:join-room', async ({ roomId }) => {
      try {
        const room = await ChatRoom.findById(roomId);
        if (!room) return;
        if (userRole !== 'admin' && room.user.toString() !== userId) return;
        socket.join(`chat-${roomId}`);
      } catch {}
    });

    // ── Chat: send a message ──────────────────────────────────────────────────
    socket.on('chat:send', async ({ roomId, content }) => {
      try {
        if (!userId || !content?.trim()) return;

        let room = await ChatRoom.findById(roomId);

        if (!room && userRole !== 'admin') {
          room = await ChatRoom.create({ user: userId });
          socket.join(`chat-${room._id}`);
          io.to('admin-room').emit('chat:new-room', {
            roomId: room._id,
            userId,
            userName: socket.user?.name,
          });
        }
        if (!room) return;

        const message = await ChatMessage.create({
          room:       room._id,
          sender:     userId,
          senderRole: userRole === 'admin' ? 'admin' : 'user',
          content:    content.trim(),
        });

        room.lastMessage   = content.trim().slice(0, 100);
        room.lastMessageAt = new Date();
        if (userRole === 'admin') room.unreadUser  += 1;
        else                      room.unreadAdmin += 1;
        await room.save();

        const populated = await message.populate('sender', 'name avatar');

        io.to(`chat-${room._id}`).emit('chat:message', {
          ...populated.toObject(),
          roomId: room._id,
        });

        if (userRole !== 'admin') {
          io.to('admin-room').emit('chat:room-activity', {
            roomId:      room._id,
            lastMessage: content.trim().slice(0, 100),
            userName:    socket.user?.name,
          });
        }
      } catch (err) {
        console.error('[Socket] chat:send:', err.message);
      }
    });

    // ── Chat: mark as read ────────────────────────────────────────────────────
    socket.on('chat:read', async ({ roomId }) => {
      try {
        if (!userId) return;
        const readRole = userRole === 'admin' ? 'user' : 'admin';
        await ChatMessage.updateMany({ room: roomId, senderRole: readRole, read: false }, { read: true });

        const room = await ChatRoom.findById(roomId);
        if (room) {
          if (userRole === 'admin') room.unreadAdmin = 0;
          else                      room.unreadUser  = 0;
          await room.save();
        }

        io.to(`chat-${roomId}`).emit('chat:read-ack', { roomId, readBy: userId });
      } catch {}
    });

    socket.on('disconnect', () => {});
  });

  _io = io;
  return io;
};
