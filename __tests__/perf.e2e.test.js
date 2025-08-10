const puppeteer = require('puppeteer');

// Basic smoke that page loads fast enough and canvas exists
(async () => {
  const start = Date.now();
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(30000);
  await page.goto('http://localhost:8080', { waitUntil: 'domcontentloaded' });
  const t = Date.now() - start;
  if (t > 4000) throw new Error(`Page took too long to load: ${t}ms`);
  await page.waitForSelector('#renderCanvas');
  console.log('[perf-smoke] load ms:', t);
  await browser.close();
})();


