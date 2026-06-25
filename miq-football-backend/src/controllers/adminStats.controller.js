import catchAsync from '../utils/catchAsync.js';
import { ApiResponse } from '../utils/apiResponse.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

// Paid-order match expression — reused across all pipelines
const PAID_MATCH = { $or: [{ 'payment.isPaid': true }, { status: 'delivered' }] };

// GET /api/v1/admin/stats/overview
// Single $facet aggregation — O(1) memory regardless of order count.
// Previously: three Order.find().lean() calls that loaded every document into RAM.
export const getOverview = catchAsync(async (req, res) => {
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth   = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    const [[result], totalProducts, totalUsers] = await Promise.all([
        Order.aggregate([
            {
                $facet: {
                    // All-time paid revenue
                    totalRevenue: [
                        { $match: PAID_MATCH },
                        { $group: { _id: null, v: { $sum: '$totalPrice' } } },
                    ],
                    // This month's paid revenue
                    thisMonthRevenue: [
                        { $match: { createdAt: { $gte: startOfThisMonth }, ...PAID_MATCH } },
                        { $group: { _id: null, v: { $sum: '$totalPrice' } } },
                    ],
                    // Last month's paid revenue
                    lastMonthRevenue: [
                        { $match: { createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }, ...PAID_MATCH } },
                        { $group: { _id: null, v: { $sum: '$totalPrice' } } },
                    ],
                    // All-time order count
                    totalOrders: [{ $count: 'n' }],
                    // This month's order count
                    thisMonthOrders: [
                        { $match: { createdAt: { $gte: startOfThisMonth } } },
                        { $count: 'n' },
                    ],
                    // Per-status breakdown
                    statusCounts: [
                        { $group: { _id: '$status', n: { $sum: 1 } } },
                    ],
                    // Per-payment-method breakdown
                    paymentCounts: [
                        { $group: { _id: '$payment.method', n: { $sum: 1 } } },
                    ],
                },
            },
        ]),
        Product.countDocuments({ isActive: true }),
        User.countDocuments({ role: 'user' }),
    ]);

    const totalRevenue      = result.totalRevenue[0]?.v      ?? 0;
    const thisMonthRevenue  = result.thisMonthRevenue[0]?.v  ?? 0;
    const lastMonthRevenue  = result.lastMonthRevenue[0]?.v  ?? 0;
    const totalOrders       = result.totalOrders[0]?.n       ?? 0;
    const thisMonthOrders   = result.thisMonthOrders[0]?.n   ?? 0;
    const statusCounts      = Object.fromEntries(result.statusCounts.map((s) => [s._id, s.n]));
    const paymentCounts     = Object.fromEntries(result.paymentCounts.map((p) => [p._id ?? 'cod', p.n]));

    const revenueChange = lastMonthRevenue === 0
        ? (thisMonthRevenue > 0 ? 100 : 0)
        : Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 1000) / 10;

    res.status(200).json(new ApiResponse(200, {
        totalProducts,
        totalUsers,
        totalOrders,
        totalRevenue,
        thisMonthRevenue,
        lastMonthRevenue,
        revenueChange,
        thisMonthOrders,
        statusCounts,
        paymentCounts,
    }, 'OK'));
});

// GET /api/v1/admin/stats/revenue?days=30
// Aggregates daily revenue server-side; no documents touch Node.js RAM.
export const getRevenueChart = catchAsync(async (req, res) => {
    const days = Math.min(parseInt(req.query.days) || 30, 90);

    const since = new Date();
    since.setDate(since.getDate() - days + 1);
    since.setHours(0, 0, 0, 0);

    const raw = await Order.aggregate([
        { $match: { createdAt: { $gte: since } } },
        {
            $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                orders: { $sum: 1 },
                revenue: {
                    $sum: {
                        $cond: [
                            { $or: [
                                { $eq: ['$payment.isPaid', true] },
                                { $eq: ['$status', 'delivered'] },
                            ]},
                            '$totalPrice',
                            0,
                        ],
                    },
                },
            },
        },
        { $sort: { _id: 1 } },
    ]);

    // Merge sparse DB results into a dense day-keyed map so the chart always
    // has a data point for every day even when there are no orders.
    const map = {};
    for (let i = 0; i < days; i++) {
        const d = new Date(since);
        d.setDate(d.getDate() + i);
        const key = d.toISOString().slice(0, 10);
        map[key] = { date: key, revenue: 0, orders: 0 };
    }
    for (const row of raw) {
        if (map[row._id]) {
            map[row._id].revenue = row.revenue;
            map[row._id].orders  = row.orders;
        }
    }

    res.status(200).json(new ApiResponse(200, Object.values(map), 'OK'));
});

// GET /api/v1/admin/stats/top-products
// $unwind + $group pushes the aggregation into MongoDB; zero order documents
// are deserialized in Node.js (previously all matching orders were loaded).
export const getTopProducts = catchAsync(async (req, res) => {
    const top = await Order.aggregate([
        { $match: { status: { $in: ['delivered', 'shipping', 'confirmed'] } } },
        { $unwind: '$items' },
        {
            $group: {
                _id:      '$items.product',
                name:     { $first: '$items.name' },
                image:    { $first: '$items.image' },
                quantity: { $sum:   '$items.quantity' },
                revenue:  { $sum:   { $multiply: ['$items.price', '$items.quantity'] } },
            },
        },
        { $sort:    { quantity: -1 } },
        { $limit:   5 },
        { $project: { _id: 1, name: 1, image: 1, quantity: 1, revenue: 1 } },
    ]);

    res.status(200).json(new ApiResponse(200, top, 'OK'));
});

// GET /api/v1/admin/stats/top-customers
// Already efficient (query + sort on indexed stats.totalSpent, limit 5).
export const getTopCustomers = catchAsync(async (req, res) => {
    const users = await User.find({ role: 'user' })
        .sort({ 'stats.totalSpent': -1 })
        .limit(5)
        .select('name email avatar stats createdAt')
        .lean();

    res.status(200).json(new ApiResponse(200, users, 'OK'));
});
