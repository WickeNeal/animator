// Capture helpers for a product tour: real screenshots of a web app plus the element boxes
// the tour zooms to. A piece's capture.mjs imports this:
//
//   import { open } from '<skill>/tools/capture-kit.mjs';
//   const c = await open(new URL('.', import.meta.url).pathname, {
//     app: 'http://localhost:3000', login: { email: 'demo@example.com', password: '…' },
//     swap: [['Demo User', 'Presenter Name']],   // text rewritten in the DOM before every shot
//     initials: ['DU', 'PN'],                    // avatar initials split over two spans
//   });
//   await c.login();
//   await c.page.goto(c.APP + '/settings/ai-agents'); await c.idle();
//   await c.shot('agents.png');
//   await c.box('agents.png', 'button', 'Enable AI agents', 'button');
//   await c.done();                       // writes src/boxes.js, closes the browser
//
// Screens are 1440x900 css px at 2x, saved 2160 wide (asset px = css px * 1.5): the engine's frameBox() assumes it.
import { createRequire } from 'node:module';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');   // the skill's own node_modules

export const K = 1.5;
export const VIEWPORT = { width: 1440, height: 900 };

export async function open(pieceDir, { app, login = null, swap = [], initials = null } = {}) {
  if (!app) throw new Error('capture-kit: pass { app: <the app URL> }');
  const OUT = pieceDir + '/assets/', boxesFile = pieceDir + '/src/boxes.js';
  fs.mkdirSync(OUT, { recursive: true }); fs.mkdirSync(pieceDir + '/src', { recursive: true });
  const BOX = fs.existsSync(boxesFile) ? JSON.parse(fs.readFileSync(boxesFile, 'utf8').replace(/^[\s\S]*?const BOX = /, '').replace(/;\s*$/, '')) : {};
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  const SW = swap;

  const tidy = () => page.evaluate(({ SW, initials }) => {
    const f = (v) => SW.reduce((a, [x, y]) => a.replaceAll(x, y), v);
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (w.nextNode()) w.currentNode.nodeValue = f(w.currentNode.nodeValue);
    if (initials) document.querySelectorAll('span').forEach((e) => { if (e.children.length === 2 && e.textContent.trim() === initials[0]) { e.children[0].textContent = initials[1][0]; e.children[1].textContent = initials[1][1]; } });
    document.querySelectorAll('input').forEach((i) => { i.value = f(i.value); });
  }, { SW, initials });

  const c = {
    page, ctx, BOX, APP: app,
    idle: () => page.waitForLoadState('networkidle'),
    async login() {
      await page.goto(app + '/login');
      if (!login) throw new Error('capture-kit: pass { login: { email, password } } to log in');
      await page.fill('input[type=email], input[name=email]', login.email);
      await page.fill('input[type=password]', login.password);
      await page.keyboard.press('Enter');
      await page.waitForURL((u) => !u.pathname.startsWith('/login'), { timeout: 20000 });
    },
    // screenshot at 2x, resampled to 2160 wide (or o.width) so 1 css px = K asset px
    async shot(name, o = {}) {
      await page.waitForTimeout(1200); await tidy();
      await page.screenshot({ path: OUT + name, ...o });
      execFileSync('sips', ['--resampleWidth', String(o.width || (o.clip ? Math.round(o.clip.width * K) : 2160)), OUT + name], { stdio: 'ignore' });
      console.log('saved', name);
    },
    // box of the element whose own text is `text`, walked up to its button / bordered card / row; stored in asset px
    async box(file, key, text, up = 'self', nth = 0) {
      const r = await page.evaluate(({ text, up, nth }) => {
        const all = [...document.querySelectorAll('body *')].filter((e) => e.offsetParent !== null || getComputedStyle(e).position === 'fixed');
        const hits = all.filter((e) => (e.innerText || '').trim() === text && ![...e.children].some((ch) => (ch.innerText || '').trim() === text));
        let el = hits[nth]; if (!el) return null;
        const bordered = (e) => { const s = getComputedStyle(e); return (parseFloat(s.borderTopWidth) > 0 || s.boxShadow !== 'none') && e.getBoundingClientRect().height > 50; };
        if (up === 'button') el = el.closest('button, a, label, [role=button]') || el;
        if (up === 'card') { let p = el.parentElement; while (p && !bordered(p)) p = p.parentElement; el = p || el; }
        if (up === 'row') el = el.parentElement;
        const b = el.getBoundingClientRect(); return [b.x, b.y, b.width, b.height];
      }, { text, up, nth });
      if (!r) return console.log('MISSING', file, key, text);
      (BOX[file] ||= {})[key] = r.map((v) => Math.round(v * K));
    },
    // box of a locator (inputs, things without their own text)
    async boxOf(file, key, locator) {
      const b = await locator.boundingBox(); if (!b) return console.log('MISSING', file, key);
      (BOX[file] ||= {})[key] = [b.x, b.y, b.width, b.height].map((v) => Math.round(v * K));
    },
    async done() {
      fs.writeFileSync(boxesFile, '// element boxes in asset px [x, y, w, h], measured by capture.mjs\nconst BOX = ' + JSON.stringify(BOX, null, 1) + ';\n');
      await browser.close();
    },
  };
  return c;
}
