import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import isAdmin from '../middlewares/admin.middleware.js';
import { createPrintOrder, getMyPrintOrders, getAllPrintOrders, updatePrintOrderStatus } from '../controllers/printOrder.controller.js';

const router = Router();

router.post('/', protect, createPrintOrder);
router.get('/my', protect, getMyPrintOrders);
router.get('/', protect, isAdmin, getAllPrintOrders);
router.patch('/:id/status', protect, isAdmin, updatePrintOrderStatus);

export default router;
