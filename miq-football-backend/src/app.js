import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import * as Sentry from '@sentry/node';

import webhookRouter from './routes/webhook.routes.js';
import routes from './routes/index.js';
import errorHandler from './middlewares/errorHandler.js';
import { apiLimiter } from './middlewares/rateLimiter.js';
import { csrfMiddleware } from './middlewares/csrf.middleware.js';
import { requestLogger } from './middlewares/requestLogger.js';

const app = express();

// Correlation ID + structured HTTP access log — must be first so every
// subsequent middleware and controller has req.log available.
app.use(requestLogger);

app.use(helmet());
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
}));
app.use('/api', apiLimiter);

// ── Stripe webhook — MUST come before express.json() ─────────────────────────
// Stripe signature verification requires the raw (unparsed) request body.
// Mounting this route first ensures express.raw() runs instead of express.json()
// for requests to this path.
app.use('/api/v1/stripe/webhook', webhookRouter);

// ── Body parsers (all other routes) ──────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


// Chống NoSQL Injection tự viết (thay express-mongo-sanitize)
app.use((req, res, next) => {
    const sanitize = (obj) => {
        if (obj && typeof obj === 'object') {
            Object.keys(obj).forEach((key) => {
                if (key.startsWith('$') || key.includes('.')) {
                    delete obj[key];
                } else {
                    sanitize(obj[key]);
                }
            });
        }
    };
    sanitize(req.body);
    sanitize(req.params);
    // Express 5: req.query là getter trên prototype — direct mutation bị mất.
    // Copy ra object thường, sanitize, rồi shadow getter trên instance này.
    const q = Object.assign({}, req.query);
    sanitize(q);
    Object.defineProperty(req, 'query', { value: q, writable: true, configurable: true, enumerable: true });
    next();
});

// CSRF defence-in-depth (see csrf.middleware.js for rationale).
// Webhook is exempt — it is mounted above and sends its own response.
app.use('/api/v1', csrfMiddleware, routes);

// /health is intentionally NOT behind rate-limiting or CSRF middleware so load
// balancers can poll it freely. Returns 503 when MongoDB is not connected.
app.get('/health', (_req, res) => {
    const mongoOk = mongoose.connection.readyState === 1;
    const status  = mongoOk ? 200 : 503;
    res.status(status).json({
        status:    mongoOk ? 'OK' : 'DEGRADED',
        timestamp: new Date().toISOString(),
        checks:    { mongodb: mongoOk ? 'ok' : 'down' },
    });
});

app.all('*splat', (req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.originalUrl} không tồn tại` });
});

// Sentry error handler must come AFTER all routes and BEFORE our own handler.
// It's a no-op when SENTRY_DSN is not set.
Sentry.setupExpressErrorHandler(app);

app.use(errorHandler);

export default app;
