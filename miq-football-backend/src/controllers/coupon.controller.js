import catchAsync from '../utils/catchAsync.js';
import { ApiResponse, ApiError } from '../utils/apiResponse.js';
import Coupon from '../models/Coupon.js';

// POST /api/v1/coupons/validate  (User: validate and get discount)
export const validateCoupon = catchAsync(async (req, res) => {
    const { code, orderTotal } = req.body;
    if (!code) throw new ApiError(400, 'Vui lòng nhập mã giảm giá');

    const coupon = await Coupon.findOne({ code: code.toUpperCase().trim(), isActive: true });
    if (!coupon) throw new ApiError(404, 'Mã giảm giá không hợp lệ');
    if (coupon.expiresAt && new Date() > coupon.expiresAt) throw new ApiError(400, 'Mã giảm giá đã hết hạn');
    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) throw new ApiError(400, 'Mã giảm giá đã được sử dụng hết');
    if (orderTotal < coupon.minOrder) throw new ApiError(400, `Đơn hàng tối thiểu ${coupon.minOrder.toLocaleString('vi-VN')}đ để dùng mã này`);

    let discount = 0;
    if (coupon.type === 'percent') {
        discount = Math.round((orderTotal * coupon.value) / 100);
        if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
    } else {
        discount = Math.min(coupon.value, orderTotal);
    }

    res.status(200).json(new ApiResponse(200, {
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        discount,
        description: coupon.description,
    }, 'Mã giảm giá hợp lệ'));
});

// Các field admin được phép set — không bao gồm usedCount, _id, timestamps
const COUPON_ALLOWED_FIELDS = [
    'code', 'type', 'value', 'minOrder', 'maxDiscount',
    'usageLimit', 'isActive', 'expiresAt', 'description',
];

// POST /api/v1/coupons  (Admin: create)
export const createCoupon = catchAsync(async (req, res) => {
    // Whitelist fields — không cho client set usedCount hay computed fields
    const payload = {};
    for (const key of COUPON_ALLOWED_FIELDS) {
        if (key in req.body) payload[key] = req.body[key];
    }
    const coupon = await Coupon.create(payload);
    res.status(201).json(new ApiResponse(201, coupon, 'Tạo mã giảm giá thành công'));
});

// GET /api/v1/coupons  (Admin: list all)
export const getCoupons = catchAsync(async (req, res) => {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.status(200).json(new ApiResponse(200, coupons, 'OK'));
});

// PATCH /api/v1/coupons/:id  (Admin: update)
// Dùng load-then-save thay vì findByIdAndUpdate để:
// 1. Validator cross-field (this.type) chạy đúng với full document context
// 2. Chỉ cho phép ghi vào COUPON_ALLOWED_FIELDS (chặn mass-assignment)
export const updateCoupon = catchAsync(async (req, res) => {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) throw new ApiError(404, 'Không tìm thấy mã giảm giá');
    for (const key of COUPON_ALLOWED_FIELDS) {
        if (key in req.body) coupon[key] = req.body[key];
    }
    await coupon.save();
    res.status(200).json(new ApiResponse(200, coupon, 'Cập nhật thành công'));
});

// DELETE /api/v1/coupons/:id  (Admin)
export const deleteCoupon = catchAsync(async (req, res) => {
    await Coupon.findByIdAndDelete(req.params.id);
    res.status(200).json(new ApiResponse(200, null, 'Đã xóa mã giảm giá'));
});
