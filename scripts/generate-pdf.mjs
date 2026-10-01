import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { copyFileSync, mkdirSync, existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

async function generatePDF() {
  const htmlPath = join(rootDir, 'docs/pitches/canton-names-pitch.html');
  const pdfPath = join(rootDir, 'docs/pitches/canton-names-pitch.pdf');
  const artifactPath = '/opt/cursor/artifacts/canton-names-pitch.pdf';

  console.log('Launching browser...');
  const browser = await chromium.launch();
  
  // Set viewport to match slide dimensions
  const page = await browser.newPage({
    viewport: { width: 1280, height: 720 }
  });

  console.log('Loading HTML...');
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle' });

  console.log('Generating PDF (1280x720 landscape)...');
  await page.pdf({
    path: pdfPath,
    width: '1280px',
    height: '720px',
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
  });

  await browser.close();

  console.log(`PDF saved to: ${pdfPath}`);

  // Copy to artifacts
  if (!existsSync('/opt/cursor/artifacts')) {
    mkdirSync('/opt/cursor/artifacts', { recursive: true });
  }
  copyFileSync(pdfPath, artifactPath);
  console.log(`Artifact saved to: ${artifactPath}`);

  return pdfPath;
}

generatePDF().catch(console.error);
