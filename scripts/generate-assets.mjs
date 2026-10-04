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

  // App screenshots at 1280x800 viewport
  console.log('\n=== Generating App Screenshots ===');
  const appContext = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1,
  });
  const appPage = await appContext.newPage();

  // App home
  console.log('Capturing app-home.png...');
  await appPage.goto(`${BASE_URL}/app`, { waitUntil: 'networkidle' });
  await appPage.waitForTimeout(2000);
  
  // Verify light theme by checking background
  const appBg = await appPage.evaluate(() => {
    const main = document.querySelector('main');
    return main ? getComputedStyle(main).backgroundColor : 'none';
  });
  console.log(`  App main background: ${appBg}`);
  
  await appPage.screenshot({
    path: `${OUTPUT_DIR}/app-home.png`,
    clip: { x: 0, y: 0, width: 1280, height: 800 },
  });
  console.log('  Saved: app-home.png');

  // App demo - bank.cns (ok status)
  console.log('Capturing app-demo-ok.png...');
  await appPage.goto(`${BASE_URL}/app/demo/recipient`, { waitUntil: 'networkidle' });
  await appPage.waitForTimeout(1500);
  
  // Type 'bank' to get verified name
  const input = await appPage.locator('input[placeholder="Enter a CNS name or party ID"]');
  await input.fill('bank');
  await appPage.waitForTimeout(1500);
  
  // Get the Mock Transfer Form card element
  const transferCard = await appPage.locator('text=Mock Transfer Form').locator('xpath=ancestor::div[contains(@class, "rounded")]').first();
  const cardBox = await transferCard.boundingBox();
  
  if (cardBox) {
    await appPage.screenshot({
      path: `${OUTPUT_DIR}/app-demo-ok.png`,
      clip: { x: Math.max(0, cardBox.x - 20), y: Math.max(0, cardBox.y - 20), width: Math.min(cardBox.width + 40, 1240), height: Math.min(cardBox.height + 40, 760) },
    });
  } else {
    // Fallback to full page
    await appPage.screenshot({
      path: `${OUTPUT_DIR}/app-demo-ok.png`,
      clip: { x: 0, y: 0, width: 1280, height: 800 },
    });
  }
  console.log('  Saved: app-demo-ok.png');

  // App demo - alice.unverified.cns (unverified status - requires confirm)
  console.log('Capturing app-demo-confirm.png...');
  await input.fill('alice');
  await appPage.waitForTimeout(1500);
  
  if (cardBox) {
    await appPage.screenshot({
      path: `${OUTPUT_DIR}/app-demo-confirm.png`,
      clip: { x: Math.max(0, cardBox.x - 20), y: Math.max(0, cardBox.y - 20), width: Math.min(cardBox.width + 40, 1240), height: Math.min(cardBox.height + 40, 760) },
    });
  } else {
    await appPage.screenshot({
      path: `${OUTPUT_DIR}/app-demo-confirm.png`,
      clip: { x: 0, y: 0, width: 1280, height: 800 },
    });
  }
  console.log('  Saved: app-demo-confirm.png');

  // App register
  console.log('Capturing app-register.png...');
  await appPage.goto(`${BASE_URL}/app/register`, { waitUntil: 'networkidle' });
  await appPage.waitForTimeout(2000);
  await appPage.screenshot({
    path: `${OUTPUT_DIR}/app-register.png`,
    clip: { x: 0, y: 0, width: 1280, height: 800 },
  });
  console.log('  Saved: app-register.png');

  await appContext.close();
  await browser.close();

  console.log('\n=== All assets generated ===');
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
