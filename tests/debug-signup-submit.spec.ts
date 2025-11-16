import { test } from "@playwright/test";

const randomNum = Math.floor(Math.random() * 10000);
const TEST_USERNAME = `test${randomNum}`;
const TEST_USER_EMAIL = `${TEST_USERNAME}@server.com`;

test("debug signup submission", async ({ page }) => {
  await page.goto("http://localhost:3000/signup");
  await page.waitForLoadState("networkidle");
  
  await page.getByTestId("username").fill(TEST_USERNAME);
  await page.getByTestId("email").fill(TEST_USER_EMAIL);
  await page.getByTestId("password").fill("testtest");
  await page.getByTestId("passwordConfirmation").fill("testtest");
  await page.getByTestId("submit").click();
  
  // Wait a bit for the navigation
  await page.waitForTimeout(3000);
  
  console.log("Current URL after submission:", page.url());
  
  // Take screenshot
  await page.screenshot({ path: "/tmp/after-signup.png", fullPage: true });
});
