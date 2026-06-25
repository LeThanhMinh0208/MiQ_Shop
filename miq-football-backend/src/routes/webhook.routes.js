import { Router } from 'express';
import express from 'express';
import { stripeWebhook } from '../controllers/webhook.controller.js';

const router = Router();

// express.raw() runs BEFORE any JSON parser touches this request.
// This route must be mounted in app.js BEFORE the global express.json() middleware.
router.post('/', express.raw({ type: 'application/json' }), stripeWebhook);

export default router;
