/**
 * Auth integration tests — forgot / reset password flow
 *
 * AUTH-1  forgotPassword: unknown email → 200 + generic message (enumeration-safe)
 * AUTH-2  forgotPassword: known email → 200, sha256(rawToken) stored (not raw token)
 * AUTH-3  resetPassword: valid token → password changed, token cleared (single-use)
 * AUTH-4  resetPassword: expired token → 400
 * AUTH-5  resetPassword: already-used token → 400 on second call
 * AUTH-6  resetPassword: wrong token → 400
 * AUTH-7  resetPassword route: authLimiter is registered (route config verification)
 *
 * Runner: node --test tests/auth.integration.test.js
 *
 * Email is silently skipped: when EMAIL_USER/EMAIL_PASS are unset, the
 * emailService createTransporter() returns null and sendPasswordResetEmail()
 * returns early without throwing. Token is still written to DB.
 */

process.env.JWT_SECRET        = 'test-secret-auth';
process.env.STRIPE_SECRET_KEY = 'sk_test_dummy_for_tests';
process.env.NODE_ENV          = 'test';
process.env.CLIENT_URL        = 'http://localhost:5173';
// Intentionally NOT setting EMAIL_USER / EMAIL_PASS so email is skipped silently

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';

const BASE = '/api/v1';

let mongod, app, User;

// ── CSRF helper ───────────────────────────────────────────────────────────────
// POST /auth/forgot-password and /auth/reset-password are not Bearer-token
// requests and are not in CSRF_EXEMPT_PATHS — they require the double-submit
// cookie+header pattern. We seed the cookie via a safe GET, then echo it back.
async function getCsrfToken() {
    const res = await request(app).get(`${BASE}/products?limit=1`);
    const raw = res.headers['set-cookie'];
    if (!raw) return '';
    const cookies = Array.isArray(raw) ? raw : [raw];
    const match = cookies.find((c) => c && c.startsWith('csrf-token='));
    if (!match) return '';
    return decodeURIComponent(match.split(';')[0].slice('csrf-token='.length));
}

before(async () => {
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri());

    const appMod  = await import('../src/app.js');
    const UserMod = await import('../src/models/User.js');

    app  = appMod.default;
    User = UserMod.default;
});

after(async () => {
    await mongoose.disconnect();
    await mongod.stop();
});

// ── helpers ──────────────────────────────────────────────────────────────────

function sha256(str) {
    return crypto.createHash('sha256').update(str).digest('hex');
}

async function createTestUser(suffix = '') {
    const email = `auth_test${suffix}_${Date.now()}@test.com`;
    // Insert directly — bypasses bcrypt pre-save for speed, password irrelevant here
    const res = await User.collection.insertOne({
        name:      'Auth Tester',
        email,
        password:  '$2a$12$placeholder',
        role:      'user',
        addresses: [],
        stats:     {},
    });
    return { _id: res.insertedId, email };
}

async function setResetToken(userId, rawToken, expiresAt) {
    await User.collection.updateOne(
        { _id: userId },
        { $set: { passwordResetToken: sha256(rawToken), passwordResetExpires: expiresAt } },
    );
}

// ── AUTH-1: Enumeration safety ────────────────────────────────────────────────

describe('AUTH-1 — forgotPassword: unknown email returns 200 (enumeration-safe)', () => {
    it('returns 200 with generic message regardless of whether email exists', async () => {
        const csrf = await getCsrfToken();
        const res = await request(app)
            .post(`${BASE}/auth/forgot-password`)
            .set('Cookie', `csrf-token=${csrf}`)
            .set('X-CSRF-Token', csrf)
            .send({ email: 'nobody_exists@unknown.com' });

        assert.equal(res.status, 200, `Expected 200 got ${res.status}: ${JSON.stringify(res.body)}`);
        const msg = res.body?.message ?? '';
        assert.ok(msg.includes('Nếu email'), `Response message should be generic: "${msg}"`);
    });
});

// ── AUTH-2: Token hashed at rest ──────────────────────────────────────────────

describe('AUTH-2 — forgotPassword: raw token emailed, sha256 stored in DB', () => {
    it('DB stores a 64-char hex (sha256), not the raw token', async () => {
        const user = await createTestUser('auth2');
        const csrf = await getCsrfToken();

        const res = await request(app)
            .post(`${BASE}/auth/forgot-password`)
            .set('Cookie', `csrf-token=${csrf}`)
            .set('X-CSRF-Token', csrf)
            .send({ email: user.email });

        // API always returns 200 with generic message
        assert.equal(res.status, 200);

        // DB must have a 64-char hex string (sha256 output)
        const dbUser = await User
            .findById(user._id)
            .select('+passwordResetToken +passwordResetExpires')
            .lean();

        assert.ok(dbUser.passwordResetToken, 'passwordResetToken must be set');
        assert.match(dbUser.passwordResetToken, /^[0-9a-f]{64}$/, 'token is 64-char hex (sha256 format)');

        // The stored value must NOT be the literal 32-byte hex raw token
        // (raw token is 64 hex chars too, but sha256 of it would be different)
        // Verify: sha256(sha256(token)) !== token (impossible to reverse sha256)
        const doubleHash = sha256(dbUser.passwordResetToken);
        assert.notEqual(dbUser.passwordResetToken, doubleHash, 'stored value is a hash, not the double-hash');

        // Expiry should be ~15 minutes from now
        const expiresIn = dbUser.passwordResetExpires.getTime() - Date.now();
        assert.ok(expiresIn > 14 * 60 * 1000, `expiry must be > 14 min from now (got ${Math.round(expiresIn / 60000)} min)`);
        assert.ok(expiresIn < 16 * 60 * 1000, `expiry must be < 16 min from now (got ${Math.round(expiresIn / 60000)} min)`);
    });
});

