/**
 * Phase 2 integration tests — order creation trustworthiness
 *
 * T1  Price injection ignored (server re-prices from DB)
 * T2  Shipping injection ignored (server computes shippingPrice)
 * T3  Oversell blocked under concurrency (10 concurrent, stock=1 → exactly 1 succeeds)
 * T4  Coupon usageLimit race (2 concurrent, usageLimit=1 → usedCount stays at 1)
 * T5  Idempotency (same key twice → same order returned)
 * T6  Stock restored exactly once on cancelOrder
 * T7  IDOR: user A cannot mark user B's order as paid
 * T8  Rollback integrity: stock reverts when second item has insufficient stock
 *
 * Runner: node --test tests/order.integration.test.js
 * Note:   T8 relies on manual compensation (no MongoDB transaction) because
 *         Atlas M0 provides a replica set but we use mongodb-memory-server
 *         (standalone) in CI. The atomic per-document operations in T3/T4 still
 *         hold because findOneAndUpdate is atomic at the document level.
 */

// Set process.env BEFORE dynamic imports so auth.middleware and stripe.config
// read the correct values at module evaluation time.
process.env.JWT_SECRET         = 'test-secret-phase2';
process.env.STRIPE_SECRET_KEY  = 'sk_test_dummy_for_tests';
process.env.NODE_ENV           = 'test';
process.env.CLIENT_URL         = 'http://localhost:5173';

import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const BASE = '/api/v1';

let mongod, app;
let Product, Order, Coupon, User, Category;

// ── helpers ──────────────────────────────────────────────────────────────────

function makeToken(userId) {
    return jwt.sign({ id: userId.toString() }, JWT_SECRET, { expiresIn: '1h' });
}

function authHeader(token) {
    return { Authorization: `Bearer ${token}` };
}

const shippingAddress = {
    fullName: 'Test User',
    phone: '0900000000',
    street: '1 Test St',
    district: 'Q1',
    city: 'HCM',
};

async function makeProduct({ stock = 5, price = 100000, salePrice = null } = {}) {
    return Product.create({
        name: `Prod-${Date.now()}-${Math.random()}`,
        description: 'Test product',
        brand: 'Test',
        category: (await Category.findOne().lean())._id,
        price,
        salePrice,
        images: [{ url: 'http://img.test/img.jpg' }],
        variants: [{ size: 'M', stock }],
    });
}

