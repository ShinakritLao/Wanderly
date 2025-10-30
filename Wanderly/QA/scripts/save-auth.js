// scripts/save-auth.js
const { chromium } = require('playwright');   // CommonJS so run with node
const readline = require('readline');

(async () => {
  // Change appUrl if needed
  const appUrl = 'http://localhost:8081';
  // Launch a real Chrome browser (headed) so Google doesn't block
  const browser = await chromium.launch({ headless: false, channel: 'chrome' });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  console.log(`Opening ${appUrl} — please complete the Google sign-in in the browser window.`);
  await page.goto(appUrl);

  // Pause here until you press Enter in the terminal after completing manual login
  await waitForEnter('When you have finished logging in via the browser, press Enter here to save auth state...');

  // Save storage state (cookies + localStorage) to auth.json
  await context.storageState({ path: 'auth.json' });
  console.log('Saved auth.json to project root.');

  await browser.close();
  process.exit(0);
})().catch(err => { console.error(err); process.exit(1); });

function waitForEnter(promptText) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question(`${promptText}\n`, () => { rl.close(); resolve(); }));
}
