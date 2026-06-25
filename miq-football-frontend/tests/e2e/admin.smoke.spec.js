/**
 * Admin lazy-load smoke test (Rule 90)
 *
 * Verifies that after React.lazy() code-splitting, navigating to /admin
 * successfully resolves the Dashboard chunk and renders content.
 *
 * Prerequisites: seeded admin@miq.vn / Admin@123 must exist.
 */

import { test, expect } from '@playwright/test';

test('admin route resolves after lazy split — Dashboard renders', async ({ page }) => {
  // Login via UI using seeded admin credentials
  await page.goto('/login');
  await page.locator('[data-testid="login-email"]').fill('admin@miq.vn');
  await page.locator('[data-testid="login-password"]').fill('Admin@123');
  await page.getByRole('button', { name: /đăng nhập|sign\s*in/i }).click();

  // Login redirects to home page — wait for that
  await expect(page).toHaveURL('/', { timeout: 10_000 });

  // Navigate to admin — AdminProtected calls checkAuth() then resolves the
  // lazy chunk.  Allow 20s for the auth check + chunk download.
  await page.goto('/admin');

  // Dashboard must render its h1 heading
  await expect(
    page.locator('h1', { hasText: 'Dashboard' }).first(),
  ).toBeVisible({ timeout: 20_000 });
});
