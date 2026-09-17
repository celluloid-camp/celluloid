import { expect, test } from "@playwright/test";
import {
  deleteTestUser,
  deleteTestUserByEmail,
  loginAsTestUser,
} from "./helpers/auth";

/** Wait until the header auth UI has resolved (not the loading skeleton). */
async function waitForAuthUi(page: import("@playwright/test").Page) {
  await expect(
    page
      .getByTestId("header-signup-button")
      .or(page.getByTestId("header-account-menu")),
  ).toBeVisible();
}

test.describe("signup", () => {
  test("test user signup with OTP", async ({ page }) => {
    const suffix = Date.now().toString(36).slice(-6);
    const username = `u${suffix}`;
    const email = `${username}@server.com`;

    try {
      await page.goto("/signup");
      await waitForAuthUi(page);
      await expect(page.getByTestId("submit")).toBeEnabled();

      await page.getByTestId("username").fill(username);
      await page.getByTestId("email").fill(email);
      await page.getByTestId("password").fill("testtest");
      await page.getByTestId("passwordConfirmation").fill("testtest");

      await page.getByTestId("submit").click();

      await expect(page).toHaveURL(/.*\/otp/);

      // CI_TEST / E2E forces a deterministic OTP on the server
      await page.getByTestId("code").fill("123456");
      await page.getByTestId("submit-otp").click();

      await expect(page).toHaveURL("/");
      await waitForAuthUi(page);

      await page.getByTestId("header-account-menu").click();
      await page.getByTestId("header-profile-button").click();

      await expect(page.getByTestId("profile-header-title")).toHaveText(username);
    } finally {
      await deleteTestUserByEmail(email);
    }
  });

  test("session cookie from testUtils authenticates and can logout", async ({
    context,
    page,
  }) => {
    const user = await loginAsTestUser(context);

    try {
      await page.goto("/");
      await expect(page.getByTestId("header-account-menu")).toBeVisible();
      await page.getByTestId("header-account-menu").click();
      await page.getByTestId("header-profile-button").click();
      await expect(page.getByTestId("profile-header-title")).toHaveText(
        user.username,
      );

      await page.getByTestId("header-account-menu").click();
      await page.getByTestId("header-logout-button").click();
      await expect(page).toHaveURL("/");
      await expect(page.getByTestId("header-signup-button")).toBeVisible();
    } finally {
      await deleteTestUser(user.id);
    }
  });
});
