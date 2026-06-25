import catchAsync from '../utils/catchAsync.js';
import { ApiResponse } from '../utils/apiResponse.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import stripe from '../config/stripe.js';
import { logger } from '../utils/logger.js';

const CUTOFF_MINUTES = 15;

/**
 * Core reconciliation logic — called by the HTTP endpoint AND by the
 * in-process timer in server.js.  Separated so the timer can invoke it
 * directly without constructing fake req/res objects.
 *
 * Returns { checked, results } — same shape the HTTP endpoint sends.
 */
export async function runReconcile() {
    const cutoff = new Date(Date.now() - CUTOFF_MINUTES * 60 * 1000);

    const stale = await Order.find({
        'payment.method': 'stripe',
        'payment.isPaid': false,
        'payment.stripePaymentIntentId': { $exists: true, $ne: null },
        createdAt: { $lte: cutoff },
    }).select('_id user totalPrice payment').lean();

    const results = [];

    for (const order of stale) {
        try {
            const pi = await stripe.paymentIntents.retrieve(order.payment.stripePaymentIntentId);

            if (pi.status !== 'succeeded') {
                results.push({ orderId: order._id, action: 'skipped', piStatus: pi.status });
                continue;
            }

            // Atomic guard — idempotent if webhook already ran
            const updated = await Order.findOneAndUpdate(
                { _id: order._id, 'payment.isPaid': false },
                {
                    $set: {
                        'payment.isPaid': true,
                        'payment.paidAt': new Date(),
                        'payment.stripeEventId': `reconcile:${pi.id}`,
                        status: 'confirmed',
                    },
                    $push: {
                        statusHistory: {
                            status: 'confirmed',
                            note: 'Xác nhận thanh toán qua reconcile',
                            updatedAt: new Date(),
                        },
                    },
                },
                { returnDocument: 'before' }
            );

            if (!updated) {
                results.push({ orderId: order._id, action: 'already_paid_no_op' });
                continue;
            }

            await User.findByIdAndUpdate(order.user, {
                $inc: { 'stats.totalSpent': order.totalPrice, 'stats.orderCount': 1 },
                $set:  { 'stats.lastOrderAt': new Date() },
            });

            logger.info({ orderId: order._id, piId: pi.id }, 'Reconcile: marked order paid');
            results.push({ orderId: order._id, action: 'marked_paid' });
        } catch (err) {
            logger.error({ orderId: order._id, err: { message: err.message } }, 'Reconcile: error processing order');
            results.push({ orderId: order._id, action: 'error', error: err.message });
        }
    }

    logger.info({ checked: stale.length, results }, 'Reconcile pending orders complete');
    return { checked: stale.length, results };
}

/**
 * POST /api/v1/admin/orders/reconcile-pending  (admin only)
 *
 * HTTP wrapper around runReconcile(). Also useful as a manual trigger
 * from an admin dashboard or ops playbook.
 */
export const reconcilePending = catchAsync(async (req, res) => {
    const data = await runReconcile();
    res.status(200).json(new ApiResponse(200, data, 'Reconcile hoàn tất'));
});
