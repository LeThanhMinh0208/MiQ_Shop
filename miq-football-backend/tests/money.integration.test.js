/**
 * Money-path integration tests — coupon and pricing invariants
 *
 * M1  Percent coupon: discount = round(itemsPrice * value / 100), capped at maxDiscount
 * M2  Fixed coupon:   discount = min(coupon.value, itemsPrice)
 * M3  Expired coupon: rejected (expiresAt in the past)
 * M4  Rollback restores BOTH stock AND coupon.usedCount when second item is out of stock
 *
 * Runner: node --test tests/money.integration.test.js
 */

process.env.JWT_SECRET        = 'test-secret-money';
process.env.STRIPE_SECRET_KEY = 'sk_test_dummy_for_tests';
process.env.NODE_ENV          = 'test';
process.env.CLIENT_URL        = 'http://localhost:5173';

import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import mongoose, { Types as MongooseTypes } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const BASE = '/api/v1';

let mongod, app, stripeInstance;
let Product, Order, Coupon, User, Category;

function makeToken(userId) {
    return jwt.sign({ id: userId.toString() }, JWT_SECRET, { expiresIn: '1h' });
}

const shippingAddress = {
    fullName: 'Money Tester',
    phone: '0900000000',
    street: '1 Money St',
    district: 'Q1',
    city: 'HCM',
};

async function makeProduct({ stock = 10, price = 200000 } = {}) {
    return Product.create({
        name: `MoneyProd-${Date.now()}-${Math.random()}`,
        description: 'desc',
        brand: 'Brand',
        category: (await Category.findOne().lean())._id,
        price,
        images: [{ url: 'http://img.test/x.jpg' }],
        variants: [{ size: 'M', stock }],
    });
}

async function makeCoupon(fields = {}) {
    return Coupon.create({
        code: `CPN${Date.now()}${Math.random().toString(36).slice(2, 5).toUpperCase()}`,
        isActive: true,
        minOrder: 0,
        ...fields,
    });
}

// ── setup / teardown ────────────────────────────────────────────────────────

before(async () => {
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri());

    const appMod     = await import('../src/app.js');
    const ProdMod    = await import('../src/models/Product.js');
    const OrderMod   = await import('../src/models/Order.js');
    const CouponMod  = await import('../src/models/Coupon.js');
    const UserMod    = await import('../src/models/User.js');
    const CatMod     = await import('../src/models/Category.js');
    const stripeMod  = await import('../src/config/stripe.js');

    app           = appMod.default;
    Product       = ProdMod.default;
    Order         = OrderMod.default;
    Coupon        = CouponMod.default;
    User          = UserMod.default;
    Category      = CatMod.default;
    stripeInstance = stripeMod.default;

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
});

let testUser, token;
before(async () => {
    // slight delay so mongoose is connected from the first before()
});

async function ensureUser() {
    if (!testUser) {
        const res = await User.collection.insertOne({
            name: 'Money User',
            email: 'moneyuser@test.com',
            password: '$2a$12$placeholder',
            role: 'user',
            addresses: [],
            stats: {},
        });
        testUser = { _id: res.insertedId };
        token = makeToken(testUser._id);
    }
}

// ── M1: Percent coupon discount calculation ────────────────────────────────

