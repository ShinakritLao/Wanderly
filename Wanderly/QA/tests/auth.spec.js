// tests/e2e/auth_valid_login.spec.js
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

test('E2E-001: User logs in with valid credentials', async ({ page }) => {
  // Step 1: Open the web app
  await page.goto('http://localhost:8081');

  // Step 2: Wait for email input and fill it
  const emailField = page.locator('input[placeholder="Email"]');
  await emailField.waitFor({ state: 'visible', timeout: 10000 });
  await emailField.fill('shinshinakrit@gmail.com');

  // Step 3: Fill password input
  const passwordField = page.locator('input[placeholder="Password"]');
  await passwordField.fill('12345678');

  // Step 4: Locate and click the "Sign in" button
  const googleSignInButton = page.getByText('Sign in', { exact: true });
  await googleSignInButton.waitFor({ state: 'visible', timeout: 10000 });
  await googleSignInButton.click();

  // Step 5: Wait for dashboard redirect
  await page.waitForSelector('text=Dashboard', { timeout: 20000 });

  // Step 6: Screenshot for report
  await page.screenshot({
    path: 'test-results/E2E-001_valid_login.png',
    fullPage: true,
  });
});


test('E2E-002: User cannot log in with invalid password', async ({ page }) => {
    // Step 1: Open the web app
  await page.goto('http://localhost:8081');

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
  const errorMessage = page.locator('text=No account found with this email or incorrect password.');
  await expect(errorMessage).toBeVisible({ timeout: 10000 });

  // Step 6: Screenshot for report
  await page.screenshot({
    path: 'test-results/E2E-002_Invalid_login.png',
    fullPage: true,
  });
});

test('E2E-003: User cannot log in with empty fields', async ({ page }) => {
  // Step 1: Open the web app
  await page.goto('http://localhost:8081');

  // Step 2: Locate and click the "Sign in" button
  const googleSignInButton = page.getByText('Sign in', { exact: true });
  await googleSignInButton.waitFor({ state: 'visible', timeout: 10000 });
  await googleSignInButton.click();

  // Step 3: Wait for dashboard redirect
  const errorMessage = page.locator('text=Please fill in both email and password.');
  await expect(errorMessage).toBeVisible({ timeout: 10000 });

  // Step 4: Screenshot for report
  await page.screenshot({
    path: 'test-results/E2E-003_Empty_field_login.png',
    fullPage: true,
  });
});

test('E2E-004: User can log out successfully', async ({ page }) => {
  // Step 1: Open the web app
  await page.goto('http://localhost:8081');

  // Step 2: Wait for email input and fill it
  const emailField = page.locator('input[placeholder="Email"]');
  await emailField.waitFor({ state: 'visible', timeout: 10000 });
  await emailField.fill('shinshinakrit@gmail.com');

  // Step 3: Fill password input
  const passwordField = page.locator('input[placeholder="Password"]');
  await passwordField.fill('12345678');

  // Step 4: Locate and click the "Sign in" button
  const googleSignInButton = page.getByText('Sign in', { exact: true });
  await googleSignInButton.waitFor({ state: 'visible', timeout: 10000 });
  await googleSignInButton.click();

  // Step 5: Wait for dashboard redirect
  await page.waitForSelector('text=Dashboard', { timeout: 20000 });

  // Step 6: Click the Logout button
  const logoutButton = page.getByText('Logout', { exact: true });
  await logoutButton.waitFor({ state: 'visible', timeout: 10000 });
  await logoutButton.click();

  // Step 7: Wait for redirect to login/home page
  const loginPage = page.locator('input[placeholder="Email"]');
  await expect(loginPage).toBeVisible({ timeout: 10000 });

  // Step 8: Screenshot for report
  await page.screenshot({
    path: 'test-results/E2E-004_logout.png',
    fullPage: true,
  });
});
