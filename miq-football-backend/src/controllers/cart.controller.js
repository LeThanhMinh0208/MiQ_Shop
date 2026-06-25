import catchAsync from '../utils/catchAsync.js';
import { ApiResponse, ApiError } from '../utils/apiResponse.js';
import Product from '../models/Product.js';

// POST /api/v1/cart/validate
// Pre-flight stock check before checkout. Returns availability per line item.
// This is the user-friendly warning layer — the hard atomicity guarantee is in
// createOrder (Phase-2 atomic findOneAndUpdate stock decrement).
export const validateCart = catchAsync(async (req, res) => {
    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
        throw new ApiError(400, 'items là bắt buộc');
    }
    if (items.length > 50) {
        throw new ApiError(400, 'Giỏ hàng không được vượt quá 50 sản phẩm');
    }

    const productIds = [...new Set(items.map((i) => i.product))];
    const products   = await Product.find({ _id: { $in: productIds }, isActive: true })
        .select('name variants')
        .lean();

    const byId = new Map(products.map((p) => [p._id.toString(), p]));

    const result = items.map(({ product, size, quantity }) => {
        const p = byId.get(product?.toString());
        if (!p) {
            return { product, size, quantity, ok: false, reason: 'Sản phẩm không tồn tại hoặc đã ngừng bán' };
        }
        const variant = p.variants.find((v) => v.size === size);
        if (!variant) {
            return { product, size, quantity, ok: false, reason: `Size ${size} không còn` };
        }
        if (variant.stock < quantity) {
            return {
                product, size, quantity, ok: false,
                available: variant.stock,
                reason: variant.stock === 0
                    ? `${p.name} (${size}) đã hết hàng`
                    : `${p.name} (${size}) chỉ còn ${variant.stock} sản phẩm`,
            };
        }
        return { product, size, quantity, ok: true, available: variant.stock };
    });

    res.status(200).json(
        new ApiResponse(200, { allOk: result.every((r) => r.ok), items: result }, 'Kiểm tra giỏ hàng'),
    );
});
