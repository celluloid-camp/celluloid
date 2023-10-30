import { expect, test } from '@playwright/test';

test('test signup', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.getByTestId('header-login-button').click();
  await page.getByTestId('signup').click();
  await expect(page).toHaveURL(/.*\/signup/);

  await page.getByTestId('username').click();
  await page.getByTestId('username').fill('test@server.com');
  await page.getByTestId('username').click();
  await page.getByTestId('username').fill('test5');
  await page.getByTestId('email').click();
  await page.getByTestId('email').fill('test@server.com');
  await page.getByTestId('password').click();
  await page.getByTestId('password').fill('testtest');
  await page.getByTestId('passwordConfirmation').click();
  await page.getByTestId('passwordConfirmation').fill('testtest');

  await page.getByTestId('submit').click();


  await page.getByTestId('code').click();
  await page.getByTestId('code').fill('0000');
  await page.getByTestId('submit').click();

  // await page.getByTestId('header-profile-button').click();
  // await page.getByRole('heading', { name: 'test5' }).click();
  // await page.getByText('test@server.com - Teacher').click();
});
