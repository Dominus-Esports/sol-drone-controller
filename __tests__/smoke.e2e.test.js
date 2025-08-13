// Minimal e2e smoke using Puppeteer (expects dev server on 8080)
const puppeteer = require('puppeteer');

(async () => {
  const port = process.env.PORT ? Number(process.env.PORT) : 8080;
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.goto(`http://localhost:${port}/Scenes/SOL_Superman_Drone_Controller.html`, { waitUntil: 'load' });
  // Ensure canvas exists
  await page.waitForSelector('#renderCanvas', { timeout: 5000 });
  console.log('[e2e] Scene loaded and canvas present');
  await browser.close();
})();
