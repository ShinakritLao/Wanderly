import { test, expect } from '@playwright/test';

async function mockLogin(page) {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.setItem('authToken', 'mock-jwt-token-here');
    localStorage.setItem('userId', 'mock-user-id');
    localStorage.setItem('userEmail', 'shinshinakrit@gmail.com');
    localStorage.setItem('password', '12345678');
  });

}
test('TC-A04: Password less than 8 characters', async ({ page }) => {
  // Step 1: Open the web app
  await page.goto('https://amazing-gingersnap-d4b59a.netlify.app/');
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('shinshinakrit@gmail.com');
  await page.getByRole('textbox', { name: 'Email' }).press('Tab');
  await page.getByRole('textbox', { name: 'Password' }).fill('123456');
  // Step 2: Locate and click the "Sign in" button
  const googleSignInButton = page.getByText('Sign in', { exact: true });
  await googleSignInButton.waitFor({ state: 'visible', timeout: 10000 });
  await googleSignInButton.click();

  // Step 3: Wait
  const errorMessage = page.locator('text=Password must be at least 8 characters long.');
  await expect(errorMessage).toBeVisible({ timeout: 10000 });

  // Step 4: Screenshot for report
  await page.screenshot({
    path: 'test-results/TC-A04_Password_less_than_8_characters.png',
    fullPage: true,
  });
});

test('TC-A05: User can login successfully', async ({ page }) => {
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
    path: 'test-results/TC-A05_User_can_login_successfully.png',
    fullPage: true,
  });
});

test('TC-A06: User cannot log in with invalid password', async ({ page }) => {
    // Step 1: Open the web app
  await page.goto('https://amazing-gingersnap-d4b59a.netlify.app/');
  // Step 2: Wait for email input and fill it
  const emailField = page.locator('input[placeholder="Email"]');
  await emailField.waitFor({ state: 'visible', timeout: 10000 });
  await emailField.fill('shinshinakrit@gmail.com');

  // Step 3: Fill password input
  const passwordField = page.locator('input[placeholder="Password"]');
  await passwordField.fill('wrongpassword');

  // Step 4: Locate and click the "Sign in" button
  const googleSignInButton = page.getByText('Sign in', { exact: true });
  await googleSignInButton.waitFor({ state: 'visible', timeout: 10000 });
  await googleSignInButton.click();

  // Step 5: Wait for dashboard redirect
  const errorMessage = page.locator('text=Incorrect email or password.');
  await expect(errorMessage).toBeVisible({ timeout: 10000 });

  // Step 6: Screenshot for report
  await page.screenshot({
    path: 'test-results/TC-A06_User_cannot_log_in_with_invalid_password.png',
    fullPage: true,
  });
});


test('TC-A07: User cannot log in with empty fields', async ({ page }) => {
  // Step 1: Open the web app
  await page.goto('https://amazing-gingersnap-d4b59a.netlify.app/');
  // Step 2: Locate and click the "Sign in" button
  const googleSignInButton = page.getByText('Sign in', { exact: true });
  await googleSignInButton.waitFor({ state: 'visible', timeout: 10000 });
  await googleSignInButton.click();

  // Step 3: Wait for dashboard redirect
  const errorMessage = page.locator('text=Please fill in both email and password.');
  await expect(errorMessage).toBeVisible({ timeout: 10000 });

  // Step 4: Screenshot for report
  await page.screenshot({
    path: 'test-results/TC-A07_User_cannot_log_in_with_empty_fields.png',
    fullPage: true,
  });
});

test('TC-A08: User can log out successfully', async ({ page }) => {
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
    path: 'test-results/TC-A08_User_can_log_out_successfully.png',
    fullPage: true,
  });
});

