// Run with Playwright installed in the test environment:
// DOCS_BASE_URL=http://127.0.0.1:4175 node scripts/check-docs.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const manifest = require('./docs-manifest.json');
const base = process.env.DOCS_BASE_URL || 'http://127.0.0.1:4175';
(async () => {
 const downloadsPath = path.resolve(__dirname, '../../screenshots/docs-downloads');
 fs.mkdirSync(downloadsPath, { recursive: true });
 const browser = await chromium.launch({ downloadsPath, executablePath: process.env.CHROMIUM_PATH || '/snap/bin/chromium', args: ['--no-sandbox'] });
 try {
  for (const width of [1440, 1200, 768, 390, 320]) {
   const page = await browser.newPage({ viewport: { width, height: 900 }, acceptDownloads: true });
   const errors = [];
   page.on('pageerror', error => errors.push(error.message));
   await page.goto(base + '/', { waitUntil: 'networkidle' });
   if (width < 1200) {
    await page.getByRole('button', { name: 'Mở menu điều hướng' }).click();
    await page.locator('.MuiDrawer-root').getByText('Tài liệu', { exact: true }).click();
   } else await page.getByRole('link', { name: 'Tài liệu', exact: true }).click();
   await page.getByRole('heading', { name: 'Tài liệu dự án', exact: true }).waitFor();
   assert.equal(await page.getByRole('navigation', { name: 'Danh mục tài liệu' }).getByRole('link').count(), 11);
   for (const doc of manifest) {
    await page.getByRole('navigation', { name: 'Danh mục tài liệu' }).getByRole('link', { name: doc.title, exact: false }).click();
    await page.getByRole('article', { name: doc.title, exact: true }).waitFor();
    assert.equal(new URL(page.url()).searchParams.get('file'), doc.path);
    assert(await page.locator('article').innerText());
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `Overflow ${width} ${doc.path}`);
   }
   await page.goto(base + '/docs?file=DESIGN.md', { waitUntil: 'networkidle' });
   const downloadPromise = page.waitForEvent('download');
   await page.getByRole('button', { name: 'Tải Markdown' }).click();
   const download = await downloadPromise;
   assert.equal(download.suggestedFilename(), 'DESIGN.md');
   assert.equal(fs.readFileSync(await download.path(), 'utf8'), fs.readFileSync(path.resolve(__dirname, '../../DESIGN.md'), 'utf8'));
   await page.goto(base + '/docs?file=missing.md', { waitUntil: 'networkidle' });
   assert.match(await page.getByRole('alert').innerText(), /Không tìm thấy/);
   await page.getByRole('link', { name: 'Tổng quan dự án', exact: false }).click();
   await page.getByRole('article', { name: 'Tổng quan dự án' }).getByRole('link', { name: 'tài liệu vận hành', exact: true }).click();
   await page.getByRole('article', { name: 'Triển khai và vận hành' }).waitFor();
   assert.equal(errors.length, 0, errors.join('\n'));
   console.log(`PASS ${width}px: navbar, 11 documents, deep link, download, missing doc, internal link, overflow, JS errors`);
   await page.close();
  }
 } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
