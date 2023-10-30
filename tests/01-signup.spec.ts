import { expect, test } from '@playwright/test';


const randomNum = Math.floor(Math.random() * 10000);
const TEST_USERNANE = `test${randomNum}`
const TEST_USER_EMAIL = `${TEST_USERNANE}@server.com`;

test('test signup', async ({ page }) => {
  await page.goto('http://127.0.0.1:3000/');
  await page.getByTestId('header-login-button').click();
  await page.getByTestId('signup').click();
  await expect(page).toHaveURL(/.*\/signup/);

  await page.getByTestId('username').click();
  await page.getByTestId('username').fill('test5');
  await page.getByTestId('email').click();
  await page.getByTestId('email').fill(TEST_USER_EMAIL);
  await page.getByTestId('password').click();
  await page.getByTestId('password').fill(TEST_USERNANE);
  await page.getByTestId('passwordConfirmation').click();
  await page.getByTestId('passwordConfirmation').fill('testtest');

  await page.getByTestId('submit').click();

  await expect(page).toHaveURL(/.*\/confirm/, { timeout: 5000 });

  await page.getByTestId('code').click();
  await page.getByTestId('code').fill('0000');
  await page.getByTestId('submit').click();

  await expect(page.getByTestId('profile-header-title')).toHaveText(TEST_USERNANE)

  await page.goto('http://127.0.0.1:3000/');

  await page.getByTestId('header-account-menu').click();
  await page.getByTestId('header-logout-button').click();

  await expect(page).toHaveURL('http://127.0.0.1:3000/');

});


test('test reconnect with existing account without confirmation', async ({ page }) => {


  await page.goto('http://127.0.0.1:3000/');
  await page.getByTestId('header-login-button').click();
  await expect(page).toHaveURL(/.*\/login/);

  await page.getByTestId('username').click();
  await page.getByTestId('username').fill(TEST_USER_EMAIL);
  await page.getByTestId('username').press('Tab');
  await page.getByTestId('password').fill('testtest');
  await page.getByTestId('submit').click();

  await expect(page).toHaveURL('http://127.0.0.1:3000/');

  await page.getByTestId('header-account-menu').click();
  await page.getByTestId('header-logout-button').click();

  await expect(page).toHaveURL('http://127.0.0.1:3000/');

});
