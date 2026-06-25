import { randomUUID } from 'node:crypto';
import { logger } from '../utils/logger.js';

// Attaches a correlation ID to every request/response cycle.
// ID comes from the upstream caller's X-Request-ID header (e.g. load balancer,
// Stripe webhook) so the trace is end-to-end; otherwise a UUID is generated.
export const requestLogger = (req, res, next) => {
    req.correlationId = req.headers['x-request-id'] || randomUUID();
    res.setHeader('X-Request-ID', req.correlationId);

    // req.log is a child logger that includes the correlation ID on every line.
    // Use req.log.info / req.log.warn in controllers instead of console.log.
    req.log = logger.child({ correlationId: req.correlationId });

    const start = Date.now();
    res.on('finish', () => {
        // Log at 'warn' for 4xx/5xx so monitoring alerts can target that level.
        const level = res.statusCode >= 500 ? 'error'
                    : res.statusCode >= 400 ? 'warn'
                    : 'info';
        req.log[level]({
            method:   req.method,
            url:      req.originalUrl,
            status:   res.statusCode,
            ms:       Date.now() - start,
            // Never log the full IP in a GDPR context; first two octets only.
            ip:       req.ip?.split('.').slice(0, 2).join('.') + '.x.x',
        }, 'http');
    });

    next();
};
