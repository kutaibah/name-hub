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

  console.log('Loading landing page (production build)...');
  await page.goto('http://127.0.0.1:3847/', { 
    waitUntil: 'networkidle',
    timeout: 30000
  });

  // Extra wait to ensure all assets are loaded
  await page.waitForTimeout(2000);
  
  // Wait for the logo image to be loaded
  await page.waitForSelector('header img[alt="Canton Names"]', { state: 'visible', timeout: 10000 });
  
  console.log('Taking screenshot of header and hero...');
  // Capture the top portion of the page (header + hero)
  await page.screenshot({ 
    path: outputPath,
    clip: { x: 0, y: 0, width: 1280, height: 600 }
  });

  await browser.close();
  console.log(`Screenshot saved to: ${outputPath}`);
}

captureHeader().catch(console.error);
