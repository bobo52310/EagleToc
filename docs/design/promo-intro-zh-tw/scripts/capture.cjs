#!/usr/bin/env node
/**
 * EagleToc promo (zh-TW intro) - real product asset capture.
 *
 * Every frame comes from the real extension (repo root, MV3) running in
 * Chrome for Testing on real websites. Nothing is mocked or hand-drawn.
 *
 * Usage
 *   node scripts/capture.cjs                 # run everything
 *   node scripts/capture.cjs --only=top,jump # run selected steps only
 *       steps: top | jump | prejump | search | zen | dark | fullpage | sites
 *       manifest.json is merged with whatever already exists, so partial
 *       re-runs keep the other sections.
 *
 * Puppeteer resolution (repo root has no node_modules by design)
 *   1. $PUPPETEER_DIR       directory that contains node_modules/puppeteer
 *   2. (no built-in default; keep puppeteer outside the repo)
 *   3. plain require('puppeteer')
 *   Install once:  mkdir -p $DIR && cd $DIR && npm init -y && npm i puppeteer
 *   (installs Chrome for Testing into ~/.cache/puppeteer; branded Chrome 137+
 *   refuses --load-extension, so do not point it at a branded Chrome.)
 *
 * Env
 *   HEADFUL=1   show the browser window (default: new headless, extensions work)
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

// ───────────────────────────── configuration ─────────────────────────────

const REPO_ROOT = path.resolve(__dirname, '../../../..');
const OUT_DIR = path.resolve(__dirname, '../assets/capture');
const MANIFEST_PATH = path.join(OUT_DIR, 'manifest.json');

const DEFAULT_PUPPETEER_DIR = null; // set $PUPPETEER_DIR instead of hard-coding a local path

const ARTICLE_URL = 'https://zh.wikipedia.org/zh-tw/人工智能';
const JUMP_TARGET = '倫理'; // h2 in the middle/late part of the article
const SEARCH_QUERY = '應用'; // hits 4 real headings (應用 / 基本應用 / 實際應用 / 應用領域)

const VIEW = { width: 1920, height: 1080, deviceScaleFactor: 2 };
const LONG = { width: 1280, height: 800, deviceScaleFactor: 1, slice: 6000, jpegQuality: 80 };

// Extra sites for the "breadth" shots. `whitelist` = hostname the extension
// does not auto-show on by default (added through chrome.storage.sync, which
// is exactly what the extension's own settings UI does).
const SITES = [
  {
    slug: 'mdn',
    kind: 'MDN reference',
    url: 'https://developer.mozilla.org/zh-TW/docs/Web/CSS/CSS_flexible_box_layout/Basic_concepts_of_flexbox',
  },
  {
    slug: 'github',
    kind: 'GitHub README',
    url: 'https://github.com/jlevy/the-art-of-command-line/blob/master/README-zh-Hant.md',
  },
  {
    slug: 'blog',
    kind: 'Tech blog long read',
    url: 'https://blog.huli.tw/2021/02/19/cors-guide-1/',
    whitelist: 'blog.huli.tw',
  },
];

const delay = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (...a) => console.log(...a);

// ───────────────────────────── bootstrap ─────────────────────────────────

function loadPuppeteer() {
  const dirs = [process.env.PUPPETEER_DIR, DEFAULT_PUPPETEER_DIR].filter(Boolean);
  for (const dir of dirs) {
    try {
      return require(require.resolve('puppeteer', { paths: [dir] }));
    } catch (_) { /* try next */ }
  }
  try {
    return require('puppeteer');
  } catch (_) {
    throw new Error(
      'puppeteer not found. Set PUPPETEER_DIR to a folder containing node_modules/puppeteer ' +
        '(see header of this script).'
    );
  }
}

function parseArgs() {
  const only = process.argv.find((a) => a.startsWith('--only='));
  const all = ['top', 'jump', 'prejump', 'search', 'zen', 'dark', 'fullpage', 'sites'];
  return new Set(only ? only.slice(7).split(',').filter(Boolean) : all);
}

function readManifest() {
  try {
    return JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  } catch (_) {
    return {};
  }
}

// ───────────────────────────── page helpers ──────────────────────────────

const NOTIFICATION_SEL =
  '.eagle-toc-auto-notification, .eagle-toc-pin-notification, .eagle-toc-notification';

async function newPage(browser, { scheme = 'light', viewport = VIEW } = {}) {
  const page = await browser.newPage();
  await page.setViewport(viewport);
  const ua = (await browser.userAgent()).replace('HeadlessChrome', 'Chrome');
  await page.setUserAgent(ua);
  await page.setExtraHTTPHeaders({ 'Accept-Language': 'zh-TW,zh;q=0.9,en;q=0.8' });
  await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: scheme }]);
  return page;
}

/** Wait until the panel finished its slide-in animation. */
async function waitForPanelExpanded(page, timeout = 40000) {
  await page.waitForFunction(
    () => {
      const p = document.querySelector('.eagle-toc-panel');
      return (
        p &&
        p.classList.contains('eagle-toc-expanded') &&
        !p.classList.contains('eagle-toc-slide-in')
      );
    },
    { timeout }
  );
  await delay(150);
}

