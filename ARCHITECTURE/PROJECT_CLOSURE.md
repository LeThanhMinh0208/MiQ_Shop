# MiQ Football Store — Project Closure Report

_Date: 2026-06-24_

---

## 1. Starting State — Audit Grade D+

The codebase entered remediation with five critical risks that could directly lose money or expose the business:

| Risk | Description |
|---|---|
| **Payment bypass** | COD orders skipped server-side price validation; any client-supplied price was trusted |
| **Price injection** | `req.body.price` was written directly to the Order document, allowing negative or zero prices |
| **Exposed credentials** | Cloudinary API secret and MongoDB URI were readable in frontend bundle via hardcoded strings |
| **Oversell** | Stock decrement was non-atomic (read → compute → write), allowing race-condition negative stock |
| **Notification 500s** | Socket.io emit inside order creation had no try/catch; any disconnect crashed the controller |

Secondary issues: no rate limiting on any auth endpoint, no CSRF protection, admin routes unprotected by role check, no password-reset flow, JWT stored in `localStorage` (XSS-readable), no webhook signature verification on Stripe events.

---

## 2. What Was Fixed

### Phase 1 — Quick Wins & Auth Hardening
- **#1** JWT migrated from `localStorage` to `httpOnly` / `SameSite=Strict` cookie — no longer readable by XSS
- **#2** `protect` middleware re-reads the user from DB on every request (revocation works immediately)
- **#3** CSRF double-submit cookie pattern added to all state-mutating endpoints
- **#4** `authLimiter` (10 req/15 min) on `/register`, `/login`; `forgotPasswordLimiter` (3 req/hr) on `/forgot-password`; `authLimiter` added to `/reset-password/:token` (C5 fix)
- **#5** Admin role guard (`requireAdmin`) on all `/admin/*` routes
- **#6** `helmet()` adds security headers; `cors` locked to `CLIENT_URL` origin

### Phase 2 — Money & Inventory Integrity
- **#7** Server re-prices every order item from the DB (`Product.findById`) — client price is ignored
- **#8** Stock decrement uses MongoDB `$inc` with `$gte: quantity` condition in one atomic operation — no race condition, no negative stock
- **#9** `idempotencyKey` field on Order (unique index, 24 hr TTL) — duplicate submissions return the existing order instead of creating a second charge
- **#10** Shipping fee computed server-side (`itemsPrice >= 500_000 ? 0 : 30_000`) — never trusted from client
- **#11** Socket.io `emit` wrapped in `try/catch` — disconnect no longer crashes the order controller
- **#12** Cancel-order restock uses the same atomic `$inc` pattern
- **#13** `validateCartStock` pre-check endpoint added; frontend calls it before creating an order

### Phase 3 — Real Stripe Integration
- **#14** `stripe.webhooks.constructEvent()` with full HMAC signature verification replaces raw body parsing
- **#15** Stripe `PaymentIntent` created server-side; `client_secret` returned to frontend — secret key never touches the browser
- **#16** `reconcile-pending` admin endpoint + in-process `scheduleReconcile` (runs every 30 min) closes the webhook-miss gap for Stripe orders
- **#17** Order status machine enforces valid transitions (pending → paid, paid → shipped, etc.)

### Phase 4 — Security Hardening
- **#18** Forgot/reset-password flow: raw token emailed, `sha256(token)` stored in DB — token never in plaintext storage
- **#19** Password reset token expires in 1 hr; token is one-use (cleared on use)
- **#20** `upload.middleware.js` whitelists MIME types and caps file size (2 MB for avatars)
- **#21** Mass-assignment protection: Mongoose schemas use `select: false` on sensitive fields; controllers pick explicit fields
- **#22** Product `salePrice` validated server-side (`salePrice < price`)

### Phase 5 — Performance & Observability
- **#23** `pino` structured logger replaces `console.log`; log level controlled by `LOG_LEVEL` env var
- **#24** Sentry DSN wired via `SENTRY_DSN` / `VITE_SENTRY_DSN` — errors captured in both frontend and backend
- **#25** MongoDB Atlas indexes added on `orders.userId`, `orders.status`, `products.category`, `products.tags`
- **#26** `react-window` virtualised list for large product grids
- **#27** Vite `manualChunks` splits `vendor-react`, `vendor-framer`, `vendor-charts`, `vendor-admin`
- **#28** `react-hot-toast` replaces `alert()`/`window.confirm()` throughout

