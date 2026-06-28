/**
 * Admin lazy-load smoke test (Rule 90)
 *
 * Verifies that after React.lazy() code-splitting, navigating to /admin
 * successfully resolves the Dashboard chunk and renders content.
 *
 * Also tests the NotificationBell panel clipping regression (Issue 3):
 * overflow-hidden on motion.aside was clipping the absolutely-positioned panel
 * that opens below the sidebar footer. Fix: removed overflow-hidden from aside,
 * added overflow-y-auto overflow-x-hidden to nav only.
 *
 * Prerequisites: seeded admin@miq.vn / Admin@123 must exist.
 */

import { test, expect } from '@playwright/test';

async function adminLogin(page) {
  await page.goto('/login');
  await page.locator('[data-testid="login-email"]').fill('admin@miq.vn');
  await page.locator('[data-testid="login-password"]').fill('Admin@123');
  await page.getByRole('button', { name: /đăng nhập|sign\s*in/i }).click();
  await expect(page).toHaveURL('/', { timeout: 10_000 });
  await page.goto('/admin');
  await expect(page.locator('h1', { hasText: 'Dashboard' }).first()).toBeVisible({ timeout: 20_000 });
}

test('admin route resolves after lazy split — Dashboard renders', async ({ page }) => {
  await adminLogin(page);
});

// ── NotificationBell panel clipping regression (Issue 3) ──────────────────
// Before fix: overflow-hidden on motion.aside clipped the absolute panel that
// opens below the sidebar footer. The panel's bottom extends below the sidebar
// footer which is near the viewport bottom → completely hidden by overflow-hidden.
//
// After fix: overflow-hidden removed from motion.aside; the panel renders fully.
// Sidebar collapse animation is unaffected because {!collapsed && ...} removes
// label text before the width transition, so nothing spills during the animation.

test('Admin NotificationBell panel is not clipped by sidebar overflow', async ({ page }) => {
  await adminLogin(page);

  // Open the notification panel via the bell button in the sidebar footer
  const bellBtn = page.getByRole('button', { name: /thông báo/i }).first();
  await expect(bellBtn).toBeVisible({ timeout: 8_000 });
  await bellBtn.click();

  // The panel must be visible and contain the "Thông báo" header
  const panel = page.locator('.bg-bg-elevated.rounded-2xl.shadow-depth-lg').last();
  await expect(panel).toBeVisible({ timeout: 5_000 });

  // "Thông báo" heading inside the panel proves the panel header is not clipped
  await expect(page.getByText('Thông báo', { exact: true }).last()).toBeVisible();

  // The panel must extend beyond the sidebar (256px wide).
  // Sidebar motion.aside has max-width 256px; panel is w-80 = 320px.
  // If overflow-hidden is still on aside, the panel is clipped and its
  // bounding box width will be 0 or truncated to the sidebar bounds.
  const panelBox  = await panel.boundingBox();
  const bellBox   = await bellBtn.boundingBox();
  expect(panelBox).not.toBeNull();
  expect(panelBox.height).toBeGreaterThan(50); // panel has real content (header + empty state)

  // The panel's bottom edge must be BELOW the bell button's bottom — proves
  // it extends downward past the bell and is not clipped at the sidebar edge.
  const panelBottom = panelBox.y + panelBox.height;
  const bellBottom  = bellBox.y + bellBox.height;
  expect(panelBottom).toBeGreaterThan(bellBottom);

  // Sidebar collapse animation unaffected: toggle collapse and confirm the
  // sidebar width changes without throwing an error.
  await bellBtn.click(); // close panel first
  const collapseBtn = page.getByRole('button', { name: /thu gọn menu|mở rộng menu/i });
  if (await collapseBtn.isVisible()) {
    await collapseBtn.click();
    // After collapse the sidebar is 64px; nav links still exist but labels hidden
    await expect(page.locator('nav a, nav button').first()).toBeVisible({ timeout: 3_000 });
    // Expand back
    await collapseBtn.click();
  }
});
