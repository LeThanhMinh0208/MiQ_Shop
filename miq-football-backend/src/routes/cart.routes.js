import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import { validateCart } from '../controllers/cart.controller.js';

const router = Router();

// POST /api/v1/cart/validate — pre-flight stock check for checkout
router.post('/validate', protect, validateCart);

export default router;
