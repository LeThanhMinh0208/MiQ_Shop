/**
 * Checkout end-to-end test
 *
 * Covers the full critical path:
 *   Cart → stock pre-check → create order → COD success
 *   Stock-out warning blocks checkout
 *   Cancel → restock
 *
 * Stripe test card numbers (test mode only):
 *   4242 4242 4242 4242  — always succeeds
 *
 * To run locally:
 *   cd miq-football-frontend && npx playwright test
 */

import { test, expect } from '@playwright/test';

const API = 'http://localhost:5000/api/v1';

// ── helpers ────────────────────────────────────────────────────────────────

async function seedTestUser(request) {
    const email    = `e2e_${Date.now()}@test.com`;
    const password = 'E2eTest12345678';
    const res = await request.post(`${API}/auth/register`, {
        data: { name: 'E2E Tester', email, password },
    });
    expect(res.ok()).toBeTruthy();
    return { email, password };
}

/** Returns the CSRF token value from the csrf-token cookie. */
async function getCsrfToken(request) {
    const res = await request.get(`${API}/products?limit=1`);
    const raw = res.headers()['set-cookie'];
    if (!raw) return '';
    const cookies = Array.isArray(raw) ? raw : [raw];
    const match = cookies.find((c) => c && c.startsWith('csrf-token='));
    if (!match) return '';
    return decodeURIComponent(match.split(';')[0].slice('csrf-token='.length));
}

/** Fills the login form using data-testid selectors. */
async function loginViaUI(page, email, password) {
    await page.goto('/login');
    await page.locator('[data-testid="login-email"]').fill(email);
    await page.locator('[data-testid="login-password"]').fill(password);
    await page.getByRole('button', { name: /đăng nhập|sign\s*in/i }).click();
    await expect(page).toHaveURL('/', { timeout: 10_000 });
}

// ── COD checkout flow ──────────────────────────────────────────────────────

test('COD checkout: add to cart → fill address → place order → success', async ({ page, request }) => {
    const { email, password } = await seedTestUser(request);
    await loginViaUI(page, email, password);

    // Navigate to products and click the first product card
    await page.goto('/products');
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible({ timeout: 10_000 });
    await page.locator('[data-testid="product-card"]').first().click();

    // Product detail page: pick first available size and add to cart
    await expect(page.locator('[data-testid="size-option"]').first()).toBeVisible({ timeout: 10_000 });
    // Click the first in-stock size (not disabled)
    const firstAvailableSize = page.locator('[data-testid="size-option"]:not([disabled])').first();
    await firstAvailableSize.click();
    await page.getByRole('button', { name: /thêm vào giỏ|add to cart/i }).click();

    // Go to cart then checkout
    await page.goto('/cart');
    await page.getByRole('button', { name: /thanh toán|checkout/i }).click();
    await expect(page).toHaveURL(/checkout/, { timeout: 10_000 });

    // Fill shipping address (city/district/ward are hierarchical selects)
    await page.getByPlaceholder('Họ tên *').fill('E2E Tester');
    await page.getByPlaceholder('Số điện thoại *').fill('0912345678');
    await page.getByPlaceholder(/địa chỉ/i).fill('123 Test Street');
    await page.getByLabel('Tỉnh/Thành phố').selectOption({ label: 'TP. Hồ Chí Minh' });
    await page.getByLabel('Quận/Huyện').selectOption({ label: 'Quận 1' });

    // COD is selected by default; click the submit button
    await page.getByRole('button', { name: /đặt hàng|place order/i }).click();

    // Expect order-success page
    await expect(page).toHaveURL(/order-success/, { timeout: 20_000 });
    await expect(page.getByText(/đặt hàng thành công|order confirmed/i)).toBeVisible();
});

// ── Stock-out warning ──────────────────────────────────────────────────────

test('Out-of-stock warning blocks checkout', async ({ page, request }) => {
    const { email, password } = await seedTestUser(request);
    await loginViaUI(page, email, password);

    // Inject a cart item pointing to a non-existent product via localStorage
    await page.evaluate(() => {
        const fakeCart = [
            {
                cartItemId: 'fake-id',
                productId:  '000000000000000000000001',
                name:       'Ghost Product',
                image:      '/placeholder.jpg',
                size:       'XL',
                quantity:   99,
                price:      100000,
            },
        ];
        localStorage.setItem(
            'miq-cart-storage',
            JSON.stringify({ state: { items: fakeCart }, version: 0 }),
        );
    });

    await page.goto('/checkout');

    // Validate endpoint returns ok: false → warning must appear
    await expect(page.getByText(/không tồn tại|hết hàng/i)).toBeVisible({ timeout: 15_000 });

    // Submit button must be disabled
    const submitBtn = page.getByRole('button', { name: /đặt hàng|tiếp tục/i });
    await expect(submitBtn).toBeDisabled();
});

// ── Stripe payment flow (skipped without real test key) ───────────────────

