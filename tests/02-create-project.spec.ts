import { expect, test } from '@playwright/test';

test.fixme('test create project without authentification', async ({ page }) => {
  await page.goto('http://localhost:3000/');

  await page.getByTestId('create').click();
  await expect(page).toHaveURL(/.*\/create/);

  await page.getByTestId('url').click();
  await page.getByTestId('url').fill('https://celluloid-media.huma-num.fr/w/aV6nSKeXYsTe6jJ8BLb8Zg');

  await page.getByTestId('url').press('Enter');

  await page.getByTestId('submit-url').click();

  await page.getByTestId('title').click();
  await page.getByTestId('title').fill('test-title');

  await page.getByTestId('description').click();
  await page.getByTestId('description').fill('test');
  await page.getByTestId('description').fill('test-description');

  await page.getByTestId('keywords').click();
  await page.getByTestId('keywords').fill('test');
  await page.getByTestId('keywords').press('Enter');

  await page.getByTestId('public-switch').getByRole('checkbox').check();
  await page.getByTestId('collaborative-switch').getByRole('checkbox').check();
  // try to submit the form without autentification
  await page.getByTestId('submit').click();
  await expect(page).toHaveURL(/.*\/login/);

  // should pop signup dialog
  await page.getByTestId('signup').click();
  await expect(page).toHaveURL(/.*\/signup/);


  await page.getByTestId('username').click();
  await page.getByTestId('username').fill('test6');

  await page.getByTestId('email').click();
  await page.getByTestId('email').fill('test6@server.com');

  await page.getByTestId('password').click();
  await page.getByTestId('password').fill('testtest');

  await page.getByTestId('passwordConfirmation').click();
  await page.getByTestId('passwordConfirmation').fill('testtest');

  await page.getByTestId('submit').click();
  await expect(page).toHaveURL(/.*\/confirm/);

  await page.getByTestId('code').click();
  await page.getByTestId('code').fill('0000');
  await page.getByTestId('submit').click();

  await expect(page).toHaveURL(/.*\/create/);

  await page.getByTestId('submit').click();
});
