import { Router } from 'express';
import {
    getProducts,
    getProduct,
    getNewArrivals,
    getFlashSale,
    createProduct,
    updateProduct,
    deleteProduct,
    checkCanReview,
    addReview,
    deleteReview,
} from '../controllers/product.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import isAdmin from '../middlewares/admin.middleware.js';
import { uploadProductImages } from '../middlewares/upload.middleware.js';

const router = Router();

router.get('/', getProducts);
router.get('/new-arrivals', getNewArrivals);  // must be before /:id
router.get('/flash-sale',   getFlashSale);   // must be before /:id
router.get('/:id', getProduct);
router.post('/', protect, isAdmin, ...uploadProductImages.array('images', 5), createProduct);

// Reviews
router.get('/:id/can-review', protect, checkCanReview);
router.post('/:id/reviews', protect, addReview);
router.delete('/:id/reviews/:reviewId', protect, deleteReview);
router.put('/:id', protect, isAdmin, ...uploadProductImages.array('images', 5), updateProduct);
router.delete('/:id', protect, isAdmin, deleteProduct);

export default router;