### UX Pass — 30+ Improvements
- **#30** `AddressForm` replaced free-text city/district/ward with three hierarchical `<select>` dropdowns backed by `vnAddress.js` (63 provinces, province → district)
- **#31** Province dataset corrected: old 15-entry stub removed; all 63 provinces now present (BRVT, DNI, KH fixed — previously had city names as province codes)
- **#32** Legacy address hydration: if stored city name doesn't match current dataset, amber warning shown and native form validation blocks submission
- **#33** `PasswordStrengthMeter` component in Register and Profile (3 criteria, colour-coded bar)
- **#34** 300 ms debounce on password input before strength meter update
- **#35** Order reference prefixed `#MIQ-` + last 8 chars of ObjectId in Profile → Orders tab
- **#36** Skeleton count matches `pageSize` (12) in ProductListing
- **#37** Mobile filter drawer button shows active filter count: "Áp dụng (N)"
- **#38** Checkout save-address checkbox for first-time users
- **#39** `MobileCartDrawer` swipe-right-to-close (60 px threshold, `onTouchStart`/`onTouchEnd`)
- **#40** `GalleryLightbox` real WCAG 2.4.3 focus trap (Tab/Shift+Tab cycles within overlay)
- **#41** `POST /reset-password/:token` rate-limited (`authLimiter`)
- Various: `Navbar` cart badge, `Footer` links, `HeroSection` CTA, `BrandLogos`, `RecommendationSection`, `NewsletterSection`, `ProductForm` admin, `AdminSidebar` active state, `CheckoutAddressForm` phone regex validation

---

## 3. Current State

The codebase is materially secure and commercially viable. All five original critical risks are closed: prices are server-validated, stock decrements are atomic, credentials are backend-only, the Stripe integration uses real HMAC webhook verification, and the notification layer no longer crashes on socket disconnect. Auth uses `httpOnly` cookies, CSRF is enforced on mutating endpoints, all admin routes require `requireAdmin`, rate limiting covers all auth endpoints including password reset. The UX has been substantially improved with proper form validation, accessible focus management, and consistent Vietnamese-language copy throughout.

**New grade: B+**

