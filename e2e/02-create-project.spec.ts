import { expect, test } from "@playwright/test";
import { deleteTestUser, loginAsTestUser } from "./helpers/auth";
import { E2E_PEERTUBE_VIDEO_URL } from "./helpers/constants";
import { mockPeerTubeVideoApi } from "./helpers/peertube";

async function loadVideoFromUrl(page: import("@playwright/test").Page) {
  const urlInput = page.getByTestId("url").first();
  await expect(urlInput).toBeVisible();
  await urlInput.fill(E2E_PEERTUBE_VIDEO_URL);
  await Promise.all([
    page.waitForRequest(/\/api\/v1\/videos\//),
    page.getByTestId("submit-url").first().click(),
  ]);
  await expect(page.getByTestId("title").first()).toBeVisible();
}

test.describe("create project", () => {
  test("guest is redirected to login on submit", async ({ page }) => {
    await mockPeerTubeVideoApi(page);

    await page.goto("/create/link");
    await expect(
      page
        .getByTestId("header-signup-button")
        .or(page.getByTestId("header-account-menu")),
    ).toBeVisible();

    await loadVideoFromUrl(page);
    await page.getByTestId("title").first().fill("test-title-e2e");
    await page.getByTestId("description").first().fill("test-description");
    await page.getByTestId("public-switch").first().locator("input").check();
    await page
      .getByTestId("collaborative-switch")
      .first()
      .locator("input")
      .check();

    await page.getByTestId("submit").first().click();
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
      await expect(page.getByTestId("header-account-menu")).toBeVisible();

      await loadVideoFromUrl(page);
      await page.getByTestId("title").first().fill("test-title-e2e");
      await page.getByTestId("description").first().fill("test-description");
      await page.getByTestId("public-switch").first().locator("input").check();
      await page
        .getByTestId("collaborative-switch")
        .first()
        .locator("input")
        .check();

      await page.getByTestId("submit").first().click();
      await expect(page).not.toHaveURL(/.*\/login/);
      await expect(page).toHaveURL(/\/project\//);
    } finally {
      await deleteTestUser(user.id);
    }
  });
});
