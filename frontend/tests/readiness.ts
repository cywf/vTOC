import { expect, type Page } from '@playwright/test';

export const installDiagnostics = (page: Page) => {
  const diagnostics: string[] = [];

  page.on('pageerror', (error) => {
    diagnostics.push(`pageerror: ${error.message}`);
  });

  page.on('console', (message) => {
    if (message.type() === 'error') {
      diagnostics.push(`console error: ${message.text()}`);
    }
  });

  return diagnostics;
};

export const waitForLandmark = async (
  page: Page,
  landmark: ReturnType<Page['getByRole']>,
  diagnostics: string[],
) => {
  try {
    await expect(landmark).toBeVisible();
  } catch (error) {
    throw new Error(
      `Route readiness landmark was not visible. Diagnostics: ${diagnostics.join(' | ') || 'none captured'}`,
      { cause: error },
    );
  }
};