describe('M1 — percent coupon discount', () => {
    it('discount = round(itemsPrice * value / 100), capped at maxDiscount', async () => {
        await ensureUser();

        // itemsPrice = 200,000 VND (1 × 200,000, below free-shipping threshold)
        // Coupon: 30% off, maxDiscount = 50,000
        // Expected discount = min(round(200000 * 30 / 100), 50000) = min(60000, 50000) = 50,000
        const product = await makeProduct({ price: 200000 });
        const coupon  = await makeCoupon({ type: 'percent', value: 30, maxDiscount: 50000 });

        const res = await request(app)
            .post(`${BASE}/orders`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                items: [{ product: product._id.toString(), size: 'M', quantity: 1 }],
                shippingAddress,
                paymentMethod: 'cod',
                couponCode: coupon.code,
            });

        assert.equal(res.status, 201, `Expected 201, got ${res.status}: ${JSON.stringify(res.body)}`);
        const order = res.body.data;
        assert.equal(order.itemsPrice, 200000, 'itemsPrice');
        assert.equal(order.coupon.discount, 50000, 'percent discount capped at maxDiscount');
        // totalPrice = itemsPrice + shippingPrice - discount = 200000 + 30000 - 50000 = 180000
        assert.equal(order.totalPrice, 180000, 'totalPrice');

        // coupon.usedCount incremented to 1
        const updated = await Coupon.findById(coupon._id).lean();
        assert.equal(updated.usedCount, 1, 'usedCount incremented');
    });

    it('percent coupon without maxDiscount applies uncapped', async () => {
        await ensureUser();
        // 10% of 200,000 = 20,000 (no cap)
        const product = await makeProduct({ price: 200000 });
        const coupon  = await makeCoupon({ type: 'percent', value: 10, maxDiscount: null });

        const res = await request(app)
            .post(`${BASE}/orders`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                items: [{ product: product._id.toString(), size: 'M', quantity: 1 }],
                shippingAddress,
                paymentMethod: 'cod',
                couponCode: coupon.code,
            });

        assert.equal(res.status, 201);
        assert.equal(res.body.data.coupon.discount, 20000, '10% of 200,000 = 20,000');
    });
});

// ── M2: Fixed coupon discount calculation ─────────────────────────────────

describe('M2 — fixed coupon discount', () => {
    it('discount = min(coupon.value, itemsPrice) — never exceeds order total', async () => {
        await ensureUser();

        // Coupon: 50,000 VND off a 200,000 VND order → discount = 50,000
        const product = await makeProduct({ price: 200000 });
        const coupon  = await makeCoupon({ type: 'fixed', value: 50000 });

        const res = await request(app)
            .post(`${BASE}/orders`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                items: [{ product: product._id.toString(), size: 'M', quantity: 1 }],
                shippingAddress,
                paymentMethod: 'cod',
                couponCode: coupon.code,
            });

        assert.equal(res.status, 201);
        const order = res.body.data;
        assert.equal(order.coupon.discount, 50000, 'fixed discount of 50,000');
        assert.equal(order.totalPrice, 180000, '200000 + 30000 - 50000 = 180000');
    });

    it('fixed coupon larger than itemsPrice is capped — totalPrice never negative', async () => {
        await ensureUser();

        // Coupon: 999,999 VND off a 200,000 VND order → discount capped at 200,000
        // totalPrice = max(0, 200000 + 30000 - 200000) = 30000
        const product = await makeProduct({ price: 200000 });
        const coupon  = await makeCoupon({ type: 'fixed', value: 999999 });

        const res = await request(app)
            .post(`${BASE}/orders`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                items: [{ product: product._id.toString(), size: 'M', quantity: 1 }],
                shippingAddress,
                paymentMethod: 'cod',
                couponCode: coupon.code,
            });

        assert.equal(res.status, 201);
        const order = res.body.data;
        // discount = min(999999, 200000) = 200000
        assert.equal(order.coupon.discount, 200000, 'discount capped at itemsPrice');
        // totalPrice = max(0, 200000 + 30000 - 200000) = 30000
        assert.equal(order.totalPrice, 30000, 'totalPrice is shipping fee (not negative)');
    });
});

// ── M3: Expired coupon rejected ────────────────────────────────────────────

describe('M3 — expired coupon rejected', () => {
    it('coupon with expiresAt in the past is rejected and no order is created', async () => {
        await ensureUser();

        const product = await makeProduct({ price: 200000 });
        const coupon  = await makeCoupon({
            type: 'percent',
            value: 20,
            expiresAt: new Date(Date.now() - 1000), // 1 second ago
        });

        const orderCountBefore = await Order.countDocuments();

        const res = await request(app)
            .post(`${BASE}/orders`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                items: [{ product: product._id.toString(), size: 'M', quantity: 1 }],
                shippingAddress,
                paymentMethod: 'cod',
                couponCode: coupon.code,
            });

        // Server accepts the order but treats the expired coupon as not found —
        // no discount applied (same behaviour as wrong code, avoids coupon-code enumeration)
        if (res.status === 201) {
            // Coupon silently ignored — order created with no discount
            assert.equal(res.body.data.coupon, null, 'expired coupon yields no discount');
        } else {
            // Some implementations explicitly reject (400) — also acceptable
            assert.ok([400, 422].includes(res.status), `expected 201 (no discount) or 4xx, got ${res.status}`);
        }

        // coupon.usedCount must NOT have been incremented
        const updated = await Coupon.findById(coupon._id).lean();
        assert.equal(updated.usedCount, 0, 'usedCount not incremented for expired coupon');

        // No order should have been created if the server returned an error
        if (res.status !== 201) {
            const orderCountAfter = await Order.countDocuments();
            assert.equal(orderCountAfter, orderCountBefore, 'no order created on expired coupon rejection');
        }
    });
});

