// Run with: node audit-links.mjs
// Checks Roving Heights and Open Library links are still live.
import https from 'https';
import { readFileSync } from 'fs';

function get(url) {
  return new Promise((resolve) => {
    const req = https.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (NigerianLitAudit/1.0)' },
      timeout: 8000,
    }, (res) => {
      resolve({ status: res.statusCode, location: res.headers.location });
      res.resume();
    });
    req.on('error', () => resolve({ status: 'ERROR' }));
    req.on('timeout', () => { req.destroy(); resolve({ status: 'TIMEOUT' }); });
  });
}

const src = readFileSync('./src/NigerianLit.jsx', 'utf8');

// Extract rovingHeights URLs
const rh = [...src.matchAll(/title: "([^"]+)".*?rovingHeights: "([^"]+)"/gs)]
  .map(m => ({ title: m[1], url: m[2] }));

// Extract openLibrary work IDs (not search fallbacks)
const ol = [...src.matchAll(/title: "([^"]+)".*?openLibrary: "(https:\/\/openlibrary\.org\/works\/[^"]+)"/gs)]
  .map(m => ({ title: m[1], url: m[2] }));

console.log(`Checking ${rh.length} Roving Heights links and ${ol.length} Open Library work links...\n`);

const issues = [];

async function run() {
  for (const book of rh) {
    await new Promise(r => setTimeout(r, 250));
    const r = await get(book.url);
    if (r.status !== 200 && r.status !== 301 && r.status !== 302) {
      issues.push(`ROVING HEIGHTS ${r.status}: "${book.title}" → ${book.url}`);
      process.stdout.write('✗');
    } else {
      process.stdout.write('✓');
    }
  }

  for (const book of ol) {
    await new Promise(r => setTimeout(r, 200));
    const r = await get(book.url + '.json');
    if (r.status !== 200) {
      issues.push(`OPEN LIBRARY ${r.status}: "${book.title}" → ${book.url}`);
      process.stdout.write('✗');
    } else {
      process.stdout.write('·');
    }
  }

  console.log('\n');
  if (issues.length === 0) {
    console.log('All links healthy.');
  } else {
    console.log(`${issues.length} issue(s) found:`);
    issues.forEach(i => console.log(' ', i));
  }
}

run();
