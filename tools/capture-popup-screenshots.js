#!/usr/bin/env node
/*
  Capture screenshots of popup redesign variants.
  Requires Chrome installed at default path on macOS or chromium/google-chrome on Linux.
*/

const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const http = require('node:http');

function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

async function waitForUrl(url, timeoutMs = 10000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      await fetch(url, { method: 'HEAD' });
      return true;
    } catch { /* retry */ }
    await wait(200);
  }
  throw new Error(`Timeout waiting for ${url}`);
}

function ensureDir(p) { if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true }); }

function platformChromePath() {
  const plat = os.platform();
  if (plat === 'darwin') return '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  if (plat === 'linux') return '/usr/bin/google-chrome';
  if (plat === 'win32') return process.env['PROGRAMFILES'] + '\\Google\\Chrome\\Application\\chrome.exe';
  return null;
}

async function main() {
  const puppeteer = require('puppeteer-core');

  // Start servers if needed
  const servers = [];
  const versions = [
    { name: 'v1', dir: '../smart-toc-popup-v1', url: 'http://localhost:8101/options/options.html', port: 8101 },
    { name: 'v2', dir: '../smart-toc-popup-v2', url: 'http://localhost:8102/options/options.html', port: 8102 },
    { name: 'v3', dir: '../smart-toc-popup-v3', url: 'http://localhost:8103/options/options.html', port: 8103 }
  ];

  for (const v of versions) {
    const ready = await fetch(v.url).then(r => r.ok).catch(() => false);
    if (!ready) {
      const proc = spawn('python3', ['-m', 'http.server', String(v.port)], { cwd: path.resolve(__dirname, '..', v.dir) });
      servers.push(proc);
      await waitForUrl(v.url, 10000);
    }
  }

  const execPath = platformChromePath();
  if (!execPath || !fs.existsSync(execPath)) {
    console.error('Could not find Chrome executable. Please install Chrome or edit tools/capture-popup-screenshots.js');
    process.exit(1);
  }

  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: execPath,
    args: ['--no-sandbox', '--disable-gpu']
  });

  const outDir = path.resolve(process.cwd(), 'screenshots');
  ensureDir(outDir);

  for (const v of versions) {
    const page = await browser.newPage();
    await page.setViewport({ width: 900, height: 780, deviceScaleFactor: 2 });
    await page.goto(v.url, { waitUntil: 'domcontentloaded' });
    await wait(400); // small settle
    const out = path.join(outDir, `popup-${v.name}.png`);
    await page.screenshot({ path: out, fullPage: false });
    console.log('Saved', out);
    await page.close();
  }

  await browser.close();
  servers.forEach(p => p.kill());
}

main().catch(err => { console.error(err); process.exit(1); });

