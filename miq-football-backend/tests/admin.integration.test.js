/**
 * Admin integration tests
 *
 * A1  reconcile-pending: returns 200 with empty result when no stale orders
 * A2  reconcile-pending: finds stale Stripe orders and reports error per-order
 *     when Stripe throws (fake key in test env) — verifies endpoint safety, not
 *     the happy-path Stripe call (which requires a real test key).
 * A3  reconcile-pending: returns 403 when called by a non-admin user
 *
 * Runner: node --test tests/admin.integration.test.js
 */

process.env.JWT_SECRET              = 'test-secret-admin';
process.env.JWT_EXPIRES_IN          = '7d';
process.env.JWT_COOKIE_EXPIRES_IN   = '7';
process.env.STRIPE_SECRET_KEY       = 'sk_test_dummy_admin';
process.env.NODE_ENV                = 'test';
process.env.CLIENT_URL              = 'http://localhost:5173';

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const BASE = '/api/v1';

let mongod, app;
let Order, User;
let adminUser, regularUser, adminToken, userToken;

function makeToken(userId, role = 'user') {
    return jwt.sign({ id: userId.toString() }, JWT_SECRET, { expiresIn: '1h' });
}

before(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    process.env.MONGO_URI = uri;
    await mongoose.connect(uri);

    const appMod   = await import('../src/app.js');
    const OrderMod = await import('../src/models/Order.js');
    const UserMod  = await import('../src/models/User.js');

    app   = appMod.default;
    Order = OrderMod.default;
    User  = UserMod.default;

    // Insert admin and regular user directly (bypass bcrypt)
    const adminId = new mongoose.Types.ObjectId();
    const userId  = new mongoose.Types.ObjectId();
    await User.collection.insertMany([
        { _id: adminId, name: 'Admin', email: 'admin@test.com', password: '$2a$12$placeholder', role: 'admin',  stats: { totalSpent: 0, orderCount: 0 }, addresses: [] },
        { _id: userId,  name: 'User',  email: 'user@test.com',  password: '$2a$12$placeholder', role: 'user',   stats: { totalSpent: 0, orderCount: 0 }, addresses: [] },
    ]);
    adminUser  = { _id: adminId };
    regularUser = { _id: userId };
    adminToken = makeToken(adminId, 'admin');
    userToken  = makeToken(userId, 'user');
});

after(async () => {
    await mongoose.disconnect();
    await mongod.stop();
});

const baseOrder = {
    items: [],
    itemsPrice: 130000,
    shippingPrice: 30000,
    totalPrice: 160000,
    shippingAddress: { fullName: 'T', phone: '09', street: 'S', district: 'D', city: 'C' },
    statusHistory: [],
};

describe('Admin reconcile-pending', () => {

    it('A1 — returns 200 with 0 checked when no stale Stripe orders exist', async () => {
        await Order.deleteMany({});

        const res = await request(app)
            .post(`${BASE}/admin/orders/reconcile-pending`)
            .set('Authorization', `Bearer ${adminToken}`);

        assert.equal(res.status, 200, `Expected 200, got ${res.status}: ${JSON.stringify(res.body)}`);
        assert.equal(res.body.data.checked, 0);
        assert.deepEqual(res.body.data.results, []);
    });

    it('A2 — finds stale pending Stripe orders and reports error (fake Stripe key)', async () => {
        await Order.deleteMany({});

        // Insert two stale pending Stripe orders (createdAt = 20 min ago)
        const staleDate = new Date(Date.now() - 20 * 60 * 1000);
        await Order.collection.insertMany([
            {
                ...baseOrder,
                user: adminUser._id,
                status: 'pending',
                payment: { method: 'stripe', isPaid: false, stripePaymentIntentId: 'pi_stale_1' },
                createdAt: staleDate,
                updatedAt: staleDate,
            },
            {
                ...baseOrder,
                user: regularUser._id,
                status: 'pending',
                payment: { method: 'stripe', isPaid: false, stripePaymentIntentId: 'pi_stale_2' },
                createdAt: staleDate,
                updatedAt: staleDate,
            },
        ]);

        // Also insert a recent order (< 15 min old) — must NOT be checked
        await Order.collection.insertOne({
            ...baseOrder,
            user: adminUser._id,
            status: 'pending',
            payment: { method: 'stripe', isPaid: false, stripePaymentIntentId: 'pi_recent' },
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        const res = await request(app)
            .post(`${BASE}/admin/orders/reconcile-pending`)
            .set('Authorization', `Bearer ${adminToken}`);

        assert.equal(res.status, 200);
        // Only the 2 stale orders are checked, not the recent one
        assert.equal(res.body.data.checked, 2, `Expected 2 checked, got ${res.body.data.checked}`);
        // All should report 'error' because the Stripe key is fake
        const actions = res.body.data.results.map((r) => r.action);
        assert.ok(actions.every((a) => a === 'error'), `Expected all errors, got: ${JSON.stringify(actions)}`);
    });

    it('A3 — non-admin user receives 403', async () => {
        const res = await request(app)
            .post(`${BASE}/admin/orders/reconcile-pending`)
            .set('Authorization', `Bearer ${userToken}`);

        assert.equal(res.status, 403, `Expected 403 for non-admin, got ${res.status}`);
    });

});
