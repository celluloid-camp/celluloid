import { expect, test, type Page } from "@playwright/test";
import { deleteTestUser, loginAsTestUser } from "./helpers/auth";
import { E2E_PEERTUBE_VIDEO_URL } from "./helpers/constants";
import { mockPeerTubeVideoApi } from "./helpers/peertube";

/** Visible create-link panel (Next can leave a hidden duplicate in the DOM). */
function createLinkPanel(page: Page) {
  return page.getByTestId("create-link-panel").filter({ visible: true });
}

async function loadVideoFromUrl(page: Page) {
  const panel = createLinkPanel(page);
  const urlInput = panel.getByTestId("url");
  await expect(urlInput).toBeVisible();
  await urlInput.fill(E2E_PEERTUBE_VIDEO_URL);
  await Promise.all([
    page.waitForRequest(/\/api\/v1\/videos\//),
    panel.getByTestId("submit-url").click(),
  ]);
  await expect(panel.getByTestId("title")).toBeVisible();
}

test.describe("create project", () => {
  test("guest is redirected to login on submit", async ({ page }) => {
    await mockPeerTubeVideoApi(page);

    await page.goto("/create/link");
    const panel = createLinkPanel(page);
    await expect(panel).toBeVisible();

    await loadVideoFromUrl(page);
    await panel.getByTestId("title").fill("test-title-e2e");
    await panel.getByTestId("description").fill("test-description");
    await panel.getByTestId("public-switch").locator("input").check();
    await panel.getByTestId("collaborative-switch").locator("input").check();

    await panel.getByTestId("submit").click();
    await expect(page).toHaveURL(/.*\/login/);
  });

  test("authenticated user can submit create form", async ({
    context,
    page,
  }) => {
    const user = await loginAsTestUser(context);
    try {
      await mockPeerTubeVideoApi(page);

      await page.goto("/create/link");
      const panel = createLinkPanel(page);
      await expect(panel).toBeVisible();
      await expect(page.getByTestId("header-account-menu")).toBeVisible();

      await loadVideoFromUrl(page);
      await panel.getByTestId("title").fill("test-title-e2e");
      await panel.getByTestId("description").fill("test-description");
      await panel.getByTestId("public-switch").locator("input").check();
      await panel.getByTestId("collaborative-switch").locator("input").check();

      await panel.getByTestId("submit").click();
      await expect(page).not.toHaveURL(/.*\/login/);
      await expect(page).toHaveURL(/\/project\//);
    } finally {
      await deleteTestUser(user.id);
    }
  });
});
