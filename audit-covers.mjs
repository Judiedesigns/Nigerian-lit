// Run with: node audit-covers.mjs
// Checks every cover image against the Open Library work it belongs to.
// Prints correct covers, wrong covers, and suggested replacements.
import https from 'https';
import { readFileSync } from 'fs';

function get(url) {
  return new Promise((resolve) => {
    const req = https.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (NigerianLitAudit/1.0)' },
      timeout: 10000,
    }, (res) => {
      let body = '';
      res.on('data', (d) => body += d);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.on('error', () => resolve({ status: 'ERROR', body: '' }));
    req.on('timeout', () => { req.destroy(); resolve({ status: 'TIMEOUT', body: '' }); });
  });
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

const src = readFileSync('./src/NigerianLit.jsx', 'utf8');

// Extract books that have both a cover URL and a work ID
const books = [...src.matchAll(
  /title: "([^"]+)".*?cover: "https:\/\/covers\.openlibrary\.org\/b\/id\/(\d+)-L\.jpg".*?openLibrary: "(https:\/\/openlibrary\.org\/works\/OL\w+)"/gs
)].map(m => ({
  title: m[1],
  coverId: m[2],
  workUrl: m[3],
  workKey: m[3].replace('https://openlibrary.org', ''),
}));

console.log(`Auditing ${books.length} books that have both a cover URL and a work ID...\n`);

const wrong = [];
const correct = [];
const errors = [];

async function run() {
  for (const book of books) {
    await delay(300);
    const r = await get(`https://openlibrary.org${book.workKey}.json`);

    if (r.status !== 200) {
      errors.push(`${book.title} — work fetch failed (${r.status})`);
      process.stdout.write('?');
      continue;
    }

    let work;
    try { work = JSON.parse(r.body); } catch {
      errors.push(`${book.title} — JSON parse failed`);
      process.stdout.write('?');
      continue;
    }

    const covers = work.covers || [];
    if (covers.map(String).includes(book.coverId)) {
      correct.push(book.title);
      process.stdout.write('✓');
    } else {
      const suggested = covers.filter(id => id > 0)[0] ?? null;
      wrong.push({ title: book.title, current: book.coverId, suggested, workKey: book.workKey });
      process.stdout.write('✗');
    }
  }

  console.log('\n');
  console.log(`✓ ${correct.length} covers verified correct`);

  if (wrong.length) {
    console.log(`\n✗ ${wrong.length} cover(s) wrong (not listed in the work):`);
    wrong.forEach(b => {
      const fix = b.suggested
        ? `→ suggest cover ID ${b.suggested}  (https://covers.openlibrary.org/b/id/${b.suggested}-L.jpg)`
        : `→ no cover available, clear it`;
      console.log(`  "${b.title}"  current: ${b.current}  ${fix}`);
    });
  }

  if (errors.length) {
    console.log(`\n? ${errors.length} could not be checked:`);
    errors.forEach(e => console.log(' ', e));
  }

  // Print a ready-to-paste summary of what to clear
  if (wrong.length) {
    console.log('\n--- Covers to CLEAR (set to "") ---');
    wrong.filter(b => !b.suggested).forEach(b => console.log(`  "${b.title}"`));
    console.log('\n--- Covers to REPLACE ---');
    wrong.filter(b => b.suggested).forEach(b =>
      console.log(`  "${b.title}"  →  https://covers.openlibrary.org/b/id/${b.suggested}-L.jpg`)
    );
  }
}

run();