async function panelRect(page) {
  return page.evaluate(() => {
    const r = document.querySelector('.eagle-toc-panel').getBoundingClientRect();
    const h = document.querySelector('.eagle-toc-header').getBoundingClientRect();
    return { x: r.x, y: r.y, width: r.width, height: r.height, headerMidY: h.y + h.height / 2 };
  });
}

/**
 * The extension auto-hides an auto-shown panel after 3 s unless the pointer is
 * over it, and its "TOC 已自動顯示" toast lives 4.4 s. Park the pointer on the
 * panel's left edge (header row, no button there) so the panel stays open until
 * the toast is gone. This is the same thing a real user does by hovering it.
 */
async function parkPointerOnPanel(page) {
  const r = await panelRect(page);
  await page.mouse.move(r.x + 6, r.headerMidY);
  const hovered = await page.evaluate(() => document.querySelector('.eagle-toc-panel').matches(':hover'));
  if (!hovered) throw new Error('pointer is not hovering the panel');
}

async function waitForToastGone(page) {
  await page.waitForFunction((sel) => !document.querySelector(sel), { timeout: 15000 }, NOTIFICATION_SEL);
}

/**
 * Close Wikipedia banners / pop-ups and hide the pinned appearance menu through their own buttons.
 * The pin state is persisted by Wikipedia (cookie), and its "unpin" button is a toggle, so only
 * click it while the menu is actually pinned.
 */
async function cleanWikipedia(page) {
  const unpinned = await page.evaluate(() => {
    const click = (sel) => {
      const el = document.querySelector(sel);
      if (el) el.click();
    };
    click('.va-variant-prompt__close'); // "記住此變體？"
    click('#asn-dismissable-notice .asn-close-button'); // site notice banner
    const pinned = document.documentElement.classList.contains('vector-feature-appearance-pinned-clientpref-1');
    if (pinned) click('.vector-appearance-pinnable-header .vector-pinnable-header-unpin-button'); // "外觀" -> hide
    return pinned;
  });
  if (unpinned) {
    // Wikipedia answers with a "外觀選單已移至此處" bubble that closes itself after ~4 s
    await page
      .waitForFunction(
        () => {
          const n = document.querySelector('.vector-popup-notification');
          return !n || n.classList.contains('oo-ui-element-hidden');
        },
        { timeout: 12000 }
      )
      .catch(() => {});
  }
  await page.evaluate(() => document.activeElement && document.activeElement.blur && document.activeElement.blur());
  await delay(700);
}

async function assertCleanPanelState(page, label, { expectPanel = true } = {}) {
  const st = await page.evaluate((sel) => {
    const p = document.querySelector('.eagle-toc-panel');
    const r = p && p.getBoundingClientRect();
    const visible = (el) => !!el && el.getBoundingClientRect().width > 0 && getComputedStyle(el).visibility !== 'hidden';
    return {
      panelExpanded: !!p && p.classList.contains('eagle-toc-expanded'),
      panelInViewport: !!r && r.right <= innerWidth + 1 && r.left >= 0,
      hovered: !!p && p.matches(':hover'),
      toast: !!document.querySelector(sel),
      variantPrompt: visible(document.querySelector('.va-variant-prompt')),
      siteNotice: visible(document.querySelector('#asn-dismissable-notice')),
      cookieBanner: visible(document.querySelector('[id*="cookie" i][class*="banner" i], #onetrust-banner-sdk, .cookie-banner')),
    };
  }, NOTIFICATION_SEL);
  const problems = [];
  if (expectPanel && !(st.panelExpanded && st.panelInViewport)) problems.push('panel not expanded/in viewport');
  if (st.toast) problems.push('toast still visible');
  if (st.variantPrompt) problems.push('wikipedia variant prompt visible');
  if (st.siteNotice) problems.push('wikipedia site notice visible');
  if (st.cookieBanner) problems.push('cookie banner visible');
  if (problems.length) throw new Error(`[${label}] unclean state: ${problems.join(', ')} ${JSON.stringify(st)}`);
  return st;
}

/** Open the main article with panel expanded, pointer parked, popups closed, toast gone. */
async function openArticle(browser, { scheme = 'light', wikipediaAutoTheme = false } = {}) {
  const page = await newPage(browser, { scheme });
  const go = async () => {
    await page.goto(ARTICLE_URL, { waitUntil: 'networkidle2', timeout: 90000 });
    await waitForPanelExpanded(page);
    await parkPointerOnPanel(page);
  };
  await go();
  if (wikipediaAutoTheme) {
    // Real UI path: appearance menu -> 顏色 -> 自動 (follow the OS), then reload so the
    // extension initialises against the dark page (it adapts to the page background on init).
    const changed = await page.evaluate(() => {
      const r = document.querySelector('input[name="skin-client-pref-skin-theme-group"][value="os"]');
      if (!r) return 'no-radio';
      r.click();
      return 'clicked';
    });
    if (changed !== 'clicked') throw new Error('Wikipedia theme radio not found');
    await delay(600);
    await page.reload({ waitUntil: 'networkidle2', timeout: 90000 });
    await waitForPanelExpanded(page);
    await parkPointerOnPanel(page);
  }
  await cleanWikipedia(page);
  await waitForToastGone(page);
  await delay(400);
  await assertCleanPanelState(page, `article/${scheme}`);
  return page;
}

