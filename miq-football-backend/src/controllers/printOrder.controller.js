import catchAsync from '../utils/catchAsync.js';
import { ApiResponse, ApiError } from '../utils/apiResponse.js';
import PrintOrder from '../models/PrintOrder.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { getIO } from '../socket/index.js';

// Server-side authoritative unit prices — client totalPrice is always ignored
const UNIT_PRICES = {
  sublimation: 200000,
  heat_press:  150000,
  embroidery:  250000,
};

// POST /api/v1/print-orders  (public — no auth required)
export const createPrintOrder = catchAsync(async (req, res) => {
  const { contactName, phone, email, teamName, jerseyType, players, notes } = req.body;

  if (!contactName?.trim()) throw new ApiError(400, 'Tên liên hệ là bắt buộc');
  if (!phone?.trim())       throw new ApiError(400, 'Số điện thoại là bắt buộc');
  if (!Array.isArray(players) || players.length === 0)
    throw new ApiError(400, 'Danh sách cầu thủ không được rỗng');

  for (const p of players) {
    if (!p.playerName?.trim()) throw new ApiError(400, 'Mỗi cầu thủ phải có tên');
    if (!p.jerseyNumber?.trim()) throw new ApiError(400, 'Mỗi cầu thủ phải có số áo');
  }

  const type = UNIT_PRICES[jerseyType] ? jerseyType : 'sublimation';
  const unitPrice  = UNIT_PRICES[type];
  const totalPrice = players.length * unitPrice; // CRITICAL: server recomputes, never trusts client value

  const order = await PrintOrder.create({
    contactName: contactName.trim(),
    phone:       phone.trim(),
    email:       email?.trim()    || '',
    teamName:    teamName?.trim() || '',
    jerseyType:  type,
    players,
    unitPrice,
    totalPrice,
    notes:       notes?.trim()    || '',
  });

  const admins = await User.find({ role: 'admin' }).select('_id');
  const notifPayload = {
    type:    'new-print-order',
    title:   'Đơn in đội mới',
    message: `${contactName.trim()} vừa đặt in ${players.length} áo${teamName ? ` cho đội ${teamName}` : ''}`,
    link:    '/admin/print-orders',
    data:    { printOrderId: order._id },
  };
  if (admins.length > 0) {
    await Notification.insertMany(admins.map((a) => ({ recipient: a._id, ...notifPayload })));
  }
  const io = getIO();
  if (io) io.to('admin-room').emit('notification', { ...notifPayload, createdAt: new Date(), read: false });

  res.status(201).json(new ApiResponse(201, order, 'Đặt in thành công! Chúng tôi sẽ liên hệ trong vòng 24h.'));
});

// GET /api/v1/print-orders/my  (User — legacy)
export const getMyPrintOrders = catchAsync(async (req, res) => {
  const orders = await PrintOrder.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.status(200).json(new ApiResponse(200, orders, 'OK'));
});

// GET /api/v1/print-orders  (Admin)
export const getAllPrintOrders = catchAsync(async (req, res) => {
  const { page, limit, status } = req.query;
  const safeLimit = Math.min(Math.max(1, parseInt(limit) || 20), 100);
  const safePage  = Math.max(1, parseInt(page) || 1);
  const filter = status ? { status } : {};
  const [orders, total] = await Promise.all([
    PrintOrder.find(filter)
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .skip((safePage - 1) * safeLimit)
      .limit(safeLimit),
    PrintOrder.countDocuments(filter),
  ]);
  res.status(200).json(new ApiResponse(200, { orders, total }, 'OK'));
});

// GET /api/v1/print-orders/:id  (Admin)
export const getPrintOrderById = catchAsync(async (req, res) => {
  const order = await PrintOrder.findById(req.params.id).populate('user', 'name email phone');
  if (!order) throw new ApiError(404, 'Không tìm thấy đơn in');
  res.status(200).json(new ApiResponse(200, order, 'OK'));
});

// PATCH /api/v1/print-orders/:id/status  (Admin)
export const updatePrintOrderStatus = catchAsync(async (req, res) => {
  const { status } = req.body;
  const order = await PrintOrder.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true },
  );
  if (!order) throw new ApiError(404, 'Không tìm thấy đơn in');
  res.status(200).json(new ApiResponse(200, order, 'Cập nhật thành công'));
});

// DELETE /api/v1/print-orders/:id  (Admin)
export const deletePrintOrder = catchAsync(async (req, res) => {
  const order = await PrintOrder.findByIdAndDelete(req.params.id);
  if (!order) throw new ApiError(404, 'Không tìm thấy đơn in');
  res.status(200).json(new ApiResponse(200, null, 'Đã xóa đơn in'));
});
