import { expect, Page, test } from '@playwright/test';


const randomNum = Math.floor(Math.random() * 10000);
const TEST_USERNANE = `test${randomNum}`
const TEST_USER_EMAIL = `${TEST_USERNANE}@server.com`;

let page: Page;
test.describe.configure({ mode: 'serial' });

test.beforeAll(async ({ browser }) => {
  page = await browser.newPage();
});

test.afterAll(async () => {
  await page.close();
});

test('test user signup', async () => {
  await page.goto('http://localhost:3000/');
  await page.getByTestId('header-login-button').click();
  await page.getByTestId('signup').click();
  await expect(page).toHaveURL(/.*\/signup/);

  await page.getByTestId('username').click();
  await page.getByTestId('username').fill(TEST_USERNANE);
  await page.getByTestId('email').click();
  await page.getByTestId('email').fill(TEST_USER_EMAIL);
  await page.getByTestId('password').click();
  await page.getByTestId('password').fill('testtest');
  await page.getByTestId('passwordConfirmation').click();
  await page.getByTestId('passwordConfirmation').fill('testtest');

  await page.getByTestId('submit').click();

  await expect(page).toHaveURL(/.*\/confirm/, { timeout: 15000 });

  await page.getByTestId('code').click();
  await page.getByTestId('code').fill('0000');
  await page.getByTestId('submit').click();

  await expect(page).toHaveURL('http://localhost:3000/', { timeout: 15000 });

  await page.getByTestId('header-account-menu').click();
  await page.getByTestId('header-profile-button').click();

  await expect(page.getByTestId('profile-header-title')).toHaveText(TEST_USERNANE)

});


test('test reconnect with existing account without confirmation', async () => {


  await page.reload();
  await page.goto('http://localhost:3000/login');

  await page.getByTestId('username').click();
  await page.getByTestId('username').fill(TEST_USER_EMAIL);
  await page.getByTestId('username').press('Tab');
  await page.getByTestId('password').fill('testtest');
  await page.getByTestId('submit').click();

  await expect(page).toHaveURL('http://localhost:3000/profile');

  await page.getByTestId('header-account-menu').click();
  await page.getByTestId('header-logout-button').click();

  await expect(page).toHaveURL('http://localhost:3000/');

});
