import catchAsync from '../utils/catchAsync.js';
import { ApiResponse, ApiError } from '../utils/apiResponse.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Coupon from '../models/Coupon.js';
import Notification from '../models/Notification.js';
import { getIO } from '../socket/index.js';
import stripe from '../config/stripe.js';
import { sendOrderConfirmation, sendOrderStatusUpdate } from '../utils/emailService.js';
import { logger } from '../utils/logger.js';

const CUSTOMIZATION_FEE  = 50000; // 50,000 VND per item with name/number print
const SHIPPING_THRESHOLD = Number(process.env.SHIPPING_THRESHOLD) || 500000;
const SHIPPING_FEE       = Number(process.env.SHIPPING_FEE)       || 30000;

// Issues a Stripe refund for a paid order and records the result.
// Race-safe: atomic findOneAndUpdate claims a sentinel 'pending' slot before
// calling Stripe, so two concurrent cancels can never both trigger a refund.
// Best-effort: releases the sentinel on failure so a manual retry is possible.
async function refundIfPaid(order) {
    if (
        order.payment.method !== 'stripe' ||
        !order.payment.isPaid              ||
        !order.payment.stripePaymentIntentId
    ) return;

    // Atomic claim: only proceed when refundId is still null.
    const claimed = await Order.findOneAndUpdate(
        { _id: order._id, 'payment.refundId': null },
        { $set: { 'payment.refundId': 'pending' } },
    );
    if (!claimed) return; // another process already claimed the slot

    try {
        const refund = await stripe.refunds.create({
            payment_intent: order.payment.stripePaymentIntentId,
        });
        await Order.findByIdAndUpdate(order._id, {
            $set:  { 'payment.refundId': refund.id, 'payment.refundedAt': new Date() },
            $push: { statusHistory: { status: 'cancelled', note: `Hoàn tiền Stripe: ${refund.id}`, updatedAt: new Date() } },
        });
    } catch (err) {
        // Release the sentinel so a manual retry remains possible
        await Order.findByIdAndUpdate(order._id, { $unset: { 'payment.refundId': '' } }).catch(() => {});
        logger.error({
            orderId: order._id,
            piId: order.payment.stripePaymentIntentId,
            err: { message: err.message },
        }, '[REFUND FAILED] Manual reconciliation required');
    }
}

// Best-effort stock restore for a completed order — used on cancellation.
// Errors are caught individually so one failure doesn't block the rest.
async function restoreStock(order) {
    await Promise.all(
        order.items.map(async (item) => {
            try {
                await Product.updateOne(
                    { _id: item.product, variants: { $elemMatch: { size: item.size } } },
                    { $inc: { 'variants.$.stock': item.quantity } }
                );
            } catch (err) {
                logger.error({ orderId: order._id, productId: item.product, size: item.size, qty: item.quantity, err: { message: err.message } }, '[RESTOCK FAILED] Manual reconciliation required');
            }
        })
    );
}

// Rolls back stock decrements and coupon increment after a failed createOrder.
// Each compensation is isolated so one failure doesn't skip the other.
async function compensate({ decremented, appliedCouponId, context }) {
    for (const d of decremented) {
        try {
            await Product.updateOne(
                { _id: d.productId, variants: { $elemMatch: { size: d.size } } },
                { $inc: { 'variants.$.stock': d.qty } }
            );
        } catch (err) {
            logger.error({ context, productId: d.productId, size: d.size, qty: d.qty, err: { message: err.message } }, '[COMPENSATION FAILED] Stock restore — manual reconciliation required');
        }
    }
    if (appliedCouponId) {
        try {
            await Coupon.findByIdAndUpdate(appliedCouponId, { $inc: { usedCount: -1 } });
        } catch (err) {
            logger.error({ context, couponId: appliedCouponId, err: { message: err.message } }, '[COMPENSATION FAILED] Coupon rollback — manual reconciliation required');
        }
    }
}

