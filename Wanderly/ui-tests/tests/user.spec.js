
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

test('TC-U01: User can view profile', async ({ page }) => {
  // Step 1: Open the web app
  await page.goto('https://amazing-gingersnap-d4b59a.netlify.app/SignIn');
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('shinshinakrit@gmail.com');
  await page.getByRole('textbox', { name: 'Email' }).press('Tab');
  await page.getByRole('textbox', { name: 'Password' }).fill('12345678');
  await page.locator('div').filter({ hasText: /^Sign in$/ }).first().click();
  await page.getByRole('button', { name: '👤' }).click();
  await page.getByText('Log out').click();
  await page.screenshot({
    path: 'test-results/TC-U01_User_can_view_profile.png',
    fullPage: true,
  });
});

test('TC-U02: User cant access profile page without logging in', async ({ page }) => {
  // Step 1: Open the web app
  await page.goto('https://amazing-gingersnap-d4b59a.netlify.app/MainTabs/Profile');
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.screenshot({
    path: 'test-results/TC-U02_User_cant_access_profile_page_without_logging_in.png',
    fullPage: true,
  });
});

test('TC-U03: User can edit profile name', async ({ page }) => {
  // Step 1: Open the web app
  await page.goto('https://amazing-gingersnap-d4b59a.netlify.app/SignIn');
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('shinshinakrit@gmail.com');
  await page.getByRole('textbox', { name: 'Email' }).press('Tab');
  await page.getByRole('textbox', { name: 'Password' }).fill('12345678');
  await page.locator('div').filter({ hasText: /^Sign in$/ }).first().click();
  await page.getByRole('button', { name: '👤' }).click();
  await page.getByText('✏️').click();
  await page.getByRole('textbox', { name: 'Enter your name' }).click();
  await page.getByRole('textbox', { name: 'Enter your name' }).fill('fasafasd');
  await page.locator('div').filter({ hasText: /^Save$/ }).first().click();
  await page.screenshot({
    path: 'test-results/TC-U03_User_can_edit_profile_name.png',
    fullPage: true,
  });
});

test('TC-U04: User can edit profile picture', async ({ page }) => {
  // Step 1: Open the web app
  await page.goto('https://amazing-gingersnap-d4b59a.netlify.app/SignIn');
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('shinshinakrit@gmail.com');
  await page.getByRole('textbox', { name: 'Email' }).press('Tab');
  await page.getByRole('textbox', { name: 'Password' }).fill('12345678');
  await page.locator('div').filter({ hasText: /^Sign in$/ }).first().click();
  await page.getByRole('button', { name: '👤' }).click();
  await page.locator('.css-g5y9jx.r-1i6wzkk.r-lrvibr.r-1loqt21.r-1otgn73.r-1awozwy > .css-g5y9jx.r-1mlwlqe > .css-g5y9jx').click();
  // Wait for the file input to appear and set the file from the Picture folder
  await page.setInputFiles('input[type="file"]', filePath);
  await page.screenshot({
    path: 'test-results/TC-U04_User_can_edit_profile_picture.png',
    fullPage: true,
  });
});

test('TC-U06: User cant use a name with emoji', async ({ page }) => {
  // Step 1: Open the web app
  await page.goto('https://amazing-gingersnap-d4b59a.netlify.app/SignIn');
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('shinshinakrit@gmail.com');
  await page.getByRole('textbox', { name: 'Email' }).press('Tab');
  await page.getByRole('textbox', { name: 'Password' }).fill('12345678');
  await page.locator('div').filter({ hasText: /^Sign in$/ }).first().click();
  await page.getByRole('button', { name: '👤' }).click();
  await page.getByText('✏️').click();
  await page.getByRole('textbox', { name: 'Enter your name' }).click();
  await page.getByRole('textbox', { name: 'Enter your name' }).fill('👤');
  await page.locator('div').filter({ hasText: /^Save$/ }).first().click();
  await page.screenshot({
    path: 'test-results/TC-U06_User_cant_use_name_with_emoji.png',
    fullPage: true,
  });
});

test('TC-U07: User cant change an email', async ({ page }) => {
  // Step 1: Open the web app
  await page.goto('https://amazing-gingersnap-d4b59a.netlify.app/SignIn');
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('shinshinakrit@gmail.com');
  await page.getByRole('textbox', { name: 'Email' }).press('Tab');
  await page.getByRole('textbox', { name: 'Password' }).fill('12345678');
  await page.locator('div').filter({ hasText: /^Sign in$/ }).first().click();
  await page.getByRole('button', { name: '👤' }).click();
  await page.getByText('✏️').click();
  await page.getByRole('dialog').getByText('No email').click();
  await page.getByText('Email cannot be changed').click();
  await page.screenshot({
    path: 'test-results/TC-U07_User_cant_change_email.png',
    fullPage: true,
  });
});