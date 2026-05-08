import catchAsync from '../utils/catchAsync.js';
import { ApiResponse, ApiError } from '../utils/apiResponse.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';

// GET /api/v1/products
export const getProducts = catchAsync(async(req, res) => {
    const { page = 1, limit = 12, category, brand, minPrice, maxPrice, search, sort } = req.query;

    const filter = { isActive: true };
    if (category) filter.category = category;
    if (brand) filter.brand = brand;
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
        .skip((page - 1) * limit)
        .limit(Number(limit));

    const total = await Product.countDocuments(filter);

    res.status(200).json(
        new ApiResponse(200, {
            products,
            pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) },
        }, 'Lấy danh sách sản phẩm thành công')
    );
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
// PUT /api/v1/products/:id (Admin)
export const updateProduct = catchAsync(async(req, res) => {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });
    if (!product) throw new ApiError(404, 'Không tìm thấy sản phẩm');
    res.status(200).json(new ApiResponse(200, product, 'Cập nhật sản phẩm thành công'));
});

// DELETE /api/v1/products/:id (Admin)
export const deleteProduct = catchAsync(async(req, res) => {
    const product = await Product.findByIdAndUpdate(
        req.params.id, { isActive: false }, { new: true }
    );
    if (!product) throw new ApiError(404, 'Không tìm thấy sản phẩm');
    res.status(200).json(new ApiResponse(200, null, 'Xóa sản phẩm thành công'));
});