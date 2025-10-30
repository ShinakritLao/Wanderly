# E2E_Setup_Log.md

## Tool Choice
**Tool:** Playwright  
**Rationale:**  
We selected Playwright because our project includes both a **web app** and a **mobile version**.  
Playwright allows testing of **real browser interactions** (like Google Sign-In OAuth), supports **mobile viewport simulation**, and integrates easily with CI/CD.  
It’s faster to configure compared to Appium and supports advanced flows like **redirects, swipes, and drag actions**, which are essential for our swipe and login features.

## Installation Commands
```bash
npm install -D @playwright/test
npx playwright install
npx playwright test --ui
