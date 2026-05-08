import Order from '../models/Order.js';
import Product from '../models/Product.js';

// Giả lập thuật toán Apriori - tìm sản phẩm thường mua cùng nhau
export const getFrequentlyBoughtTogether = async(productId) => {
    // Tìm tất cả đơn hàng có chứa sản phẩm này
    const orders = await Order.find({
        'items.product': productId,
        status: { $in: ['delivered', 'confirmed'] },
    });

    if (orders.length === 0) return [];

    // Đếm tần suất xuất hiện của các sản phẩm khác trong cùng đơn hàng
    const frequencyMap = {};
    orders.forEach((order) => {
        order.items.forEach((item) => {
            const id = item.product.toString();
            if (id !== productId.toString()) {
                frequencyMap[id] = (frequencyMap[id] || 0) + 1;
            }
        });
    });

    // Sắp xếp theo tần suất giảm dần, lấy top 4
    const sortedIds = Object.entries(frequencyMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([id]) => id);

    if (sortedIds.length === 0) return [];

    const products = await Product.find({
        _id: { $in: sortedIds },
        isActive: true,
    }).select('name price salePrice images brand ratings');

    return products;
};

// Gợi ý dựa trên cùng danh mục + tags tương tự
export const getSimilarProducts = async(productId) => {
    const product = await Product.findById(productId);
    if (!product) return [];

    const similar = await Product.find({
            _id: { $ne: productId },
            isActive: true,
            $or: [
                { category: product.category },
                { tags: { $in: product.tags } },
                { brand: product.brand },
            ],
        })
        .select('name price salePrice images brand ratings category')
        .limit(8);

    return similar;
};