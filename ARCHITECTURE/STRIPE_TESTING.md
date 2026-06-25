# Stripe End-to-End Testing Guide

This document covers the mandatory end-to-end test that must be completed **before launch**
and the automated integration tests that run in CI.

---

## Part 1 — Automated Tests (CI / local)

The webhook integration tests live in
`miq-football-backend/tests/webhook.integration.test.js`.

They use `stripe.webhooks.generateTestHeaderString({ payload, secret })` from the Stripe SDK
(not a hand-rolled HMAC) so `constructEvent` in the controller verifies a genuinely
Stripe-formatted signature. If the algorithm ever diverged between what Stripe signs with
and what the controller verifies, these tests would catch it.

### What's covered

| Test | Claim |
|---|---|
| W1 — invalid signature | `constructEvent` rejects wrong secret → 400 |
| W2 — missing header | No `stripe-signature` → 400 |
| W3 — `payment_intent.succeeded` | Order flips `isPaid=true`, `status=confirmed`, `stripeEventId` stored, user stats incremented |
| W4 — duplicate delivery (idempotency) | Stats NOT incremented twice; second delivery returns 200 |
| W5 — unknown orderId | 200, graceful no-op, no crash |
| W6 — PI id mismatch | Order stays pending, 200 |
| W7 — `payment_intent.payment_failed` | 200, order stays pending (retry path open) |
| RECON-1 | Stuck-pending order (PI succeeded, webhook missed) → `runReconcile()` marks paid |
| RECON-2 | Second reconcile on same order → `already_paid_no_op` (atomic guard) |
| RECON-3 | Order whose PI is `requires_action` → skipped |
| RECON-4 | Concurrent `runReconcile()` calls → exactly one `marked_paid` |
| R1 — cancel paid Stripe order | `stripe.refunds.create` called once, `refundId` stored |
| R2 — cancel already-cancelled | 400, `refunds.create` NOT called again |
| R3 — cancel COD order | `refunds.create` NOT called |

### Run

```bash
cd miq-football-backend
node --test tests/webhook.integration.test.js
```

Expected output: `pass 14  fail 0`.

---

## Part 2 — Real Stripe-Signed Webhook (MANDATORY before launch)

The automated tests above use an in-memory Mongo and a dummy Stripe key. They prove the code
logic is correct. They do NOT prove that a real Stripe-signed webhook is accepted by the running
server. This section covers that test.

### Prerequisites

