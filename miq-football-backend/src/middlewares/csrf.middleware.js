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
 * Double-submit-cookie CSRF defence.
 *
 * Deployment model: same-site (miqsport.vn) + SameSite=Lax on the session
 * cookie. SameSite=Lax already blocks cross-site POST/PUT/DELETE, so CSRF
 * tokens are redundant under current browser standards — they are included
 * here as defence-in-depth against future browser quirks or subdomain issues.
 *
 * Bearer-token requests (automated clients, test suite) are exempt:
 * Bearer tokens are never sent automatically by browsers, so those callers
 * are immune to CSRF by definition.
 */
export const csrfMiddleware = (req, res, next) => {
    // Set the cookie on EVERY response (not just GETs) so that even a fresh
    // login response plants the token — the very next mutating request can
    // then supply the matching header without needing a prior GET.
    if (!req.cookies[CSRF_COOKIE]) {
        const token = crypto.randomBytes(32).toString('hex');
        res.cookie(CSRF_COOKIE, token, {
            httpOnly: false,  // must be readable by the SPA's JS
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: COOKIE_MAX_AGE,
        });
    }

    // Safe methods don't mutate state — no validation needed
    if (SAFE_METHODS.has(req.method)) return next();

    // Bearer-token callers — not browser-cookie-based, so CSRF-immune
    if (req.headers.authorization?.startsWith('Bearer ')) return next();

    // Auth bootstrap routes — no victim session exists to exploit
    if (CSRF_EXEMPT_PATHS.has(req.path)) return next();

    // Double-submit validation: cookie value must match header value
    const cookieToken = req.cookies[CSRF_COOKIE];
    const headerToken = req.headers[CSRF_HEADER];

    if (!cookieToken || !headerToken || cookieToken !== headerToken) {
        return res.status(403).json({ success: false, message: 'CSRF token không hợp lệ' });
    }

    next();
};
