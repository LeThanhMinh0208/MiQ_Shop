import { ApiError } from '../utils/apiResponse.js';

const errorHandler = (err, req, res, next) => {
    let error = {...err };
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
    if (err.name === 'JsonWebTokenError') {
        error = new ApiError(401, 'Token không hợp lệ, vui lòng đăng nhập lại');
    }
    if (err.name === 'TokenExpiredError') {
        error = new ApiError(401, 'Token đã hết hạn, vui lòng đăng nhập lại');
    }

    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: error.message || 'Lỗi server',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};

export default errorHandler;