import User from '../models/User.js';
import Order from '../models/Order.js';

// Chuẩn bị dữ liệu cho thuật toán K-Means phân cụm khách hàng
// Dựa trên RFM: Recency, Frequency, Monetary
export const getSegmentationData = async() => {
    const users = await User.find({ role: 'user' }).select('_id name email stats');

    const now = new Date();

    const data = users.map((user) => {
        const { totalSpent, orderCount, lastOrderAt } = user.stats;

        // Recency: số ngày kể từ lần mua cuối (càng nhỏ càng tốt)
        const recency = lastOrderAt ?
            Math.floor((now - new Date(lastOrderAt)) / (1000 * 60 * 60 * 24)) :
            999;

        // Frequency: số đơn hàng
        const frequency = orderCount || 0;

        // Monetary: tổng chi tiêu
        const monetary = totalSpent || 0;

        // Phân cụm đơn giản dựa trên ngưỡng (mock K-Means)
        let segment = 'cold'; // Ít mua, lâu rồi không mua
        if (frequency >= 5 && monetary >= 5000000) {
            segment = 'vip'; // Khách VIP
        } else if (frequency >= 2 && recency <= 30) {
            segment = 'loyal'; // Khách trung thành
        } else if (recency <= 7) {
            segment = 'new'; // Khách mới
        } else if (recency <= 60) {
            segment = 'at_risk'; // Có nguy cơ rời bỏ
        }

        return {
            userId: user._id,
            name: user.name,
            email: user.email,
            recency,
            frequency,
            monetary,
            segment,
        };
    });

    // Thống kê theo segment
    const summary = data.reduce((acc, user) => {
        acc[user.segment] = (acc[user.segment] || 0) + 1;
        return acc;
    }, {});

    return { data, summary, total: data.length };
};