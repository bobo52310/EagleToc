/* Capture screenshots of popup redesign variants at multiple widths. */
const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

async function waitForServer(url, timeoutMs = 10000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    (function poll() {
      http.get(url, () => resolve()).on('error', () => {
        if (Date.now() - start > timeoutMs) return reject(new Error('Server start timeout'));
        setTimeout(poll, 200);
      });
    })();
  });
}

async function main() {
  const port = process.env.PORT || 8080;
  const base = `http://localhost:${port}`;
  const targets = [
    { id: 'v1', url: `${base}/worktrees/v1/popup/popup.html` },
    { id: 'v2', url: `${base}/worktrees/v2/popup/popup.html` },
    { id: 'v3', url: `${base}/worktrees/v3/popup/popup.html` },
  ];
  const widths = [480, 640, 760];

  const screenshotsDir = path.join(process.cwd(), 'screenshots');
  if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir);

  // Start simple server
  const server = spawn('python3', ['-m', 'http.server', String(port)], { stdio: 'ignore' });
  try {
    await waitForServer(`${base}/popup-redesign-comparison.html`);
  } catch (e) {
    server.kill();
    throw e;
  }

  // Use puppeteer (not core) to ensure Chromium is available
  const puppeteer = require('puppeteer');
  const browser = await puppeteer.launch({ headless: 'new', defaultViewport: null });
  const page = await browser.newPage();

  for (const t of targets) {
    for (const w of widths) {
      await page.setViewport({ width: w, height: 900, deviceScaleFactor: 2 });
      await page.goto(t.url, { waitUntil: 'networkidle2' });
      // small delay to allow paints
      await page.evaluate(() => new Promise(r => setTimeout(r, 150)));
      const out = path.join(screenshotsDir, `popup-${t.id}-${w}.png`);
      await page.screenshot({ path: out, fullPage: false });
      // eslint-disable-next-line no-console
      console.log('Saved', out);
    }
  }

  await browser.close();
  server.kill();
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
