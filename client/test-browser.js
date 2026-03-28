const puppeteer = require('puppeteer');

(async () => {
  try {
    const browser = await puppeteer.launch({ 
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });
    const page = await browser.newPage();
    page.on('console', msg => console.log('LOG:', msg.text()));
    page.on('pageerror', err => console.log('ERROR:', err.message));
    page.on('requestfailed', request => {
      console.log('REQUEST FAILED:', request.url(), request.failure()?.errorText || 'Unknown error');
    });

    console.log('Navigating...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
    console.log('Title:', await page.title());
    const bodyHTML = await page.evaluate(() => document.body.innerHTML);
    if (bodyHTML.includes('Query your company data')) {
        console.log('MAIN CONTENT RENDERED');
    } else {
        console.log('MAIN CONTENT MISSING');
        console.log('Body HTML:', bodyHTML.substring(0, 500));
    }
    
    await browser.close();
  } catch (err) {
    console.error('PUPPETEER EXCEPTION:', err);
  }
})();