async function shot(page, name, opts = {}) {
  const file = path.join(OUT_DIR, name);
  await page.screenshot({ path: file, ...opts });
  log(`   saved ${name}  (${(fs.statSync(file).size / 1024 / 1024).toFixed(2)} MB)`);
  return file;
}

// ───────────────────────────── scenes ────────────────────────────────────

async function sceneTop(browser) {
  log('[top] view-top.png + panel.png');
  const page = await openArticle(browser, { scheme: 'light' });
  const scrollY = await page.evaluate(() => scrollY);
  if (scrollY !== 0) throw new Error(`expected scrollY 0, got ${scrollY}`);
  const title = await page.title();
  const pr = await panelRect(page);
  await shot(page, 'view-top.png');

  const clip = { x: Math.round(pr.x), y: Math.round(pr.y), width: Math.round(pr.width), height: Math.round(pr.height) };
  // captureBeyondViewport:false -> crop exactly what is on screen (the default mode re-lays out the fixed panel)
  await shot(page, 'panel.png', { clip, captureBeyondViewport: false });

  // Same panel, page content hidden, so the PNG keeps real alpha (rounded corners, 5% translucency).
  await page.addStyleTag({
    content: `html, body { background: transparent !important; }
              body > *:not([class*="eagle-toc"]):not([id*="eagle-toc"]) { visibility: hidden !important; }`,
  });
  await delay(300);
  await shot(page, 'panel-alpha.png', { clip, omitBackground: true, captureBeyondViewport: false });
  await page.close();
  return { title, panel: { ...clip, note: 'CSS px in the 1920x1080 viewport (PNGs are 2x)' } };
}

/**
 * One real click on the panel entry. Returns the observed state; the screenshot is only taken by the
 * caller when the panel highlight really sits on the clicked heading.
 */
async function clickPanelEntryOnce(browser) {
  const page = await openArticle(browser, { scheme: 'light' });
  const link = await page.evaluateHandle(
    (t) => [...document.querySelectorAll('.eagle-toc-link')].find((a) => a.textContent.trim() === t),
    JUMP_TARGET
  );
  if (!(await link.evaluate((a) => !!a))) throw new Error(`panel has no "${JUMP_TARGET}" entry`);

  // Scroll the panel list with the real mouse wheel until the entry is visible inside the panel.
  for (let i = 0; i < 12; i++) {
    const m = await link.evaluate((a) => {
      const b = a.getBoundingClientRect();
      const c = document.querySelector('.eagle-toc-content').getBoundingClientRect();
      const p = document.querySelector('.eagle-toc-panel').getBoundingClientRect();
      return { inView: b.top >= c.top && b.bottom <= p.bottom - 24, cx: c.x + c.width / 2, cy: (c.top + p.bottom) / 2 };
    });
    if (m.inView) break;
    await page.mouse.move(m.cx, m.cy);
    await page.mouse.wheel({ deltaY: 120 });
    await delay(250);
  }
  const pt = await link.evaluate((a) => {
    const b = a.getBoundingClientRect();
    return { x: b.x + 60, y: b.y + b.height / 2 };
  });
  await page.mouse.move(pt.x, pt.y);
  await delay(300);
  await page.mouse.click(pt.x, pt.y);

  // wait for the smooth scroll to finish
  let last = -1;
  let stable = 0;
  for (let i = 0; i < 80 && stable < 5; i++) {
    await delay(120);
    const y = await page.evaluate(() => scrollY);
    stable = Math.abs(y - last) < 0.5 ? stable + 1 : 0;
    last = y;
  }
  await delay(600);

  const read = () =>
    page.evaluate((t) => {
      const hl = document.querySelector('.eagle-toc-highlighted');
      const heading = [...document.querySelectorAll('h1,h2,h3')].find((h) => h.textContent.replace(/\[.*?\]/g, '').trim() === t);
      return {
        active: [...document.querySelectorAll('.eagle-toc-active')].map((a) => a.textContent.trim()),
        highlightedHeading: hl && hl.textContent.replace(/\[.*?\]/g, '').trim(),
        headingTop: heading && Math.round(heading.getBoundingClientRect().top),
        viewY: heading && Math.round(heading.getBoundingClientRect().top + scrollY),
        scrollY: Math.round(scrollY),
      };
    }, JUMP_TARGET);
  const ok = (st) => st.active.length === 1 && st.active[0] === JUMP_TARGET && st.highlightedHeading === JUMP_TARGET;
  return { page, read, ok };
}

