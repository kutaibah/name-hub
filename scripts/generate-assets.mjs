import { chromium } from 'playwright';
import { existsSync, mkdirSync } from 'fs';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3847';
const OUTPUT_DIR = '/opt/cursor/artifacts';

if (!existsSync(OUTPUT_DIR)) {
  mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function main() {
  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: true });

  // Generate PDFs at 960x540
  console.log('\n=== Generating PDFs ===');
  
  // Main pitch deck PDF
  console.log('Generating canton-names-pitch.pdf...');
  const pdfContext = await browser.newContext({
    viewport: { width: 960, height: 540 },
    deviceScaleFactor: 1,
  });
  const pdfPage = await pdfContext.newPage();
  await pdfPage.goto(`${BASE_URL}/pitch/index.html`, { waitUntil: 'networkidle' });
  await pdfPage.waitForTimeout(1000);
  await pdfPage.pdf({
    path: `${OUTPUT_DIR}/canton-names-pitch.pdf`,
    width: '960px',
    height: '540px',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
  });
  console.log('  Saved: canton-names-pitch.pdf');

  // Judge pitch deck PDF
  console.log('Generating pitch-judges.pdf...');
  await pdfPage.goto(`${BASE_URL}/pitch-judges/index.html`, { waitUntil: 'networkidle' });
  await pdfPage.waitForTimeout(1000);
  await pdfPage.pdf({
    path: `${OUTPUT_DIR}/pitch-judges.pdf`,
    width: '960px',
    height: '540px',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
  });
  console.log('  Saved: pitch-judges.pdf');
  await pdfContext.close();

  // Generate screenshots at 1280x720 viewport
  console.log('\n=== Generating Screenshots ===');
  const screenshotContext = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    deviceScaleFactor: 1,
  });
  const screenshotPage = await screenshotContext.newPage();

  // Homepage hero screenshot
  console.log('Capturing homepage-hero.png...');
  await screenshotPage.goto(BASE_URL, { waitUntil: 'networkidle' });
  await screenshotPage.waitForTimeout(2000);
  
  // Verify CSS loaded by checking computed styles
  const headerBg = await screenshotPage.evaluate(() => {
    const header = document.querySelector('header');
    return header ? getComputedStyle(header).backgroundColor : 'none';
  });
  console.log(`  Header background: ${headerBg}`);
  
  await screenshotPage.screenshot({
    path: `${OUTPUT_DIR}/homepage-hero.png`,
    clip: { x: 0, y: 0, width: 1280, height: 720 },
  });
  console.log('  Saved: homepage-hero.png');

  // Docs quickstart screenshot
  console.log('Capturing docs-quickstart.png...');
  await screenshotPage.goto(`${BASE_URL}/docs`, { waitUntil: 'networkidle' });
  await screenshotPage.waitForTimeout(2000);
  await screenshotPage.screenshot({
    path: `${OUTPUT_DIR}/docs-quickstart.png`,
    clip: { x: 0, y: 0, width: 1280, height: 720 },
  });
  console.log('  Saved: docs-quickstart.png');

  await screenshotContext.close();
  await browser.close();

  console.log('\n=== All assets generated ===');
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
