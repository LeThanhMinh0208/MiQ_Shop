# Production Deploy Checklist

## Required environment variables

### Backend
| Variable | Example | Notes |
|---|---|---|
| `MONGO_URI` | `mongodb+srv://...` | Atlas connection string |
| `JWT_SECRET` | (random 64-byte hex) | Never reuse across environments |
| `JWT_EXPIRES_IN` | `7d` | |
| `JWT_COOKIE_EXPIRES_IN` | `7` | Days, as a number string |
| `STRIPE_SECRET_KEY` | `sk_live_...` | Live key for production |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | From Stripe Dashboard → Webhooks |
| `CLOUDINARY_CLOUD_NAME` | `dnk7wahah` | |
| `CLOUDINARY_API_KEY` | | |
| `CLOUDINARY_API_SECRET` | | NEVER expose to frontend |
| `CLIENT_URL` | `https://miqsport.vn` | No trailing slash |
| `SENTRY_DSN` | `https://...@sentry.io/...` | Optional; no-op when absent |
| `LOG_LEVEL` | `info` | |
| `NODE_ENV` | `production` | |

### Frontend
| Variable | Notes |
|---|---|
| `VITE_API_URL` | e.g. `https://api.miqsport.vn/api/v1` |
| `VITE_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` — safe to expose |
| `VITE_CLOUDINARY_CLOUD_NAME` | `dnk7wahah` |
| `VITE_CLOUDINARY_PRESET` | `miq_unsigned` (unsigned, no secret needed) |
| `VITE_SENTRY_DSN` | Optional |

---

## Known production footguns

### 1. CSRF cookie busts CDN page caching
`csrfMiddleware` sets a `Set-Cookie` header on **every response**, including HTML page loads. CDNs (Cloudflare, CloudFront) will not cache responses with `Set-Cookie` by default.

**Fix if you add a CDN in front of the API server:**
- Configure the CDN to strip `Set-Cookie` from cached GET responses, OR
- Move the CSRF cookie to be set only on the first `GET /api/v1/auth/csrf-token` call and cache that separately, OR
- Switch to the Synchronizer Token Pattern served with the initial HTML.

### 2. Shipping price is hardcoded
`order.controller.js` (search for `SHIPPING_THRESHOLD` or the constant near `createOrder`) hardcodes the free-shipping threshold and the flat shipping fee. There is no admin panel for this.

Before go-live, verify the values match the agreed shipping policy. To change them post-deploy you must redeploy the backend.

### 3. Stripe webhook secret
After deploying, register the production webhook endpoint in the Stripe Dashboard and paste the new `whsec_...` secret as `STRIPE_WEBHOOK_SECRET`. Forgetting this means all Stripe payments will silently fail to mark orders paid (webhook verification will return 400 and Stripe will retry until it gives up).

### 4. MongoDB Atlas IP allowlist
Atlas M0/M10+ requires the server's egress IP to be allow-listed. If deploying to a platform with dynamic IPs (Railway, Render free tier), add `0.0.0.0/0` temporarily — but prefer a static IP or VPC peering.

### 5. Reconcile-pending cron
`POST /api/v1/admin/orders/reconcile-pending` closes the webhook-miss gap but must be called periodically. Options:
- Add a cron job (Railway/Render scheduler, GitHub Actions scheduled workflow) to call it every 30 minutes with an admin JWT.
- Or add an in-process `setInterval` in `server.js` — simpler but stops when the process restarts.

---

## Forgot-password (not implemented — backlog)
There is currently **no password-reset / forgot-password flow**. Users who forget their password have no self-service recovery path.

**Backlog task:** Implement `POST /auth/forgot-password` (sends a signed reset link via email) and `POST /auth/reset-password/:token`. The JWT secret or a separate `RESET_TOKEN_SECRET` can sign the one-time token with a short TTL (15 min).

Until this is implemented, admins must manually reset passwords via the MongoDB console or a protected admin endpoint.
