import { chromium } from 'playwright';
import { mkdirSync, existsSync } from 'fs';

async function captureSlide(slideNumber, outputPath) {
  if (!existsSync('/opt/cursor/artifacts')) {
    mkdirSync('/opt/cursor/artifacts', { recursive: true });
  }

  console.log(`Capturing slide ${slideNumber}...`);
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1280, height: 720 }
  });

  const htmlPath = `file://${process.cwd()}/docs/pitches/canton-names-pitch.html`;
  await page.goto(htmlPath, { waitUntil: 'networkidle' });

  // Navigate to the specified slide
  for (let i = 1; i < slideNumber; i++) {
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(100);
  }
  
  // Wait for slide transition
  await page.waitForTimeout(300);
  
  // Take screenshot
  await page.screenshot({ path: outputPath });
  
  await browser.close();
  console.log(`Screenshot saved to: ${outputPath}`);
}

const slideNum = parseInt(process.argv[2] || '12');
const output = process.argv[3] || '/opt/cursor/artifacts/revenue-slide.png';
captureSlide(slideNum, output).catch(console.error);
