import { expect, test } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.getByTestId('create').click();
  await page.getByPlaceholder('Ajoutez un lien vers une vidéo PeerTube...').click();
  await page.getByPlaceholder('Ajoutez un lien vers une vidéo PeerTube...').fill('https://celluloid-media.huma-num.fr/w/aV6nSKeXYsTe6jJ8BLb8Zg');
  await page.getByPlaceholder('Ajoutez un lien vers une vidéo PeerTube...').press('Enter');
  await page.getByLabel('Titre').click();
  await page.getByLabel('Titre').fill('test');
  await page.getByLabel('Description').click();
  await page.getByLabel('Description').fill('test');
  await page.getByLabel('Titre').click();
  await page.getByLabel('Titre').fill('test-title');
  await page.getByLabel('Description').click();
  await page.getByLabel('Description').fill('test-description');
  await page.getByLabel('Mots clés').click();
  await page.getByTestId('keywords').getByLabel('Mots clés').fill('test');
  await page.getByTestId('keywords').getByLabel('Mots clés').press('Enter');
  await page.getByTestId('public-switch').getByRole('checkbox').check();
  await page.getByTestId('collaborative-switch').getByRole('checkbox').check();
  await page.getByTestId('submit').click();
  await page.getByTestId('signup').click();
  await page.getByPlaceholder('Email ou nom d\'utilisateur').click();
  await page.getByPlaceholder('Email ou nom d\'utilisateur').fill('test6');
  await page.getByPlaceholder('Adresse email').click();
  await page.getByPlaceholder('Adresse email').fill('test6@server.com');
  await page.getByPlaceholder('Adresse email').press('Tab');
  await page.getByPlaceholder('Mot de passe', { exact: true }).fill('testtest');
  await page.getByPlaceholder('Mot de passe', { exact: true }).press('Tab');
  await page.getByPlaceholder('Confirmer le mot de passe').fill('testtest');
  await page.getByTestId('submit').click();
  await page.goto('http://localhost:3000/confirm?email=test6@server.com');
  await page.getByPlaceholder('Code de confirmation').click();
  await page.getByPlaceholder('Code de confirmation').fill('0000');
  await page.getByTestId('submit').click();
  await page.getByTestId('submit').click();
});
