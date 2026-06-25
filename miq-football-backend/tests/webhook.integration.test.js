/**
 * Stripe webhook integration tests — real SDK signing
 *
 * Signature generation uses stripe.webhooks.generateTestHeaderString({ payload, secret })
 * so constructEvent in the controller verifies a genuinely Stripe-formatted signature,
 * NOT a hand-rolled HMAC that could mask a real-world algorithm mismatch.
 *
 * W1  Invalid signature → 400
 * W2  Missing stripe-signature header → 400
 * W3  payment_intent.succeeded → order marked paid, stripeEventId stored, user stats updated
 * W4  Duplicate delivery of same event → 200, stats NOT incremented twice (idempotency)
 * W5  Unknown orderId in metadata → 200 (graceful no-op)
 * W6  PI id mismatch → 200, order stays unpaid
 * W7  payment_intent.payment_failed → 200, order stays pending/unpaid (intentional no-op)
 *
 * R1  Cancel paid Stripe order → stripe.refunds.create called once, refundId stored
 * R2  Cancel already-cancelled order → 400, refunds.create NOT called again
 * R3  Cancel COD order → refunds.create NOT called
 *
 * RECON-1  runReconcile() finds stuck-pending order whose PI succeeded → marks paid, stats updated
 * RECON-2  Second runReconcile() run on same order → already_paid_no_op (atomic guard)
 * RECON-3  runReconcile() on order whose PI is still requires_action → skipped
 * RECON-4  Concurrent runReconcile() calls → exactly one marks paid (race-condition guard)
 */

process.env.JWT_SECRET            = 'test-secret-webhook';
process.env.STRIPE_SECRET_KEY     = 'sk_test_dummy_webhook';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_webhook_secret';
process.env.NODE_ENV              = 'test';
process.env.CLIENT_URL            = 'http://localhost:5173';

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const WEBHOOK_PATH   = '/api/v1/stripe/webhook';

let mongod, app;
let Order, User, stripeModule, stripeInstance;

// ── Stripe-SDK signature helper ───────────────────────────────────────────────
// Uses stripe.webhooks.generateTestHeaderString({ payload, secret }) — the same
// code path that constructEvent verifies. If the algorithm ever diverged from
// what Stripe's CDN signs with, these tests would fail.

function signPayload(payload, secret = WEBHOOK_SECRET) {
    const raw = typeof payload === 'string' ? payload : JSON.stringify(payload);
    const header = stripeInstance.webhooks.generateTestHeaderString({ payload: raw, secret });
    return { raw, header };
}

async function postWebhook(body, overrideHeader) {
    const raw = typeof body === 'string' ? body : JSON.stringify(body);
    const { header } = overrideHeader != null
        ? { header: overrideHeader }
        : signPayload(raw);
    return request(app)
        .post(WEBHOOK_PATH)
        .set('Content-Type', 'application/json')
        .set('stripe-signature', header)
        .send(raw);
}

function buildEvent(override = {}) {
    const piId = `pi_test_${crypto.randomUUID()}`;
    return {
        id:   `evt_test_${crypto.randomUUID()}`,
        type: 'payment_intent.succeeded',
        data: {
            object: {
                id:       piId,
                status:   'succeeded',
                metadata: {},
                ...override.data?.object,
            },
        },
        ...override,
    };
}

// ── Setup ──────────────────────────────────────────────────────────────────────

before(async () => {
    mongod = await MongoMemoryServer.create();
    process.env.MONGO_URI = mongod.getUri();
    await mongoose.connect(mongod.getUri());

    const mod = await import('../src/app.js');
    app = mod.default;

    Order        = (await import('../src/models/Order.js')).default;
    User         = (await import('../src/models/User.js')).default;
    stripeModule = await import('../src/config/stripe.js');
    stripeInstance = stripeModule.default;
});

after(async () => {
    await mongoose.disconnect();
    await mongod.stop();
});

// ── Fixture helpers ────────────────────────────────────────────────────────────

async function createUser() {
    const id = new mongoose.Types.ObjectId();
    await User.collection.insertOne({
        _id:      id,
        name:     'Webhook Tester',
        email:    `webhook-${id}@test.com`,
        password: 'hashed',
        role:     'user',
        stats:    { totalSpent: 0, orderCount: 0 },
    });
    return id;
}

