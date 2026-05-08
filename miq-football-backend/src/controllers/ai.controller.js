import catchAsync from '../utils/catchAsync.js';
import { ApiResponse, ApiError } from '../utils/apiResponse.js';
import {
    getFrequentlyBoughtTogether,
    getSimilarProducts,
} from '../services/recommendation.service.js';
import { getSegmentationData } from '../services/segmentation.service.js';

// GET /api/v1/ai/recommendations/:productId/bought-together
export const getBoughtTogether = catchAsync(async(req, res) => {
    const { productId } = req.params;
    const products = await getFrequentlyBoughtTogether(productId);
    res.status(200).json(new ApiResponse(200, products, 'Gợi ý sản phẩm thường mua cùng'));
});

// GET /api/v1/ai/recommendations/:productId/similar
export const getSimilar = catchAsync(async(req, res) => {
    const { productId } = req.params;
    const products = await getSimilarProducts(productId);
    res.status(200).json(new ApiResponse(200, products, 'Sản phẩm tương tự'));
});

// GET /api/v1/ai/segmentation (Admin only)
export const getSegmentation = catchAsync(async(req, res) => {
    const result = await getSegmentationData();
    res.status(200).json(new ApiResponse(200, result, 'Dữ liệu phân cụm khách hàng'));
});