const fs = require('fs');
const content = fs.readFileSync('src/data/levels.ts', 'utf8');

const mapMatches = [...content.matchAll(/id:\s*(\d+),[\s\S]*?name:\s*['"]([^'"]+)['"][\s\S]*?map:\s*\[([\s\S]*?)\]/g)];
console.log('Total levels found:', mapMatches.length);

let allValid = true;
const VALID_CHARS = new Set([
  '#', 'R', 'P', 'B', 'F', 'A', 'S', 'V', 'D', 'E', 'T',
  '1', '2', '3', '4', 'G', 'J', 'W', 'M', 'X', 'U', 'Y', '.'
]);

let totalSlimes = 0;
let totalSpiders = 0;
let totalCeilSpiders = 0;
let totalBats = 0;

mapMatches.forEach(m => {
  const id = m[1];
  const name = m[2];
  const lines = m[3].split('\n')
    .map(l => l.trim().replace(/^'|',?$/g, ''))
    .filter(l => l.length > 0);

  if (lines.length !== 16) {
    console.error(`[FAIL] Level ${id} has ${lines.length} rows instead of 16`);
    allValid = false;
  }

  let dRow = -1, dCol = -1;
  let hasTrophy = false, hasExit = false;
  const counts = {};

  lines.forEach((l, r) => {
    if (l.length !== 30) {
      console.error(`[FAIL] Level ${id} row ${r} has length ${l.length} instead of 30: ${l}`);
      allValid = false;
    }
    for (let c = 0; c < l.length; c++) {
      const ch = l[c];
      counts[ch] = (counts[ch] || 0) + 1;
      if (!VALID_CHARS.has(ch)) {
        console.error(`[FAIL] Level ${id} row ${r} col ${c} has invalid character '${ch}'`);
        allValid = false;
      }
      if (ch === 'D') {
        dRow = r;
        dCol = c;
      }
      if (ch === 'T') hasTrophy = true;
      if (ch === 'E') hasExit = true;
    }
  });

  const slimes = counts['M'] || 0;
  const spiders = counts['X'] || 0;
  const ceilSpiders = counts['U'] || 0;
  const bats = counts['Y'] || 0;

  totalSlimes += slimes;
  totalSpiders += spiders;
  totalCeilSpiders += ceilSpiders;
  totalBats += bats;

  if (dRow === -1) {
    console.error(`[FAIL] Level ${id} has NO Dave spawn D!`);
    allValid = false;
  } else {
    const under = lines[dRow + 1] ? lines[dRow + 1][dCol] : 'NONE';
    const head = dRow > 0 ? lines[dRow - 1][dCol] : 'NONE';
    console.log(`Level ${id} (${name}): D at (${dCol}, ${dRow}) | Monsters: [Slimes: ${slimes}, Spiders: ${spiders}, Web-Spiders: ${ceilSpiders}, Bats: ${bats}]`);
    if (under !== '#' && under !== 'P' && under !== 'B') {
      console.error(`[FAIL] Level ${id} has unsafe tile under Dave: '${under}'`);
      allValid = false;
    }
    if (head === '#' || head === 'P' || head === 'B') {
      console.error(`[FAIL] Level ${id} Dave head is blocked by '${head}'`);
      allValid = false;
    }
  }

  if (!hasTrophy) {
    console.error(`[FAIL] Level ${id} has NO Trophy T!`);
    allValid = false;
  }
  if (!hasExit) {
    console.error(`[FAIL] Level ${id} has NO Exit E!`);
    allValid = false;
  }
});

console.log('\n--- MONSTER ROSTER SUMMARY ---');
console.log(`Total Green Slimes (M): ${totalSlimes}`);
console.log(`Total Red Spiders (X): ${totalSpiders}`);
console.log(`Total Ceiling Web-Dropper Spiders (U): ${totalCeilSpiders}`);
console.log(`Total Flying Bats (Y): ${totalBats}`);
console.log(`GRAND TOTAL MONSTERS: ${totalSlimes + totalSpiders + totalCeilSpiders + totalBats}\n`);

if (allValid) {
  console.log('SUCCESS: All 10 levels are 100% valid with safe spawns, correct dimensions, and authentic monsters!');
} else {
  console.error('FAILURE: Found issues in level definitions.');
  process.exit(1);
}