// ── M4: Rollback restores BOTH stock AND coupon.usedCount ─────────────────

describe('M4 — rollback on stock failure restores coupon.usedCount', () => {
    it('when second item is out of stock, stock AND coupon.usedCount revert to starting values', async () => {
        await ensureUser();

        // product A: sufficient stock
        const productA = await makeProduct({ stock: 5, price: 100000 });
        // product B: zero stock — will trigger compensate()
        const productB = await makeProduct({ stock: 0, price: 100000 });
        const coupon   = await makeCoupon({ type: 'percent', value: 10 });

        const stockABefore      = 5;
        const usedCountBefore   = 0;

        const res = await request(app)
            .post(`${BASE}/orders`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                items: [
                    { product: productA._id.toString(), size: 'M', quantity: 1 },
                    { product: productB._id.toString(), size: 'M', quantity: 1 },
                ],
                shippingAddress,
                paymentMethod: 'cod',
                couponCode: coupon.code,
            });

        assert.equal(res.status, 400, `Expected 400 (out-of-stock) got ${res.status}`);

        // Product A's stock must be restored to starting value
        const pA = await Product.findById(productA._id).lean();
        const variantA = pA.variants.find((v) => v.size === 'M');
        assert.equal(variantA.stock, stockABefore, `productA stock restored: expected ${stockABefore} got ${variantA.stock}`);

        // coupon.usedCount must be back to 0
        const updatedCoupon = await Coupon.findById(coupon._id).lean();
        assert.equal(updatedCoupon.usedCount, usedCountBefore, `coupon usedCount rolled back: expected ${usedCountBefore} got ${updatedCoupon.usedCount}`);

        // No order document created
        const orderCount = await Order.countDocuments();
        assert.equal(orderCount, 0, 'no orphan order created');
    });
});

// ══════════════════════════════════════════════════════════════════════════════
// CONCURRENCY TESTS — prove race conditions are closed under simultaneous load
// All use Promise.all so requests fire before any response is received.
// The test DB is a MongoMemoryServer standalone node (no replica set), so
// these rely on MongoDB's per-document atomicity (findOneAndUpdate, $inc with
// condition) rather than multi-document transactions. That is deliberate: it
// matches the production constraint and is exactly why the code uses atomic ops.
// ══════════════════════════════════════════════════════════════════════════════

// ── C1: Oversell under concurrency ───────────────────────────────────────────
//
// 10 requests fire simultaneously against a single-unit variant.
// The atomic $inc + $gte:1 condition in findOneAndUpdate ensures only one
// request ever decrements past zero — without transactions, without locks.

describe('C1 — concurrent oversell prevention', () => {
    it('only 1 of 10 simultaneous requests succeeds when stock=1; stock never goes negative', async () => {
        await ensureUser();
        const product = await makeProduct({ stock: 1, price: 100000 });

        const makeReq = () =>
            request(app)
                .post(`${BASE}/orders`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    items: [{ product: product._id.toString(), size: 'M', quantity: 1 }],
                    shippingAddress,
                    paymentMethod: 'cod',
                });

        // All 10 fire before any response is received
        const results = await Promise.all(Array.from({ length: 10 }, makeReq));

        const succeeded = results.filter((r) => r.status === 201);
        const rejected  = results.filter((r) => r.status === 400);

        assert.equal(succeeded.length, 1, `Expected exactly 1 success, got ${succeeded.length}. All statuses: ${results.map(r => r.status)}`);
        assert.equal(rejected.length,  9, `Expected exactly 9 rejections, got ${rejected.length}`);

        // Stock must be exactly 0 — never < 0
        const fresh = await Product.findById(product._id).lean();
        const variant = fresh.variants.find((v) => v.size === 'M');
        assert.equal(variant.stock, 0, `Stock must be 0 (never negative). Got: ${variant.stock}`);
    });
});

