import { chromium } from 'playwright';
import { existsSync, mkdirSync } from 'fs';
import { execSync } from 'child_process';

const BASE_URL = 'http://localhost:43235/app/demo/recipient';
const OUTPUT_DIR = '/opt/cursor/artifacts';

if (!existsSync(OUTPUT_DIR)) {
  mkdirSync(OUTPUT_DIR, { recursive: true });
}

const SCREENSHOTS = [
  {
    name: 'bank',
    file: 'recipient-ok.png',
    expectedBadge: 'Verified',
    expectedName: 'bank.cns',
    description: 'OK/Verified status',
  },
  {
    name: 'alice',
    file: 'recipient-confirm.png',
    expectedBadge: 'Unverified',
    expectedName: 'alice.unverified.cns',
    description: 'Unverified status (needs confirmation)',
  },
  {
    name: 'changed-party',
    file: 'recipient-changed.png',
    expectedBadge: 'Changed',
    expectedName: 'changed-party.unverified.cns',
    description: 'Changed party ID status',
  },
  {
    name: 'expired-name',
    file: 'recipient-blocked.png',
    expectedBadge: 'Expired',
    expectedName: 'expired-name.unverified.cns',
    description: 'Expired/blocked status',
  },
];

async function main() {
  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  console.log(`Navigating to ${BASE_URL}...`);
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  for (const screenshot of SCREENSHOTS) {
    console.log(`\n--- Capturing ${screenshot.file} (${screenshot.description}) ---`);

    // Clear any existing input
    const input = page.locator('input[placeholder="Enter a CNS name or party ID"]');
    await input.click();
    await input.fill('');
    await page.waitForTimeout(300);

    // Type the name to trigger resolution
    console.log(`  Typing: ${screenshot.name}`);
    await input.fill(screenshot.name);

    // Wait for resolution to complete (badge to appear)
    console.log(`  Waiting for badge: ${screenshot.expectedBadge}`);
    const badge = page.locator(`text="${screenshot.expectedBadge}"`).first();
    await badge.waitFor({ state: 'visible', timeout: 10000 });
    await page.waitForTimeout(500); // Let animations settle

    // Find the Mock Transfer Form card
    const card = page.locator('div[data-slot="card"]').filter({
      has: page.locator('div[data-slot="card-title"]:has-text("Mock Transfer Form")'),
    });

    // Verify the card exists
    const cardCount = await card.count();
    if (cardCount === 0) {
      console.error(`  ERROR: Could not find Mock Transfer Form card`);
      continue;
    }

    // Take element screenshot
    const outputPath = `${OUTPUT_DIR}/${screenshot.file}`;
    await card.screenshot({ path: outputPath });
    console.log(`  Saved: ${outputPath}`);

    // Verify screenshot contents
    const cardText = await card.textContent();
    const hasInput = cardText?.includes('Recipient');
    const hasBadge = cardText?.includes(screenshot.expectedBadge);
    const hasName = cardText?.includes(screenshot.expectedName);
    const hasSendButton = cardText?.includes('Send Transfer');
    const hasAmount = cardText?.includes('Amount');

    console.log(`  Verification:`);
    console.log(`    - Has Recipient label: ${hasInput}`);
    console.log(`    - Has ${screenshot.expectedBadge} badge: ${hasBadge}`);
    console.log(`    - Has name ${screenshot.expectedName}: ${hasName}`);
    console.log(`    - Has Amount field: ${hasAmount}`);
    console.log(`    - Has Send Transfer button: ${hasSendButton}`);

    if (!hasInput || !hasBadge || !hasName || !hasSendButton || !hasAmount) {
      console.error(`  WARNING: Some elements may be missing!`);
    }
  }

  await browser.close();
  console.log('\n=== All screenshots captured ===');

  // List output files with sizes
  console.log('\nOutput files:');
  for (const screenshot of SCREENSHOTS) {
    const path = `${OUTPUT_DIR}/${screenshot.file}`;
    try {
      const stat = execSync(`stat -c '%s' "${path}"`, { encoding: 'utf8' }).trim();
      console.log(`  ${screenshot.file}: ${Math.round(parseInt(stat) / 1024)} KB`);
    } catch {
      console.log(`  ${screenshot.file}: ERROR - file not found`);
    }
  }
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
