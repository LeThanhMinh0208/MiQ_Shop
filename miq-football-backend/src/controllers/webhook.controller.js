import stripe from '../config/stripe.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import { sendOrderConfirmation } from '../utils/emailService.js';
import { logger } from '../utils/logger.js';

/**
 * POST /api/v1/stripe/webhook
 *
 * Mounted with express.raw({ type: 'application/json' }) — raw body required
 * for Stripe signature verification.
 *
 * Returns 200 for every valid event (including already-processed ones) so
 * Stripe stops retrying. Returns 400 only for signature failures (bad secret).
 * Returns 5xx for transient server errors so Stripe retries later.
 */
export const stripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];

    // ── Signature verification ────────────────────────────────────────────────
    let event;
    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        logger.warn({ err: { message: err.message } }, '[Webhook] Signature verification failed');
        return res.status(400).json({ error: `Webhook error: ${err.message}` });
    }

    // ── Event dispatch ────────────────────────────────────────────────────────
    try {
        if (event.type === 'payment_intent.succeeded') {
            await handlePaymentIntentSucceeded(event);
        }
        // Additional event types can be handled here (e.g. payment_intent.payment_failed)
    } catch (err) {
        logger.error({ err: { message: err.message, stack: err.stack }, eventType: event.type }, '[Webhook] Handler error');
        // 500 → Stripe retries; useful for transient DB failures
        return res.status(500).json({ error: 'Internal error' });
    }

    // Always 200 for events we processed (or intentionally ignored)
    res.json({ received: true });
};

// ─────────────────────────────────────────────────────────────────────────────

async function handlePaymentIntentSucceeded(event) {
    const pi = event.data.object;
    const orderId = pi.metadata?.orderId;

    if (!orderId) {
        logger.warn({ piId: pi.id }, '[Webhook] payment_intent.succeeded with no orderId in metadata');
        return;
    }

    // Atomic guard: only flip isPaid when it is currently false AND the PI matches.
    // This makes the handler idempotent — replaying the same event is a no-op.
    const order = await Order.findOneAndUpdate(
        {
            _id: orderId,
            'payment.isPaid': false,
            'payment.stripePaymentIntentId': pi.id,
        },
        {
            $set: {
                'payment.isPaid': true,
                'payment.paidAt': new Date(),
                'payment.stripeEventId': event.id,
                status: 'confirmed',
            },
            $push: {
                statusHistory: {
                    status: 'confirmed',
                    note: 'Thanh toán Stripe thành công',
                    updatedAt: new Date(),
                },
            },
        },
        { returnDocument: 'before' }  // pre-update doc
    );

    // null → order not found OR already paid → idempotent no-op, skip side effects
    if (!order) return;

    // Side effects run exactly once (guarded by the atomic update above)
    await User.findByIdAndUpdate(order.user, {
        $inc: { 'stats.totalSpent': order.totalPrice, 'stats.orderCount': 1 },
        $set:  { 'stats.lastOrderAt': new Date() },
    });

    const customer = await User.findById(order.user).select('name email').lean();
    if (customer?.email) {
        sendOrderConfirmation(order, customer).catch((err) =>
            logger.error({ err: { message: err.message }, orderId: order._id }, '[Webhook] Confirmation email failed')
        );
    }
}
