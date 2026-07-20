import { test, expect } from '@playwright/test';
import { installDiagnostics, waitForLandmark } from './readiness';

test.describe('ChatKit Co-Pilot integration', () => {
  test('mounts the assistant widget and toggles visibility', async ({ page }) => {
    const diagnostics = installDiagnostics(page);
    await page.goto('/');

    await waitForLandmark(page, page.getByRole('heading', { name: /vtoc station command/i }), diagnostics);

    const consoleToggle = page.getByRole('button', { name: /open operations console/i });
    await waitForLandmark(page, consoleToggle, diagnostics);

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
