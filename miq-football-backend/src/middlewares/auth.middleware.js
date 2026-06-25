import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { ApiError } from '../utils/apiResponse.js';
import catchAsync from '../utils/catchAsync.js';

export const protect = catchAsync(async(req, res, next) => {
    let token;

    if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(new ApiError(401, 'Bạn chưa đăng nhập'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // [6] Guard against forged payloads — decoded.id must be a string
    if (typeof decoded.id !== 'string') {
        return next(new ApiError(401, 'Token không hợp lệ'));
    }

    // Intentional: one DB lookup per authenticated request.
    // This is what enables Phase-4 JWT invalidation after password change —
    // passwordChangedAt is checked against decoded.iat below. A long-lived
    // cache would delay that check. If this becomes a real bottleneck under
    // load, add a SHORT-TTL in-process cache (≤60 s) keyed by user id and
    // explicitly invalidate it on password change, role change, and profile update.
    const user = await User.findById(decoded.id);
    if (!user) {
        return next(new ApiError(401, 'Tài khoản không còn tồn tại'));
    }

    // [1] Reject tokens issued before the last password change
    if (user.passwordChangedAt) {
        const changedAtSec = Math.floor(user.passwordChangedAt.getTime() / 1000);
        if (decoded.iat < changedAtSec) {
            return next(new ApiError(401, 'Mật khẩu đã thay đổi, vui lòng đăng nhập lại'));
        }
    }

    req.user = user;
    next();
});

export const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new ApiError(403, 'Bạn không có quyền thực hiện hành động này'));
        }
        next();
    };
};
