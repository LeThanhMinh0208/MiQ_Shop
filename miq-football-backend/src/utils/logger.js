import pino from 'pino';

// Structured JSON logger. In production, output goes to stdout as newline-
// delimited JSON for ingestion by Datadog / Loki / CloudWatch.
// In development, pino-pretty formats it for human readability.
export const logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    base: { service: 'miq-backend', env: process.env.NODE_ENV || 'development' },
    // Never log these keys — they may contain secrets or PII
    redact: {
        paths: [
            // HTTP credentials
            'req.headers.authorization',
            'req.headers.cookie',
            // Auth payloads
            'req.body.password',
            'req.body.currentPassword',
            'req.body.newPassword',
            'user.password',
            // Stripe — client_secret lets the holder confirm a PaymentIntent
            // without knowing the secret key; must never appear in logs.
            'pi.client_secret',
            'event.data.object.client_secret',
            // Card details (defense-in-depth; should never reach logger but just in case)
            'pi.payment_method_details.card.number',
            'pi.payment_method_details.card.cvc',
        ],
        censor: '[REDACTED]',
    },
    // pino-pretty is only used in local development — not in production or tests.
    // Install it as a devDependency: npm install --save-dev pino-pretty
    ...(process.env.NODE_ENV === 'development' && {
        transport: {
            target: 'pino-pretty',
            options: { colorize: true, translateTime: 'SYS:HH:MM:ss', ignore: 'pid,hostname,service' },
        },
    }),
});
