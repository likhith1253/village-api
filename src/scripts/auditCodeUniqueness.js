/**
 * Deep audit script: cross-file analysis of MDDS code uniqueness.
 * Checks whether MDDS DTC and MDDS Sub_DT codes repeat across different state files.
 */
import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';

const DATASET_DIR = 'D:\\dataset';

function main() {
  const files = fs.readdirSync(DATASET_DIR)
    .filter(f => f.endsWith('.xls'))
    .sort();

  console.log(`Scanning ${files.length} files...\n`);

  // Maps: code -> Set of stateCode values that contain it
  const districtCodeMap  = new Map(); // dtc  -> Set<stc>
  const subDistCodeMap   = new Map(); // subdt -> Set<stc>
  const villageCodeMap   = new Map(); // plcn  -> Set<stc>

  for (const file of files) {
    const filePath = path.join(DATASET_DIR, file);
    const workbook = XLSX.readFile(filePath);
    const ws = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });

    for (const row of rows) {
      const plcn  = String(row['MDDS PLCN']   || '').trim();
      const dtc   = String(row['MDDS DTC']    || '').trim();
      const subdt = String(row['MDDS Sub_DT'] || '').trim();
      const stc   = String(row['MDDS STC']    || '').trim();

      // District rows: plcn=000000, subdt=00000, dtc!=000
      if (plcn === '000000' && subdt === '00000' && dtc !== '000') {
        if (!districtCodeMap.has(dtc)) districtCodeMap.set(dtc, new Set());
        districtCodeMap.get(dtc).add(stc);
      }

      // SubDistrict rows: plcn=000000, subdt!=00000
      if (plcn === '000000' && subdt !== '00000') {
        if (!subDistCodeMap.has(subdt)) subDistCodeMap.set(subdt, new Set());
        subDistCodeMap.get(subdt).add(stc);
      }

      // Village rows: plcn!=000000
      if (plcn !== '000000') {
        if (!villageCodeMap.has(plcn)) villageCodeMap.set(plcn, new Set());
        villageCodeMap.get(plcn).add(stc);
      }
    }

    console.log(`Processed: ${file}`);
  }

  // Collisions = code appears in more than one state
  const districtCollisions  = [...districtCodeMap.entries()].filter(([, states]) => states.size > 1);
  const subDistCollisions   = [...subDistCodeMap.entries()].filter(([, states]) => states.size > 1);
  const villageCollisions   = [...villageCodeMap.entries()].filter(([, states]) => states.size > 1);

  console.log('\n==================================================');
  console.log('          MDDS CODE UNIQUENESS AUDIT REPORT      ');
  console.log('==================================================');

  console.log(`\nTotal unique District codes   : ${districtCodeMap.size}`);
  console.log(`District code collisions      : ${districtCollisions.length}`);
  if (districtCollisions.length > 0) {
    console.log('SAMPLE COLLISIONS (first 10):');
    districtCollisions.slice(0, 10).forEach(([code, states]) => {
      console.log(`  DTC ${code} -> States: [${[...states].join(', ')}]`);
    });
  }

  console.log(`\nTotal unique SubDistrict codes: ${subDistCodeMap.size}`);
  console.log(`SubDistrict code collisions   : ${subDistCollisions.length}`);
  if (subDistCollisions.length > 0) {
    console.log('SAMPLE COLLISIONS (first 10):');
    subDistCollisions.slice(0, 10).forEach(([code, states]) => {
      console.log(`  Sub_DT ${code} -> States: [${[...states].join(', ')}]`);
    });
  }

  console.log(`\nTotal unique Village codes    : ${villageCodeMap.size}`);
  console.log(`Village code collisions       : ${villageCollisions.length}`);
  if (villageCollisions.length > 0) {
    console.log('SAMPLE COLLISIONS (first 10):');
    villageCollisions.slice(0, 10).forEach(([code, states]) => {
      console.log(`  PLCN ${code} -> States: [${[...states].join(', ')}]`);
    });
  }

  console.log('\n==================================================');
  console.log('VERDICT:');
  if (districtCollisions.length > 0)
    console.log('  ❌ MDDS DTC is NOT globally unique — composite key needed.');
  else
    console.log('  ✅ MDDS DTC appears globally unique in this dataset.');

  if (subDistCollisions.length > 0)
    console.log('  ❌ MDDS Sub_DT is NOT globally unique — composite key needed.');
  else
    console.log('  ✅ MDDS Sub_DT appears globally unique in this dataset.');

  if (villageCollisions.length > 0)
    console.log('  ❌ MDDS PLCN is NOT globally unique — composite key needed.');
  else
    console.log('  ✅ MDDS PLCN appears globally unique in this dataset.');

  console.log('==================================================');
}

main();
