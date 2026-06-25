import { Router } from 'express';
import {
    register,
    login,
    logout,
    getMe,
    updateProfile,
    uploadUserAvatar,
    changePassword,
    addAddress,
    updateAddress,
    deleteAddress,
    toggleWishlist,
    getWishlist,
    forgotPassword,
    resetPassword,
} from '../controllers/auth.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { authLimiter, forgotPasswordLimiter } from '../middlewares/rateLimiter.js';
import { uploadAvatar } from '../middlewares/upload.middleware.js';

const router = Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/logout', logout);
router.get('/me', protect, getMe);

// Password reset (public, rate-limited)
router.post('/forgot-password', forgotPasswordLimiter, forgotPassword);
router.post('/reset-password/:token', authLimiter, resetPassword);

// Profile
router.put('/profile', protect, updateProfile);
router.post('/avatar', protect, ...uploadAvatar.single('avatar'), uploadUserAvatar);
router.put('/change-password', protect, changePassword);

// Addresses
router.post('/addresses', protect, addAddress);
router.put('/addresses/:addressId', protect, updateAddress);
router.delete('/addresses/:addressId', protect, deleteAddress);

// Wishlist
router.get('/wishlist', protect, getWishlist);
router.post('/wishlist/:productId', protect, toggleWishlist);

export default router;
