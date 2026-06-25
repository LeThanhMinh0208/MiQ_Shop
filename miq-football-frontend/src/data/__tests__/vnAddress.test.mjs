/**
 * Node.js smoke test — run with: node src/data/__tests__/vnAddress.test.mjs
 * No test framework needed; exits 1 on failure.
 */
import { getCities, getDistricts, getWards } from '../vnAddress.js';

let failed = 0;
const assert = (cond, msg) => {
  if (!cond) { console.error('FAIL:', msg); failed++; }
  else { console.log('pass:', msg); }
};

const cities = getCities();

assert(cities.length === 63, `province count === 63 (got ${cities.length})`);
assert(cities.every(c => c.code && c.name), 'every city has code + name');
const sorted = cities.slice().sort((a, b) => a.name.localeCompare(b.name, 'vi'));
assert(
  cities.every((c, i) => c.code === sorted[i].code),
  'getCities() is alphabetically sorted',
);

// Spot-check a few provinces that were wrong in the old dataset
const codes = cities.map(c => c.code);
assert(codes.includes('BRVT'), 'Bà Rịa - Vũng Tàu present (code BRVT)');
assert(codes.includes('DNI'),  'Đồng Nai present (code DNI) — not "BH"');
assert(codes.includes('KH'),   'Khánh Hòa present (code KH) — not "NTG"');

// Districts
const hnDistricts = getDistricts('HN');
assert(hnDistricts.length > 0, 'HN has districts');
assert(hnDistricts.every(d => d.code && d.name), 'HN districts have code + name');

// Unknown province → empty array (not throw)
assert(getDistricts('UNKNOWN').length === 0, 'unknown province → empty districts');
assert(getWards('UNKNOWN', 'D01').length === 0, 'unknown province → empty wards');

if (failed) { console.error(`\n${failed} assertion(s) failed`); process.exit(1); }
else { console.log('\nAll assertions passed.'); }
