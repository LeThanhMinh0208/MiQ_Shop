import crypto from 'node:crypto';

const CSRF_COOKIE = 'csrf-token';
const CSRF_HEADER = 'x-csrf-token';
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const COOKIE_MAX_AGE = 24 * 60 * 60 * 1000; // 1 day

// Login and register have no pre-existing session to hijack — CSRF is not
// applicable. Exempting them also fixes the bootstrap problem: a fresh
// browser has no csrf-token cookie yet, but /auth/login is always the
// first mutating request.
//
// Stripe webhook is server-to-server (not browser-initiated); it carries
// its own security via HMAC signature verification and never has a CSRF
// cookie or token.  Path is relative to the /api/v1 mount point.
const CSRF_EXEMPT_PATHS = new Set(['/auth/login', '/auth/register', '/stripe/webhook']);

/**
 * Build the set of trusted browser origins.  Browsers always send — and
 * cannot forge — the Origin header, so a matching Origin is a complete CSRF
 * defence for cross-domain deploys (Vercel frontend → Render backend) where
 * JS cannot read the backend cookie to build the double-submit pair.
 *
 * Keep this list in sync with the cors() allowlist in app.js.
 */
const buildTrustedOrigins = () => {
    const set = new Set(['http://localhost:5173', 'http://localhost:3000']);
    const clientUrl = (process.env.CLIENT_URL || '').replace(/\/$/, '');
    if (clientUrl) set.add(clientUrl);
    return set;
};
const TRUSTED_ORIGINS = buildTrustedOrigins();

/**
 * Two-layer CSRF defence:
 *
 * Layer 1 — Origin check (cross-domain deploy, e.g. Vercel → Render):
 *   Browsers set a non-forgeable Origin header on all cross-site mutating
 *   requests.  If the origin is in TRUSTED_ORIGINS the request is safe.
 *   This covers production where the SPA cannot read the backend cookie
 *   due to the different domain.
 *
 * Layer 2 — Double-submit cookie (same-site / tools without Origin header):
 *   For callers that don't send an Origin header (curl, Postman, same-origin
 *   XHR in some browsers), the csrf-token cookie value must match the
 *   x-csrf-token request header.
 *
 * Bearer-token requests (automated clients, test suite) skip both layers —
 * Bearer tokens are never sent automatically by browsers, so those callers
 * are immune to CSRF by definition.
 */
export const csrfMiddleware = (req, res, next) => {
    // Plant the cookie on EVERY response so the SPA has it immediately after
    // the first GET — the very next mutating request can then supply it.
    if (!req.cookies[CSRF_COOKIE]) {
        const token = crypto.randomBytes(32).toString('hex');
        const isProd = process.env.NODE_ENV === 'production';
        res.cookie(CSRF_COOKIE, token, {
            httpOnly: false, // must be readable by the SPA's JS
            secure: isProd,
            sameSite: isProd ? 'none' : 'strict',
            maxAge: COOKIE_MAX_AGE,
        });
    }

    // Safe methods don't mutate state — no validation needed
    if (SAFE_METHODS.has(req.method)) return next();

    // Bearer-token callers — not browser-cookie-based, so CSRF-immune
    if (req.headers.authorization?.startsWith('Bearer ')) return next();

    // Auth bootstrap routes — no victim session exists to exploit
    if (CSRF_EXEMPT_PATHS.has(req.path)) return next();

    // Layer 1: trusted Origin header.
    // Covers cross-domain deploys (Vercel → Render) where the browser sends
    // Origin but JS cannot read the backend cookie to do double-submit.
    const requestOrigin = req.headers.origin;
    if (requestOrigin && TRUSTED_ORIGINS.has(requestOrigin)) return next();

    // Layer 2: double-submit cookie.
    // Covers same-site requests and automated tools that omit the Origin header.
    const cookieToken = req.cookies[CSRF_COOKIE];
    const headerToken = req.headers[CSRF_HEADER];
    if (!cookieToken || !headerToken || cookieToken !== headerToken) {
        return res.status(403).json({ success: false, message: 'CSRF token không hợp lệ' });
    }

    next();
};
