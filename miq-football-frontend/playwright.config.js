import { defineConfig, devices } from '@playwright/test';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// Load backend .env so webServer env vars work without CI secret injection
const _backendEnv = {};
const _envPath = join(process.cwd(), '..', 'miq-football-backend', '.env');
if (existsSync(_envPath)) {
    const raw = readFileSync(_envPath, 'utf8');
    for (const line of raw.split(/\r?\n/)) {
        const eq = line.indexOf('=');
        if (eq > 0 && !line.trimStart().startsWith('#')) {
            _backendEnv[line.slice(0, eq).trim()] = line.slice(eq + 1).trim();
        }
    }
}

/**
 * Playwright configuration for MiQ Sport e2e tests.
 *
 * CI mode: set CI=true to use the CI-specific headless settings.
 * Stripe webhooks: in CI, the webhook step is skipped and the order status is
 * asserted after polling. Full webhook testing requires stripe-cli or a public
 * ngrok URL (see ops runbook).
 */
export default defineConfig({
    testDir: './tests/e2e',
    timeout: 60_000,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: process.env.CI ? 'github' : 'list',

    use: {
        baseURL: 'http://localhost:5173',
        headless: true,
        // Persist cookies between steps — needed for session auth
        storageState: undefined,
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        trace: 'retain-on-failure',
    },

    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],

    // Start both servers automatically when running e2e tests.
    // In CI these are started by the workflow instead, so set SKIP_WEB_SERVER=1.
    webServer: process.env.SKIP_WEB_SERVER
        ? undefined
        : [
              {
                  command: 'node ../miq-football-backend/server.js',
                  url: 'http://localhost:5000/health',
                  cwd: '.',
                  env: {
                      NODE_ENV: 'test',
                      PORT: '5000',
                      MONGO_URI: process.env.MONGO_URI_TEST || process.env.MONGO_URI || _backendEnv.MONGO_URI,
                      JWT_SECRET: process.env.JWT_SECRET || _backendEnv.JWT_SECRET || 'e2e-test-secret',
                      JWT_EXPIRES_IN: '7d',
                      JWT_COOKIE_EXPIRES_IN: '7',
                      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || _backendEnv.STRIPE_SECRET_KEY || 'sk_test_placeholder',
                  },
                  reuseExistingServer: !process.env.CI,
              },
              {
                  command: 'npm run dev',
                  url: 'http://localhost:5173',
                  reuseExistingServer: !process.env.CI,
              },
          ],
});
