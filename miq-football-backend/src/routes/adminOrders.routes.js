import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import isAdmin from '../middlewares/admin.middleware.js';
import { reconcilePending } from '../controllers/adminOrders.controller.js';

const router = Router();

router.use(protect, isAdmin);

router.post('/reconcile-pending', reconcilePending);

export default router;