async function makeCoupon({ usageLimit = null, value = 10, type = 'percent' } = {}) {
    return Coupon.create({
        code: `TEST${Date.now()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
        type,
        value,
        usageLimit,
        isActive: true,
    });
}

// ── setup / teardown ──────────────────────────────────────────────────────────

before(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);

    // Dynamic imports so process.env mutations above are visible at module load
    const appMod      = await import('../src/app.js');
    const ProductMod  = await import('../src/models/Product.js');
    const OrderMod    = await import('../src/models/Order.js');
    const CouponMod   = await import('../src/models/Coupon.js');
    const UserMod     = await import('../src/models/User.js');
    const CatMod      = await import('../src/models/Category.js');

    app      = appMod.default;
    Product  = ProductMod.default;
    Order    = OrderMod.default;
    Coupon   = CouponMod.default;
    User     = UserMod.default;
    Category = CatMod.default;

    // Seed one category (products require it)
    await Category.create({ name: 'Football', slug: 'football' });
});

after(async () => {
    await mongoose.disconnect();
    await mongod.stop();
});

beforeEach(async () => {
    await Order.deleteMany({});
    await Product.deleteMany({});
    await Coupon.deleteMany({});
    // Keep users and category across tests
});

// ── user fixtures (created once, reused) ────────────────────────────────────

let userA, userB, tokenA, tokenB;

before(async () => {
    // Wait a tick so mongoose is connected (before() hooks run in order)
});

async function ensureUsers() {
    if (!userA) {
        // Insert directly to bypass the bcrypt pre-save hook and minlength validator
        // (password is irrelevant for these tests — auth uses the JWT we sign ourselves)
        const res = await User.collection.insertMany([
            { name: 'Alice', email: 'alice@test.com', password: '$2a$12$placeholder', role: 'user', addresses: [], stats: {} },
            { name: 'Bob',   email: 'bob@test.com',   password: '$2a$12$placeholder', role: 'user', addresses: [], stats: {} },
        ]);
        const ids = Object.values(res.insertedIds);
        userA = { _id: ids[0] };
        userB = { _id: ids[1] };
        tokenA = makeToken(userA._id);
        tokenB = makeToken(userB._id);
    }
}

// ── T1: Price injection ignored ───────────────────────────────────────────────

describe('T1 — price injection', () => {
    it('server ignores client-supplied item.price and uses DB price', async () => {
        await ensureUsers();
        const product = await makeProduct({ price: 100000, salePrice: null, stock: 5 });

        const res = await request(app)
            .post(`${BASE}/orders`)
            .set(authHeader(tokenA))
            .send({
                items: [{
                    product: product._id.toString(),
                    size: 'M',
                    quantity: 1,
                    price: 1, // injected: 1 VND — should be ignored
                }],
                shippingAddress,
                paymentMethod: 'cod',
            });

        assert.equal(res.status, 201, `Expected 201 got ${res.status}: ${JSON.stringify(res.body)}`);
        const order = res.body.data;
        assert.equal(order.items[0].price, 100000, 'item.price must be DB price (100,000 VND)');
        assert.equal(order.itemsPrice, 100000, 'itemsPrice must equal DB price × qty');
    });
});

// ── T2: Shipping injection ignored ───────────────────────────────────────────

describe('T2 — shipping injection', () => {
    it('server ignores client-supplied shippingPrice and computes it from itemsPrice', async () => {
        await ensureUsers();
        // itemsPrice < 500,000 → shippingPrice should be 30,000
        const product = await makeProduct({ price: 100000, stock: 5 });

        const res = await request(app)
            .post(`${BASE}/orders`)
            .set(authHeader(tokenA))
            .send({
                items: [{ product: product._id.toString(), size: 'M', quantity: 1 }],
                shippingAddress,
                paymentMethod: 'cod',
                shippingPrice: 0, // injected: try to get free shipping
            });

        assert.equal(res.status, 201);
        assert.equal(res.body.data.shippingPrice, 30000, 'shippingPrice must be server-computed 30,000 VND');

        // itemsPrice >= 500,000 → free shipping
        const bigProduct = await makeProduct({ price: 600000, stock: 5 });
        const res2 = await request(app)
            .post(`${BASE}/orders`)
            .set(authHeader(tokenA))
            .send({
                items: [{ product: bigProduct._id.toString(), size: 'M', quantity: 1 }],
                shippingAddress,
                paymentMethod: 'cod',
                shippingPrice: 999999, // injected: try to inflate
            });

        assert.equal(res2.status, 201);
        assert.equal(res2.body.data.shippingPrice, 0, 'shippingPrice must be 0 for orders >= 500,000 VND');
    });
});

// ── T3: Oversell blocked under concurrency ───────────────────────────────────

describe('T3 — concurrent oversell prevention', () => {
    it('only 1 of 10 concurrent requests succeeds when stock=1', async () => {
        await ensureUsers();
        const product = await makeProduct({ price: 100000, stock: 1 });

        const makeReq = () => request(app)
            .post(`${BASE}/orders`)
            .set(authHeader(tokenA))
            .send({
                items: [{ product: product._id.toString(), size: 'M', quantity: 1 }],
                shippingAddress,
                paymentMethod: 'cod',
            });

        const results = await Promise.all(Array.from({ length: 10 }, makeReq));
        const succeeded = results.filter(r => r.status === 201);
        const failed    = results.filter(r => r.status === 400);

        assert.equal(succeeded.length, 1, `Expected exactly 1 success, got ${succeeded.length}`);
        assert.equal(failed.length,    9, `Expected exactly 9 failures, got ${failed.length}`);

        const remaining = await Product.findById(product._id).lean();
        const variant = remaining.variants.find(v => v.size === 'M');
        assert.equal(variant.stock, 0, 'Stock must be 0 after 1 successful purchase');
    });
});

// ── T4: Coupon usageLimit race ────────────────────────────────────────────────

describe('T4 — coupon race condition', () => {
    it('usedCount never exceeds usageLimit=1 under concurrent requests', async () => {
        await ensureUsers();
        const product = await makeProduct({ price: 100000, stock: 10 });
        const coupon  = await makeCoupon({ usageLimit: 1, value: 10, type: 'percent' });

        const makeReq = () => request(app)
            .post(`${BASE}/orders`)
            .set(authHeader(tokenA))
            .send({
                items: [{ product: product._id.toString(), size: 'M', quantity: 1 }],
                shippingAddress,
                paymentMethod: 'cod',
                couponCode: coupon.code,
            });

        const results = await Promise.all([makeReq(), makeReq()]);
        // Both requests should succeed (stock is sufficient)
        assert.ok(results.every(r => r.status === 201), 'Both orders should be created');

        const withCoupon    = results.filter(r => r.body.data.coupon?.discount > 0);
        const withoutCoupon = results.filter(r => !r.body.data.coupon?.discount);
        assert.equal(withCoupon.length, 1, 'Exactly 1 order should have the coupon applied');
        assert.equal(withoutCoupon.length, 1, 'Exactly 1 order should have no coupon');

        const fresh = await Coupon.findById(coupon._id).lean();
        assert.equal(fresh.usedCount, 1, `usedCount must be exactly 1, got ${fresh.usedCount}`);
    });
});

// ── T5: Idempotency ───────────────────────────────────────────────────────────

describe('T5 — order creation idempotency', () => {
    it('same idempotencyKey twice returns same order without creating a duplicate', async () => {
        await ensureUsers();
        const product = await makeProduct({ price: 100000, stock: 5 });
        const key = `idem-${Date.now()}`;

        const payload = {
            items: [{ product: product._id.toString(), size: 'M', quantity: 1 }],
            shippingAddress,
            paymentMethod: 'cod',
            idempotencyKey: key,
        };

        const res1 = await request(app).post(`${BASE}/orders`).set(authHeader(tokenA)).send(payload);
        const res2 = await request(app).post(`${BASE}/orders`).set(authHeader(tokenA)).send(payload);

        assert.ok([200, 201].includes(res1.status), `res1: ${res1.status}`);
        assert.ok([200, 201].includes(res2.status), `res2: ${res2.status}`);
        assert.equal(
            res1.body.data._id,
            res2.body.data._id,
            'Both responses must reference the same order _id'
        );

        const total = await Order.countDocuments({ idempotencyKey: key });
        assert.equal(total, 1, 'Exactly 1 order with this idempotencyKey must exist in DB');

        // Stock should only be decremented once
        const prod = await Product.findById(product._id).lean();
        const variant = prod.variants.find(v => v.size === 'M');
        assert.equal(variant.stock, 4, 'Stock must be decremented exactly once (5 - 1 = 4)');
    });
});

// ── T5b: Concurrent idempotency (races the E11000 path) ──────────────────────
//
// T5 above is sequential (request 1 completes before request 2 starts), so it
// always hits the pre-check branch. T5b fires both requests simultaneously via
// Promise.all so they race through the pre-check and one may hit the E11000
// path in the catch block. Either way both must succeed and reference the same
// order — no 500 allowed.

describe('T5b — concurrent idempotency race', () => {
    it('two simultaneous requests with same key → same order, no 500', async () => {
        await ensureUsers();
        const product = await makeProduct({ price: 100000, stock: 5 });
        const key = `race-${Date.now()}`;

        const makeReq = () => request(app)
            .post(`${BASE}/orders`)
            .set(authHeader(tokenA))
            .send({
                items: [{ product: product._id.toString(), size: 'M', quantity: 1 }],
                shippingAddress,
                paymentMethod: 'cod',
                idempotencyKey: key,
            });

        // Both fire before either response is received
        const [res1, res2] = await Promise.all([makeReq(), makeReq()]);

        assert.ok([200, 201].includes(res1.status), `res1 got ${res1.status}: ${JSON.stringify(res1.body)}`);
        assert.ok([200, 201].includes(res2.status), `res2 got ${res2.status}: ${JSON.stringify(res2.body)}`);
        assert.equal(res1.body.data._id, res2.body.data._id, 'Both responses must reference the same order');

        const total = await Order.countDocuments({ idempotencyKey: key });
        assert.equal(total, 1, `Exactly 1 order with this key must exist, found ${total}`);

        // Stock must be decremented exactly once regardless of which path ran
        const prod = await Product.findById(product._id).lean();
        assert.equal(prod.variants.find(v => v.size === 'M').stock, 4, 'Stock must be 4 (decremented once)');
    });
});

// ── T6: Stock restored exactly once on cancel ─────────────────────────────────

describe('T6 — stock restore on cancellation', () => {
    it('cancelOrder restores stock; calling cancel again has no effect', async () => {
        await ensureUsers();
        const product = await makeProduct({ price: 100000, stock: 5 });

        // Create order (stock goes 5 → 4)
        const createRes = await request(app)
            .post(`${BASE}/orders`)
            .set(authHeader(tokenA))
            .send({
                items: [{ product: product._id.toString(), size: 'M', quantity: 1 }],
                shippingAddress,
                paymentMethod: 'cod',
            });
        assert.equal(createRes.status, 201);
        const orderId = createRes.body.data._id;

        let prod = await Product.findById(product._id).lean();
        assert.equal(prod.variants.find(v => v.size === 'M').stock, 4, 'Stock should be 4 after order');

        // Cancel (stock should go 4 → 5)
        const cancelRes = await request(app)
            .put(`${BASE}/orders/${orderId}/cancel`)
            .set(authHeader(tokenA))
            .send({ reason: 'Changed my mind' });
        assert.equal(cancelRes.status, 200);

        prod = await Product.findById(product._id).lean();
        assert.equal(prod.variants.find(v => v.size === 'M').stock, 5, 'Stock must be restored to 5 after cancel');

        // Second cancel attempt must be rejected (order is already cancelled)
        const cancelRes2 = await request(app)
            .put(`${BASE}/orders/${orderId}/cancel`)
            .set(authHeader(tokenA))
            .send({ reason: 'Duplicate cancel' });
        assert.equal(cancelRes2.status, 400, 'Second cancel must return 400');

        prod = await Product.findById(product._id).lean();
        assert.equal(prod.variants.find(v => v.size === 'M').stock, 5, 'Stock must remain 5 (no double restore)');
    });
});

// ── T7: IDOR on markOrderPaid ─────────────────────────────────────────────────

describe('T7 — IDOR on markOrderPaid', () => {
    it('user B cannot mark user A\'s order as paid', async () => {
        await ensureUsers();
        const product = await makeProduct({ price: 100000, stock: 5 });

        // User A creates an order
        const createRes = await request(app)
            .post(`${BASE}/orders`)
            .set(authHeader(tokenA))
            .send({
                items: [{ product: product._id.toString(), size: 'M', quantity: 1 }],
                shippingAddress,
                paymentMethod: 'stripe',
            });
        assert.equal(createRes.status, 201);
        const orderId = createRes.body.data._id;

        // User B tries to mark it paid → must get 404 (not 200)
        const payRes = await request(app)
            .put(`${BASE}/orders/${orderId}/pay`)
            .set(authHeader(tokenB))
            .send();

        assert.equal(payRes.status, 404, `IDOR: user B got ${payRes.status} instead of 404`);

        // Phase 3: Stripe orders without a PaymentIntent cannot be self-marked paid from the client.
        // The 400 here is correct — the webhook is the only path to flip isPaid for Stripe orders.
        const payResA = await request(app)
            .put(`${BASE}/orders/${orderId}/pay`)
            .set(authHeader(tokenA))
            .send();
        assert.equal(payResA.status, 400, `Stripe order without PI must return 400 (Phase 3 protection)`);
    });
});

// ── T8: Rollback integrity on partial stock failure ───────────────────────────
//
// NOTE: This test uses manual compensation (not a MongoDB transaction) because
// mongodb-memory-server runs as a standalone node. The per-document atomic
// decrements in T3 still hold; what T8 verifies is that the compensation loop
// correctly reverses the first item's decrement when the second item fails.

describe('T8 — rollback integrity on partial stock failure', () => {
    it('stock of the first item is fully restored when the second item has insufficient stock', async () => {
        await ensureUsers();
        const prod1 = await makeProduct({ price: 100000, stock: 5 }); // enough
        const prod2 = await makeProduct({ price: 100000, stock: 0 }); // out of stock

        const res = await request(app)
            .post(`${BASE}/orders`)
            .set(authHeader(tokenA))
            .send({
                items: [
                    { product: prod1._id.toString(), size: 'M', quantity: 1 },
                    { product: prod2._id.toString(), size: 'M', quantity: 1 },
                ],
                shippingAddress,
                paymentMethod: 'cod',
            });

        assert.equal(res.status, 400, 'Request must fail due to insufficient stock on prod2');

        // prod1 stock must be back to 5 (compensation loop fired)
        const fresh1 = await Product.findById(prod1._id).lean();
        assert.equal(
            fresh1.variants.find(v => v.size === 'M').stock,
            5,
            'prod1 stock must be fully restored to 5 after rollback'
        );

        // No order created
        const orderCount = await Order.countDocuments({});
        assert.equal(orderCount, 0, 'No order must exist after failed creation');
    });
});

// ── T9: Refund race guard ─────────────────────────────────────────────────────
//
// Two concurrent cancel requests on a Stripe-paid order must not both try to
// call stripe.refunds.create. The atomic sentinel ('pending') in refundIfPaid
// ensures only one process claims the refund slot. With a fake Stripe key the
// call will fail, releasing the sentinel — so the final refundId must be null,
// not 'pending'.

describe('T9 — concurrent cancel: refund race guard', () => {
    it('two simultaneous cancels never leave refundId stuck as "pending"', async () => {
        await ensureUsers();
        const product = await makeProduct({ price: 150000, stock: 2 });

        // Insert a Stripe-paid confirmed order directly (bypasses createOrder flow)
        const orderId = new mongoose.Types.ObjectId();
        await Order.collection.insertOne({
            _id:          orderId,
            user:         userA._id,
            items:        [{ product: product._id, name: 'Race Shirt', image: 'img', size: 'M', quantity: 1, price: 150000 }],
            itemsPrice:   150000,
            shippingPrice: 30000,
            totalPrice:   180000,
            shippingAddress,
            status:       'confirmed',
            payment: {
                method:                'stripe',
                isPaid:                true,
                paidAt:                new Date(),
                stripePaymentIntentId: 'pi_race_test',
                refundId:              null,
            },
            statusHistory: [],
            createdAt:    new Date(),
            updatedAt:    new Date(),
        });

        // Fire two concurrent cancel requests — at least one must succeed
        const [res1, res2] = await Promise.all([
            request(app).put(`${BASE}/orders/${orderId}/cancel`).set(authHeader(tokenA)).send({ reason: 'race cancel 1' }),
            request(app).put(`${BASE}/orders/${orderId}/cancel`).set(authHeader(tokenA)).send({ reason: 'race cancel 2' }),
        ]);

        const statuses = [res1.status, res2.status];
        assert.ok(
            statuses.includes(200),
            `At least one cancel must succeed (200). Got: ${statuses}`,
        );

        // Final state: order is cancelled, refundId is NOT the sentinel string
        const finalOrder = await Order.findById(orderId).lean();
        assert.equal(finalOrder.status, 'cancelled', 'Order must be cancelled');
        assert.notEqual(
            finalOrder.payment.refundId,
            'pending',
            'Sentinel "pending" must not remain — either null (stripe failed) or a real refund id',
        );
    });
});