// POST /api/v1/orders
export const createOrder = catchAsync(async (req, res) => {
    const { items, shippingAddress, paymentMethod, notes, couponCode, idempotencyKey } = req.body;

    if (!items || items.length === 0) throw new ApiError(400, 'Đơn hàng phải có ít nhất 1 sản phẩm');

    // [6] Idempotency — return existing order if same key already created one
    if (idempotencyKey) {
        const existing = await Order.findOne({ idempotencyKey }).lean();
        if (existing) return res.status(200).json(new ApiResponse(200, existing, 'Đơn hàng đã tồn tại'));
    }

    // [2] Server-side price re-validation — never trust client-supplied item.price
    const productIds = [...new Set(items.map(i => i.product?.toString()).filter(Boolean))];
    const products = await Product.find({ _id: { $in: productIds }, isActive: true }).lean();
    const productMap = new Map(products.map(p => [p._id.toString(), p]));

    let itemsPrice = 0;
    const validatedItems = [];

    for (const item of items) {
        const product = productMap.get(item.product?.toString());
        if (!product) throw new ApiError(400, `Sản phẩm không tồn tại hoặc đã ngừng bán`);

        const hasCustomization = !!(item.customization?.name || item.customization?.number);
        const unitPrice = (product.salePrice !== null && product.salePrice !== undefined)
            ? product.salePrice
            : product.price;
        const serverPrice = unitPrice + (hasCustomization ? CUSTOMIZATION_FEE : 0);

        itemsPrice += serverPrice * item.quantity;
        validatedItems.push({
            product: product._id,
            name:    product.name,
            image:   product.images?.[0]?.url || item.image || '',
            price:   serverPrice,
            size:    item.size,
            quantity: item.quantity,
            customization: {
                name:   item.customization?.name   || '',
                number: item.customization?.number || '',
            },
        });
    }

    // [2] Shipping price computed server-side — never from req.body
    const shippingPrice = itemsPrice >= SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;

    // [4] Coupon race — single atomic conditional findOneAndUpdate
    let couponDiscount = 0;
    let appliedCoupon  = null;
    let appliedCouponId = null;

    if (couponCode) {
        const now = new Date();
        const coupon = await Coupon.findOneAndUpdate(
            {
                code: couponCode.toUpperCase().trim(),
                isActive: true,
                minOrder: { $lte: itemsPrice },
                $and: [
                    { $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }] },
                    { $or: [{ usageLimit: null }, { $expr: { $lt: ['$usedCount', '$usageLimit'] } }] },
                ],
            },
            { $inc: { usedCount: 1 } },
            { returnDocument: 'before' }  // pre-update doc so we read values before increment
        );

        if (coupon) {
            if (coupon.type === 'percent') {
                couponDiscount = Math.round((itemsPrice * coupon.value) / 100);
                if (coupon.maxDiscount) couponDiscount = Math.min(couponDiscount, coupon.maxDiscount);
            } else {
                couponDiscount = Math.min(coupon.value, itemsPrice);
            }
            appliedCoupon   = { code: coupon.code, discount: couponDiscount };
            appliedCouponId = coupon._id;
        }
    }

    const totalPrice = Math.max(0, itemsPrice + shippingPrice - couponDiscount);

    // [3] Atomic stock decrement per item — fail fast with rollback
    const decremented = []; // { productId, size, qty } for compensation

    for (const item of validatedItems) {
        const updated = await Product.findOneAndUpdate(
            {
                _id: item.product,
                variants: { $elemMatch: { size: item.size, stock: { $gte: item.quantity } } },
            },
            { $inc: { 'variants.$.stock': -item.quantity } },
            { returnDocument: 'before' }
        );

        if (!updated) {
            await compensate({ decremented, appliedCouponId, context: 'stock-check' });
            throw new ApiError(400, `Sản phẩm "${item.name}" size ${item.size} không đủ hàng`);
        }
        decremented.push({ productId: item.product, size: item.size, qty: item.quantity });
    }

    // All stock reserved — create the order
    let order;
    try {
        order = await Order.create({
            user: req.user._id,
            items: validatedItems,
            shippingAddress,
            itemsPrice,
            shippingPrice,
            coupon: appliedCoupon,
            totalPrice,
            payment: { method: paymentMethod || 'stripe' },
            notes,
            idempotencyKey: idempotencyKey || undefined,
            statusHistory: [{ status: 'pending', note: 'Đơn hàng vừa được tạo' }],
        });
    } catch (err) {
        await compensate({ decremented, appliedCouponId, context: 'order-create' });
        // Duplicate idempotencyKey race: two requests with same key slipped past the pre-check
        if (err.code === 11000 && err.keyPattern?.idempotencyKey && idempotencyKey) {
            const existing = await Order.findOne({ idempotencyKey }).lean();
            if (existing) return res.status(200).json(new ApiResponse(200, existing, 'Đơn hàng đã tồn tại'));
        }
        throw err;
    }

    // Send confirmation email (non-blocking)
    sendOrderConfirmation(order, req.user).catch(() => {});

    // Notify admins via socket
    const admins = await User.find({ role: 'admin' }).select('_id').lean();
    const shortId = order._id.toString().slice(-6).toUpperCase();
    const newOrderPayload = {
        type: 'new-order',
        title: 'Đơn hàng mới',
        message: `${req.user.name} vừa đặt đơn #${shortId} · ${new Intl.NumberFormat('vi-VN').format(totalPrice)}đ`,
        link: '/admin/orders',
        data: { orderId: order._id },
    };
    if (admins.length > 0) {
        await Notification.insertMany(admins.map(a => ({ recipient: a._id, ...newOrderPayload })));
    }
    const ioNew = getIO();
    if (ioNew) ioNew.to('admin-room').emit('notification', { ...newOrderPayload, createdAt: new Date(), read: false });

    res.status(201).json(new ApiResponse(201, order, 'Tạo đơn hàng thành công'));
});

