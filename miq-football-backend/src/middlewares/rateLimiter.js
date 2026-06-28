import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    skip: () => process.env.NODE_ENV === 'test',
    message: { success: false, message: 'Quá nhiều lần thử, vui lòng thử lại sau 15 phút' },
    standardHeaders: true,
    legacyHeaders: false,
});

export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    skip: () => process.env.NODE_ENV === 'test',
    message: { success: false, message: 'Quá nhiều request, vui lòng thử lại sau' },
});

// Stricter limiter for password reset — 3 attempts per IP per hour
export const forgotPasswordLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 3,
    message: { success: false, message: 'Quá nhiều yêu cầu đặt lại mật khẩu, vui lòng thử lại sau 1 giờ' },
    standardHeaders: true,
    legacyHeaders: false,
});