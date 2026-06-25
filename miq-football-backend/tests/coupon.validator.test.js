/**
 * Integration test — Coupon percent-value validator
 *
 * Confirms that:
 *  1. Creating a percent coupon with value > 100 is rejected.
 *  2. PATCHing an existing percent coupon's value to 200 via the fixed
 *     load-then-save pattern throws ValidationError and leaves the DB unchanged.
 *  3. Boundary value 100% is accepted.
 *  4. A fixed-type coupon with value > 100 (e.g. 200 000 VND) is accepted.
 *
 * Uses Node.js built-in `node:test` runner (Node 18+) and mongodb-memory-server
 * so no real MongoDB connection is required.
 *
 * Run:  npm test
 */

import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Coupon from '../src/models/Coupon.js';

let mongod;

before(async () => {
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri());
});

after(async () => {
    await mongoose.disconnect();
    await mongod.stop();
});

// Wipe the collection between tests to keep codes unique
beforeEach(async () => {
    await Coupon.deleteMany({});
});

describe('Coupon percent-value cross-field validator', () => {

    it('[create] rejects percent coupon with value > 100', async () => {
        await assert.rejects(
            () => Coupon.create({ code: 'OVER', type: 'percent', value: 200 }),
            (err) => {
                assert.ok(
                    err instanceof mongoose.Error.ValidationError,
                    `Expected ValidationError, got ${err.constructor.name}: ${err.message}`
                );
                assert.ok(
                    err.errors?.value?.message?.includes('100%'),
                    `Expected message to mention "100%", got: ${err.errors?.value?.message}`
                );
                return true;
            }
        );
    });

    it('[update] load-then-save rejects value=200 and leaves stored value unchanged', async () => {
        // Arrange — create a valid percent coupon
        const created = await Coupon.create({ code: 'SALE50', type: 'percent', value: 50 });

        // Act — simulate the fixed updateCoupon controller pattern
        const loaded = await Coupon.findById(created._id);
        loaded.value = 200; // attempt to set invalid value

        // Assert — save() must reject because this.type === 'percent' and 200 > 100
        await assert.rejects(
            () => loaded.save(),
            (err) => {
                assert.ok(
                    err instanceof mongoose.Error.ValidationError,
                    `Expected ValidationError, got ${err.constructor.name}`
                );
                assert.ok(
                    err.errors?.value?.message?.includes('100%'),
                    `Wrong error message: ${err.errors?.value?.message}`
                );
                return true;
            }
        );

        // Verify stored value in DB is still 50 (not 200)
        const fresh = await Coupon.findById(created._id).lean();
        assert.equal(
            fresh.value,
            50,
            `DB value should be 50 (unchanged) but got ${fresh.value}`
        );
    });

    it('[update] changing type+value together: percent→fixed with value=200000 is valid', async () => {
        // Edge case: update both type and value in one operation.
        // With load-then-save, after setting type='fixed', the validator sees
        // this.type === 'fixed', so value=200000 is allowed.
        const created = await Coupon.create({ code: 'CHANGING', type: 'percent', value: 50 });

        const loaded = await Coupon.findById(created._id);
        loaded.type  = 'fixed';
        loaded.value = 200000; // valid for fixed type (200 000 VND)
        await loaded.save();   // must NOT throw

        const fresh = await Coupon.findById(created._id).lean();
        assert.equal(fresh.type,  'fixed');
        assert.equal(fresh.value, 200000);
    });

    it('[boundary] percent coupon with value = 100 is accepted', async () => {
        const c = await Coupon.create({ code: 'FULL100', type: 'percent', value: 100 });
        assert.equal(c.value, 100);
    });

    it('[fixed type] value > 100 is valid (e.g. 200 000 VND discount)', async () => {
        const c = await Coupon.create({ code: 'FIXED200K', type: 'fixed', value: 200000 });
        assert.equal(c.value, 200000);
    });

    it('[mass-assign guard] usedCount cannot be set via COUPON_ALLOWED_FIELDS pattern', async () => {
        // Replicate the createCoupon whitelist logic
        const COUPON_ALLOWED_FIELDS = [
            'code', 'type', 'value', 'minOrder', 'maxDiscount',
            'usageLimit', 'isActive', 'expiresAt', 'description',
        ];
        const rawBody = { code: 'CHEAT', type: 'percent', value: 10, usedCount: 9999 };
        const payload = {};
        for (const key of COUPON_ALLOWED_FIELDS) {
            if (key in rawBody) payload[key] = rawBody[key];
        }
        const c = await Coupon.create(payload);
        assert.equal(c.usedCount, 0, `usedCount should be 0 (schema default), got ${c.usedCount}`);
    });
});
