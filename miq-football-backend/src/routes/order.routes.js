import { Router } from 'express';
import {
    createOrder,
    createPaymentIntent,
    markOrderPaid,
    getMyOrders,
    getAllOrders,
    updateOrderStatus,
} from '../controllers/order.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import isAdmin from '../middlewares/admin.middleware.js';

const router = Router();

router.use(protect); // Tất cả order routes đều cần đăng nhập

router.post('/', createOrder);
router.get('/my-orders', getMyOrders);
router.post('/:id/payment-intent', createPaymentIntent);
router.put('/:id/pay', markOrderPaid);

// Admin only
router.get('/', isAdmin, getAllOrders);
router.put('/:id/status', isAdmin, updateOrderStatus);

export default router;