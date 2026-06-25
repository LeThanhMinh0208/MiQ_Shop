import { Router } from 'express';
import authRoutes from './auth.routes.js';
import productRoutes from './product.routes.js';
import orderRoutes from './order.routes.js';
import cartRoutes from './cart.routes.js';
import aiRoutes from './ai.routes.js';
import categoryRoutes from './category.routes.js';
import couponRoutes from './coupon.routes.js';
import printOrderRoutes from './printOrder.routes.js';
import siteAssetRoutes from './siteAsset.routes.js';
import adminStatsRoutes from './adminStats.routes.js';
import adminOrdersRoutes from './adminOrders.routes.js';
import notificationRoutes from './notification.routes.js';
import chatRoutes from './chat.routes.js';
import addressRoutes from './address.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/address', addressRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/cart', cartRoutes);
router.use('/ai', aiRoutes);
router.use('/categories', categoryRoutes);
router.use('/coupons', couponRoutes);
router.use('/print-orders', printOrderRoutes);
router.use('/site-assets', siteAssetRoutes);
router.use('/admin/stats', adminStatsRoutes);
router.use('/admin/orders', adminOrdersRoutes);
router.use('/notifications', notificationRoutes);
router.use('/chat', chatRoutes);

export default router;