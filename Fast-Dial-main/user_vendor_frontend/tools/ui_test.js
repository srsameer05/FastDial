import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-features=IsolateOrigins,site-per-process'] });
  const page = await browser.newPage();
  const envUrl = process.env.TEST_URL;
  const urlsToTry = envUrl ? [envUrl] : ['http://localhost:5174', 'http://localhost:5173', 'http://127.0.0.1:5174', 'http://127.0.0.1:5173'];
  console.log('Trying frontend URLs:', urlsToTry);

  let navigated = false;
  for (const base of urlsToTry) {
    const url = base.replace(/\/$/, '') + '/';
    try {
      console.log('Navigating to', url);
      await page.goto(url, { waitUntil: 'networkidle', timeout: 10000 });
      navigated = true;
      break;
    } catch (e) {
      console.warn('Failed to navigate to', url, e.message);
    }
  }

  if (!navigated) {
    console.error('Could not reach frontend on any candidate URL');
    process.exit(3);
  }

  // Wait for the business category select
  await page.waitForSelector('select[name="bussiness_category"]', { timeout: 10000 });

  const options = await page.$$eval('select[name="bussiness_category"] option', opts =>
    opts.map(o => o.textContent.trim()).filter(text => text && text !== 'Select a category' && text !== 'Loading categories...')
  );

  console.log('Found category options:', options);

  if (!options || options.length === 0) {
    console.error('No category options found');
    process.exit(2);
  }

  console.log('UI test passed: categories populated');
  await browser.close();
})();
