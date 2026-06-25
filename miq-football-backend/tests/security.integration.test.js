/**
 * Phase 4 security regression tests
 *
 * SEC-1  CSRF: state-changing request without X-CSRF-Token header returns 403
 * SEC-2  CSRF: same request with matching cookie+header passes CSRF check
 * SEC-3  CSRF: /auth/login and /auth/register are exempt (bootstrap works)
 * SEC-4  JWT: token issued before password change is rejected after change
 * SEC-5  Upload: file exceeding 5 MB limit is rejected with 400
 * SEC-6  Upload: SVG file (image/svg+xml) is rejected with 400
 *
 * Runner: node --test tests/security.integration.test.js
 */

process.env.JWT_SECRET           = 'test-secret-phase4';
process.env.JWT_EXPIRES_IN       = '7d';
process.env.JWT_COOKIE_EXPIRES_IN = '7';
process.env.STRIPE_SECRET_KEY    = 'sk_test_dummy_for_tests';
process.env.NODE_ENV             = 'test';
process.env.CLIENT_URL           = 'http://localhost:5173';

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const BASE = '/api/v1';

let mongod, app, User, Category;

before(async () => {
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri());

    const appMod  = await import('../src/app.js');
    const UserMod = await import('../src/models/User.js');
    const CatMod  = await import('../src/models/Category.js');

    app      = appMod.default;
    User     = UserMod.default;
    Category = CatMod.default;

    await Category.create({ name: 'Football', slug: 'football' });
});

after(async () => {
    await mongoose.disconnect();
    await mongod.stop();
});

// ── helpers ──────────────────────────────────────────────────────────────────

function makeToken(userId, options = {}) {
    return jwt.sign({ id: userId.toString(), ...options }, JWT_SECRET, { expiresIn: '2h' });
}

// Returns the csrf-token cookie value from a Set-Cookie header array, or null.
function extractCsrfToken(setCookieArr = []) {
    const entry = setCookieArr.find((c) => c.startsWith('csrf-token='));
    if (!entry) return null;
    return entry.split(';')[0].split('=')[1];
}

// ── SEC-1 — CSRF forged request rejected ─────────────────────────────────────

describe('SEC-1 — CSRF: forged request without token is rejected', () => {
    it('PUT to protected route without X-CSRF-Token returns 403', async () => {
        const ts = Date.now();
        const agent = request.agent(app);

        // Seed csrf-token cookie via a safe GET
        await agent.get(`${BASE}/products`);

        // Log in (exempt path) so the agent's jar now holds the auth token cookie
        await User.create({ name: 'SEC1 User', email: `sec1_${ts}@test.com`, password: 'Password12345678' });
        const loginRes = await agent
            .post(`${BASE}/auth/login`)
            .send({ email: `sec1_${ts}@test.com`, password: 'Password12345678' });
        assert.equal(loginRes.status, 200, 'Login must succeed for SEC-1 setup');

        // State-changing request with NO X-CSRF-Token header → 403
        const res = await agent
            .put(`${BASE}/auth/profile`)
            .send({ name: 'Forged Update' });

        assert.equal(res.status, 403, 'Must return 403 without CSRF token');
        assert.ok(/CSRF/i.test(res.body.message), 'Error message must mention CSRF');
    });
});

// ── SEC-2 — CSRF with correct token succeeds ─────────────────────────────────

describe('SEC-2 — CSRF: request with matching cookie+header passes CSRF check', () => {
    it('PUT with correct X-CSRF-Token passes CSRF and reaches the route handler', async () => {
        const ts = Date.now();
        const agent = request.agent(app);

        // Seed csrf-token cookie and capture its value
        const getRes = await agent.get(`${BASE}/products`);
        const csrfToken = extractCsrfToken(getRes.headers['set-cookie']);
        assert.ok(csrfToken, 'GET must set csrf-token cookie');

        // Log in
        await User.create({ name: 'SEC2 User', email: `sec2_${ts}@test.com`, password: 'Password12345678' });
        await agent
            .post(`${BASE}/auth/login`)
            .send({ email: `sec2_${ts}@test.com`, password: 'Password12345678' });

        // PUT with matching X-CSRF-Token header — must NOT be 403
        const res = await agent
            .put(`${BASE}/auth/profile`)
            .set('X-CSRF-Token', csrfToken)
            .send({ name: 'Valid Update' });

        assert.notEqual(res.status, 403, 'CSRF validation must pass with correct token');
    });
});

// ── SEC-3 — CSRF bootstrap: login/register exempt ────────────────────────────

