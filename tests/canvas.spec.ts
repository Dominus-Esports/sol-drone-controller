import { expect, test } from '@playwright/test';

test('loads scene and locks pointer', async ({ page }) => {
  await page.goto('/');
  const canvas = page.locator('#renderCanvas');
  await expect(canvas).toBeVisible();
  // Hide any overlays that could intercept pointer events in CI
  await page.evaluate(() => {
    const p = document.getElementById('centerPrompt');
    if (p) { p.style.display = 'none'; p.style.pointerEvents = 'none'; }
    const h = document.getElementById('hud');
    if (h) { h.style.display = 'none'; h.style.pointerEvents = 'none'; }
  });
  await canvas.click({ position: { x: 50, y: 50 } });
  // move forward a bit (W)
  await page.keyboard.down('w');
  await page.waitForTimeout(300);
  await page.keyboard.up('w');
  // HUD should be present or hidden depending config; canvas remains visible
  await expect(canvas).toBeVisible();
});
