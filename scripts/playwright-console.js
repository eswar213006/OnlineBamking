const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  page.on('console', (msg) => {
    console.log(`[console:${msg.type()}] ${msg.text()}`);
  });
  page.on('pageerror', (error) => {
    console.log(`[pageerror] ${error.message}`);
  });
  page.on('requestfailed', (request) => {
    const failure = request.failure();
    console.log(`[requestfailed] ${request.url()} ${failure?.errorText || ''}`);
  });

  try {
    const response = await page.goto('http://localhost:5177/', { waitUntil: 'networkidle' });
    console.log('status', response?.status());
    await page.waitForTimeout(3000);
    const html = await page.content();
    console.log('html length', html.length);
    const bodyText = await page.locator('body').innerText();
    console.log('body text length', bodyText.length);
    console.log('body text snippet:', bodyText.slice(0, 500));
  } catch (err) {
    console.error('error during page load:', err);
  } finally {
    await browser.close();
  }
})();