async function createPendingOrder(userId, piId, { ageMinutes = 0 } = {}) {
    const id  = new mongoose.Types.ObjectId();
    const now = Date.now() - ageMinutes * 60 * 1000;
    await Order.collection.insertOne({
        _id:          id,
        user:         userId,
        items:        [],
        itemsPrice:   200000,
        shippingPrice: 0,
        totalPrice:   200000,
        shippingAddress: { fullName: 'T', phone: '09', street: 'S', district: 'D', city: 'C' },
        status:       'pending',
        payment: { method: 'stripe', stripePaymentIntentId: piId, isPaid: false },
        statusHistory: [],
        createdAt:    new Date(now),
        updatedAt:    new Date(now),
    });
    return id;
}

// ── W: Webhook tests ──────────────────────────────────────────────────────────

describe('Stripe webhook — real-SDK-signed events', () => {

    it('W1 — invalid signature returns 400', async () => {
        const body = JSON.stringify(buildEvent());
        // Sign with a different secret — constructEvent must reject it
        const { header: badHeader } = signPayload(body, 'whsec_wrong_secret_entirely');
        const res = await postWebhook(body, badHeader);
        assert.equal(res.status, 400, `body: ${JSON.stringify(res.body)}`);
        assert.ok(res.body.error, 'Error field must be present');
    });

    it('W2 — missing stripe-signature header returns 400', async () => {
        const res = await request(app)
            .post(WEBHOOK_PATH)
            .set('Content-Type', 'application/json')
            .send(JSON.stringify(buildEvent()));
        assert.equal(res.status, 400);
    });

    it('W3 — payment_intent.succeeded marks order paid, stores stripeEventId, updates user stats', async () => {
        const userId  = await createUser();
        const piId    = `pi_w3_${crypto.randomUUID()}`;
        const orderId = await createPendingOrder(userId, piId);

        const event = buildEvent({
            data: { object: { id: piId, status: 'succeeded', metadata: { orderId: orderId.toString() } } },
        });

        const res = await postWebhook(event);
        assert.equal(res.status, 200, `body: ${JSON.stringify(res.body)}`);
        assert.deepEqual(res.body, { received: true });

        const order = await Order.findById(orderId).lean();
        assert.equal(order.payment.isPaid, true, 'isPaid must be true');
        assert.equal(order.status, 'confirmed', 'status must be confirmed');
        assert.equal(order.payment.stripeEventId, event.id, 'stripeEventId must match event.id');
        assert.ok(order.payment.paidAt, 'paidAt must be set');
        assert.ok(order.statusHistory.some(h => h.status === 'confirmed'), 'statusHistory must contain confirmed');

        const user = await User.findById(userId).lean();
        assert.equal(user.stats.orderCount, 1, 'orderCount must be 1');
        assert.equal(user.stats.totalSpent, 200000, 'totalSpent must be 200000');
    });

    it('W4 — replaying the same event is idempotent (stats not double-counted)', async () => {
        const userId  = await createUser();
        const piId    = `pi_w4_${crypto.randomUUID()}`;
        const orderId = await createPendingOrder(userId, piId);

        const event = buildEvent({
            id:   `evt_w4_replay_${crypto.randomUUID()}`,
            data: { object: { id: piId, status: 'succeeded', metadata: { orderId: orderId.toString() } } },
        });

        const res1 = await postWebhook(event);
        assert.equal(res1.status, 200);

        // Second delivery (Stripe retry scenario)
        const res2 = await postWebhook(event);
        assert.equal(res2.status, 200, 'Retry must return 200 so Stripe stops retrying');

        const user = await User.findById(userId).lean();
        assert.equal(user.stats.orderCount, 1, `orderCount was ${user.stats.orderCount} — idempotency failed`);
        assert.equal(user.stats.totalSpent, 200000, `totalSpent was ${user.stats.totalSpent} — idempotency failed`);
    });

    it('W5 — unknown orderId in metadata returns 200 (graceful no-op)', async () => {
        const event = buildEvent({
            data: {
                object: {
                    id: `pi_w5_${crypto.randomUUID()}`,
                    status: 'succeeded',
                    metadata: { orderId: new mongoose.Types.ObjectId().toString() },
                },
            },
        });

        const res = await postWebhook(event);
        assert.equal(res.status, 200, `body: ${JSON.stringify(res.body)}`);
        assert.deepEqual(res.body, { received: true });
    });

    it('W6 — PI id mismatch leaves order unchanged', async () => {
        const userId  = await createUser();
        const piId    = `pi_real_${crypto.randomUUID()}`;
        const orderId = await createPendingOrder(userId, piId);

        const event = buildEvent({
            data: {
                object: {
                    id: `pi_different_${crypto.randomUUID()}`,
                    status: 'succeeded',
                    metadata: { orderId: orderId.toString() },
                },
            },
        });

        const res = await postWebhook(event);
        assert.equal(res.status, 200);

        const order = await Order.findById(orderId).lean();
        assert.equal(order.payment.isPaid, false, 'PI mismatch must not flip isPaid');
        assert.equal(order.status, 'pending');
    });

    it('W7 — payment_intent.payment_failed returns 200 and leaves order pending', async () => {
        // The controller has no handler for this event type — it falls through to the
        // final res.json({ received: true }). The order stays pending so the reconcile
        // loop can catch it later, and OrderPending.jsx shows the "Đã xảy ra lỗi
        // thanh toán — thử lại hoặc chọn phương thức khác" notice.
        const userId  = await createUser();
        const piId    = `pi_w7_${crypto.randomUUID()}`;
        const orderId = await createPendingOrder(userId, piId);

        const event = {
            id:   `evt_w7_${crypto.randomUUID()}`,
            type: 'payment_intent.payment_failed',
            data: {
                object: {
                    id:               piId,
                    status:           'requires_payment_method',
                    last_payment_error: { message: 'Your card was declined.' },
                    metadata:         { orderId: orderId.toString() },
                },
            },
        };

        const res = await postWebhook(event);
        assert.equal(res.status, 200, `body: ${JSON.stringify(res.body)}`);
        assert.deepEqual(res.body, { received: true });

        // Order must remain pending — no state change
        const order = await Order.findById(orderId).lean();
        assert.equal(order.payment.isPaid, false, 'Failed payment must not mark order paid');
        assert.equal(order.status, 'pending', 'Order must stay pending for retry');
    });

});

