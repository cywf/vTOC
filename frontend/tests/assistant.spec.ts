import { test, expect } from '@playwright/test';

test.describe('ChatKit Co-Pilot integration', () => {
  test('mounts the assistant widget and toggles visibility', async ({ page }) => {
    await page.goto('/');

    const consoleToggle = page.getByRole('button', { name: /open operations console/i });
    await expect(consoleToggle).toBeVisible();

    const assistant = page.locator('chatkit-assistant');
    await expect(assistant).toBeHidden();

    await consoleToggle.click();
    await expect(assistant).toBeVisible();

    await page.getByRole('button', { name: /hide operations console/i }).click();
    await expect(assistant).toBeHidden();

    await page.getByRole('button', { name: /open operations console/i }).click();
    await expect(assistant).toBeVisible();
  });
});
