import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runDemo() {
  const screenshotDir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  console.log('🚀 Starting NyayBot Hackathon Demo Suite...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2, // High-res for slides
  });
  const page = await context.newPage();

  // 1. Load App (Light Mode default)
  await page.goto('http://localhost:5174');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(screenshotDir, '01_porcelain_light_home.png') });
  console.log('✅ Captured: Porcelain Light Home');

  // 2. Open Mode Selector
  await page.click('.mode-trigger-btn');
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(screenshotDir, '02_mode_dropdown_open.png') });
  console.log('✅ Captured: Mode Dropdown Open');

  // 3. Switch to Advanced Mode
  await page.click('.mode-option.advanced');
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(screenshotDir, '03_advanced_mode_active.png') });
  console.log('✅ Captured: Advanced Mode Selection');

  // 4. Switch to Deep Mode
  await page.click('.mode-trigger-btn');
  await page.click('.mode-option.deep');
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(screenshotDir, '04_deep_mode_active.png') });
  console.log('✅ Captured: Deep Mode Selection');

  // 5. Switch to Dark Mode (Midnight Navy)
  // Assuming there is a theme toggle. If not, we'll try to find the button or just capture the current state.
  // Many apps use [data-theme="dark"] on body.
  const themeToggle = await page.$('.theme-toggle'); // Adjust if you have a specific selector
  if (themeToggle) {
    await themeToggle.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(screenshotDir, '05_midnight_navy_chat.png') });
    console.log('✅ Captured: Midnight Navy Theme');
  }

  // 6. Open Login Modal (Show Encryption)
  await page.click('.auth-btn, .login-btn, #person-icon-id'); // Try common selectors
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(screenshotDir, '06_secure_login_modal.png') });
  console.log('✅ Captured: Secure Login Modal');

  console.log('\n✨ Demo Suite Complete! Assets saved in: hackathon_demo/screenshots/');
  await browser.close();
}

runDemo().catch(console.error);