// ── RECON: Reconciliation tests ────────────────────────────────────────────────

describe('runReconcile() — webhook-miss safety net', () => {
    let runReconcile;

    before(async () => {
        ({ runReconcile } = await import('../src/controllers/adminOrders.controller.js'));
    });

    it('RECON-1 — finds stuck-pending order whose PI is succeeded → marks paid + updates stats', async () => {
        const userId  = await createUser();
        const piId    = `pi_recon1_${crypto.randomUUID()}`;
        // Age the order past the 15-minute cutoff
        const orderId = await createPendingOrder(userId, piId, { ageMinutes: 20 });

        // Patch stripe.paymentIntents.retrieve to return succeeded
        const origRetrieve = stripeInstance.paymentIntents.retrieve.bind(stripeInstance.paymentIntents);
        stripeInstance.paymentIntents.retrieve = async (id) => {
            if (id === piId) return { id, status: 'succeeded' };
            return origRetrieve(id);
        };

        try {
            const result = await runReconcile();

            assert.ok(result.checked >= 1, 'Must have checked at least 1 order');
            const entry = result.results.find(r => r.orderId.toString() === orderId.toString());
            assert.ok(entry, 'Order must appear in reconcile results');
            assert.equal(entry.action, 'marked_paid', `action was "${entry.action}"`);

            const order = await Order.findById(orderId).lean();
            assert.equal(order.payment.isPaid, true, 'isPaid must be true after reconcile');
            assert.equal(order.status, 'confirmed', 'status must be confirmed');
            assert.ok(order.payment.stripeEventId?.startsWith('reconcile:'), 'stripeEventId must have reconcile: prefix');

            const user = await User.findById(userId).lean();
            assert.equal(user.stats.orderCount, 1, 'orderCount must be incremented');
            assert.equal(user.stats.totalSpent, 200000, 'totalSpent must be incremented');
        } finally {
            stripeInstance.paymentIntents.retrieve = origRetrieve;
        }
    });

    it('RECON-2 — second runReconcile() on same order is a no-op (already_paid_no_op)', async () => {
        const userId  = await createUser();
        const piId    = `pi_recon2_${crypto.randomUUID()}`;
        const orderId = await createPendingOrder(userId, piId, { ageMinutes: 20 });

        const origRetrieve = stripeInstance.paymentIntents.retrieve.bind(stripeInstance.paymentIntents);
        stripeInstance.paymentIntents.retrieve = async (id) => {
            if (id === piId) return { id, status: 'succeeded' };
            return origRetrieve(id);
        };

        try {
            // First run marks it paid
            await runReconcile();

            // Order must now be paid — simulate a concurrent / duplicate run
            const result2 = await runReconcile();

            // This specific order must be 'already_paid_no_op' OR not appear (if the
            // first run flipped isPaid, the query filter 'payment.isPaid: false' won't
            // find it — checked count drops and orderId won't appear in results, which
            // is also correct idempotent behavior).
            const entry = result2.results.find(r => r.orderId.toString() === orderId.toString());
            if (entry) {
                assert.ok(
                    entry.action === 'already_paid_no_op' || entry.action === 'skipped',
                    `Expected no-op action, got "${entry.action}"`,
                );
            }
            // Either way, stats must NOT be incremented again
            const user = await User.findById(userId).lean();
            assert.equal(user.stats.orderCount, 1, `orderCount was ${user.stats.orderCount} — double-counted`);
        } finally {
            stripeInstance.paymentIntents.retrieve = origRetrieve;
        }
    });

    it('RECON-3 — order whose PI is still requires_action is skipped (not marked paid)', async () => {
        const userId  = await createUser();
        const piId    = `pi_recon3_${crypto.randomUUID()}`;
        const orderId = await createPendingOrder(userId, piId, { ageMinutes: 20 });

        const origRetrieve = stripeInstance.paymentIntents.retrieve.bind(stripeInstance.paymentIntents);
        stripeInstance.paymentIntents.retrieve = async (id) => {
            if (id === piId) return { id, status: 'requires_action' };
            return origRetrieve(id);
        };

        try {
            const result = await runReconcile();
            const entry  = result.results.find(r => r.orderId.toString() === orderId.toString());
            assert.ok(entry, 'Order must appear in reconcile results');
            assert.equal(entry.action, 'skipped', `Expected skipped, got "${entry.action}"`);

            const order = await Order.findById(orderId).lean();
            assert.equal(order.payment.isPaid, false, 'requires_action order must stay unpaid');
            assert.equal(order.status, 'pending');
        } finally {
            stripeInstance.paymentIntents.retrieve = origRetrieve;
        }
    });

    it('RECON-4 — concurrent runReconcile() calls mark order paid exactly once', async () => {
        const userId  = await createUser();
        const piId    = `pi_recon4_${crypto.randomUUID()}`;
        const orderId = await createPendingOrder(userId, piId, { ageMinutes: 20 });

        const origRetrieve = stripeInstance.paymentIntents.retrieve.bind(stripeInstance.paymentIntents);
        stripeInstance.paymentIntents.retrieve = async (id) => {
            if (id === piId) return { id, status: 'succeeded' };
            return origRetrieve(id);
        };

        try {
            // Fire two runs concurrently — the MongoDB atomic findOneAndUpdate guard
            // must ensure only one wins and updates the order.
            const [r1, r2] = await Promise.all([runReconcile(), runReconcile()]);

            const allResults = [...r1.results, ...r2.results].filter(
                r => r.orderId.toString() === orderId.toString()
            );
            const markedPaid = allResults.filter(r => r.action === 'marked_paid');
            assert.equal(markedPaid.length, 1, `Expected exactly 1 marked_paid, got ${markedPaid.length}`);

            // Stats must be incremented exactly once
            const user = await User.findById(userId).lean();
            assert.equal(user.stats.orderCount, 1, `orderCount was ${user.stats.orderCount} after concurrent reconcile`);
        } finally {
            stripeInstance.paymentIntents.retrieve = origRetrieve;
        }
    });

});

