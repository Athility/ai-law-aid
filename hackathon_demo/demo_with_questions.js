import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runHackathonDemo() {
  const vaultDir = path.join(__dirname, 'presentation_vault');
  const dirs = {
    prompts: path.join(vaultDir, 'PROMPTS'),
    responses: path.join(vaultDir, 'RESPONSES'),
    indicators: path.join(vaultDir, 'MODE_INDICATORS')
  };

  // Ensure directories exist
  Object.values(dirs).forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  });

  console.log('🚀 Initiating NyayBot Hackathon Demo Script...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  await page.goto('http://localhost:5174');
  await page.waitForTimeout(2000);

  // SCENARIO 1: BASIC MODE
  console.log('⚡ Scenario 1: Basic Legal Awareness...');
  await page.click('.mode-trigger-btn');
  await page.click('.mode-option.basic');
  await page.type('.chat-input', 'What is Section 80C of the Income Tax Act?', { delay: 50 });
  await page.screenshot({ path: path.join(dirs.prompts, '01_basic_question.png') });
  await page.click('.send-btn');
  await page.waitForTimeout(4000); // Wait for response
  await page.screenshot({ path: path.join(dirs.responses, '02_basic_response.png') });

  // SCENARIO 2: ADVANCED MODE
  console.log('🔍 Scenario 2: Advanced Case Law Search...');
  await page.click('.mode-trigger-btn');
  await page.click('.mode-option.advanced');
  await page.screenshot({ path: path.join(dirs.indicators, 'advanced_blue_id.png'), clip: { x: 400, y: 800, width: 200, height: 100 } }); // Close up
  await page.type('.chat-input', 'Supreme Court judgments on Right to Privacy (Article 21).', { delay: 50 });
  await page.screenshot({ path: path.join(dirs.prompts, '03_advanced_question.png') });
  await page.click('.send-btn');
  await page.waitForTimeout(6000);
  await page.screenshot({ path: path.join(dirs.responses, '04_advanced_results.png') });

  // SCENARIO 3: DEEP MODE
  console.log('💎 Scenario 3: Deep Strategic Intelligence...');
  await page.click('.mode-trigger-btn');
  await page.click('.mode-option.deep');
  await page.type('.chat-input', 'Analyze breach of non-compete clauses in India and draft an eviction strategy.', { delay: 50 });
  await page.screenshot({ path: path.join(dirs.prompts, '05_deep_question.png') });
  await page.click('.send-btn');
  await page.waitForTimeout(8000);
  await page.screenshot({ path: path.join(dirs.responses, '06_deep_final_strategy.png') });

  console.log('\n🏆 Demo successfully populated the Presentation Vault!');
  await browser.close();
}

runHackathonDemo().catch(console.error);
