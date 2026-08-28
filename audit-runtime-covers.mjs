// Run with: node audit-runtime-covers.mjs
// Books without a hardcoded `cover` are looked up at runtime against Open Library.
// This reports what the match verification in BookCover accepts and rejects, and
// shows which books used to receive an unrelated cover.
import { readFileSync } from 'fs';

const norm = (v) => (v || "").toLowerCase().replace(/[‘’'`]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
const titleKey = (v) => norm(v).replace(/^(the|a|an) /, "");
const nameParts = (v) => norm(v).split(" ").filter((p) => p.length > 2);

function plausible(book, doc) {
  const want = titleKey(book.title), got = titleKey(doc.title);
  if (!want || !got) return false;
  if (!(got === want || got.startsWith(want) || want.startsWith(got))) return false;
  const wanted = nameParts(book.author), found = (doc.author_name || []).flatMap(nameParts);
  if (!wanted.length || !found.length) return false;
  return wanted.some((p) => found.includes(p));
}

const src = readFileSync('./src/NigerianLit.jsx', 'utf8');
const books = src.split('\n')
  .filter((l) => /^\s*\{ id: \d+, title: "/.test(l))
  .map((l) => ({
    title: l.match(/title: "([^"]+)"/)?.[1],
    author: l.match(/author: "([^"]+)"/)?.[1],
    hasCover: /cover: "https/.test(l),
    noCover: /noCover: true/.test(l),
  }))
  .filter((b) => b.title && !b.hasCover && !b.noCover);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const kept = [], rescued = [], lost = [];

console.log(`Checking ${books.length} books that rely on runtime lookup...\n`);

for (const b of books) {
  await sleep(250);
  const q = encodeURIComponent(`${b.title} ${b.author}`);
  let docs = [];
  try {
    const r = await fetch(`https://openlibrary.org/search.json?q=${q}&fields=title,author_name,cover_i&limit=5`);
    docs = (await r.json()).docs || [];
  } catch {
    console.log(`  ? ${b.title} — fetch failed`);
    continue;
  }

  const oldPick = docs[0];
  const newPick = docs.find((d) => d.cover_i && plausible(b, d));

  if (newPick) { kept.push(b.title); process.stdout.write('✓'); }
  else if (oldPick?.cover_i) { rescued.push({ b, oldPick }); process.stdout.write('✗'); }
  else { lost.push(b.title); process.stdout.write('·'); }
}

console.log(`\n\n✓ ${kept.length} verified — cover shown`);
console.log(`✗ ${rescued.length} rejected — previously showed an UNRELATED cover, now letter fallback`);
console.log(`· ${lost.length} had no cover either way`);

if (rescued.length) {
  console.log(`\nWrong covers now suppressed:`);
  rescued.forEach(({ b, oldPick }) =>
    console.log(`  "${b.title}" by ${b.author}\n      was showing: "${oldPick.title}" by ${(oldPick.author_name || ['unknown']).join(', ')}`));
}
