import catchAsync from '../utils/catchAsync.js';
import { ApiResponse, ApiError } from '../utils/apiResponse.js';
import PrintOrder from '../models/PrintOrder.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { getIO } from '../socket/index.js';

// POST /api/v1/print-orders  (User)
export const createPrintOrder = catchAsync(async (req, res) => {
    const {
        jerseyType, playerName, playerNumber, font, quantity, color,
        logoUrl, notes, contactPhone, deliveryAddress,
    } = req.body;

    const payload = {
        user:           req.user._id,
        name:           req.user.name,
        phone:          contactPhone || req.body.phone || '',
        jerseyType:     jerseyType   || 'custom',
        playerName:     playerName   || '',
        playerNumber:   String(playerNumber || ''),
        fontStyle:      font         || req.body.fontStyle || 'BLOCK',
        quantity:       Number(quantity) || 1,
        referenceImage: logoUrl      || req.body.referenceImage || '',
        notes:          [notes, deliveryAddress ? `Địa chỉ giao: ${deliveryAddress}` : ''].filter(Boolean).join('\n'),
    };

    const order = await PrintOrder.create(payload);

    const admins = await User.find({ role: 'admin' }).select('_id');
    const notifPayload = {
        type: 'new-print-order',
        title: 'Đơn đặt in mới',
        message: `${req.user.name} vừa đặt in áo: ${order.playerName} #${order.playerNumber}`,
        link: '/admin/print-orders',
        data: { printOrderId: order._id },
    };
    if (admins.length > 0) {
        await Notification.insertMany(admins.map((a) => ({ recipient: a._id, ...notifPayload })));
    }
    const io = getIO();
    if (io) io.to('admin-room').emit('notification', { ...notifPayload, createdAt: new Date(), read: false });

    res.status(201).json(new ApiResponse(201, order, 'Đặt in thành công! Chúng tôi sẽ liên hệ trong vòng 24h.'));
});

// GET /api/v1/print-orders/my  (User)
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

// PATCH /api/v1/print-orders/:id/status  (Admin)
export const updatePrintOrderStatus = catchAsync(async (req, res) => {
    const { status } = req.body;
    const order = await PrintOrder.findByIdAndUpdate(req.params.id, { status }, { returnDocument: 'after' });
    if (!order) throw new ApiError(404, 'Không tìm thấy đơn in');
    res.status(200).json(new ApiResponse(200, order, 'Cập nhật thành công'));
});
