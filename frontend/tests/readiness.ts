import { expect, type Page } from '@playwright/test';

const telemetryEvent = {
  id: 1,
  source_id: 101,
  latitude: 18.5,
  longitude: -66.1,
  event_time: '2026-07-20T10:00:00.000Z',
  received_at: '2026-07-20T10:00:00.000Z',
  payload: { callsign: 'TEST123' },
  status: 'succeeded',
  station_id: 1,
  source: {
    id: 101,
    name: 'Playwright ADS-B',
    slug: 'playwright-adsb',
    source_type: 'adsb',
    description: 'Playwright ADS-B contact',
    station_id: 1,
  },
};

export const mockApiResponses = async (page: Page) => {
  await page.route('**/api/v1/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;

    if (request.method() === 'POST' && path === '/api/v1/chatkit/commands') {
      await route.fulfill({
        contentType: 'application/json',
        json: {
          status: 'succeeded',
          connector_id: 'adsb-receiver',
          message: 'Playwright connector test succeeded',
        },
      });
      return;
    }

    if (request.method() === 'GET' && path === '/api/v1/telemetry/events') {
      await route.fulfill({ contentType: 'application/json', json: [telemetryEvent] });
      return;
    }

    if (request.method() === 'GET' && path === '/api/v1/stations/toc-s1/dashboard') {
      await route.fulfill({
        contentType: 'application/json',
        json: {
          station: {
            id: 1,
            slug: 'toc-s1',
            name: 'TOC-S1',
            timezone: 'UTC',
          },
          metrics: {
            total_events: 1,
            active_sources: 1,
            last_event: telemetryEvent,
          },
        },
      });
      return;
    }

    if (request.method() === 'GET' && path === '/api/v1/stations/toc-s1/timeline') {
      await route.fulfill({ contentType: 'application/json', json: { entries: [] } });
      return;
    }

    await route.fulfill({
      contentType: 'application/json',
      json: {
        error: `Unexpected Playwright API fixture request: ${request.method()} ${path}`,
      },
      status: 501,
    });
  });
};

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