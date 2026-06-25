import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import isAdmin from '../middlewares/admin.middleware.js';
import { validateCoupon, createCoupon, getCoupons, updateCoupon, deleteCoupon } from '../controllers/coupon.controller.js';

const router = Router();

router.post('/validate', protect, validateCoupon);
router.get('/', protect, isAdmin, getCoupons);
router.post('/', protect, isAdmin, createCoupon);
router.patch('/:id', protect, isAdmin, updateCoupon);
router.delete('/:id', protect, isAdmin, deleteCoupon);

export default router;
