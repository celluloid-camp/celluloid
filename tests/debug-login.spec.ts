import { test } from "@playwright/test";

test("debug login page", async ({ page }) => {
  await page.goto("http://localhost:3000/login");
  await page.waitForLoadState("networkidle");
  
  // Take screenshot
  await page.screenshot({ path: "/tmp/login-page.png", fullPage: true });
  
  // Get all test ids on page
  const testIds = await page.locator('[data-testid]').evaluateAll(
    (elements) => elements.map(el => el.getAttribute('data-testid'))
  );
  console.log("All test IDs on login page:", testIds);
});
