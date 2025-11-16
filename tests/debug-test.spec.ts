import { test } from "@playwright/test";

test("debug homepage", async ({ page }) => {
  await page.goto("http://localhost:3000/");
  await page.waitForLoadState("networkidle");
  
  // Take screenshot
  await page.screenshot({ path: "/tmp/homepage.png", fullPage: true });
  
  // Get page content
  const content = await page.content();
  console.log("Page has login button:", content.includes("header-login-button"));
  console.log("Page has signup button:", content.includes("header-signup-button"));
  
  // Try to find the button
  const loginButton = page.getByTestId("header-login-button");
  const isVisible = await loginButton.isVisible().catch(() => false);
  console.log("Login button visible:", isVisible);
  
  // Get all test ids on page
  const testIds = await page.locator('[data-testid]').evaluateAll(
    (elements) => elements.map(el => el.getAttribute('data-testid'))
  );
  console.log("All test IDs on page:", testIds);
});