describe('SEC-3 — CSRF: auth bootstrap routes work without prior GET', () => {
    it('POST /auth/login with no pre-existing csrf-token cookie returns 200', async () => {
        const ts = Date.now();
        await User.create({ name: 'Boot User', email: `boot_${ts}@test.com`, password: 'Password12345678' });

        // Fresh agent: no cookies at all — simulates a first visit
        const res = await request.agent(app)
            .post(`${BASE}/auth/login`)
            .send({ email: `boot_${ts}@test.com`, password: 'Password12345678' });

        assert.equal(res.status, 200, '/auth/login must not be blocked by CSRF guard');
    });

    it('POST /auth/register with no pre-existing csrf-token cookie returns 201', async () => {
        const ts = Date.now();
        const res = await request.agent(app)
            .post(`${BASE}/auth/register`)
            .send({ name: 'New Boot', email: `reg_${ts}@test.com`, password: 'Password12345678' });

        assert.equal(res.status, 201, '/auth/register must not be blocked by CSRF guard');
    });
});

// ── SEC-4 — JWT invalidation after password change ───────────────────────────

describe('SEC-4 — JWT: token issued before password change is rejected', () => {
    it('old token rejected after password change; same-second edge case handled', async () => {
        const ts = Date.now();
        const user = await User.create({
            name: 'Pass Changer',
            email: `passchange_${ts}@test.com`,
            password: 'OldPassword12345678',
        });

        // Issue a token with iat set 2 seconds in the past so it's definitely
        // older than passwordChangedAt (= Date.now() - 1000) after the change.
        const iatPast = Math.floor(Date.now() / 1000) - 2;
        const oldToken = jwt.sign(
            { id: user._id.toString(), iat: iatPast },
            JWT_SECRET,
            { expiresIn: '2h' },
        );

        // Old token works BEFORE password change
        const beforeRes = await request(app)
            .get(`${BASE}/auth/me`)
            .set('Authorization', `Bearer ${oldToken}`);
        assert.equal(beforeRes.status, 200, 'Token must work before password change');

        // Change the password — triggers pre-save hook: passwordChangedAt = Date.now() - 1000
        const freshUser = await User.findById(user._id).select('+password');
        freshUser.password = 'NewPassword12345678';
        await freshUser.save();

        // Old token (iat = now-2 s) < changedAtSec (= now-1 s) → must be rejected
        const afterRes = await request(app)
            .get(`${BASE}/auth/me`)
            .set('Authorization', `Bearer ${oldToken}`);
        assert.equal(afterRes.status, 401, 'Old token must be rejected after password change');
        assert.ok(/Mật khẩu/i.test(afterRes.body.message), 'Error must mention password change');

        // A freshly issued token (iat = now) must still work
        const newToken = makeToken(user._id);
        const newRes = await request(app)
            .get(`${BASE}/auth/me`)
            .set('Authorization', `Bearer ${newToken}`);
        assert.equal(newRes.status, 200, 'Fresh token issued after password change must work');
    });
});

// ── SEC-5 — Upload: oversized file rejected ───────────────────────────────────

describe('SEC-5 — Upload: file exceeding 5 MB limit is rejected', () => {
    it('returns 400 for a 5 MB + 1 byte JPEG upload', async () => {
        const ts = Date.now();
        const admin = await User.create({
            name: 'Upload Admin',
            email: `admin_sec5_${ts}@test.com`,
            password: 'AdminPass12345678',
            role: 'admin',
        });
        const adminToken = makeToken(admin._id);
        const cat = await Category.findOne().lean();

        // 5 MB + 1 byte buffer — just over the multer fileSize limit
        const bigBuffer = Buffer.alloc(5 * 1024 * 1024 + 1, 0xff);

        const res = await request(app)
            .post(`${BASE}/products`)
            .set('Authorization', `Bearer ${adminToken}`)
            .field('name', 'Oversized Test')
            .field('description', 'Test')
            .field('brand', 'Brand')
            .field('category', cat._id.toString())
            .field('price', '100000')
            .attach('images', bigBuffer, { filename: 'big.jpg', contentType: 'image/jpeg' });

        assert.equal(res.status, 400, 'Oversized file must return 400, not 500');
    });
});

// ── SEC-6 — Upload: SVG file rejected ────────────────────────────────────────

describe('SEC-6 — Upload: SVG file is rejected', () => {
    it('returns 400 for a file with content-type image/svg+xml', async () => {
        const ts = Date.now();
        const admin = await User.create({
            name: 'SVG Admin',
            email: `admin_sec6_${ts}@test.com`,
            password: 'AdminPass12345678',
            role: 'admin',
        });
        const adminToken = makeToken(admin._id);
        const cat = await Category.findOne().lean();

        const svgBuf = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><circle r="10"/></svg>');

        const res = await request(app)
            .post(`${BASE}/products`)
            .set('Authorization', `Bearer ${adminToken}`)
            .field('name', 'SVG Exploit Attempt')
            .field('description', 'Test')
            .field('brand', 'Brand')
            .field('category', cat._id.toString())
            .field('price', '100000')
            .attach('images', svgBuf, { filename: 'hack.svg', contentType: 'image/svg+xml' });

        assert.equal(res.status, 400, 'SVG upload must return 400');
    });
});