// ── R: Refund tests ────────────────────────────────────────────────────────────

describe('Refund on cancellation of paid Stripe order', () => {
    let jwt;

    before(async () => {
        jwt = (await import('jsonwebtoken')).default;
    });

    async function makeUserWithToken() {
        const id = new mongoose.Types.ObjectId();
        await User.collection.insertOne({
            _id:      id,
            name:     'Refund Tester',
            email:    `refund-${id}@test.com`,
            password: 'hashed',
            role:     'user',
            stats:    { totalSpent: 0, orderCount: 0 },
        });
        return { userId: id, token: jwt.sign({ id: id.toString() }, process.env.JWT_SECRET, { expiresIn: '1h' }) };
    }

    async function createPaidStripeOrder(userId, piId) {
        const id = new mongoose.Types.ObjectId();
        await Order.collection.insertOne({
            _id:          id,
            user:         userId,
            items:        [],
            itemsPrice:   300000,
            shippingPrice: 0,
            totalPrice:   300000,
            shippingAddress: { fullName: 'R', phone: '09', street: 'S', district: 'D', city: 'C' },
            status:       'confirmed',
            payment: { method: 'stripe', stripePaymentIntentId: piId, isPaid: true, paidAt: new Date() },
            statusHistory: [{ status: 'confirmed', note: 'Paid', updatedAt: new Date() }],
        });
        return id;
    }

    it('R1 — cancelling a paid Stripe order calls stripe.refunds.create exactly once and records refundId', async () => {
        const { userId, token } = await makeUserWithToken();
        const piId    = `pi_r1_${crypto.randomUUID()}`;
        const orderId = await createPaidStripeOrder(userId, piId);

        let callCount = 0;
        const fakeRefundId = `re_test_${crypto.randomUUID()}`;
        const orig = stripeInstance.refunds.create.bind(stripeInstance.refunds);
        stripeInstance.refunds.create = async () => { callCount++; return { id: fakeRefundId }; };

        try {
            const res = await request(app)
                .put(`/api/v1/orders/${orderId}/cancel`)
                .set('Authorization', `Bearer ${token}`)
                .send({ reason: 'Changed my mind' });

            assert.equal(res.status, 200, `body: ${JSON.stringify(res.body)}`);
            assert.equal(callCount, 1, 'refunds.create must be called exactly once');

            const order = await Order.findById(orderId).lean();
            assert.equal(order.payment.refundId, fakeRefundId, 'refundId must be stored');
            assert.ok(order.payment.refundedAt, 'refundedAt must be set');
            assert.equal(order.status, 'cancelled');
        } finally {
            stripeInstance.refunds.create = orig;
        }
    });

    it('R2 — cancelling already-cancelled order returns 400; refunds.create NOT called again', async () => {
        const { userId, token } = await makeUserWithToken();
        const piId    = `pi_r2_${crypto.randomUUID()}`;
        const orderId = await createPaidStripeOrder(userId, piId);

        let callCount = 0;
        const orig = stripeInstance.refunds.create.bind(stripeInstance.refunds);
        stripeInstance.refunds.create = async () => { callCount++; return { id: `re_${crypto.randomUUID()}` }; };

        try {
            const res1 = await request(app)
                .put(`/api/v1/orders/${orderId}/cancel`)
                .set('Authorization', `Bearer ${token}`)
                .send({ reason: 'First cancel' });
            assert.equal(res1.status, 200);
            assert.equal(callCount, 1);

            const res2 = await request(app)
                .put(`/api/v1/orders/${orderId}/cancel`)
                .set('Authorization', `Bearer ${token}`)
                .send({ reason: 'Second cancel' });
            assert.equal(res2.status, 400, 'Second cancel must be rejected');
            assert.equal(callCount, 1, 'refunds.create must NOT be called a second time');
        } finally {
            stripeInstance.refunds.create = orig;
        }
    });

    it('R3 — COD paid order cancellation does NOT call stripe.refunds.create', async () => {
        const { userId, token } = await makeUserWithToken();
        const id = new mongoose.Types.ObjectId();
        await Order.collection.insertOne({
            _id:          id,
            user:         userId,
            items:        [],
            itemsPrice:   150000,
            shippingPrice: 0,
            totalPrice:   150000,
            shippingAddress: { fullName: 'C', phone: '09', street: 'S', district: 'D', city: 'C' },
            status:       'confirmed',
            payment: { method: 'cod', isPaid: true },
            statusHistory: [{ status: 'confirmed', note: 'COD', updatedAt: new Date() }],
        });

        let callCount = 0;
        const orig = stripeInstance.refunds.create.bind(stripeInstance.refunds);
        stripeInstance.refunds.create = async () => { callCount++; return { id: 're_never' }; };

        try {
            const res = await request(app)
                .put(`/api/v1/orders/${id}/cancel`)
                .set('Authorization', `Bearer ${token}`)
                .send({ reason: 'COD cancel' });
            assert.equal(res.status, 200);
            assert.equal(callCount, 0, 'COD orders must never call stripe.refunds.create');
        } finally {
            stripeInstance.refunds.create = orig;
        }
    });
});