// POST /api/v1/orders/:id/payment-intent
export const createPaymentIntent = catchAsync(async (req, res) => {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) throw new ApiError(404, 'Không tìm thấy đơn hàng');
    if (order.payment.isPaid) throw new ApiError(400, 'Đơn hàng đã được thanh toán');

    // Idempotent: if a PaymentIntent already exists, retrieve and return its secret
    if (order.payment.stripePaymentIntentId) {
        const existing = await stripe.paymentIntents.retrieve(order.payment.stripePaymentIntentId);
        return res.status(200).json(
            new ApiResponse(200, { clientSecret: existing.client_secret }, 'Payment intent đã tồn tại')
        );
    }

    // Amount is always taken from the server-side order — never from the client
    const paymentIntent = await stripe.paymentIntents.create({
        amount: order.totalPrice,
        currency: 'vnd',
        metadata: { orderId: order._id.toString() },
    });

    order.payment.stripePaymentIntentId = paymentIntent.id;
    await order.save();

    res.status(200).json(
        new ApiResponse(200, { clientSecret: paymentIntent.client_secret }, 'Tạo payment intent thành công')
    );
});

// PUT /api/v1/orders/:id/pay
// Used for COD confirmation by admin. For Stripe orders, payment is confirmed
// exclusively via the webhook; this endpoint rejects Stripe orders that do not
// have a succeeded PaymentIntent so the client can never bypass the webhook.
export const markOrderPaid = catchAsync(async (req, res) => {
    // IDOR fix — scope to the authenticated user's own order
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) throw new ApiError(404, 'Không tìm thấy đơn hàng');
    if (order.payment.isPaid) throw new ApiError(400, 'Đơn hàng đã được thanh toán');

    // Stripe orders must have a confirmed PaymentIntent — never trust the client blindly
    if (order.payment.method === 'stripe') {
        if (!order.payment.stripePaymentIntentId) {
            throw new ApiError(400, 'Chưa có payment intent cho đơn hàng này');
        }
        const pi = await stripe.paymentIntents.retrieve(order.payment.stripePaymentIntentId);
        if (pi.status !== 'succeeded') {
            throw new ApiError(400, 'Thanh toán Stripe chưa hoàn thành');
        }
    }

    order.payment.isPaid = true;
    order.payment.paidAt = new Date();
    order.status = 'confirmed';
    order.statusHistory.push({ status: 'confirmed', note: 'Xác nhận thanh toán' });
    await order.save();

    await User.findByIdAndUpdate(order.user, {
        $inc: { 'stats.totalSpent': order.totalPrice, 'stats.orderCount': 1 },
        $set: { 'stats.lastOrderAt': new Date() },
    });

    res.status(200).json(new ApiResponse(200, order, 'Xác nhận thanh toán thành công'));
});

// GET /api/v1/orders/my-orders
export const getMyOrders = catchAsync(async (req, res) => {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(new ApiResponse(200, orders, 'Lấy đơn hàng thành công'));
});

