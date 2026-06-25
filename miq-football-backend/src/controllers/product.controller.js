import mongoose from 'mongoose';
import slugify from 'slugify';
import catchAsync from '../utils/catchAsync.js';
import { ApiResponse, ApiError } from '../utils/apiResponse.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Order from '../models/Order.js';

// GET /api/v1/products
export const getProducts = catchAsync(async(req, res) => {
    const { page, limit, category, brand, minPrice, maxPrice, search, sort, tag } = req.query;
    const safeLimit = Math.min(Math.max(1, parseInt(limit) || 12), 100);
    const safePage  = Math.max(1, parseInt(page) || 1);

    const filter = { isActive: true };

    if (category) {
        // Accept both ObjectId and slug/name strings
        if (mongoose.Types.ObjectId.isValid(category) && category.length === 24) {
            filter.category = new mongoose.Types.ObjectId(category);
        } else {
            // Lookup by slug (exact) or name (case-insensitive)
            const normalizedSlug = slugify(category, { lower: true, strict: true });
            const cat = await Category.findOne({
                $or: [
                    { slug: normalizedSlug },
                    { slug: category.toLowerCase() },
                    { name: { $regex: new RegExp(`^${category.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } },
                ],
                isActive: true,
            }).select('_id').lean();

            if (cat) {
                filter.category = cat._id;
            } else {
                // No matching category → return empty result set immediately
                return res.status(200).json(
                    new ApiResponse(200, {
                        products: [],
                        pagination: { page: 1, limit: safeLimit, total: 0, pages: 0 },
                    }, 'Không tìm thấy danh mục')
                );
            }
        }
    }

    if (brand) filter.brand = { $regex: new RegExp(`^${brand.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') };
    if (tag) filter.tags = { $in: [tag] };
    if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) filter.price.$gte = Number(minPrice);
        if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (search) filter.$text = { $search: search };

    const sortOptions = {
        newest: { createdAt: -1 },
        price_asc: { price: 1 },
        price_desc: { price: -1 },
        rating: { 'ratings.average': -1 },
    };

    const products = await Product.find(filter)
        .populate('category', 'name slug')
        .sort(sortOptions[sort] || { createdAt: -1 })
        .skip((safePage - 1) * safeLimit)
        .limit(safeLimit);

    const total = await Product.countDocuments(filter);

    res.status(200).json(
        new ApiResponse(200, {
            products,
            pagination: { page: safePage, limit: safeLimit, total, pages: Math.ceil(total / safeLimit) },
        }, 'Lấy danh sách sản phẩm thành công')
    );
});

// GET /api/v1/products/flash-sale?limit=8
export const getFlashSale = catchAsync(async(req, res) => {
    const limit = Math.min(parseInt(req.query.limit) || 8, 20);
    const now = new Date();

    // Priority: products with active flash sale not yet expired, then any product with salePrice
    const withFlash = await Product.find({
        isActive: true,
        'flashSale.active': true,
        'flashSale.endAt': { $gt: now },
    }).populate('category', 'name slug').sort({ createdAt: -1 }).limit(limit).lean();

    if (withFlash.length >= limit) {
        return res.status(200).json(new ApiResponse(200, withFlash, 'Flash sale products'));
    }

    // Fallback: any product with a salePrice, fill up to limit
    const idsAlready = withFlash.map((p) => p._id);
    const fallback = await Product.find({
        isActive: true,
        salePrice: { $ne: null, $exists: true },
        _id: { $nin: idsAlready },
    }).populate('category', 'name slug').sort({ createdAt: -1 }).limit(limit - withFlash.length).lean();

    res.status(200).json(new ApiResponse(200, [...withFlash, ...fallback], 'Flash sale products'));
});

// GET /api/v1/products/new-arrivals?limit=5
export const getNewArrivals = catchAsync(async(req, res) => {
    const limit = Math.min(parseInt(req.query.limit) || 5, 10);
    const products = await Product.find({ isActive: true })
        .populate('category', 'name slug')
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();
    res.status(200).json(new ApiResponse(200, products, 'Sản phẩm mới nhất'));
});

// GET /api/v1/products/:id
export const getProduct = catchAsync(async(req, res) => {
    const product = await Product.findById(req.params.id).populate('category', 'name slug');
    if (!product) throw new ApiError(404, 'Không tìm thấy sản phẩm');
    res.status(200).json(new ApiResponse(200, product, 'Lấy sản phẩm thành công'));
});

// POST /api/v1/products (Admin)
export const createProduct = catchAsync(async(req, res) => {
    const body = {...req.body };

    // Parse các field JSON từ FormData (vì FormData chỉ truyền được string)
    if (typeof body.variants === 'string') {
        body.variants = JSON.parse(body.variants);
    }
    if (typeof body.tags === 'string') {
        body.tags = JSON.parse(body.tags);
    }
    if (typeof body.features === 'string') {
        body.features = JSON.parse(body.features);
    }

    // Xử lý ảnh upload từ Cloudinary (req.files có sẵn từ multer)
    if (req.files && req.files.length > 0) {
        body.images = req.files.map((file) => ({
            url: file.path, // Cloudinary URL
            publicId: file.filename, // Cloudinary public_id
            alt: body.name || '',
        }));
    }

    const product = await Product.create(body);
    res.status(201).json(new ApiResponse(201, product, 'Tạo sản phẩm thành công'));
});
// Updatable fields for products. Computed/protected fields (slug, ratings,
// reviews, _id) are deliberately absent — slug is re-derived by the pre-save
// hook when name changes; ratings are managed via the review endpoints.
const PRODUCT_ALLOWED = new Set([
    'name', 'description', 'brand', 'category', 'price', 'salePrice',
    'variants', 'tags', 'sport', 'features', 'isFeatured', 'isActive', 'accentColor',
]);

// PUT /api/v1/products/:id (Admin)
// Uses load-then-save so the pre('save') slug hook fires when name changes.
// Only whitelisted fields are written — never Object.assign(product, req.body).
export const updateProduct = catchAsync(async(req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) throw new ApiError(404, 'Không tìm thấy sản phẩm');

    const body = { ...req.body };
    if (typeof body.variants === 'string') body.variants = JSON.parse(body.variants);
    if (typeof body.tags    === 'string') body.tags     = JSON.parse(body.tags);
    if (typeof body.features === 'string') body.features = JSON.parse(body.features);

    // Whitelist: only copy permitted fields from request body
    for (const field of PRODUCT_ALLOWED) {
        if (body[field] !== undefined) product[field] = body[field];
    }

    // flashSale is handled separately to strip the auto-managed soldCount
    if (body.flashSale !== undefined) {
        const { soldCount: _ignored, ...safeSale } = body.flashSale;
        product.flashSale = { ...product.flashSale.toObject?.() ?? product.flashSale, ...safeSale };
    }

    if (req.files && req.files.length > 0) {
        product.images = req.files.map((file) => ({
            url:      file.path,
            publicId: file.filename,
            alt:      body.name || product.name || '',
        }));
    }

    await product.save(); // triggers pre-save slug hook if name changed
    res.status(200).json(new ApiResponse(200, product, 'Cập nhật sản phẩm thành công'));
});

// GET /api/v1/products/:id/can-review (Auth)
export const checkCanReview = catchAsync(async(req, res) => {
    const productId = req.params.id;

    const deliveredOrder = await Order.findOne({
        user: req.user._id,
        status: 'delivered',
        'items.product': productId,
    });

    const product = await Product.findById(productId).select('reviews');
    if (!product) throw new ApiError(404, 'Không tìm thấy sản phẩm');

    const myReview = product.reviews.find(
        (r) => r.user.toString() === req.user._id.toString()
    ) || null;

    res.status(200).json(new ApiResponse(200, {
        canReview: !!deliveredOrder,
        myReview,
    }, 'OK'));
});

// POST /api/v1/products/:id/reviews (Auth)
export const addReview = catchAsync(async(req, res) => {
    const { rating, comment, images } = req.body;

    if (!rating || rating < 1 || rating > 5)
        throw new ApiError(400, 'Rating phải từ 1 đến 5');
    if (!comment || comment.trim().length < 10)
        throw new ApiError(400, 'Bình luận cần ít nhất 10 ký tự');

    const reviewImages = Array.isArray(images) ? images.slice(0, 3) : [];

    const deliveredOrder = await Order.findOne({
        user: req.user._id,
        status: 'delivered',
        'items.product': req.params.id,
    });
    if (!deliveredOrder)
        throw new ApiError(403, 'Bạn cần mua và nhận sản phẩm này (đơn "Đã giao") mới có thể đánh giá');

    const product = await Product.findById(req.params.id);
    if (!product) throw new ApiError(404, 'Không tìm thấy sản phẩm');

    const existingIdx = product.reviews.findIndex(
        (r) => r.user.toString() === req.user._id.toString()
    );

    if (existingIdx >= 0) {
        product.reviews[existingIdx].rating = rating;
        product.reviews[existingIdx].comment = comment.trim();
        if (reviewImages.length > 0) product.reviews[existingIdx].images = reviewImages;
    } else {
        product.reviews.push({
            user:   req.user._id,
            name:   req.user.name,
            avatar: req.user.avatar?.url || '',
            rating,
            comment: comment.trim(),
            images: reviewImages,
            verifiedPurchase: true,
        });
    }

    product.updateRatings();
    await product.save();

    const savedReview = existingIdx >= 0
        ? product.reviews[existingIdx]
        : product.reviews[product.reviews.length - 1];

    res.status(200).json(new ApiResponse(200, {
        review: savedReview,
        ratings: product.ratings,
    }, existingIdx >= 0 ? 'Cập nhật đánh giá thành công' : 'Đánh giá thành công'));
});

// DELETE /api/v1/products/:id/reviews/:reviewId (Auth)
export const deleteReview = catchAsync(async(req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) throw new ApiError(404, 'Không tìm thấy sản phẩm');

    const review = product.reviews.id(req.params.reviewId);
    if (!review) throw new ApiError(404, 'Không tìm thấy đánh giá');

    if (
        review.user.toString() !== req.user._id.toString() &&
        req.user.role !== 'admin'
    ) throw new ApiError(403, 'Bạn không có quyền xóa đánh giá này');

    product.reviews.pull(req.params.reviewId);
    product.updateRatings();
    await product.save();

    res.status(200).json(new ApiResponse(200, { ratings: product.ratings }, 'Đã xóa đánh giá'));
});

// DELETE /api/v1/products/:id (Admin)
export const deleteProduct = catchAsync(async(req, res) => {
    const product = await Product.findByIdAndUpdate(
        req.params.id, { isActive: false }, { returnDocument: 'after' }
    );
    if (!product) throw new ApiError(404, 'Không tìm thấy sản phẩm');
    res.status(200).json(new ApiResponse(200, null, 'Xóa sản phẩm thành công'));
});