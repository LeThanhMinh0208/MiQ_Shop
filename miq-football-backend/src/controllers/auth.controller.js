import catchAsync from '../utils/catchAsync.js';
import { ApiResponse } from '../utils/apiResponse.js';
import * as authService from '../services/auth.service.js';
import { sendTokenResponse } from '../services/auth.service.js';

export const register = catchAsync(async(req, res) => {
    const { name, email, password } = req.body;
    const user = await authService.registerUser({ name, email, password });
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