/**
 * Chrome Web Store Screenshot Automation
 * EagleTOC Extension
 *
 * Generates screenshots that comply with Chrome Web Store specifications:
 * - 5 feature screenshots (1280x800 @2x for Retina quality)
 *
 * Usage: npm run store:screenshots
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const os = require('os');

// ═══════════════════════════════════════════════════════════════
// Configuration
// ═══════════════════════════════════════════════════════════════

const CONFIG = {
  extensionPath: path.resolve(__dirname, '..'),
  outputDir: path.resolve(__dirname, '../screenshots/store'),

  viewport: {
    width: 1280,
    height: 800,
    deviceScaleFactor: 2, // Retina quality -> 2560x1600 actual pixels
  },

  // Timeout settings
  timeout: 30000,
  navigationTimeout: 20000,

  // Animation stabilization delay
  animationDelay: 800,

  // Maximum retry attempts
  maxRetries: 2,
};

// Cross-platform modifier key detection
const IS_MAC = os.platform() === 'darwin';
const MODIFIER_KEY = IS_MAC ? 'Meta' : 'Control';

// ═══════════════════════════════════════════════════════════════
// Screenshot Scenario Definitions
// ═══════════════════════════════════════════════════════════════

const SCENARIOS = [
  {
    name: '01-toc-panel',
    description: 'TOC Panel Expanded - Main Feature Showcase',
    url: 'https://en.wikipedia.org/wiki/Artificial_intelligence',
    setup: async (page) => {
      // Wikipedia is whitelisted, TOC will auto-show
      await page.waitForSelector('.eagle-toc-panel', {
        visible: true,
        timeout: CONFIG.timeout,
      });
      // Wait for expand animation to complete
      await page.waitForSelector('.eagle-toc-expanded', { timeout: 10000 });
      await delay(CONFIG.animationDelay);
    },
  },
  {
    name: '02-search',
    description: 'Search Feature - Fuzzy Search Modal',
    url: 'https://en.wikipedia.org/wiki/Machine_learning',
    setup: async (page) => {
      await page.waitForSelector('.eagle-toc-panel', { visible: true });
      await page.waitForSelector('.eagle-toc-expanded', { timeout: 10000 });
      await delay(CONFIG.animationDelay); // Wait for panel to fully render

      // Wait for toolbar button to be ready, then click
      await page.waitForSelector('.eagle-toc-toolbar-search', { visible: true });
      await page.click('.eagle-toc-toolbar-search');

      await page.waitForSelector('.eagle-toc-search-modal', { visible: true });
      // Type demo search term
      await page.type('.eagle-toc-search-input', 'neural', { delay: 50 });
      await delay(400);
    },
  },
  {
    name: '03-zen-mode',
    description: 'Zen Mode - Immersive Reading Experience',
    url: 'https://en.wikipedia.org/wiki/Reading_(process)',
    setup: async (page) => {
      await page.waitForSelector('.eagle-toc-panel', { visible: true });
      await page.waitForSelector('.eagle-toc-expanded', { timeout: 10000 });
      await delay(CONFIG.animationDelay); // Wait for panel to fully render

      // Wait for toolbar button to be ready, then click
      await page.waitForSelector('.eagle-toc-toolbar-zen', { visible: true });
      await page.click('.eagle-toc-toolbar-zen');
      await page.waitForSelector('.eagle-toc-zen-container', { visible: true });
      await delay(1000); // Zen Mode has longer animation
    },
  },
  {
    name: '04-dark-mode',
    description: 'Dark Mode - Night Reading',
    url: 'https://en.wikipedia.org/wiki/Dark_mode',
    setup: async (page) => {
      // Emulate system dark mode
      await page.emulateMediaFeatures([
        { name: 'prefers-color-scheme', value: 'dark' },
      ]);

      await page.waitForSelector('.eagle-toc-panel', { visible: true });
      await page.waitForSelector('.eagle-toc-expanded', { timeout: 10000 });
      await delay(CONFIG.animationDelay);
    },
  },
  {
    name: '05-options',
    description: 'Settings Page - Extension Options',
    url: null, // Special handling
    customViewport: { width: 700, height: 800, deviceScaleFactor: 2 },
    setup: async (page, ctx) => {
      const optionsUrl = `chrome-extension://${ctx.extensionId}/options/options.html`;
      await page.goto(optionsUrl, { waitUntil: 'networkidle2' });
      await delay(500);
    },
  },
];

// ═══════════════════════════════════════════════════════════════
// Main Program
// ═══════════════════════════════════════════════════════════════

async function main() {
  console.log('\n🚀 EagleTOC Chrome Web Store Screenshot Automation');
  console.log('═'.repeat(55));
  console.log(`📍 Platform: ${os.platform()} (modifier key: ${MODIFIER_KEY})`);
  console.log(`📁 Output: ${CONFIG.outputDir}\n`);

  // Ensure output directory exists
  if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true });
  }

  // Launch browser with extension
  console.log('🌐 Launching browser with extension...');
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: [
      `--disable-extensions-except=${CONFIG.extensionPath}`,
      `--load-extension=${CONFIG.extensionPath}`,
      `--window-size=${CONFIG.viewport.width + 100},${CONFIG.viewport.height + 150}`,
      '--disable-infobars',
      '--no-first-run',
    ],
    ignoreDefaultArgs: ['--disable-extensions'],
  });

  try {
    // Get Extension ID
    const extensionId = await getExtensionId(browser);
    console.log(`📦 Extension ID: ${extensionId}\n`);

    const page = await browser.newPage();
    await page.setViewport(CONFIG.viewport);

    // Execute each screenshot scenario
    let successCount = 0;
    for (const scenario of SCENARIOS) {
      const success = await captureScenario(page, scenario, { extensionId });
      if (success) successCount++;
    }

    // Summary
    console.log('═'.repeat(55));
    console.log(`🎉 Complete! ${successCount}/${SCENARIOS.length} screenshots captured`);
    console.log(`📁 Output directory: ${CONFIG.outputDir}`);
  } finally {
    await browser.close();
  }
}

// ═══════════════════════════════════════════════════════════════
// Utility Functions
// ═══════════════════════════════════════════════════════════════

async function captureScenario(page, scenario, ctx, attempt = 1) {
  console.log(`📸 [${scenario.name}] ${scenario.description}`);

  try {
    // Apply custom viewport if specified
    if (scenario.customViewport) {
      await page.setViewport(scenario.customViewport);
    } else {
      await page.setViewport(CONFIG.viewport);
    }

    // Navigate to target page
    if (scenario.url) {
      await page.goto(scenario.url, {
        waitUntil: 'networkidle2',
        timeout: CONFIG.navigationTimeout,
      });
    }

    // Execute scenario setup
    await scenario.setup(page, ctx);

    // Capture screenshot
    const outputPath = path.join(CONFIG.outputDir, `${scenario.name}.png`);
    await page.screenshot({ path: outputPath });

    console.log(`   ✅ Saved: ${outputPath}\n`);
    return true;
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);

    // Retry logic
    if (attempt < CONFIG.maxRetries) {
      console.log(`   🔄 Retry ${attempt}/${CONFIG.maxRetries}...`);
      await delay(1000);
      return captureScenario(page, scenario, ctx, attempt + 1);
    }

    console.log('');
    return false;
  }
}

async function getExtensionId(browser) {
  // Wait for service worker to load
  const workerTarget = await browser.waitForTarget(
    (target) =>
      target.type() === 'service_worker' &&
      target.url().includes('chrome-extension://'),
    { timeout: 10000 }
  );

  const url = workerTarget.url();
  return url.split('/')[2];
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Execute
main().catch((err) => {
  console.error('\n❌ Execution failed:', err.message);
  process.exit(1);
});
