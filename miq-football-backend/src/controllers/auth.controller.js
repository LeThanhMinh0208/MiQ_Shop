import crypto from 'crypto';
import catchAsync from '../utils/catchAsync.js';
import { ApiResponse, ApiError } from '../utils/apiResponse.js';
import * as authService from '../services/auth.service.js';
import { sendTokenResponse } from '../services/auth.service.js';
import User from '../models/User.js';
import { sendPasswordResetEmail } from '../utils/emailService.js';

// Strip HTML tags from a plain-text display name, then cap length.
// Prevents stored-XSS via HTML in email templates or future rendered views.
function sanitizeName(raw) {
    if (typeof raw !== 'string') return '';
    return raw.replace(/<[^>]*>/g, '').trim().slice(0, 100);
}

export const register = catchAsync(async(req, res) => {
    const { name, email, password } = req.body;
    const user = await authService.registerUser({ name: sanitizeName(name), email, password });
    sendTokenResponse(user, 201, res, 'Đăng ký thành công');
});

export const login = catchAsync(async(req, res) => {
    const { email, password } = req.body;
    const user = await authService.loginUser({ email, password });
    sendTokenResponse(user, 200, res, 'Đăng nhập thành công');
});

export const logout = (req, res) => {
    res.cookie('token', '', { httpOnly: true, expires: new Date(0) });
    res.status(200).json({ success: true, message: 'Đăng xuất thành công' });
};

export const getMe = catchAsync(async(req, res) => {
    res.status(200).json(new ApiResponse(200, req.user, 'Lấy thông tin thành công'));
});

export const updateProfile = catchAsync(async(req, res) => {
    const { name, email } = req.body;
    const user = await User.findByIdAndUpdate(
        req.user._id,
        { name: sanitizeName(name), email },
        { returnDocument: 'after', runValidators: true }
    );
    res.status(200).json(new ApiResponse(200, user, 'Cập nhật thông tin thành công'));
});

export const uploadUserAvatar = catchAsync(async(req, res) => {
    if (!req.file) throw new ApiError(400, 'Vui lòng chọn ảnh');
    const user = await User.findByIdAndUpdate(
        req.user._id,
        { avatar: { url: req.file.path, publicId: req.file.filename } },
        { returnDocument: 'after' }
    );
    res.status(200).json(new ApiResponse(200, user, 'Cập nhật ảnh đại diện thành công'));
});

export const changePassword = catchAsync(async(req, res) => {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.comparePassword(currentPassword))) {
        throw new ApiError(401, 'Mật khẩu hiện tại không đúng');
    }
    user.password = newPassword;
    await user.save();
    res.status(200).json(new ApiResponse(200, null, 'Đổi mật khẩu thành công'));
});

export const addAddress = catchAsync(async(req, res) => {
    const user = await User.findById(req.user._id);
    if (req.body.isDefault || user.addresses.length === 0) {
        user.addresses.forEach((a) => { a.isDefault = false; });
        req.body.isDefault = true;
    }
    user.addresses.push(req.body);
    await user.save();
    res.status(200).json(new ApiResponse(200, user.addresses, 'Thêm địa chỉ thành công'));
});

export const updateAddress = catchAsync(async(req, res) => {
    const user = await User.findById(req.user._id);
    const address = user.addresses.id(req.params.addressId);
    if (!address) throw new ApiError(404, 'Không tìm thấy địa chỉ');
    if (req.body.isDefault) {
        user.addresses.forEach((a) => { a.isDefault = false; });
    }
    Object.assign(address, req.body);
    await user.save();
    res.status(200).json(new ApiResponse(200, user.addresses, 'Cập nhật địa chỉ thành công'));
});

export const deleteAddress = catchAsync(async(req, res) => {
    const user = await User.findById(req.user._id);
    user.addresses.pull(req.params.addressId);
    await user.save();
    res.status(200).json(new ApiResponse(200, user.addresses, 'Xóa địa chỉ thành công'));
});

// Always return the same generic message regardless of whether email exists —
// prevents email-enumeration attacks.
const RESET_GENERIC_MSG = 'Nếu email tồn tại trong hệ thống, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu trong vài phút.';

export const forgotPassword = catchAsync(async (req, res) => {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';

    const user = await User.findOne({ email }).select('+passwordResetToken +passwordResetExpires');

    if (!user) {
        // Return 200 so the caller cannot distinguish found vs not-found
        return res.status(200).json(new ApiResponse(200, null, RESET_GENERIC_MSG));
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken   = crypto.createHash('sha256').update(rawToken).digest('hex');
    user.passwordResetExpires = Date.now() + 15 * 60 * 1000; // 15 min
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${rawToken}`;

    try {
        await sendPasswordResetEmail(user, resetUrl);
    } catch {
        user.passwordResetToken   = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });
        throw new ApiError(500, 'Không thể gửi email, vui lòng thử lại sau');
    }

    res.status(200).json(new ApiResponse(200, null, RESET_GENERIC_MSG));
});

export const resetPassword = catchAsync(async (req, res) => {
    const { token } = req.params;
    const { password } = req.body || {};

    if (!password || password.length < 8) {
        throw new ApiError(400, 'Mật khẩu mới phải có ít nhất 8 ký tự');
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
        passwordResetToken:   hashedToken,
        passwordResetExpires: { $gt: Date.now() },
    }).select('+password +passwordResetToken +passwordResetExpires');

    if (!user) {
        throw new ApiError(400, 'Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn');
    }

    // The pre-save hook hashes password and sets passwordChangedAt
    user.password             = password;
    user.passwordResetToken   = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.status(200).json(new ApiResponse(200, null, 'Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại.'));
});

export const toggleWishlist = catchAsync(async(req, res) => {
    const { productId } = req.params;
    const user = await User.findById(req.user._id);
    const idx = user.wishlist.indexOf(productId);
    if (idx >= 0) {
        user.wishlist.splice(idx, 1);
    } else {
        user.wishlist.push(productId);
    }
    await user.save();
    res.status(200).json(new ApiResponse(200, user.wishlist, 'Đã cập nhật wishlist'));
});

export const getWishlist = catchAsync(async(req, res) => {
    const user = await User.findById(req.user._id).populate('wishlist');
    res.status(200).json(new ApiResponse(200, user.wishlist, 'Lấy wishlist thành công'));
});