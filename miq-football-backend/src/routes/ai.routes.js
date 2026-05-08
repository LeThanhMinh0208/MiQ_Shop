import { Router } from 'express';
import {
    getBoughtTogether,
    getSimilar,
    getSegmentation,
} from '../controllers/ai.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import isAdmin from '../middlewares/admin.middleware.js';

const router = Router();

router.get('/recommendations/:productId/bought-together', getBoughtTogether);
router.get('/recommendations/:productId/similar', getSimilar);
router.get('/segmentation', protect, isAdmin, getSegmentation);

export default router;