import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import isAdmin from '../middlewares/admin.middleware.js';
import {
    getOverview,
    getRevenueChart,
    getTopProducts,
    getTopCustomers,
} from '../controllers/adminStats.controller.js';

const router = Router();

router.use(protect, isAdmin);

router.get('/overview', getOverview);
router.get('/revenue', getRevenueChart);
router.get('/top-products', getTopProducts);
router.get('/top-customers', getTopCustomers);

export default router;
