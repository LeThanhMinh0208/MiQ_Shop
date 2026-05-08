import catchAsync from '../utils/catchAsync.js';
import { ApiResponse, ApiError } from '../utils/apiResponse.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import stripe from '../config/stripe.js';

// POST /api/v1/orders
export const createOrder = catchAsync(async(req, res) => {
    const { items, shippingAddress, paymentMethod, notes } = req.body;

    if (!items || items.length === 0) throw new ApiError(400, 'Đơn hàng phải có ít nhất 1 sản phẩm');

    const itemsPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shippingPrice = itemsPrice >= 500000 ? 0 : 30000; // Miễn ship cho đơn >= 500k
    const totalPrice = itemsPrice + shippingPrice;

    const order = await Order.create({
        user: req.user._id,
        items,
        shippingAddress,
        itemsPrice,
        shippingPrice,
        totalPrice,
        payment: { method: paymentMethod || 'stripe' },
        notes,
        statusHistory: [{ status: 'pending', note: 'Đơn hàng vừa được tạo' }],
    });

    res.status(201).json(new ApiResponse(201, order, 'Tạo đơn hàng thành công'));
});

// POST /api/v1/orders/:id/payment-intent (Tạo Stripe Payment Intent)
export const createPaymentIntent = catchAsync(async(req, res) => {
    const order = await Order.findById(req.params.id);
    if (!order) throw new ApiError(404, 'Không tìm thấy đơn hàng');
    if (order.user.toString() !== req.user._id.toString()) {
        throw new ApiError(403, 'Không có quyền truy cập đơn hàng này');
    }

    // Tạo PaymentIntent trên Stripe (đơn vị là VND - không có số thập phân)
    const paymentIntent = await stripe.paymentIntents.create({
        amount: order.totalPrice,
        currency: 'vnd',
        metadata: { orderId: order._id.toString() },
    });

    // Lưu paymentIntentId vào order
    order.payment.stripePaymentIntentId = paymentIntent.id;
    await order.save();

    res.status(200).json(
        new ApiResponse(200, { clientSecret: paymentIntent.client_secret }, 'Tạo payment intent thành công')
    );
});

// PUT /api/v1/orders/:id/pay (Xác nhận đã thanh toán)
export const markOrderPaid = catchAsync(async(req, res) => {
    const order = await Order.findById(req.params.id);
    if (!order) throw new ApiError(404, 'Không tìm thấy đơn hàng');

    order.payment.isPaid = true;
    order.payment.paidAt = new Date();
    order.status = 'confirmed';
    order.statusHistory.push({ status: 'confirmed', note: 'Thanh toán thành công' });
    await order.save();

    // Cập nhật stats user cho K-Means segmentation
    await User.findByIdAndUpdate(order.user, {
        $inc: { 'stats.totalSpent': order.totalPrice, 'stats.orderCount': 1 },
        $set: { 'stats.lastOrderAt': new Date() },
    });

    res.status(200).json(new ApiResponse(200, order, 'Xác nhận thanh toán thành công'));
});

// GET /api/v1/orders/my-orders
export const getMyOrders = catchAsync(async(req, res) => {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(new ApiResponse(200, orders, 'Lấy đơn hàng thành công'));
});

// GET /api/v1/orders (Admin)
export const getAllOrders = catchAsync(async(req, res) => {
    const { page = 1, limit = 20, status } = req.query;
    const filter = status ? { status } : {};

    const orders = await Order.find(filter)
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit));

    const total = await Order.countDocuments(filter);

    res.status(200).json(
        new ApiResponse(200, { orders, total }, 'Lấy tất cả đơn hàng thành công')
    );
});

// PUT /api/v1/orders/:id/status (Admin)
export const updateOrderStatus = catchAsync(async(req, res) => {
    const { status, note } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) throw new ApiError(404, 'Không tìm thấy đơn hàng');

    order.status = status;
    order.statusHistory.push({ status, note: note || '' });
    await order.save();

    res.status(200).json(new ApiResponse(200, order, 'Cập nhật trạng thái thành công'));
});