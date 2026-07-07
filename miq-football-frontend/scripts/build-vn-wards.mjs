/**
 * Build script: generate public/wards/{provinceCode}.json for all 63 provinces.
 *
 * Data source: sub-vn npm package (GSO 2019 pre-reform data matching vnAddress.js structure).
 *
 * Run:  node scripts/build-vn-wards.mjs
 *
 * Output: one JSON file per province — { [districtCode]: [wardName, ...] }
 * AddressForm fetches the file for the selected province on demand (lazy, ~10–30 kB each).
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require   = createRequire(import.meta.url);

// ── 1. Load sub-vn tree (province → district → ward hierarchy) ───────────────
const tree = require('../node_modules/sub-vn/json_data/tree.json');

// ── 2. Load vnAddress.js province/district structure ──────────────────────────
// Extract only the VN_ADDRESS object literal (before the export helper functions).
const vnAddressText = readFileSync(
  join(__dirname, '../src/data/vnAddress.js'), 'utf8'
);
// Grab from "const VN_ADDRESS = {" up to the closing "};" before the first export
const objMatch = vnAddressText.match(/const VN_ADDRESS = (\{[\s\S]+?\n\})\s*;/);
if (!objMatch) throw new Error('Cannot parse VN_ADDRESS from vnAddress.js');

const { Module } = await import('module');
const m = new Module();
m._compile(`module.exports = ${objMatch[1]};`, 'vnAddress-data.js');
const VN_ADDRESS = m.exports;

// ── 3. Name normalisation helpers ─────────────────────────────────────────────

/**
 * Fold Vietnamese text to ASCII-comparable form so that spelling variants like
 * "Hoà"/"Hòa", "Thuỷ"/"Thủy", "Qui"/"Quy" all match the same key.
 *
 * Steps: NFD-decompose → strip combining marks → replace Đ/đ → collapse spaces.
 */
const fold = (s) =>
  s.normalize('NFD')
    .replace(/[̀-ͯ]/g, '')  // strip all combining diacritic marks
    .replace(/[Đđ]/g, 'd')            // Đ has no decomposed form → manual
    .replace(/['''`]/g, '')           // apostrophes in Tây Nguyên district names
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

// Strip province-level prefixes so we can match "Tỉnh Bến Tre" → "Bến Tre"
const normaliseProvinceName = (n) =>
  fold(n.replace(/^(Tỉnh|Thành phố|Thành Phố|TP\.\s*)/i, '').trim());

// Strip district-level prefixes so we can match "Thành phố Bến Tre" → "Bến Tre"
const normaliseDistrictName = (n) =>
  fold(n.replace(/^(Quận|Huyện|Thị xã|TX\.\s*|Thành phố|TP\.\s*|Thành Phố)/i, '').trim());

// ── 4. Build reverse-lookup: normalised province name → our province code ─────
const provByNorm = {};
for (const [code, prov] of Object.entries(VN_ADDRESS)) {
  provByNorm[normaliseProvinceName(prov.name)] = code;
}

// ── 5. Process each sub-vn province and build ward lookup ────────────────────
const outDir = join(__dirname, '../public/wards');
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

let totalProvinces = 0;
let totalDistricts = 0;
let totalWards     = 0;
let unmatchedProvinces = [];
let unmatchedDistricts = [];

for (const subProv of Object.values(tree)) {
  const normProvName = normaliseProvinceName(subProv.name);
  const provCode = provByNorm[normProvName];

  if (!provCode) {
    unmatchedProvinces.push(subProv.name);
    continue;
  }

  const ourDistricts = VN_ADDRESS[provCode].districts;

  // Build reverse-lookup for districts in this province: normalised name → our code
  const distByNorm = {};
  for (const [dCode, dist] of Object.entries(ourDistricts)) {
    distByNorm[normaliseDistrictName(dist.name)] = dCode;
  }

  // Output object: { [ourDistCode]: [wardName, ...] }
  const provWards = {};
  let matched = 0;

  for (const subDist of Object.values(subProv.districts)) {
    const normDistName = normaliseDistrictName(subDist.name);
    const distCode = distByNorm[normDistName];

    if (!distCode) {
      unmatchedDistricts.push(`${subProv.name} / ${subDist.name}`);
      continue;
    }

    const wardNames = Object.values(subDist.wards || {}).map((w) => w.name);
    provWards[distCode] = wardNames;
    totalWards += wardNames.length;
    totalDistricts++;
    matched++;
  }

  if (matched > 0) {
    writeFileSync(
      join(outDir, `${provCode}.json`),
      JSON.stringify(provWards),
      'utf8'
    );
    totalProvinces++;
  }
}

// ── 6. Report ─────────────────────────────────────────────────────────────────
console.log(`\n✅  Ward data generated:`);
console.log(`   Provinces: ${totalProvinces}/63`);
console.log(`   Districts matched: ${totalDistricts}`);
console.log(`   Total wards: ${totalWards}`);

if (unmatchedProvinces.length) {
  console.log(`\n⚠️  Unmatched provinces (${unmatchedProvinces.length}):`);
  unmatchedProvinces.forEach((n) => console.log(`   • ${n}`));
}
if (unmatchedDistricts.length) {
  console.log(`\n⚠️  Unmatched districts (${unmatchedDistricts.length}):`);
  unmatchedDistricts.slice(0, 20).forEach((n) => console.log(`   • ${n}`));
  if (unmatchedDistricts.length > 20)
    console.log(`   … and ${unmatchedDistricts.length - 20} more`);
}
console.log('');
