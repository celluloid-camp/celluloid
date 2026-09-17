import { expect, test, type Locator, type Page } from "@playwright/test";
import { createTestUser, deleteTestUser } from "./helpers/auth";
import { E2E_OTP } from "./helpers/constants";

/**
 * Auth forms are often mounted twice (page + intercepting @modal).
 * Prefer the open dialog when present.
 */
function authForm(page: Page): Locator {
  const dialog = page.getByRole("dialog");
  return dialog.or(page.locator("form").filter({ has: page.getByTestId("submit") }));
}

test.describe("password reset", () => {
  test("forgot password flow resets password and signs in", async ({
    page,
  }) => {
    const user = await createTestUser({ password: "oldpassword" });
    const newPassword = "newpassword";

    try {
      await page.goto("/");
      await page.getByTestId("header-login-button").click();
      await expect(page.getByRole("dialog")).toBeVisible();

      const login = page.getByRole("dialog");
      await login.getByTestId("forgot-button").click();
      await expect(page).toHaveURL(/.*\/forgot/);

      const forgot = authForm(page);
      await forgot.getByTestId("email").fill(user.email);
      await forgot.getByTestId("submit").click();
      await expect(page).toHaveURL(/\/recover/);

      const recover = authForm(page);
      await expect(recover.getByTestId("email")).toHaveValue(user.email);
      await recover.getByTestId("code").fill(E2E_OTP);
      await recover.getByTestId("password").fill(newPassword);
      await recover.getByTestId("passwordConfirmation").fill(newPassword);
      await recover.getByTestId("submit").click();

      await expect(page).toHaveURL("/");
      await expect(page.getByTestId("header-account-menu")).toBeVisible();

      await page.getByTestId("header-account-menu").click();
      await page.getByTestId("header-logout-button").click();
      await expect(page.getByTestId("header-signup-button")).toBeVisible();

      await page.getByTestId("header-login-button").click();
      await expect(page.getByRole("dialog")).toBeVisible();
      const relogin = page.getByRole("dialog");
      await relogin.getByTestId("username").fill(user.email);
      await relogin.getByTestId("password").fill(newPassword);
      await relogin.getByTestId("submit").click();
      await expect(page.getByTestId("header-account-menu")).toBeVisible();
    } finally {
      await deleteTestUser(user.id);
    }
  });
});
