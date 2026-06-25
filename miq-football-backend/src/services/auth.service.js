import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { ApiError } from '../utils/apiResponse.js';

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

export const sendTokenResponse = (user, statusCode, res, message) => {
    const token = signToken(user._id);

    const cookieDays = parseInt(process.env.JWT_COOKIE_EXPIRES_IN, 10) || 7;
    const isProd = process.env.NODE_ENV === 'production';
    const cookieOptions = {
        maxAge: cookieDays * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'none' : 'lax',
    };

    user.password = undefined;

    res.status(statusCode).cookie('token', token, cookieOptions).json({
        success: true,
        message,
        data: { user },
    });
};

export const registerUser = async({ name, email, password }) => {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new ApiError(400, 'Email này đã được đăng ký');
    }
    const user = await User.create({ name, email, password });
    return user;
};

export const loginUser = async({ email, password }) => {
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
        throw new ApiError(401, 'Email hoặc mật khẩu không đúng');
    }
    return user;
};