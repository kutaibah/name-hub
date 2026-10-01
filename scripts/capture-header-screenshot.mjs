import { chromium } from 'playwright';
import { mkdirSync, existsSync } from 'fs';

async function captureHeader() {
  const outputPath = '/opt/cursor/artifacts/screenshots/landing-header-logo.png';
  
  if (!existsSync('/opt/cursor/artifacts/screenshots')) {
    mkdirSync('/opt/cursor/artifacts/screenshots', { recursive: true });
  }

  console.log('Launching browser...');
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1280, height: 800 }
  });

  console.log('Loading landing page...');
  await page.goto('http://127.0.0.1:3847/', { waitUntil: 'networkidle' });

  console.log('Taking screenshot of header...');
  const header = await page.locator('header').first();
  await header.screenshot({ path: outputPath });

  await browser.close();
  console.log(`Screenshot saved to: ${outputPath}`);
}

captureHeader().catch(console.error);
