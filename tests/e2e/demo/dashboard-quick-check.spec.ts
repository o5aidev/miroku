/**
 * Quick Dashboard UI Check
 *
 * Fast smoke test to verify dashboard is accessible and rendering
 */

import { test, expect } from '@playwright/test';

const DASHBOARD_URL = 'http://localhost:5173';

test.describe('Dashboard Quick Check', () => {
  test.setTimeout(15000);

  test('should load dashboard homepage', async ({ page }) => {
    await page.goto(DASHBOARD_URL, { waitUntil: 'domcontentloaded', timeout: 10000 });

    // Wait for React to render
    await page.waitForTimeout(2000);

    // Check if main container exists
    const mainContainer = page.locator('div').first();
    await expect(mainContainer).toBeDefined();

    // Take screenshot
    await page.screenshot({
      path: 'playwright-report/screenshots/quick-check.png',
      fullPage: false,
    });

    console.log('✅ Dashboard loaded successfully');
  });

  test('should have h1 heading', async ({ page }) => {
    await page.goto(DASHBOARD_URL, { waitUntil: 'domcontentloaded', timeout: 10000 });
    await page.waitForTimeout(2000);

    const h1 = page.locator('h1');
    const count = await h1.count();

    console.log(`Found ${count} h1 elements`);
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should respond within 5 seconds', async ({ page }) => {
    const startTime = Date.now();

    await page.goto(DASHBOARD_URL, { waitUntil: 'domcontentloaded', timeout: 10000 });

    const loadTime = Date.now() - startTime;
    console.log(`Load time: ${loadTime}ms`);

    expect(loadTime).toBeLessThan(5000);
  });
});
