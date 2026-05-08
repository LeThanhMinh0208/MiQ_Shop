import { ApiError } from '../utils/apiResponse.js';

// Shorthand middleware dùng sau protect()
// Ví dụ: router.delete('/:id', protect, isAdmin, deleteProduct)
const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return next(new ApiError(403, 'Chỉ Admin mới có quyền truy cập'));
    }
    next();
};

export default isAdmin;