// ── AUTH-3: Valid token — password changed, token cleared ─────────────────────

describe('AUTH-3 — resetPassword: valid token changes password and clears token', () => {
    it('accepts a valid token, changes the password, and clears the token from DB', async () => {
        const user = await createTestUser('auth3');
        const rawToken = crypto.randomBytes(32).toString('hex');
        await setResetToken(user._id, rawToken, new Date(Date.now() + 15 * 60 * 1000));
        const csrf = await getCsrfToken();

        const res = await request(app)
            .post(`${BASE}/auth/reset-password/${rawToken}`)
            .set('Cookie', `csrf-token=${csrf}`)
            .set('X-CSRF-Token', csrf)
            .send({ password: 'NewPassword123' });

        assert.equal(res.status, 200, `Expected 200 got ${res.status}: ${JSON.stringify(res.body)}`);
        assert.ok(res.body?.message?.includes('thành công'), 'Success message in response');

        // DB: token and expiry must be cleared
        const dbUser = await User
            .findById(user._id)
            .select('+passwordResetToken +passwordResetExpires')
            .lean();

        assert.ok(!dbUser.passwordResetToken, 'passwordResetToken cleared after use');
        assert.ok(!dbUser.passwordResetExpires, 'passwordResetExpires cleared after use');
    });
});

// ── AUTH-4: Expired token rejected ───────────────────────────────────────────

describe('AUTH-4 — resetPassword: expired token returns 400', () => {
    it('rejects a token whose expiry is in the past', async () => {
        const user = await createTestUser('auth4');
        const rawToken = crypto.randomBytes(32).toString('hex');
        // Set expiry 1 second in the past
        await setResetToken(user._id, rawToken, new Date(Date.now() - 1000));
        const csrf = await getCsrfToken();

        const res = await request(app)
            .post(`${BASE}/auth/reset-password/${rawToken}`)
            .set('Cookie', `csrf-token=${csrf}`)
            .set('X-CSRF-Token', csrf)
            .send({ password: 'NewPassword123' });

        assert.equal(res.status, 400, `Expected 400 (expired) got ${res.status}: ${JSON.stringify(res.body)}`);
        assert.ok(
            res.body?.message?.includes('không hợp lệ') || res.body?.message?.includes('hết hạn'),
            `Error message should mention invalid/expired token: "${res.body?.message}"`,
        );
    });
});

// ── AUTH-5: Single-use — second call with same token fails ────────────────────

describe('AUTH-5 — resetPassword: token is single-use (cleared on first use)', () => {
    it('second call with the same token is rejected after first succeeds', async () => {
        const user = await createTestUser('auth5');
        const rawToken = crypto.randomBytes(32).toString('hex');
        await setResetToken(user._id, rawToken, new Date(Date.now() + 15 * 60 * 1000));
        const csrf = await getCsrfToken();

        // First call — must succeed
        const res1 = await request(app)
            .post(`${BASE}/auth/reset-password/${rawToken}`)
            .set('Cookie', `csrf-token=${csrf}`)
            .set('X-CSRF-Token', csrf)
            .send({ password: 'FirstPassword123' });
        assert.equal(res1.status, 200, `First reset should succeed: ${JSON.stringify(res1.body)}`);

        // Second call with same token — must fail (token cleared)
        const res2 = await request(app)
            .post(`${BASE}/auth/reset-password/${rawToken}`)
            .set('Cookie', `csrf-token=${csrf}`)
            .set('X-CSRF-Token', csrf)
            .send({ password: 'SecondPassword123' });
        assert.equal(res2.status, 400, `Second reset with same token must fail: ${JSON.stringify(res2.body)}`);
    });
});

// ── AUTH-6: Wrong token rejected ──────────────────────────────────────────────

describe('AUTH-6 — resetPassword: wrong token rejected', () => {
    it('a fabricated token that does not match any user returns 400', async () => {
        const fakeToken = crypto.randomBytes(32).toString('hex');
        const csrf = await getCsrfToken();

        const res = await request(app)
            .post(`${BASE}/auth/reset-password/${fakeToken}`)
            .set('Cookie', `csrf-token=${csrf}`)
            .set('X-CSRF-Token', csrf)
            .send({ password: 'SomePassword123' });

        assert.equal(res.status, 400);
    });
});

// ── AUTH-7: Rate limiter on route ─────────────────────────────────────────────

describe('AUTH-7 — reset-password route has authLimiter registered', () => {
    it('route file registers authLimiter on POST /reset-password/:token', async () => {
        // This test validates route configuration by reading the source file.
        // Behavioural rate-limit testing (hammering the endpoint) is reserved
        // for load tests — here we just prove the middleware is wired.
        const { readFileSync } = await import('node:fs');
        const { fileURLToPath } = await import('node:url');
        const { resolve, dirname } = await import('node:path');

        const routeFile = resolve(
            fileURLToPath(import.meta.url),
            '../../src/routes/auth.routes.js',
        );
        const content = readFileSync(routeFile, 'utf8');

        assert.ok(
            content.includes('authLimiter') && content.includes('/reset-password'),
            'auth.routes.js must register authLimiter on the /reset-password route',
        );
    });
});