async function sceneJump(browser) {
  log(`[jump] view-jump.png (click "${JUMP_TARGET}" in the panel)`);
  // The extension's scroll tracker (IntersectionObserver band at 20%-30% of the viewport) can race with the
  // smooth scroll started by the click and move the highlight to the next sub-heading. That is real product
  // behaviour, so retry the whole real click until the highlight matches, and record how often it did not.
  const attempts = [];
  for (let n = 1; n <= 8; n++) {
    const { page, read, ok } = await clickPanelEntryOnce(browser);
    const st = await read();
    attempts.push({ attempt: n, panelActive: st.active, ok: ok(st) });
    log(`   attempt ${n}: panel active = ${JSON.stringify(st.active)}${ok(st) ? '  OK' : '  (mismatch, retry)'}`);
    if (ok(st)) {
      await assertCleanPanelState(page, 'jump');
      await shot(page, 'view-jump.png');
      const after = await read();
      await page.close();
      if (!ok(after)) {
        attempts[attempts.length - 1].ok = false;
        log('   highlight changed during screenshot, retry');
        continue;
      }
      return { text: JUMP_TARGET, level: 2, viewScrollY: st.scrollY, viewY: st.viewY, panelActive: st.active[0], attempts };
    }
    await page.close();
  }
  throw new Error(`panel highlight never landed on "${JUMP_TARGET}": ${JSON.stringify(attempts)}`);
}

/**
 * Pre-click state for the animation: same view as view-top (article start, panel open), but the panel's own
 * list is wheel-scrolled so the JUMP_TARGET row is fully visible in the middle of the panel. The page itself
 * is never scrolled and nothing is clicked; the pointer rests on the panel header, away from the row.
 * The measured box is the clickable <a class="eagle-toc-link"> of that row (CSS px, 1920x1080 viewport).
 */
async function scenePrejump(browser) {
  log(`[prejump] view-prejump.png ("${JUMP_TARGET}" row visible in the panel list, nothing clicked)`);
  const page = await openArticle(browser, { scheme: 'light' });
  const pageScrollY = () => page.evaluate(() => Math.round(scrollY));
  if ((await pageScrollY()) !== 0) throw new Error('page is not at the article start');

  const link = await page.evaluateHandle(
    (t) => [...document.querySelectorAll('.eagle-toc-link')].find((a) => a.textContent.trim() === t),
    JUMP_TARGET
  );
  if (!(await link.evaluate((a) => !!a))) throw new Error(`panel has no "${JUMP_TARGET}" entry`);

  const geom = () =>
    link.evaluate((a) => {
      const r = (b) => ({ x: b.x, y: b.y, width: b.width, height: b.height });
      const content = document.querySelector('.eagle-toc-content');
      const c = content.getBoundingClientRect();
      const p = document.querySelector('.eagle-toc-panel').getBoundingClientRect();
      return {
        link: r(a.getBoundingClientRect()),
        li: r(a.closest('li').getBoundingClientRect()),
        top: c.top, // list area starts here; the panel clips it at panelBottom
        bottom: p.bottom,
        centerX: c.x + c.width / 2,
        listScrollTop: Math.round(content.scrollTop),
      };
    });

  // Wheel the list (never the page: the pointer stays on the list area) until the row sits mid-panel.
  const first = await geom();
  const mid = (first.top + first.bottom) / 2;
  await page.mouse.move(first.centerX, mid);
  for (let i = 0; i < 40; i++) {
    const g = await geom();
    const delta = g.link.y + g.link.height / 2 - mid;
    if (Math.abs(delta) <= 20) break;
    await page.mouse.wheel({ deltaY: Math.sign(delta) * Math.min(Math.abs(delta), 120) });
    await delay(350);
    if ((await pageScrollY()) !== 0) throw new Error('page scrolled while wheeling the panel list');
  }
  // let the list scroll settle, then park the pointer on the header edge (not on the row)
  let last = -1;
  for (let i = 0; i < 20; i++) {
    const g = await geom();
    if (g.listScrollTop === last) break;
    last = g.listScrollTop;
    await delay(200);
  }
  await parkPointerOnPanel(page);
  await delay(500);

  const g = await geom();
  const state = await page.evaluate((a) => ({
    rowHovered: a.matches(':hover') || a.closest('li').matches(':hover'),
    panelHovered: document.querySelector('.eagle-toc-panel').matches(':hover'),
    active: [...document.querySelectorAll('.eagle-toc-active')].map((x) => x.textContent.trim()),
    scrollY: Math.round(scrollY),
  }), link);
  const fullyVisible = g.link.y >= g.top + 8 && g.link.y + g.link.height <= g.bottom - 8;
  if (!fullyVisible) throw new Error(`row not fully inside the panel: ${JSON.stringify(g)}`);
  if (state.rowHovered) throw new Error('pointer is hovering the target row');
  if (!state.panelHovered) throw new Error('pointer left the panel');
  if (state.scrollY !== 0) throw new Error(`page scrolled: ${state.scrollY}`);
  await assertCleanPanelState(page, 'prejump');
  await shot(page, 'view-prejump.png');

  const after = await geom();
  if (Math.abs(after.link.y - g.link.y) > 0.01) throw new Error('row moved during the screenshot');
  const round = (v) => Math.round(v * 100) / 100;
  const panelRow = { x: round(g.link.x), y: round(g.link.y), width: round(g.link.width), height: round(g.link.height) };
  log(`   row (a.eagle-toc-link) = ${JSON.stringify(panelRow)}; li = ${JSON.stringify(g.li)}; list scrollTop = ${g.listScrollTop}; page scrollY = ${state.scrollY}`);
  await page.close();
  return { panelRow, pageScrollY: state.scrollY, listScrollTop: g.listScrollTop };
}

