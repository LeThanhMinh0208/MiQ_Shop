import catchAsync from '../utils/catchAsync.js';
import { ApiResponse, ApiError } from '../utils/apiResponse.js';
import ChatRoom from '../models/ChatRoom.js';
import ChatMessage from '../models/ChatMessage.js';

// GET /api/v1/chat/room — User: get or create their room
export const getOrCreateRoom = catchAsync(async (req, res) => {
  let room = await ChatRoom.findOne({ user: req.user._id });
  if (!room) room = await ChatRoom.create({ user: req.user._id });
  res.json(new ApiResponse(200, room, 'OK'));
});

// GET /api/v1/chat/rooms — Admin: all rooms
export const getAllRooms = catchAsync(async (req, res) => {
  const rooms = await ChatRoom.find({ status: 'open' })
    .populate('user', 'name email avatar')
    .sort({ lastMessageAt: -1, createdAt: -1 });
  res.json(new ApiResponse(200, rooms, 'OK'));
});

// GET /api/v1/chat/room/:roomId/messages
export const getMessages = catchAsync(async (req, res) => {
  const room = await ChatRoom.findById(req.params.roomId);
  if (!room) throw new ApiError(404, 'Không tìm thấy phòng chat');

  if (req.user.role !== 'admin' && room.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Không có quyền truy cập');
  }

  const messages = await ChatMessage.find({ room: room._id })
    .populate('sender', 'name avatar role')
    .sort({ createdAt: 1 })
    .limit(100);

  res.json(new ApiResponse(200, messages, 'OK'));
});
