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

test('TC-F01: User can Select filter', async ({ page }) => {
  await page.goto('https://amazing-gingersnap-d4b59a.netlify.app/SignIn');
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('shinshinakrit@gmail.com');
  await page.getByRole('textbox', { name: 'Email' }).press('Tab');
  await page.getByRole('textbox', { name: 'Password' }).fill('12345678');
  await page.locator('div').filter({ hasText: /^Sign in$/ }).first().click();
  await page.getByRole('button', { name: '➕' }).click();
  await page.getByText('🎚️').click();
  await page.getByText('Culture').first().click();
  await page.getByText('Confirm').click();
  await page.getByText('Santorini').nth(2).click();
  await page.screenshot({
    path: 'test-results/TC-F01_User_can_Select_filter.png',
    fullPage: true,
  });
});

test('TC-F02: User can Select multiple filters', async ({ page }) => {
  await page.goto('https://amazing-gingersnap-d4b59a.netlify.app/SignIn');
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('shinshinakrit@gmail.com');
  await page.getByRole('textbox', { name: 'Email' }).press('Tab');
  await page.getByRole('textbox', { name: 'Password' }).fill('12345678');
  await page.locator('div').filter({ hasText: /^Sign in$/ }).first().click();
  await page.getByRole('button', { name: '➕' }).click();
  await page.getByText('🎚️').click();
  await page.getByText('Adventure').first().click();
  await page.locator('div').filter({ hasText: /^Culture$/ }).first().click();
  await page.getByRole('slider').click();
  await page.locator('div').filter({ hasText: /^Confirm$/ }).first().click();
  await page.getByText('Machu Picchu').nth(1).click();
  await page.screenshot({
    path: 'test-results/TC-F02_User_can_Select_multiple_filters.png',
    fullPage: true,
  });
});

test('TC-F03: The Selected Filter are not matching any place', async ({ page }) => {
  await page.goto('https://amazing-gingersnap-d4b59a.netlify.app/SignIn');
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('shinshinakrit@gmail.com');
  await page.getByRole('textbox', { name: 'Email' }).press('Tab');
  await page.getByRole('textbox', { name: 'Password' }).fill('12345678');
  await page.locator('div').filter({ hasText: /^Sign in$/ }).first().click();
  await page.getByRole('button', { name: '➕' }).click();
  await page.getByText('🎚️').click();
  await page.getByText('Luxury').first().click();
  await page.getByText('History').click();
  await page.getByText('Wildlife').click();
  await page.getByRole('slider').click();
  await page.locator('div').filter({ hasText: /^Confirm$/ }).first().click();
  await page.getByText('No more places!').click();
  await page.screenshot({
    path: 'test-results/TC-F03_The_Selected_Filter_are_not_matching_any_place.png',
    fullPage: true,
  });
});

test('TC-F04: Measure response', async ({ page }) => {
  await page.goto('https://amazing-gingersnap-d4b59a.netlify.app/SignIn');
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('shinshinakrit@gmail.com');
  await page.getByRole('textbox', { name: 'Email' }).press('Tab');
  await page.getByRole('textbox', { name: 'Password' }).fill('12345678');
  await page.locator('div').filter({ hasText: /^Sign in$/ }).first().click();
  await page.getByRole('button', { name: '➕' }).click();
  await page.getByText('🎚️').click();
  await page.getByText('Culture').first().click();
  await page.getByText('Confirm').click();
  await page.getByText('Santorini').nth(2).click();
  await page.screenshot({
    path: 'test-results/TC-F04_Measure_response.png',
    fullPage: true,
  });
});

test('TC-F05: User can clear the filter', async ({ page }) => {
  await page.goto('https://amazing-gingersnap-d4b59a.netlify.app/SignIn');
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('shinshinakrit@gmail.com');
  await page.getByRole('textbox', { name: 'Email' }).press('Tab');
  await page.getByRole('textbox', { name: 'Password' }).fill('12345678');
  await page.locator('div').filter({ hasText: /^Sign in$/ }).first().click();
  await page.getByRole('button', { name: '➕' }).click();
  await page.getByText('🎚️').click();
  await page.getByText('Culture').first().click();
  await page.getByText('Confirm').click();
  await page.getByText('Santorini').nth(2).click();
  await page.getByText('🎚️').click();
  await page.locator('div').filter({ hasText: /^Clear All$/ }).first().click();
  await page.getByText('Mount Fuji').nth(1).click();
  await page.screenshot({
    path: 'test-results/TC-F05_User_can_clear_the_filter.png',
    fullPage: true,
  });
});
