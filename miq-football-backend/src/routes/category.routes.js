import { Router } from 'express';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import catchAsync from '../utils/catchAsync.js';
import { ApiResponse, ApiError } from '../utils/apiResponse.js';
import { protect } from '../middlewares/auth.middleware.js';
import isAdmin from '../middlewares/admin.middleware.js';
import { uploadCategoryImage } from '../middlewares/upload.middleware.js';

const router = Router();

// GET /api/v1/categories
router.get('/', catchAsync(async (req, res) => {
    const matchFilter = req.query.showAll === 'true' ? {} : { isActive: true };
    const categories = await Category.aggregate([
        { $match: matchFilter },
        { $sort: { displayOrder: 1, name: 1 } },
        {
            $lookup: {
                from: 'products',
                let: { catId: '$_id' },
                pipeline: [
                    { $match: { $expr: { $and: [
                        { $eq: ['$category', '$$catId'] },
                        { $eq: ['$isActive', true] }
                    ]}}}
                ],
                as: '_products',
            },
        },
        { $addFields: { productCount: { $size: '$_products' } } },
        { $project: { _products: 0 } },
    ]);
    res.status(200).json(new ApiResponse(200, categories, 'Lấy danh mục thành công'));
}));

// GET /api/v1/categories/:slug/featured?limit=6
router.get('/:slug/featured', catchAsync(async (req, res) => {
    const limit = Math.min(parseInt(req.query.limit) || 6, 12);
    const category = await Category.findOne({ slug: req.params.slug, isActive: true });
    if (!category) throw new ApiError(404, 'Không tìm thấy danh mục');
    const products = await Product.find({ category: category._id, isActive: true })
        .populate('category', 'name slug')
        .sort({ 'ratings.count': -1, 'ratings.average': -1 })
        .limit(limit)
        .lean();
    res.status(200).json(new ApiResponse(200, products, 'Sản phẩm nổi bật'));
}));

// POST /api/v1/categories (Admin)
router.post('/', protect, isAdmin, ...uploadCategoryImage.single('image'), catchAsync(async (req, res) => {
    const body = { ...req.body };
    if (req.file) {
        body.image = { url: req.file.path, publicId: req.file.filename };
    }
    if (!body.parent || body.parent === '') body.parent = null;
    const category = await Category.create(body);
    res.status(201).json(new ApiResponse(201, category, 'Tạo danh mục thành công'));
}));

// PUT /api/v1/categories/:id (Admin)
router.put('/:id', protect, isAdmin, ...uploadCategoryImage.single('image'), catchAsync(async (req, res) => {
    const updates = { ...req.body };
    if (req.file) {
        updates.image = { url: req.file.path, publicId: req.file.filename };
    }
    if (updates.parent === '') updates.parent = null;
    const category = await Category.findByIdAndUpdate(req.params.id, updates, {
        returnDocument: 'after',
        runValidators: true,
    });
    if (!category) throw new ApiError(404, 'Không tìm thấy danh mục');
    res.status(200).json(new ApiResponse(200, category, 'Cập nhật danh mục thành công'));
}));

// DELETE /api/v1/categories/:id (Admin - soft delete)
router.delete('/:id', protect, isAdmin, catchAsync(async (req, res) => {
    const category = await Category.findByIdAndUpdate(
        req.params.id,
        { isActive: false },
        { returnDocument: 'after' }
    );
    if (!category) throw new ApiError(404, 'Không tìm thấy danh mục');
    res.status(200).json(new ApiResponse(200, null, 'Đã ẩn danh mục'));
}));

// PATCH /api/v1/categories/:id/restore (Admin - restore soft deleted)
router.patch('/:id/restore', protect, isAdmin, catchAsync(async (req, res) => {
    const category = await Category.findByIdAndUpdate(
        req.params.id,
        { isActive: true },
        { returnDocument: 'after' }
    );
    if (!category) throw new ApiError(404, 'Không tìm thấy danh mục');
    res.status(200).json(new ApiResponse(200, category, 'Đã khôi phục danh mục'));
}));

export default router;