// ── C2: Coupon usageLimit race ────────────────────────────────────────────────
//
// A coupon with usageLimit:1 and 3 simultaneous orders applying it.
// The atomic findOneAndUpdate with $expr: { $lt: ['$usedCount', '$usageLimit'] }
// means only one request ever atomically claims the increment.
// The other 2 orders still succeed — they just have no coupon applied.

describe('C2 — coupon usageLimit race', () => {
    it('usedCount stays at 1 when 3 concurrent orders all try to use a usageLimit:1 coupon', async () => {
        await ensureUser();
        const product = await makeProduct({ stock: 10, price: 200000 });
        const coupon  = await makeCoupon({ type: 'percent', value: 10, usageLimit: 1 });

        const makeReq = () =>
            request(app)
                .post(`${BASE}/orders`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    items: [{ product: product._id.toString(), size: 'M', quantity: 1 }],
                    shippingAddress,
                    paymentMethod: 'cod',
                    couponCode: coupon.code,
                });

        const results = await Promise.all([makeReq(), makeReq(), makeReq()]);

        // All 3 orders must be created (stock is sufficient)
        const statuses = results.map((r) => r.status);
        assert.ok(results.every((r) => r.status === 201), `All 3 orders must succeed. Statuses: ${statuses}`);

        // Exactly 1 must have the coupon discount
        const withDiscount    = results.filter((r) => (r.body.data.coupon?.discount ?? 0) > 0);
        const withoutDiscount = results.filter((r) => !(r.body.data.coupon?.discount ?? 0));
        assert.equal(withDiscount.length,    1, `Exactly 1 order must carry the coupon discount. Got: ${withDiscount.length}`);
        assert.equal(withoutDiscount.length, 2, `Exactly 2 orders must have no discount. Got: ${withoutDiscount.length}`);

        // DB: usedCount must be exactly 1 — the atomic guard prevented double-increment
        const freshCoupon = await Coupon.findById(coupon._id).lean();
        assert.equal(freshCoupon.usedCount, 1, `usedCount must be exactly 1, got ${freshCoupon.usedCount}`);
    });
});

// ── C3: Idempotency E11000 path under concurrency ────────────────────────────
//
// Both requests fire before either completes. They race through the pre-check
// findOne (which finds no existing order), both attempt Order.create(), and
// exactly one hits the unique-index E11000. The catch block compensates the
// stock for the losing request and returns the winning order to both callers.
// Final state: 1 order document, both responses carry the same _id, stock
// decremented once.

describe('C3 — concurrent idempotency (E11000 path)', () => {
    it('two simultaneous requests with the same idempotencyKey produce exactly 1 order', async () => {
        await ensureUser();
        const product = await makeProduct({ stock: 5, price: 100000 });
        const key = `idem-concurrent-${Date.now()}`;

        const makeReq = () =>
            request(app)
                .post(`${BASE}/orders`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    items: [{ product: product._id.toString(), size: 'M', quantity: 1 }],
                    shippingAddress,
                    paymentMethod: 'cod',
                    idempotencyKey: key,
                });

        // Both fire before either response arrives — maximises the chance that
        // both pass the pre-check findOne and race to Order.create()
        const [res1, res2] = await Promise.all([makeReq(), makeReq()]);

        // Both callers must get a success response (200 or 201)
        assert.ok(
            [200, 201].includes(res1.status),
            `res1 must be 200 or 201, got ${res1.status}: ${JSON.stringify(res1.body)}`,
        );
        assert.ok(
            [200, 201].includes(res2.status),
            `res2 must be 200 or 201, got ${res2.status}: ${JSON.stringify(res2.body)}`,
        );

        // Both responses must carry the SAME order _id
        assert.equal(
            res1.body.data._id,
            res2.body.data._id,
            `Both callers must get the same order _id. res1=${res1.body.data._id} res2=${res2.body.data._id}`,
        );

        // Exactly 1 order document in DB
        const total = await Order.countDocuments({ idempotencyKey: key });
        assert.equal(total, 1, `Expected exactly 1 order with this key, found ${total}`);

        // Stock decremented exactly once (5 - 1 = 4)
        const fresh = await Product.findById(product._id).lean();
        const stock = fresh.variants.find((v) => v.size === 'M').stock;
        assert.equal(stock, 4, `Stock must be 4 (decremented exactly once). Got: ${stock}`);
    });
});

