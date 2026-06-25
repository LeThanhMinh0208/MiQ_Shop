import 'dotenv/config';
import * as Sentry from '@sentry/node';
import { createServer } from 'http';
import app from './src/app.js';
import connectDB from './src/config/db.js';
import { initSocket } from './src/socket/index.js';
import { logger } from './src/utils/logger.js';
import { runReconcile } from './src/controllers/adminOrders.controller.js';

// Sentry must be initialised before any other imports so it can instrument
// the express app and catch errors in all middlewares and routes.
// Set SENTRY_DSN in .env — if unset, Sentry silently disables itself.
if (process.env.SENTRY_DSN) {
    Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.NODE_ENV || 'development',
        // Capture 100% of transactions in dev; lower in production to control volume.
        tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
        // Never send user passwords or auth tokens to Sentry.
        beforeSend(event) {
            if (event.request?.data) {
                const data = event.request.data;
                if (data.password)        data.password        = '[REDACTED]';
                if (data.currentPassword) data.currentPassword = '[REDACTED]';
                if (data.newPassword)     data.newPassword     = '[REDACTED]';
            }
            if (event.request?.cookies) event.request.cookies = '[REDACTED]';
            if (event.request?.headers?.authorization) {
                event.request.headers.authorization = '[REDACTED]';
            }
            return event;
        },
    });
    logger.info('Sentry initialised');
} else {
    logger.info('SENTRY_DSN not set — error monitoring disabled');
}

const PORT = process.env.PORT || 5000;

const httpServer = createServer(app);

initSocket(httpServer);

const RECONCILE_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes
const RECONCILE_INITIAL_DELAY_MS = 5 * 60 * 1000; // 5 minutes after boot

function scheduleReconcile() {
    setTimeout(async function loop() {
        try {
            const result = await runReconcile();
            if (result.checked > 0) {
                logger.info(result, 'Auto-reconcile complete');
            }
        } catch (err) {
            logger.error({ err: { message: err.message } }, 'Auto-reconcile failed');
        }
        setTimeout(loop, RECONCILE_INTERVAL_MS);
    }, RECONCILE_INITIAL_DELAY_MS);
}

connectDB().then(() => {
    logger.info({ port: PORT, env: process.env.NODE_ENV }, 'Server starting');
    httpServer.listen(PORT, () => {
        logger.info(`Server running on http://localhost:${PORT} [${process.env.NODE_ENV}]`);
    });
    // Webhook-miss safety net: periodically check for Stripe orders that
    // never received a webhook and mark them paid if Stripe confirms it.
    // Only runs in production/development — not in test mode to avoid
    // unnecessary Stripe API calls during the test suite.
    if (process.env.NODE_ENV !== 'test') {
        scheduleReconcile();
        logger.info(`Auto-reconcile scheduled: first run in ${RECONCILE_INITIAL_DELAY_MS / 60000} min, then every ${RECONCILE_INTERVAL_MS / 60000} min`);
    }
});

process.on('unhandledRejection', (err) => {
    logger.error({ err }, 'Unhandled rejection — shutting down');
    process.exit(1);
});
