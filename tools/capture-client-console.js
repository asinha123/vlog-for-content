const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const url = process.argv[2] || 'http://localhost:4201';
  const outScreenshot = process.argv[3] || 'tools/diag.png';
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  const logs = [];

  // Attach error handlers before any script runs to capture stack traces
  await page.evaluateOnNewDocument(() => {
    window.addEventListener('error', (e) => {
      try {
        console.error('__PAGE_ERROR__', e.message, e.error && e.error.stack);
      } catch (err) {
        console.error('__PAGE_ERROR__', e.message);
      }
    });
    window.addEventListener('unhandledrejection', (e) => {
      try {
        console.error('__UNHANDLED_REJECTION__', e.reason && (e.reason.stack || e.reason));
      } catch (err) {
        console.error('__UNHANDLED_REJECTION__');
      }
    });
  });

  page.on('console', msg => {
    (async () => {
      const type = msg.type();
      const text = msg.text();
      const args = [];
      for (const a of msg.args()) {
        try {
          args.push(await a.jsonValue());
        } catch (e) {
          try {
            args.push(a.toString());
          } catch (e2) {
            args.push({ error: e2.message });
          }
        }
      }
      logs.push({ source: 'console', type, text, args });
      console.log(`[console:${type}] ${text}`);
      if (args.length) console.log(' args:', JSON.stringify(args));
    })();
  });

  page.on('pageerror', err => {
    logs.push({ source: 'pageerror', message: err.message, stack: err.stack });
    console.error('[pageerror]', err.message);
  });

  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 20000 });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: outScreenshot, fullPage: false });
    const content = await page.content();
    console.log('\n--- PAGE HTML (first 800 chars) ---');
    console.log(content.slice(0, 800));
  } catch (e) {
    console.error('Navigation/timeout error:', e && e.message);
    logs.push({ source: 'navigation', message: e && e.message });
  }

  await browser.close();
  fs.writeFileSync('tools/console-log.json', JSON.stringify(logs, null, 2));
  console.log('\nSaved screenshot to', outScreenshot);
  console.log('Saved logs to tools/console-log.json');
})();