async function sceneSearch(browser) {
  log(`[search] view-search.png (query "${SEARCH_QUERY}")`);
  const page = await openArticle(browser, { scheme: 'light' });
  await page.click('.eagle-toc-toolbar-search');
  await page.waitForSelector('.eagle-toc-search-modal.show', { visible: true });
  await delay(250);
  await page.type('.eagle-toc-search-input', SEARCH_QUERY, { delay: 90 });
  await delay(500);
  const res = await page.evaluate(() => ({
    value: document.querySelector('.eagle-toc-search-input').value,
    items: [...document.querySelectorAll('.eagle-toc-search-result-item')].map((e) =>
      e.textContent.replace(/\s+/g, ' ').trim()
    ),
    marks: document.querySelectorAll('.eagle-toc-search-match').length,
  }));
  if (res.value !== SEARCH_QUERY || res.items.length < 2 || res.marks < 1) {
    throw new Error(`search not showing results: ${JSON.stringify(res)}`);
  }
  await assertCleanPanelState(page, 'search');
  await shot(page, 'view-search.png');
  await page.close();
  return { query: SEARCH_QUERY, results: res.items };
}

async function sceneZen(browser) {
  log('[zen] view-zen.png');
  const page = await openArticle(browser, { scheme: 'light' });
  await page.click('.eagle-toc-toolbar-zen');
  await page.waitForSelector('.eagle-toc-zen-container', { visible: true });
  await delay(3500); // let the zen reader run a little so real text is on screen
  const st = await page.evaluate(() => ({
    zen: !!document.querySelector('.eagle-toc-zen-container'),
    text: (document.querySelector('.eagle-toc-zen-content') || {}).textContent?.trim().slice(0, 40),
  }));
  if (!st.zen) throw new Error('zen container missing');
  await shot(page, 'view-zen.png');
  await page.close();
  return { sampleText: st.text };
}

async function sceneDark(browser) {
  log('[dark] view-dark.png');
  const page = await openArticle(browser, { scheme: 'dark', wikipediaAutoTheme: true });
  const st = await page.evaluate(() => ({
    prefersDark: matchMedia('(prefers-color-scheme: dark)').matches,
    wikiTheme: [...document.documentElement.classList].filter((c) => c.startsWith('skin-theme-clientpref')),
    bodyBg: getComputedStyle(document.body).backgroundColor,
  }));
  if (!st.prefersDark) throw new Error('prefers-color-scheme: dark not active');
  await shot(page, 'view-dark.png');
  await page.close();
  return st;
}

/** Make every extension-injected element invisible without touching page layout. */
const HIDE_EXTENSION_CSS = `
  body > [class*="eagle-toc"], body > [id*="eagle-toc"] { display: none !important; }
`;

/**
 * Self-check of the slicing: for every seam, compare "bottom 200px of slice N + top 200px of slice N+1"
 * against a ground-truth viewport screenshot taken by really scrolling there (no beyond-viewport capture).
 * Sticky elements (left TOC) exist only in the real-scroll shot, so the left 330px are ignored. JPEG noise on dense
 * text gives ~0.2-3% differing pixels; a real misalignment gives tens of percent, hence the 8% threshold.
 * Needs ImageMagick (`magick`); skipped with a warning if it is missing.
 */
