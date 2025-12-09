import { expect, Page, test } from "@playwright/test";

const randomNum = Math.floor(Math.random() * 10000);
const TEST_USERNANE = `test${randomNum}`;
const TEST_USER_EMAIL = `${TEST_USERNANE}@server.com`;

test.describe("signup", () => {
  test("test user signup", async ({ page }) => {
    // Navigate directly to the signup page
    await page.goto("http://localhost:3000/signup");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(/.*\/signup/);

    await page.getByTestId("username").click();
    await page.getByTestId("username").fill(TEST_USERNANE);
    await page.getByTestId("email").click();
    await page.getByTestId("email").fill(TEST_USER_EMAIL);
    await page.getByTestId("password").click();
    await page.getByTestId("password").fill("testtest");
    await page.getByTestId("passwordConfirmation").click();
    await page.getByTestId("passwordConfirmation").fill("testtest");

    await page.getByTestId("submit").click();

    await expect(page).toHaveURL(/.*\/otp/);

    await page.getByTestId("code").click();
    await page.getByTestId("code").fill("0000");
    await page.getByTestId("submit").click();

    await expect(page).toHaveURL("http://localhost:3000/");

    await page.getByTestId("header-account-menu").click();
    await page.getByTestId("header-profile-button").click();

    await expect(page.getByTestId("profile-header-title")).toHaveText(
      TEST_USERNANE,
    );
  });

  test("test reconnect with existing account without confirmation", async ({
    page,
  }) => {
    await page.goto("http://localhost:3000/login");
    await page.waitForLoadState("networkidle");

    await page.getByTestId("username").click();
    await page.getByTestId("username").fill(TEST_USER_EMAIL);
    await page.getByTestId("username").press("Tab");
    await page.getByTestId("password").fill("testtest");
    await page.getByTestId("submit").click();

    // Wait for successful login and navigation
    await page.waitForURL("http://localhost:3000/", {timeout: 10000});

    await page.getByTestId("header-account-menu").click();
    await page.getByTestId("header-logout-button").click();

    await expect(page).toHaveURL("http://localhost:3000/");
  });
});
