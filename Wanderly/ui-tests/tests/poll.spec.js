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

test('TC-P01: User can create a poll', async ({ page }) => {
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
  await page.getByRole('button', { name: '📁' }).click();
  await page.getByText('Create New➕').click();
  await page.locator('div').filter({ hasText: /^Mount Fuji$/ }).nth(3).click();
  await page.locator('div').filter({ hasText: /^Santorini$/ }).nth(3).click();
  await page.getByRole('textbox', { name: 'Enter folder name' }).click();
  await page.getByRole('textbox', { name: 'Enter folder name' }).fill('Atest');
  await page.getByText('Save Folder').click();
  await page.locator('.css-g5y9jx.r-18u37iz.r-156q2ks').click();
  await page.screenshot({
    path: 'test-results/TC-P01_User_can_create_a_poll.png',
    fullPage: true,
  });
});

test('TC-P02: User can access poll', async ({ page }) => {
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
  await page.getByRole('button', { name: '📁' }).click();
  await page.getByText('Create New➕').click();
  await page.locator('div').filter({ hasText: /^Mount Fuji$/ }).nth(3).click();
  await page.locator('div').filter({ hasText: /^Santorini$/ }).nth(3).click();
  await page.getByRole('textbox', { name: 'Enter folder name' }).click();
  await page.getByRole('textbox', { name: 'Enter folder name' }).fill('Atest');
  await page.getByText('Save Folder').click();
  await page.locator('.css-g5y9jx.r-18u37iz.r-156q2ks').click();
  await page.getByText('Open voting').click();
  await page.locator('div').filter({ hasText: /^Mount Fuji$/ }).nth(4).click();
  await page.locator('div').filter({ hasText: /^Vote$/ }).first().click();
  await page.getByText('Vote Result').click();
  await page.screenshot({
    path: 'test-results/TC-P02_User_can_access_poll.png',
    fullPage: true,
  });
});

test('TC-P04: User can vote', async ({ page }) => {
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
  await page.getByRole('button', { name: '📁' }).click();
  await page.getByText('Create New➕').click();
  await page.locator('div').filter({ hasText: /^Mount Fuji$/ }).nth(3).click();
  await page.locator('div').filter({ hasText: /^Santorini$/ }).nth(3).click();
  await page.getByRole('textbox', { name: 'Enter folder name' }).click();
  await page.getByRole('textbox', { name: 'Enter folder name' }).fill('Atest');
  await page.getByText('Save Folder').click();
  await page.locator('.css-g5y9jx.r-18u37iz.r-156q2ks').click();
  await page.getByText('Open voting').click();
  await page.locator('div').filter({ hasText: /^Mount Fuji$/ }).nth(4).click();
  await page.locator('div').filter({ hasText: /^Vote$/ }).first().click();
  await page.getByText('Vote Result').click();
  await page.screenshot({
    path: 'test-results/TC-P04-User_can_vote.png',
    fullPage: true,
  });
});

test('TC-P05: User cant vote multiple times', async ({ page }) => {
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
  await page.getByRole('button', { name: '📁' }).click();
  await page.getByText('Create New➕').click();
  await page.locator('div').filter({ hasText: /^Mount Fuji$/ }).nth(3).click();
  await page.locator('div').filter({ hasText: /^Santorini$/ }).nth(3).click();
  await page.getByRole('textbox', { name: 'Enter folder name' }).click();
  await page.getByRole('textbox', { name: 'Enter folder name' }).fill('Atest');
  await page.getByText('Save Folder').click();
  await page.locator('.css-g5y9jx.r-18u37iz.r-156q2ks').click();
  await page.getByText('Open voting').click();
  await page.locator('div').filter({ hasText: /^Mount Fuji$/ }).nth(4).click();
  await page.locator('div').filter({ hasText: /^Vote$/ }).first().click();
  await page.getByText('Vote Result').click();
  await page.screenshot({
    path: 'test-results/TC-P05-User_cant_vote_multiple_times.png',
    fullPage: true,
  });
});

test('TC-P06: Multiple User can vote', async ({ page }) => {
  await page.goto('https://wanderly-db.netlify.app/vote/58fe1cb4-6401-4264-9087-50286aa72d93');
  await page.getByText('Great Wall of China').click();
  await page.screenshot({
    path: 'test-results/TC-P06-Multiple_User_can_vote.png',
    fullPage: true,
  });
});

test('TC-P07: Invalid poll', async ({ page }) => {
  await page.goto('https://wanderly-db.netlify.app/vote/0682c056-7a69-4385-a177-c37af1673100');
  await page.getByText('This poll has ended.').click();
  await page.screenshot({
    path: 'test-results/TC-P07-Invalid_poll.png',
    fullPage: true,
  });
});