async function verifySeams(page, slices, pageHeight) {
  const probe = spawnSync('magick', ['-version']);
  if (probe.error) {
    log('   (seam check skipped: ImageMagick not found)');
    return { skipped: 'ImageMagick not found' };
  }
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'eagletoc-seam-'));
  const magick = (...args) => spawnSync('magick', args, { encoding: 'utf8' });
  const result = [];
  for (let i = 1; i < slices.length; i++) {
    const seamY = slices[i].y;
    const gt = path.join(tmp, `gt${i}.png`);
    await page.evaluate((y) => window.scrollTo(0, y - 300), seamY);
    await delay(900);
    await page.screenshot({ path: gt, clip: { x: 0, y: seamY - 200, width: LONG.width, height: 400 }, captureBeyondViewport: false });
    const st = path.join(tmp, `st${i}.png`);
    magick(path.join(OUT_DIR, slices[i - 1].file), '-gravity', 'south', '-crop', `${LONG.width}x200+0+0`, '+repage',
      path.join(OUT_DIR, slices[i].file), '-gravity', 'north', '-crop', `${LONG.width}x200+0+0`, '+repage', '-gravity', 'center', '-append', st);
    const crop = `${LONG.width - 330}x400+330+0`;
    magick(gt, '-crop', crop, '+repage', path.join(tmp, `gtc${i}.png`));
    magick(st, '-crop', crop, '+repage', path.join(tmp, `stc${i}.png`));
    const cmp = magick('compare', '-fuzz', '12%', '-metric', 'AE', path.join(tmp, `stc${i}.png`), path.join(tmp, `gtc${i}.png`), 'null:');
    const diffPx = parseInt((cmp.stderr || cmp.stdout || '').trim().split(/\s+/)[0], 10);
    const total = (LONG.width - 330) * 400;
    result.push({ seamY, differingPx: diffPx, ratio: Number((diffPx / total).toFixed(4)), ok: diffPx / total < 0.08 });
    log(`   seam y=${seamY}: ${diffPx} / ${total} px differ (${((diffPx / total) * 100).toFixed(2)}%)`);
  }
  fs.rmSync(tmp, { recursive: true, force: true });
  await page.evaluate(() => window.scrollTo(0, 0));
  if (result.some((r) => !r.ok)) throw new Error(`slice seams do not match the real page: ${JSON.stringify(result)}`);
  return result;
}

async function sceneFullPage(browser) {
  log('[fullpage] page-NN.jpg + headings (1280 wide)');
  const page = await newPage(browser, { scheme: 'light', viewport: { width: LONG.width, height: LONG.height, deviceScaleFactor: 1 } });
  await page.goto(ARTICLE_URL, { waitUntil: 'networkidle2', timeout: 90000 });
  await waitForPanelExpanded(page);
  await cleanWikipedia(page);

  // Force every lazy image to load: walk down the page, then wait for all <img> to settle.
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < total + LONG.height; y += 600) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await delay(90);
  }
  await page.evaluate(() => {
    document.querySelectorAll('img[loading="lazy"]').forEach((i) => i.setAttribute('loading', 'eager'));
  });
  await page.waitForFunction(
    () => [...document.images].every((i) => i.complete),
    { timeout: 60000 }
  );
  await page.evaluate(() => window.scrollTo(0, 0));
  await delay(1200);

  // stable height (two reads 600 ms apart)
  let h1 = await page.evaluate(() => document.documentElement.scrollHeight);
  await delay(600);
  let h2 = await page.evaluate(() => document.documentElement.scrollHeight);
  if (h1 !== h2) {
    await delay(1500);
    h2 = await page.evaluate(() => document.documentElement.scrollHeight);
  }

  // Headings exactly as the extension lists them, with their real y in this layout.
  const data = await page.evaluate(() => {
    const items = [...document.querySelectorAll('.eagle-toc-panel .eagle-toc-item')];
    const rows = items.map((li) => {
      const a = li.querySelector('.eagle-toc-link');
      const el = document.getElementById(a.dataset.headingId);
      const r = el.getBoundingClientRect();
      return {
        level: Number(li.className.match(/eagle-toc-level-(\d)/)[1]),
        text: a.textContent.trim(),
        id: a.dataset.headingId,
        y: Math.round(r.top + scrollY),
        h: Math.round(r.height),
      };
    });
    const root = document.querySelector('#mw-content-text .mw-parser-output') || document.querySelector('#mw-content-text');
    const clone = root.cloneNode(true);
    clone.querySelectorAll('style, script, .mw-editsection, sup.reference, .mw-cite-backlink').forEach((n) => n.remove());
    const text = clone.textContent.replace(/\s+/g, '');
    clone.querySelectorAll('.reflist, ol.references, .mw-references-wrap, .navbox, .navbox-styles').forEach((n) => n.remove());
    const bodyText = clone.textContent.replace(/\s+/g, '');
    const cjk = (t) => (t.match(/[\u3400-\u9fff\uf900-\ufaff]/g) || []).length;
    return {
      rows,
      title: document.title,
      charCount: text.length,
      cjkCharCount: cjk(text),
      bodyCharCount: bodyText.length,
      bodyCjkCharCount: cjk(bodyText),
      pageHeight: Math.ceil(document.documentElement.scrollHeight),
      pageWidth: document.documentElement.scrollWidth,
      allImagesLoaded: [...document.images].every((i) => i.complete),
    };
  });

  // Hide the extension and cut slices. clip + captureBeyondViewport renders from scroll 0,
  // so sticky/fixed elements appear once (at the top) instead of once per slice.
  await page.addStyleTag({ content: HIDE_EXTENSION_CSS });
  await page.evaluate(() => window.scrollTo(0, 0));
  await delay(300);

  for (const f of fs.readdirSync(OUT_DIR)) if (/^page-\d+\.jpg$/.test(f)) fs.unlinkSync(path.join(OUT_DIR, f));
  const slices = [];
  for (let i = 0, y = 0; y < data.pageHeight; i++, y += LONG.slice) {
    const height = Math.min(LONG.slice, data.pageHeight - y);
    const name = `page-${String(i).padStart(2, '0')}.jpg`;
    await page.screenshot({
      path: path.join(OUT_DIR, name),
      type: 'jpeg',
      quality: LONG.jpegQuality,
      clip: { x: 0, y, width: LONG.width, height },
      captureBeyondViewport: true,
    });
    slices.push({ file: name, y, width: LONG.width, height });
    log(`   saved ${name}  y=${y} h=${height}`);
  }
  const seamCheck = await verifySeams(page, slices, data.pageHeight);
  await page.close();

  const titleRow = data.rows.find((r) => r.level === 1) || null;
  const headings = data.rows.filter((r) => r.level === 2 || r.level === 3).map(({ level, text, y, h }) => ({ level, text, y, h }));
  return {
    pageHeight: data.pageHeight,
    pageWidth: data.pageWidth,
    heightStable: h1 === h2,
    allImagesLoaded: data.allImagesLoaded,
    slices,
    seamCheck,
    title: titleRow ? { text: titleRow.text, y: titleRow.y } : null,
    docTitle: data.title,
    headings,
    stats: {
      headingCount: headings.length,
      h2Count: headings.filter((x) => x.level === 2).length,
      h3Count: headings.filter((x) => x.level === 3).length,
      panelItemCount: data.rows.length,
      charCount: data.charCount,
      cjkCharCount: data.cjkCharCount,
      bodyCharCount: data.bodyCharCount,
      bodyCjkCharCount: data.bodyCjkCharCount,
      charCountDefinition:
        'charCount = whitespace-stripped textContent of #mw-content-text .mw-parser-output minus style/script, [編輯] links and citation markers (includes the references list); bodyCharCount = same minus reference list and navboxes; cjk* = CJK ideographs only',
    },
  };
}

