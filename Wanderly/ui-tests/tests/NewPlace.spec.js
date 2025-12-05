  import { test, expect } from '@playwright/test';
  const path = require('path');
  const filePath = path.join(__dirname, '../Picture/imagemango.png');
  
  async function mockLogin(page) {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('authToken', 'mock-jwt-token-here');
      localStorage.setItem('userId', 'mock-user-id');
      localStorage.setItem('userEmail', 'shinshinakrit@gmail.com');
      localStorage.setItem('password', '12345678');
    });
  
  }

test('TC-P01: User can add new place', async ({ page }) => {
  await page.goto('https://amazing-gingersnap-d4b59a.netlify.app/SignIn');
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('shinshinakrit@gmail.com');
  await page.getByRole('textbox', { name: 'Email' }).press('Tab');
  await page.getByRole('textbox', { name: 'Password' }).fill('12345678');
  await page.locator('div').filter({ hasText: /^Sign in$/ }).first().click();
  await page.getByRole('button', { name: '🚩' }).click();
  await page.getByRole('textbox', { name: 'e.g. Hidden Beach' }).click();
  await page.getByRole('textbox', { name: 'e.g. Hidden Beach' }).fill('Mango Land');
  await page.getByRole('textbox', { name: 'City, Country' }).click();
  await page.getByRole('textbox', { name: 'City, Country' }).fill('Bangkok,Thailand');
  await page.locator('div').filter({ hasText: /^Upload from device$/ }).first().click();
  await page.setInputFiles('input[type="file"]', filePath);
  await page.getByRole('textbox', { name: 'Tell us about this place...' }).click();
  await page.getByRole('textbox', { name: 'Tell us about this place...' }).fill('This place is full of mango and you should try it.');
  await page.locator('div').filter({ hasText: /^Submit$/ }).first().click();
  await page.getByText('Yes').click();
  await page.getByText('Mango Land').click();
  await page.screenshot({
    path: 'test-results/TC-P01_User_can_create_a_poll.png',
    fullPage: true,
  });
});

test('TC-P02: User can not add new place with empty field', async ({ page }) => {
  await page.goto('https://amazing-gingersnap-d4b59a.netlify.app/SignIn');
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('shinshinakrit@gmail.com');
  await page.getByRole('textbox', { name: 'Email' }).press('Tab');
  await page.getByRole('textbox', { name: 'Password' }).fill('12345678');
  await page.locator('div').filter({ hasText: /^Sign in$/ }).first().click();
  await page.getByRole('button', { name: '🚩' }).click();
  await page.getByRole('textbox', { name: 'e.g. Hidden Beach' }).click();
  await page.getByRole('textbox', { name: 'e.g. Hidden Beach' }).fill('Mango Land');
  await page.getByRole('textbox', { name: 'City, Country' }).click();
  await page.locator('div').filter({ hasText: /^Upload from device$/ }).first().click();
  await page.setInputFiles('input[type="file"]', filePath);
  await page.getByRole('textbox', { name: 'Tell us about this place...' }).click();
  await page.locator('div').filter({ hasText: /^Submit$/ }).first().click();
  await page.screenshot({
    path: 'test-results/TC-P02_User_can_not_add_new_place_with_empty_field.png',
    fullPage: true,
  });
});

test('TC-P04: Admin approval', async ({ page }) => {
  await page.goto('https://amazing-gingersnap-d4b59a.netlify.app/SignIn');
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('shinshinakrit@gmail.com');
  await page.getByRole('textbox', { name: 'Email' }).press('Tab');
  await page.getByRole('textbox', { name: 'Password' }).fill('12345678');
  await page.locator('div').filter({ hasText: /^Sign in$/ }).first().click();
  await page.getByRole('button', { name: '🚩' }).click();
  await page.getByRole('textbox', { name: 'e.g. Hidden Beach' }).click();
  await page.getByRole('textbox', { name: 'e.g. Hidden Beach' }).fill('Mango Land');
  await page.getByRole('textbox', { name: 'City, Country' }).click();
  await page.getByRole('textbox', { name: 'City, Country' }).fill('Bangkok,Thailand');
  await page.locator('div').filter({ hasText: /^Upload from device$/ }).first().click();
  await page.setInputFiles('input[type="file"]', filePath);
  await page.getByRole('textbox', { name: 'Tell us about this place...' }).click();
  await page.getByRole('textbox', { name: 'Tell us about this place...' }).fill('This place is full of mango and you should try it.');
  await page.locator('div').filter({ hasText: /^Submit$/ }).first().click();
  await page.getByText('Yes').click();
  await page.getByText('Mango Land').click();
  await page.screenshot({
    path: 'test-results/TC-P04_Admin_approval.png',
    fullPage: true,
  });
});

test('TC-P05: Admin Reject', async ({ page }) => {
  await page.goto('https://amazing-gingersnap-d4b59a.netlify.app/SignIn');
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('shinshinakrit@gmail.com');
  await page.getByRole('textbox', { name: 'Email' }).press('Tab');
  await page.getByRole('textbox', { name: 'Password' }).fill('12345678');
  await page.locator('div').filter({ hasText: /^Sign in$/ }).first().click();
  await page.getByRole('button', { name: '🚩' }).click();
  await page.getByRole('textbox', { name: 'e.g. Hidden Beach' }).click();
  await page.getByRole('textbox', { name: 'e.g. Hidden Beach' }).fill('Mango Land');
  await page.getByRole('textbox', { name: 'City, Country' }).click();
  await page.getByRole('textbox', { name: 'City, Country' }).fill('Bangkok,Thailand');
  await page.locator('div').filter({ hasText: /^Upload from device$/ }).first().click();
  await page.setInputFiles('input[type="file"]', filePath);
  await page.getByRole('textbox', { name: 'Tell us about this place...' }).click();
  await page.getByRole('textbox', { name: 'Tell us about this place...' }).fill('This place is full of mango and you should try it.');
  await page.locator('div').filter({ hasText: /^Submit$/ }).first().click();
  await page.getByText('No', { exact: true }).click();
  await page.screenshot({
    path: 'test-results/TC-P05_Admin_Reject.png',
    fullPage: true,
  });
});