- [Stripe CLI](https://stripe.com/docs/stripe-cli) installed and logged in
- A real Stripe test-mode key (`sk_test_...` + `pk_test_...`)
- Backend `.env` with real `STRIPE_SECRET_KEY=sk_test_...`
- Frontend `.env` with `VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...`

### Step 1 — Start the backend

```bash
cd miq-football-backend
npm run dev
# Server must log: "Server running on http://localhost:5000"
```

### Step 2 — Open a Stripe listen session

In a second terminal:

```bash
stripe login              # first time only; opens browser for auth
stripe listen --forward-to http://localhost:5000/api/v1/stripe/webhook
```

Stripe CLI prints a line like:

```
> Ready! Your webhook signing secret is whsec_abcdef1234...  (^C to quit)
```

**Copy that `whsec_...` value** into `miq-football-backend/.env`:

```
STRIPE_WEBHOOK_SECRET=whsec_abcdef1234...
```

Restart the backend so it picks up the new secret.

### Step 3 — Start the frontend

```bash
cd miq-football-frontend
npm run dev
```

Open `http://localhost:5173`.

### Step 4 — Place a test order (standard card)

1. Register a new account or log in.
2. Add any product to the cart.
3. Go to Checkout. Fill in a shipping address.
4. Select **Thẻ tín dụng / Debit** (Stripe card payment).
5. Enter test card number `4242 4242 4242 4242`, any future expiry (e.g. `12/30`), any CVC (e.g. `123`).
6. Click **Tiếp tục thanh toán**.
7. Click **Xác nhận thanh toán** on the next step.

### Step 5 — Verify the webhook was received

In the `stripe listen` terminal you should see:

```
2025-XX-XX ...  --> payment_intent.created     [evt_...]
2025-XX-XX ...  --> payment_intent.succeeded   [evt_...]
2025-XX-XX ...  <-- [200] POST http://localhost:5000/api/v1/stripe/webhook [evt_...]
```

The `<-- [200]` line confirms the backend accepted the Stripe-signed webhook.

### Step 6 — Verify in MongoDB

```js
// Run in mongosh or MongoDB Compass
db.orders.findOne(
  { "payment.method": "stripe", "payment.isPaid": true },
  { status: 1, "payment.isPaid": 1, "payment.stripeEventId": 1, "payment.paidAt": 1 }
)
```

Expected result — the order created in step 4 should show:

```json
{
  "status": "confirmed",
  "payment": {
    "isPaid": true,
    "stripeEventId": "evt_...",
    "paidAt": "2025-..."
  }
}
```

`isPaid: true` + `status: "confirmed"` + a real `stripeEventId` starting with `evt_` proves the
full path: Stripe → `constructEvent` (real HMAC) → DB update → 200 response.

### Step 7 — Test 3DS / SCA (strong authentication card)

Repeat steps 4-6 using card `4000 0025 0000 3155`.

- The Stripe Elements widget will show a 3DS authentication popup.
- **To test the success path:** complete the popup ("Complete authentication" in test mode).
  Verify the order flips `confirmed` in MongoDB.
- **To test abandonment:** close the popup without completing it.
  - The frontend `OrderPending` page must show the reassurance copy
    ("Đơn hàng đang chờ xử lý — không bị trừ tiền nếu thanh toán chưa hoàn tất").
  - The order stays `pending` in MongoDB.
  - The `stripe listen` terminal shows `payment_intent.payment_failed` → `[200]`
    (the controller returns 200 and leaves the order in `pending` so the user can retry).
  - The in-process `scheduleReconcile` will check this order in ~30 minutes; since the PI is
    still `requires_action`, it is skipped (RECON-3 test case covers this).

### Step 8 — Test duplicate delivery (replay safety)

In the `stripe listen` terminal, find the `evt_...` ID for the `payment_intent.succeeded` event.
Then re-send it:

```bash
stripe events resend evt_...
```

Expected: backend returns `[200]` again, but the order is NOT re-confirmed and user stats are NOT
incremented (RECON-2 / W4 idempotency).

---

## Part 3 — Switching to Live Mode

Only after Part 2 passes with test keys:

1. In Stripe Dashboard → switch to **Live mode**.
2. Generate new **live** keys: `sk_live_...` and `pk_live_...`.
3. Update backend production env: `STRIPE_SECRET_KEY=sk_live_...`
4. Update frontend production env: `VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...`
5. Register the **production** webhook URL in Stripe Dashboard → Developers → Webhooks:
   ```
   https://api.miqsport.vn/api/v1/stripe/webhook
   ```
   Subscribe to events: `payment_intent.succeeded`, `payment_intent.payment_failed`
6. Copy the generated `whsec_...` live secret into production env as `STRIPE_WEBHOOK_SECRET`.
7. Run a live test with a real card (small amount, immediately refund).

---

## Middleware Order Verification

`app.js` mounts the webhook router **before** `express.json()`:

```js
// Line 33 — webhook first (raw body)
app.use('/api/v1/stripe/webhook', webhookRouter);

// Line 36 — JSON parser for all other routes
app.use(express.json({ limit: '10kb' }));
```

`webhook.routes.js` adds `express.raw({ type: 'application/json' })` on the route itself:

```js
router.post('/', express.raw({ type: 'application/json' }), stripeWebhook);
```

This means the raw body reaches `constructEvent` unparsed. If `express.json()` ran first, it
would convert the body to a JS object, Stripe's signature check would fail with "No signatures
found matching the expected signature", and all webhooks would return 400.