The gap to A is: ward-level address data is absent (dropdowns show empty when district selected), legacy free-text address blocking relies on native browser validation rather than JS validation, the reconcile loop is in-process (won't deduplicate across horizontal scale), and no real Stripe end-to-end test has ever been run against a live webhook.

---

## 4. Test Coverage

| Layer | Status |
|---|---|
| **E2E — COD full checkout** | ✅ Green (Playwright, real browser, real DB) |
| **E2E — Stock-out warning blocks checkout** | ✅ Green |
| **E2E — Cancel + restock** | ✅ Green |
| **E2E — Stripe card payment** | ⏭ Skipped (placeholder keys; must be run manually with real `sk_test_` / `pk_test_`) |
| **Unit — vnAddress.js province count** | ✅ 10/10 assertions pass (node script) |
| **Unit — backend controllers** | ❌ Not written |
| **Unit — Stripe webhook handler** | ❌ Not written (tested only via self-built HMAC in the reconcile path) |
| **Integration — auth flow** | ❌ Not written |

**What the e2e suite covers:** The happy-path COD order lifecycle (cart → address → place order → success page), the stock-out guard (item in cart pointing to non-existent product blocks submission), and the cancel-restock loop (API-level, not UI). The Stripe test scaffold exists but has never run against a real Stripe environment.

**What is NOT covered:** Admin order management, wishlist, profile address CRUD, password reset token flow, Cloudinary image upload, coupon redemption, Stripe webhook delivery (only the reconcile fallback), and any multi-user race conditions on stock.

---

## 5. Known Debt

1. **Ward-level address data absent.** `getWards()` always returns `[]`. The dataset is province → district only. The ward `<select>` renders gracefully (no crash, no `required` attribute), but users cannot select a ward. Full ward data (~5 MB) should be lazy-loaded via a small API or a dynamic import in a later sprint. Ward is not required for order delivery at this scale but is standard in Vietnamese address forms.

2. **Legacy address blocking relies on native form validation only.** `validateAddress()` in `Checkout.jsx` checks `!address.city?.trim()` — it passes a non-empty legacy city string through. The hidden `required` sentinel input is the sole block. This works for browser form submission but would not block a programmatic `handleSubmit()` call (e.g., a test that fires `submit` via JS). A proper fix adds a `isLegacyCity` check inside `validateAddress()`.

3. **`scheduleReconcile` uses in-process `setTimeout` chain.** If the backend runs as multiple instances (horizontal scale), each instance independently polls Stripe and updates the same orders. The operations are idempotent (marking an already-paid order as paid again is a no-op), but it multiplies Stripe API calls and log noise. Replace with an external cron (GitHub Actions, Railway scheduler) calling the admin endpoint with an `Authorization: Bearer <admin-jwt>` header.

4. **Shipping fee and threshold are hardcoded in the controller.** `order.controller.js:137`: `const shippingPrice = itemsPrice >= 500000 ? 0 : 30000;`. Changing shipping policy requires a backend redeploy. A `ShippingConfig` model or an env var would remove this coupling.

5. **Focus-trap FOCUSABLE selector does not exclude `disabled` or `aria-hidden` elements.** `ProductDetail.jsx:178`: `'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'`. If a disabled button is ever added inside the lightbox overlay, Tab would land on it (browsers handle disabled differently). The selector should be extended with `:not([disabled]):not([aria-hidden="true"])`.

6. **No backend unit tests or webhook integration tests.** The Stripe webhook handler (`stripe.webhooks.constructEvent`) has been verified by code review but has never been exercised against a real Stripe-signed payload. See Go-Live Checklist item 3.

---

## 6. Go-Live Checklist (Human / Ops — cannot be done in code)

- [ ] **Rotate all secrets before deploying to production.** Generate new `JWT_SECRET` (64-byte random hex), new MongoDB user credentials, new Cloudinary API key, and new Stripe keys. The current `.env` values were committed as placeholders or used in development; none should reach production.

- [ ] **Set real Stripe keys.** Replace `STRIPE_SECRET_KEY=sk_test_placeholder` with `sk_live_...` and `VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxx` with `pk_live_...` from the Stripe Dashboard. Switch the Stripe account to live mode.

- [ ] **Register the production webhook endpoint in Stripe Dashboard and set `STRIPE_WEBHOOK_SECRET`.** After deploying, go to Stripe Dashboard → Developers → Webhooks, add the production endpoint URL (`https://api.miqsport.vn/api/v1/webhooks/stripe`), and copy the generated `whsec_...` secret to `STRIPE_WEBHOOK_SECRET`. Without this, all Stripe payments silently fail to mark orders paid.

- [ ] **Run a real end-to-end Stripe payment with `stripe listen`.** The Playwright Stripe test has never run against a live webhook. Use `stripe listen --forward-to localhost:5000/api/v1/webhooks/stripe`, place a test order with card `4242 4242 4242 4242`, and confirm the order transitions from `pending` → `paid` in MongoDB. **This is mandatory before launch.** The webhook HMAC signature verification code has only been reviewed, never exercised end-to-end.

- [ ] **Configure `SENTRY_DSN` and `VITE_SENTRY_DSN`.** Create a Sentry project, paste the DSN into both backend and frontend environment variables. Verify a test error appears in the Sentry dashboard before going live.

- [ ] **Verify MongoDB Atlas automated backups are enabled** on the production cluster (M10+ required for point-in-time recovery). M0 free tier has no backups.

- [ ] **Set `LOG_LEVEL=warn` in production** (currently defaults to `info`, which is verbose under load).

- [ ] **Wire an external scheduler to call `POST /api/v1/admin/orders/reconcile-pending`** every 30 minutes with a valid admin JWT. The in-process `scheduleReconcile` runs alongside the server process and stops if the process restarts; an external cron survives restarts and works across multiple instances.

- [ ] **Configure CDN to not cache responses with `Set-Cookie`.** The CSRF middleware sets a cookie on every response. Cloudflare, CloudFront, and similar CDNs will refuse to cache pages with `Set-Cookie` headers. Either configure the CDN to strip the cookie on cacheable GET responses, or move CSRF cookie issuance to a dedicated `/api/v1/auth/csrf-token` endpoint called once at app boot.

- [ ] **Atlas IP allowlist.** Add the production server's static egress IP to the MongoDB Atlas network access list. Remove `0.0.0.0/0` if it was added during development.
