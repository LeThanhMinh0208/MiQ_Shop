import { ApiError } from '../utils/apiResponse.js';
import { logger } from '../utils/logger.js';

const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    if (err.name === 'CastError') {
        error = new ApiError(404, `Không tìm thấy resource với id: ${err.value}`);
    }
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        error = new ApiError(400, `${field} này đã được sử dụng`);
    }
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map((e) => e.message);
        error = new ApiError(400, messages.join(', '));
    }
    if (err.name === 'MulterError') {
        const msg = err.code === 'LIMIT_FILE_SIZE'
            ? 'Dung lượng file không được vượt quá 5MB'
            : `Lỗi upload: ${err.message}`;
        error = new ApiError(400, msg);
    }
    if (err.name === 'JsonWebTokenError') {
        error = new ApiError(401, 'Token không hợp lệ, vui lòng đăng nhập lại');
    }
    if (err.name === 'TokenExpiredError') {
        error = new ApiError(401, 'Token đã hết hạn, vui lòng đăng nhập lại');
    }

    const statusCode = error.statusCode || 500;

    // Structured log: 5xx → error (alerts); 4xx → debug (expected client errors).
    // Deliberately omit req.body and req.user to avoid logging PII / password hashes.
    if (statusCode >= 500) {
        const log = req.log ?? logger;
        log.error({
            err: { message: err.message, name: err.name, stack: err.stack },
            method:  req.method,
            url:     req.originalUrl,
            status:  statusCode,
        }, 'unhandled server error');
    }

    res.status(statusCode).json({
        success: false,
        message: error.message || 'Lỗi server',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};

export default errorHandler;