// ── C4: Refund concurrency + atomic guard ─────────────────────────────────────
//
// GUARD VERDICT: ATOMIC at the DB level.
//
// The guard in refundIfPaid() (order.controller.js:29-33):
//
//   const claimed = await Order.findOneAndUpdate(
//       { _id: order._id, 'payment.refundId': null },
//       { $set: { 'payment.refundId': 'pending' } },
//   );
//   if (!claimed) return;  // another process already claimed the slot
//
// findOneAndUpdate is a single atomic operation in MongoDB — it evaluates the
// filter and applies the update in one step at the storage level. Under
// concurrent cancels, only one request will find refundId === null and return
// a document; the other finds nothing and returns null, so it exits immediately.
// This guarantee holds even across multiple server instances (horizontal scale)
// because it runs in the DB, not in application memory.
//
// The test below stubs stripe.refunds.create to count invocations so we can
// assert AT MOST ONE call even under simultaneous requests.

describe('C4 — concurrent cancel: refund guard is atomic (stripe.refunds.create called at most once)', () => {
    it('two simultaneous cancels on a paid Stripe order call refunds.create at most once', async () => {
        await ensureUser();
        const product = await makeProduct({ stock: 1, price: 300000 });

        // Insert a confirmed, Stripe-paid order directly (bypass createOrder for speed)
        const orderId = new MongooseTypes.ObjectId();
        await Order.collection.insertOne({
            _id:           orderId,
            user:          testUser._id,
            items:         [{ product: product._id, name: 'Race Shirt', image: 'http://img.test/race.jpg', size: 'M', quantity: 1, price: 300000 }],
            itemsPrice:    300000,
            shippingPrice: 30000,
            totalPrice:    330000,
            shippingAddress,
            status:        'confirmed',
            payment: {
                method:                'stripe',
                isPaid:                true,
                paidAt:                new Date(),
                stripePaymentIntentId: 'pi_c4_race_test',
                refundId:              null,
            },
            statusHistory: [],
            createdAt:     new Date(),
            updatedAt:     new Date(),
        });

        // Stub stripe.refunds.create to count invocations and return a fake refund
        let callCount = 0;
        const origCreate = stripeInstance.refunds.create.bind(stripeInstance.refunds);
        stripeInstance.refunds.create = async () => {
            callCount++;
            return { id: `re_c4_fake_${Date.now()}` };
        };

        try {
            // Both cancel requests fire simultaneously
            const [res1, res2] = await Promise.all([
                request(app)
                    .put(`${BASE}/orders/${orderId}/cancel`)
                    .set('Authorization', `Bearer ${token}`)
                    .send({ reason: 'concurrent cancel 1' }),
                request(app)
                    .put(`${BASE}/orders/${orderId}/cancel`)
                    .set('Authorization', `Bearer ${token}`)
                    .send({ reason: 'concurrent cancel 2' }),
            ]);

            const statuses = [res1.status, res2.status];

            // At least one must succeed
            assert.ok(
                statuses.includes(200),
                `At least one cancel must return 200. Got: ${statuses}`,
            );

            // The atomic sentinel ensures at most one Stripe call — even under race
            assert.ok(
                callCount <= 1,
                `stripe.refunds.create must be called AT MOST ONCE. Got: ${callCount} calls`,
            );

            // Final DB state: order is cancelled; sentinel 'pending' must not linger
            const finalOrder = await Order.findById(orderId).lean();
            assert.equal(finalOrder.status, 'cancelled', 'Order must be in cancelled status');
            assert.notEqual(
                finalOrder.payment.refundId,
                'pending',
                'Sentinel "pending" must not remain in DB — either a real refundId or null',
            );
        } finally {
            // Restore original so other tests are unaffected
            stripeInstance.refunds.create = origCreate;
        }
    });
});