// GET /api/v1/orders/:id — user-scoped single order (for polling from OrderPending)
export const getOrderById = catchAsync(async (req, res) => {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id }).lean();
    if (!order) throw new ApiError(404, 'Không tìm thấy đơn hàng');
    res.status(200).json(new ApiResponse(200, order, 'Lấy đơn hàng thành công'));
});

// GET /api/v1/orders (Admin)
export const getAllOrders = catchAsync(async (req, res) => {
    const { page, limit, status } = req.query;
    const safeLimit = Math.min(Math.max(1, parseInt(limit) || 20), 100);
    const safePage  = Math.max(1, parseInt(page) || 1);
    const filter = status ? { status } : {};

    const orders = await Order.find(filter)
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .skip((safePage - 1) * safeLimit)
        .limit(safeLimit);

    const total = await Order.countDocuments(filter);

    res.status(200).json(
        new ApiResponse(200, { orders, total }, 'Lấy tất cả đơn hàng thành công')
    );
});

// PUT /api/v1/orders/:id/status (Admin)
export const updateOrderStatus = catchAsync(async (req, res) => {
    const { status, note } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) throw new ApiError(404, 'Không tìm thấy đơn hàng');

    const prevStatus = order.status;
    order.status = status;
    order.statusHistory.push({ status, note: note || '' });

    if (status === 'delivered' && !order.payment.isPaid) {
        order.payment.isPaid = true;
        order.payment.paidAt = new Date();
        await User.findByIdAndUpdate(order.user, {
            $inc: { 'stats.totalSpent': order.totalPrice, 'stats.orderCount': 1 },
            $set: { 'stats.lastOrderAt': new Date() },
        });
    }

    if (status === 'cancelled' && order.payment.isPaid && prevStatus !== 'cancelled') {
        await User.findByIdAndUpdate(order.user, {
            $inc: { 'stats.totalSpent': -order.totalPrice, 'stats.orderCount': -1 },
        });
    }

    await order.save();

    // [5] Restore stock + Stripe refund on cancellation (guard prevents double-restore/refund)
    if (status === 'cancelled' && prevStatus !== 'cancelled') {
        await restoreStock(order);
        await refundIfPaid(order);
    }

    const customer = await User.findById(order.user).select('name email').lean();
    if (customer?.email) {
        sendOrderStatusUpdate(order, customer, note).catch(() => {});
    }

    const io = getIO();
    if (io) {
        io.to(`user-${order.user.toString()}`).emit('order:status-changed', {
            orderId: order._id,
            status,
            note: note || '',
        });
    }

    res.status(200).json(new ApiResponse(200, order, 'Cập nhật trạng thái thành công'));
});

// PUT /api/v1/orders/:id/cancel (User)
export const cancelOrder = catchAsync(async (req, res) => {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) throw new ApiError(404, 'Không tìm thấy đơn hàng');
    if (!['pending', 'confirmed'].includes(order.status)) {
        throw new ApiError(400, 'Chỉ có thể hủy đơn hàng khi đang chờ xác nhận hoặc đã xác nhận');
    }

    const prevStatus = order.status;
    const { reason = '' } = req.body || {};
    order.status = 'cancelled';
    order.statusHistory.push({ status: 'cancelled', note: reason || 'Người dùng hủy đơn' });
    await order.save();

    // [5] Restore stock + Stripe refund exactly once (prevStatus guard)
    if (prevStatus !== 'cancelled') {
        await restoreStock(order);
        await refundIfPaid(order);
    }

    const admins = await User.find({ role: 'admin' }).select('_id');
    const shortId = order._id.toString().slice(-6).toUpperCase();
    const notifPayload = {
        type: 'order-cancelled',
        title: 'Đơn hàng bị hủy',
        message: `Khách hàng ${req.user.name} đã hủy đơn #${shortId}`,
        link: '/admin/orders',
        data: { orderId: order._id },
    };
    if (admins.length > 0) {
        await Notification.insertMany(admins.map(a => ({ recipient: a._id, ...notifPayload })));
    }
    const io = getIO();
    if (io) {
        io.to('admin-room').emit('notification', { ...notifPayload, createdAt: new Date(), read: false });
    }

    res.status(200).json(new ApiResponse(200, order, 'Đã hủy đơn hàng'));
});
