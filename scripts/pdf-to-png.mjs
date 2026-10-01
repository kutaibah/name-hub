import { chromium } from 'playwright';
import { mkdirSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

async function renderPDFPages() {
  const pdfPath = join(rootDir, 'docs/pitches/canton-names-pitch.pdf');
  const outputDir = '/opt/cursor/artifacts/screenshots';
  
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  // We'll use a different approach - render the HTML directly for specific slides
  const htmlPath = join(rootDir, 'docs/pitches/canton-names-pitch.html');
  
  console.log('Launching browser...');
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1280, height: 720 }
  });

  console.log('Loading HTML...');
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle' });

  // Hide controls for screenshots
  await page.addStyleTag({
    content: '.controls, .slide-number, .progress { display: none !important; }'
  });

  const pagesToCapture = [1, 5, 12];
  
  for (const slideNum of pagesToCapture) {
    // Navigate to the slide
    await page.evaluate((n) => {
      document.querySelectorAll('.slide').forEach(s => s.classList.remove('active'));
      document.querySelector(`[data-slide="${n}"]`).classList.add('active');
    }, slideNum);
    
    await page.waitForTimeout(100);
    
    const outputPath = `${outputDir}/pitch-page-${slideNum}.png`;
    await page.screenshot({ path: outputPath, fullPage: false });
    console.log(`Saved slide ${slideNum}: ${outputPath}`);
  }

  await browser.close();
  console.log('\nDone!');
}

renderPDFPages().catch(console.error);
