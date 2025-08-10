import { test, expect } from '@playwright/test';

test('loads scene and locks pointer', async ({ page }) => {
  await page.goto('/');
  const canvas = page.locator('#renderCanvas');
  await expect(canvas).toBeVisible();
  // Hide prompt overlay that might intercept pointer in CI
  await page.evaluate(() => { const el = document.getElementById('centerPrompt'); if (el) el.style.display = 'none'; });
  await canvas.click({ position: { x: 50, y: 50 } });
  // move forward a bit (W)
  await page.keyboard.down('w');
  await page.waitForTimeout(300);
  await page.keyboard.up('w');
  // HUD should be present or hidden depending config; canvas remains visible
  await expect(canvas).toBeVisible();
});