test('Stripe checkout: card payment → order-pending → confirmed', async ({ page, request }) => {
    const realKey = process.env.STRIPE_SECRET_KEY;
    const realPubKey = process.env.VITE_STRIPE_PUBLISHABLE_KEY;
    const hasRealSecretKey = realKey && realKey.startsWith('sk_test_') && realKey !== 'sk_test_placeholder' && !realKey.includes('placeholder');
    const hasRealPublicKey = realPubKey && realPubKey.startsWith('pk_test_') && !realPubKey.includes('xxxx') && !realPubKey.includes('placeholder');
    test.skip(!hasRealSecretKey || !hasRealPublicKey, 'Requires real Stripe test keys (sk_test_ + pk_test_)');

    const { email, password } = await seedTestUser(request);
    await loginViaUI(page, email, password);

    await page.goto('/products');
    await page.locator('[data-testid="product-card"]').first().click();
    await page.locator('[data-testid="size-option"]:not([disabled])').first().click();
    await page.getByRole('button', { name: /thêm vào giỏ|add to cart/i }).click();

    await page.goto('/cart');
    await page.getByRole('button', { name: /thanh toán|checkout/i }).click();
    await expect(page).toHaveURL(/checkout/);

    await page.getByPlaceholder('Họ tên *').fill('E2E Stripe');
    await page.getByPlaceholder('Số điện thoại *').fill('0912345678');
    await page.getByPlaceholder(/địa chỉ/i).fill('456 Stripe Ave');
    await page.getByLabel('Tỉnh/Thành phố').selectOption({ label: 'TP. Hồ Chí Minh' });
    await page.getByLabel('Quận/Huyện').selectOption({ label: 'Quận 3' });

    // Select Stripe card payment
    await page.getByRole('button', { name: /thẻ tín dụng|card/i }).click();
    await page.getByRole('button', { name: /tiếp tục thanh toán/i }).click();

    const stripeFrame = page.frameLocator('iframe[name^="__privateStripeFrame"]').first();
    await stripeFrame.getByRole('textbox', { name: /card number/i }).fill('4242424242424242');
    await stripeFrame.getByRole('textbox', { name: /expiry/i }).fill('12/30');
    await stripeFrame.getByRole('textbox', { name: /cvc/i }).fill('123');
    await page.getByRole('button', { name: /thanh toán/i }).click();

    await expect(page).toHaveURL(/order-pending/, { timeout: 20_000 });
    const confirmed = page.getByText(/đã xác nhận|đặt hàng thành công/i);
    const timeout   = page.getByText(/kiểm tra email|check your email/i);
    await expect(confirmed.or(timeout)).toBeVisible({ timeout: 100_000 });
});

// ── Cancel and restock ─────────────────────────────────────────────────────

test('COD cancel restores stock', async ({ page, request }) => {
    // getCsrfToken MUST come first: it relies on seeing the csrf-token Set-Cookie
    // header in the response. seedTestUser's POST /auth/register is CSRF-exempt
    // but still triggers the cookie to be set, so a subsequent GET would find the
    // cookie already in the jar and receive no Set-Cookie header — returning ''.
    const csrfToken = await getCsrfToken(request);
    const { email, password } = await seedTestUser(request);

    // Login for direct API calls
    await request.post(`${API}/auth/login`, { data: { email, password } });

    // Get a product with stock
    const prodRes  = await request.get(`${API}/products?limit=1`);
    const products = (await prodRes.json()).data?.products;
    if (!products?.length) test.skip(true, 'No products in DB for cancel test');

    const product = products[0];
    const size    = product.variants?.[0]?.size;
    const stock0  = product.variants?.[0]?.stock;
    if (!size) test.skip(true, 'Product has no variants');

    // Create a COD order (needs CSRF header)
    const orderRes  = await request.post(`${API}/orders`, {
        headers: { 'x-csrf-token': csrfToken },
        data: {
            items: [{
                product:  product._id,
                name:     product.name,
                image:    product.images[0]?.url,
                size,
                quantity: 1,
                price:    product.price,
            }],
            shippingAddress: { fullName: 'Cancel Tester', phone: '0900000000', street: '1 St', district: 'Q1', city: 'HCM' },
            paymentMethod: 'cod',
            idempotencyKey: `cancel-test-${Date.now()}`,
        },
    });
    const orderBody = await orderRes.json().catch(() => null);
    expect(orderRes.ok(), `Order HTTP ${orderRes.status()}: ${JSON.stringify(orderBody)}`).toBeTruthy();
    const order = orderBody?.data;

    // Cancel the order (needs CSRF header)
    const cancelRes  = await request.put(`${API}/orders/${order._id}/cancel`, {
        headers: { 'x-csrf-token': csrfToken },
    });
    const cancelBody = await cancelRes.json().catch(() => null);
    expect(cancelRes.ok(), `Cancel HTTP ${cancelRes.status()}: orderId=${order?._id} body=${JSON.stringify(cancelBody)}`).toBeTruthy();

    // Verify stock was restored
    const prodAfter   = await request.get(`${API}/products/${product._id}`);
    const productAfter = (await prodAfter.json()).data;
    const sizeAfter   = productAfter.variants.find((v) => v.size === size);

    expect(sizeAfter.stock).toBe(stock0);
});
