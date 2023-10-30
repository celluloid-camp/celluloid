import { expect, test } from '@playwright/test';

test('test signin with existing account', async ({ page }) => {


  await page.goto('http://localhost:3000/');
  await page.getByTestId('header-login-button').click();
  await expect(page).toHaveURL(/.*\/login/);

  await page.getByTestId('username').click();
  await page.getByTestId('username').fill('test@server.com');
  await page.getByTestId('username').press('Tab');
  await page.getByTestId('password').fill('testtest');
  await page.getByTestId('submit').click();

  // await page.getByTestId('header-account-menu').click();
  // await page.getByTestId('header-profile-button').click();

  // await expect(page.getByTestId('profile-header-title')).toHaveText("test@server.com");

});