/** The extension's built-in auto-show whitelist, parsed from content/content.js (single source of truth). */
function defaultWhitelist() {
  const src = fs.readFileSync(path.join(REPO_ROOT, 'content/content.js'), 'utf8');
  const m = src.match(/autoShowWhitelist:\s*\[([^\]]*)\]/);
  if (!m) throw new Error('could not parse default autoShowWhitelist from content/content.js');
  return [...m[1].matchAll(/'([^']+)'/g)].map((x) => x[1]);
}

/**
 * Add hostnames to the whitelist via chrome.storage.sync (what the extension's settings UI does).
 * Storage overrides the built-in defaults wholesale, so the defaults are written back together.
 */
async function setWhitelist(browser, hostnames) {
  const target = await browser.waitForTarget(
    (t) => t.type() === 'service_worker' && t.url().startsWith('chrome-extension://'),
    { timeout: 15000 }
  );
  const worker = await target.worker();
  const list = [...new Set([...defaultWhitelist(), ...hostnames])];
  await worker.evaluate((l) => chrome.storage.sync.set({ autoShowWhitelist: l }), list);
}

/** Best-effort generic consent/cookie dismissal (only clicks buttons that look like accept/close of a banner). */
async function dismissGenericBanners(page) {
  await page.evaluate(() => {
    const re = /^(accept( all)?( cookies)?|allow all|agree|got it|i agree|ok|接受|同意|全部接受|我知道了|關閉|close)$/i;
    const roots = document.querySelectorAll(
      '[id*="cookie" i], [class*="cookie" i], [id*="consent" i], [class*="consent" i], [id*="onetrust" i], [class*="banner" i]'
    );
    roots.forEach((root) => {
      root.querySelectorAll('button, a[role="button"]').forEach((b) => {
        if (re.test(b.textContent.trim())) b.click();
      });
    });
  });
  await delay(500);
}

async function sceneSites(browser) {
  log('[sites] breadth shots');
  const out = [];
  for (const site of SITES) {
    log(`   ${site.slug}: ${site.url}`);
    const page = await newPage(browser, { scheme: 'light' });
    await page.goto(site.url, { waitUntil: 'load', timeout: 90000 });
    await waitForPanelExpanded(page, 60000);
    await parkPointerOnPanel(page);
    await dismissGenericBanners(page);
    await waitForToastGone(page);
    await delay(800);
    await assertCleanPanelState(page, `site/${site.slug}`);
    const info = await page.evaluate(() => ({
      title: document.title,
      finalUrl: location.href,
      panelItems: document.querySelectorAll('.eagle-toc-panel .eagle-toc-item').length,
      first: [...document.querySelectorAll('.eagle-toc-panel .eagle-toc-link')].slice(0, 6).map((a) => a.textContent.trim()),
    }));
    const file = `site-${site.slug}.png`;
    await shot(page, file);
    out.push({ slug: site.slug, kind: site.kind, requestedUrl: site.url, ...info, file });
    await page.close();
  }
  return out;
}

// ───────────────────────────── main ──────────────────────────────────────

