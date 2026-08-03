// Screenshots every page at desktop and mobile widths, and reports JS errors,
// failed requests and images that never decoded. Lazy loading is disabled and
// the page is scrolled end to end first, otherwise below-the-fold art captures
// blank.
//
//   npm --prefix tools install puppeteer     (once)
//   tools/serve.sh &                          (in another shell)
//   ONLY=home node tools/shoot.js             (or omit ONLY for all pages)
//
// Output lands in tools/shots/ (gitignored).

const path = require('path');
const ROOT = path.join(__dirname, '..');
const puppeteer = require(path.join(__dirname, 'node_modules/puppeteer'));
const OUT = path.join(__dirname, 'shots');
require('fs').mkdirSync(OUT, { recursive: true });

const all = [['home','http://localhost:8765/'], ['products','http://localhost:8765/products/'],
             ['spaces','http://localhost:8765/spaces/'], ['case-studies','http://localhost:8765/case-studies/']];
const pages = process.env.ONLY ? all.filter(p => p[0] === process.env.ONLY) : all;

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'], protocolTimeout: 180000 });
  for (const [name, url] of pages) {
    for (const [label, w, h] of [['desktop',1440,900], ['mobile',390,844]]) {
      const page = await browser.newPage();
      const errs = [];
      page.on('pageerror', e => errs.push('JS: ' + e.message));
      page.on('requestfailed', r => errs.push('FAILED: ' + r.url().split('/').pop()));
      page.on('response', r => { if (r.status() >= 400) errs.push(r.status() + ': ' + r.url().split('/').pop()); });
      await page.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

      // Force lazy images to load by disabling the attribute outright.
      await page.evaluate(() => {
        document.querySelectorAll('img[loading="lazy"]').forEach(i => i.loading = 'eager');
      });
      const height = await page.evaluate(() => document.body.scrollHeight);
      for (let y = 0; y < height; y += Math.round(h * 0.8)) {
        await page.evaluate(v => window.scrollTo(0, v), y);
        await new Promise(r => setTimeout(r, 100));
      }
      await page.evaluate(() => window.scrollTo(0, 0));
      await new Promise(r => setTimeout(r, 1500));

      const notLoaded = await page.evaluate(() =>
        [...document.images].filter(i => !i.complete || i.naturalWidth === 0)
          .map(i => i.currentSrc.split('/').pop() || '(no src)'));
      if (notLoaded.length) console.log(`  ${name}/${label} images not loaded:`, notLoaded);

      await page.screenshot({ path: `${OUT}/${name}-${label}.png`, fullPage: true });
      if (errs.length) console.log(`  ${name}/${label}:`, [...new Set(errs)].slice(0,6));
      await page.close();
    }
    console.log('  shot', name);
  }
  await browser.close();
})();
