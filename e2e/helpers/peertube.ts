import type { Page } from "@playwright/test";

/** Minimal PeerTube video payload so create-project e2e does not depend on CORS/network. */
export const MOCK_PEERTUBE_VIDEO = {
  id: 1,
  uuid: "00000000-0000-4000-8000-000000000001",
  shortUUID: "e2eVideoShortUUID12",
  name: "E2E Test Video",
  description: "Mocked video for Playwright",
  duration: 120,
  thumbnailPath: "/lazy-static/thumbnails/e2e.jpg",
  account: {
    host: "celluloid.cloud",
    name: "e2e",
    displayName: "e2e",
  },
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "*",
};

export async function mockPeerTubeVideoApi(page: Page) {
  await page.route(/\/api\/v1\/videos\//, async (route) => {
    if (route.request().method() === "OPTIONS") {
      await route.fulfill({ status: 204, headers: corsHeaders });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      headers: corsHeaders,
      body: JSON.stringify(MOCK_PEERTUBE_VIDEO),
    });
  });
}