async function main() {
  const steps = parseArgs();
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const puppeteer = loadPuppeteer();

  log(`EagleToc promo capture  (${os.platform()}, steps: ${[...steps].join(',')})`);
  log(`extension: ${REPO_ROOT}\noutput:    ${OUT_DIR}\n`);

  const browser = await puppeteer.launch({
    headless: process.env.HEADFUL ? false : true,
    defaultViewport: null,
    args: [
      `--disable-extensions-except=${REPO_ROOT}`,
      `--load-extension=${REPO_ROOT}`,
      '--no-first-run',
      '--lang=zh-TW',
      '--force-color-profile=srgb',
      `--window-size=${VIEW.width},${VIEW.height}`,
    ],
    ignoreDefaultArgs: ['--disable-extensions'],
  });

  const patch = {};
  try {
    log(`chrome: ${await browser.version()}`);
    if (steps.has('sites')) {
      // must happen early: the MV3 service worker is only a live target for ~30 s after launch
      const extra = SITES.map((x) => x.whitelist).filter(Boolean);
      if (extra.length) await setWhitelist(browser, extra);
    }
    if (steps.has('top')) Object.assign(patch, { _top: await sceneTop(browser) });
    if (steps.has('jump')) patch.jump = await sceneJump(browser);
    if (steps.has('prejump')) patch.prejump = await scenePrejump(browser);
    if (steps.has('search')) patch.search = await sceneSearch(browser);
    if (steps.has('zen')) patch.zen = await sceneZen(browser);
    if (steps.has('dark')) patch.dark = await sceneDark(browser);
    if (steps.has('fullpage')) patch._full = await sceneFullPage(browser);
    if (steps.has('sites')) patch.sites = await sceneSites(browser);
  } finally {
    await browser.close();
  }

  // assemble manifest (merge with existing so partial runs keep other sections)
  const prev = readManifest();
  const next = { ...prev };
  if (patch._top || patch._full) {
    next.article = { ...(prev.article || {}), url: ARTICLE_URL, capturedAt: new Date().toISOString().slice(0, 10) };
  }
  if (patch._top) {
    next.article.viewTitle = patch._top.title;
    next.panel = patch._top.panel;
  }
  if (patch._full) {
    const f = patch._full;
    next.article.title = f.title ? f.title.text.replace(/\[.*?\]/g, '').trim() : f.docTitle;
    next.article.documentTitle = f.docTitle;
    next.pageHeight = f.pageHeight;
    next.pageWidth = f.pageWidth;
    next.pageViewport = { width: LONG.width, deviceScaleFactor: LONG.deviceScaleFactor, jpegQuality: LONG.jpegQuality };
    next.heightStableBeforeCapture = f.heightStable;
    next.allImagesLoaded = f.allImagesLoaded;
    next.slices = f.slices.map(({ file, y, width, height }) => ({ file, y, width, height }));
    next.seamCheck = f.seamCheck;
    next.titleHeading = f.title;
    next.headingsNote =
      'h2/h3 exactly as listed by the EagleToc panel (maxHeadingLevels=3); the page h1 is in titleHeading. y = heading element top in the 1280px-wide long image.';
    next.headings = f.headings;
    next.stats = f.stats;
  }
  for (const k of ['jump', 'search', 'zen', 'dark', 'sites']) if (patch[k]) next[k] = patch[k];
  // jump.panelRow comes from the prejump step; a re-run of "jump" alone must not drop it
  if (patch.jump && !patch.prejump && prev.jump && prev.jump.panelRow) next.jump.panelRow = prev.jump.panelRow;
  if (patch.prejump) next.jump = { ...(next.jump || {}), panelRow: patch.prejump.panelRow };

  // jump y in the long image (1280 layout) comes from the heading list
  if (next.jump && Array.isArray(next.headings)) {
    const hit = next.headings.find((h) => h.text === next.jump.text);
    if (hit) next.jump.y = hit.y;
  }
  const finalOrder = [
    'article', 'pageHeight', 'pageWidth', 'pageViewport', 'heightStableBeforeCapture', 'allImagesLoaded',
    'slices', 'seamCheck', 'titleHeading', 'headingsNote', 'headings', 'stats', 'jump', 'search', 'zen', 'dark', 'panel', 'sites',
  ];
  const ordered = {};
  for (const k of finalOrder) if (next[k] !== undefined) ordered[k] = next[k];
  for (const k of Object.keys(next)) if (!(k in ordered)) ordered[k] = next[k];
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(ordered, null, 2) + '\n');

  // size report
  let bytes = 0;
  for (const f of fs.readdirSync(OUT_DIR)) bytes += fs.statSync(path.join(OUT_DIR, f)).size;
  log(`\nmanifest: ${MANIFEST_PATH}`);
  log(`assets/capture total: ${(bytes / 1024 / 1024).toFixed(1)} MB`);
}

main().catch((err) => {
  console.error('\ncapture failed:', err && err.stack ? err.stack : err);
  process.exit(1);
});
