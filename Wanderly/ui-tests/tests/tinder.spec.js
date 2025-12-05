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

test('TC-S01: User can Swipe right', async ({ page }) => {
  await page.goto('https://amazing-gingersnap-d4b59a.netlify.app/SignIn');
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('shinshinakrit@gmail.com');
  await page.getByRole('textbox', { name: 'Email' }).press('Tab');
  await page.getByRole('textbox', { name: 'Password' }).fill('12345678');
  await page.locator('div').filter({ hasText: /^Sign in$/ }).first().click();
  await page.getByRole('button', { name: '➕' }).click();
  await page.getByText('💚').nth(1).click();
  await page.getByRole('button', { name: '⭐' }).click();
  await page.getByText('Mount Fuji').nth(1).click();
  await page.screenshot({
    path: 'test-results/TC-S01_User_can_Swipe_right.png',
    fullPage: true,
  });
});

test('TC-S02: User can Swipe left', async ({ page }) => {
  await page.goto('https://amazing-gingersnap-d4b59a.netlify.app/SignIn');
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('shinshinakrit@gmail.com');
  await page.getByRole('textbox', { name: 'Email' }).press('Tab');
  await page.getByRole('textbox', { name: 'Password' }).fill('12345678');
  await page.locator('div').filter({ hasText: /^Sign in$/ }).first().click();
  await page.getByRole('button', { name: '➕' }).click();
  await page.getByText('❌').nth(1).click();
  await page.getByRole('button', { name: '⭐' }).click();
  await page.getByText('No favorites yet').click();
  await page.screenshot({
    path: 'test-results/TC-S02_User_can_Swipe_left.png',
    fullPage: true,
  });
});

test('TC-S03: User can Swipe card multiple times', async ({ page }) => {
  await page.goto('https://amazing-gingersnap-d4b59a.netlify.app/SignIn');
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('shinshinakrit@gmail.com');
  await page.getByRole('textbox', { name: 'Email' }).press('Tab');
  await page.getByRole('textbox', { name: 'Password' }).fill('12345678');
  await page.locator('div').filter({ hasText: /^Sign in$/ }).first().click();
  await page.getByRole('button', { name: '➕' }).click();
  await page.getByText('💚').nth(1).click();
  await page.waitForTimeout(3000);
  await page.getByText('💚').nth(1).click();
  await page.waitForTimeout(3000);
  await page.getByText('💚').nth(1).click();
  await page.getByRole('button', { name: '⭐' }).click();
  await page.getByText('Mount Fuji').nth(1).click();
  await page.getByText('Santorini').nth(2).click(); 
  await page.screenshot({
    path: 'test-results/TC-S03_User_can_Swipe_card_multiple_times.png',
    fullPage: true,
  });
});

test('TC-S05: User can Reload page', async ({ page }) => {
  await page.goto('https://amazing-gingersnap-d4b59a.netlify.app/SignIn');
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('shinshinakrit@gmail.com');
  await page.getByRole('textbox', { name: 'Email' }).press('Tab');
  await page.getByRole('textbox', { name: 'Password' }).fill('12345678');
  await page.locator('div').filter({ hasText: /^Sign in$/ }).first().click();
  await page.getByRole('button', { name: '➕' }).click();
  await page.getByText('💚').nth(1).click();
  await page.getByRole('button', { name: '⭐' }).click();
  await page.getByText('Mount Fuji').nth(1).click();
  await page.goto('https://amazing-gingersnap-d4b59a.netlify.app/MainTabs/Home');
  await page.getByRole('button', { name: '⭐' }).click();
  await page.screenshot({
    path: 'test-results/TC-S05_User_can_Reload_page.png',
    fullPage: true,
  });
});

test('TC-S06: User can Remove item from Favorite page', async ({ page }) => {
  await page.goto('https://amazing-gingersnap-d4b59a.netlify.app/SignIn');
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('shinshinakrit@gmail.com');
  await page.getByRole('textbox', { name: 'Email' }).press('Tab');
  await page.getByRole('textbox', { name: 'Password' }).fill('12345678');
  await page.locator('div').filter({ hasText: /^Sign in$/ }).first().click();
  await page.getByRole('button', { name: '➕' }).click();
  await page.getByText('💚').nth(1).click();
  await page.getByRole('button', { name: '⭐' }).click();
  await page.getByText('Mount Fuji').nth(1).click();
  await page.goto('https://amazing-gingersnap-d4b59a.netlify.app/MainTabs/Home');
  await page.getByRole('button', { name: '⭐' }).click();
  await page.screenshot({
    path: 'test-results/TC-S06_User_can_Remove_item_from_Favorite_page.png',
    fullPage: true,
  });
});
