import catchAsync from '../utils/catchAsync.js';
import { ApiResponse } from '../utils/apiResponse.js';
import Notification from '../models/Notification.js';

// GET /api/v1/notifications
export const getMyNotifications = catchAsync(async (req, res) => {
  const [notifications, unreadCount] = await Promise.all([
    Notification.find({ recipient: req.user._id }).sort({ createdAt: -1 }).limit(30),
    Notification.countDocuments({ recipient: req.user._id, read: false }),
  ]);
  res.json(new ApiResponse(200, { notifications, unreadCount }, 'OK'));
});

// PATCH /api/v1/notifications/read-all
export const markAllRead = catchAsync(async (req, res) => {
  await Notification.updateMany({ recipient: req.user._id, read: false }, { read: true });
  res.json(new ApiResponse(200, null, 'Đã đọc tất cả'));
});

// PATCH /api/v1/notifications/:id/read
export const markRead = catchAsync(async (req, res) => {
  await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user._id },
    { read: true }
  );
  res.json(new ApiResponse(200, null, 'Đã đọc'));
});
