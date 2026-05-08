import { Router } from 'express';
import Category from '../models/Category.js';
import catchAsync from '../utils/catchAsync.js';
import { ApiResponse } from '../utils/apiResponse.js';

const router = Router();

// GET /api/v1/categories
router.get('/', catchAsync(async(req, res) => {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    res.status(200).json(new ApiResponse(200, categories, 'Lấy danh mục thành công'));
}));

export default router;