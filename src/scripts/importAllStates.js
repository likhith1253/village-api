import { PrismaClient } from '@prisma/client';
import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';

/**
 * Village API — Production Bulk Importer (Final)
 *
 * Architecture: Two-Pass Design
 *
 * PASS 1 — Pure in-memory, ZERO database calls:
 *   Read all 29 XLS files sequentially.
 *   Apply MDDS hierarchy rules row by row.
 *   Collect into four in-memory structures:
 *     statesMap       Map<stateCode, { stateCode, name }>
 *     districtsMap    Map<districtCode, { districtCode, name, stateCode }>
 *     subDistrictsMap Map<"${districtCode}_${subdt}", { subDistrictCode, name, districtCode, stateCode }>
 *     villagesArray   Array<{ villageCode, name, fullAddress, _stateCode, _districtCode, _subDtKey }>
 *
 * PASS 2 — Bulk database writes, minimal round trips:
 *   [1]  Country upsert                                    → 1 DB call
 *   [2]  State createMany + skipDuplicates                 → 1 DB call
 *   [3]  State findMany — resolve stateCode → DB id        → 1 DB call
 *   [4]  District createMany + skipDuplicates              → 1 DB call
 *   [5]  District findMany — resolve districtCode → DB id  → 1 DB call
 *   [6]  SubDistrict createMany + skipDuplicates           → 1 DB call
 *   [7]  SubDistrict findMany (include district)           → 1 DB call
 *   [8]  DB ping — wake Neon before village bulk writes    → 1 DB call
 *   [9]  Village createMany batches (2000/batch)           → ~229 DB calls
 *   [10] Verification counts                               → 6 DB calls
 *   Total: ~243 DB calls (vs ~462,598 in per-row architecture)
 *
 * Estimated runtime: 3–6 minutes
 * Memory peak:       ~400–450 MB
 */

// ─────────────────────────────────────────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────────────────────────────────────────

const DATASET_DIR       = 'D:\\dataset';
const VILLAGE_BATCH_SIZE = 2000;

// ─────────────────────────────────────────────────────────────────────────────
// Neon Retry Wrapper
// Reconnects on P1001 / P1002 (auto-suspend connection drops).
// Every DB call in this importer is wrapped with withRetry().
// ─────────────────────────────────────────────────────────────────────────────

let prisma = new PrismaClient();

async function withRetry(fn, retries = 5, delayMs = 3000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn(prisma);
    } catch (err) {
      const isConnErr =
        err?.code === 'P1001' ||
        err?.code === 'P1002' ||
        String(err?.message ?? '').includes("Can't reach database");

      if (isConnErr && attempt < retries) {
        console.warn(
          `  ⚠  DB connection lost (attempt ${attempt}/${retries}). Reconnecting in ${delayMs / 1000}s...`
        );
        await prisma.$disconnect().catch(() => {});
        await new Promise(r => setTimeout(r, delayMs));
        prisma = new PrismaClient();
      } else {
        throw err;
      }
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Convert any value to Title Case string.
 */
function toTitleCase(val) {
  if (val === undefined || val === null || val === '') return '';
  return String(val)
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, c => c.toUpperCase());
}

/**
 * Normalize a MDDS code field.
 *
 * The xlsx library may return numeric cell values as JS numbers.
 * e.g. district code "203" stored numerically → returned as 203 (number)
 *      subdistrict code "01013" stored numerically → returned as 1013 (number)
 *      sentinel "000000" stored numerically → returned as 0 (number)
 *
 * This function converts to string and zero-pads to the expected width.
 *
 * @param {*}      val       Raw cell value (string or number)
 * @param {number} padLength Expected width (STC=2, DTC=3, Sub_DT=5, PLCN=6)
 * @returns {string}
 */
function normalizeCode(val, padLength) {
  if (val === undefined || val === null) {
    return '0'.repeat(padLength);
  }
  const s = String(val).trim();
  if (s === '' || s === 'undefined') {
    return '0'.repeat(padLength);
  }
  return s.padStart(padLength, '0');
}

/**
 * Split an array into chunks of `size`.
 */
function chunk(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Log current Node.js memory usage at a named checkpoint.
 */
function logMemory(label) {
  const m = process.memoryUsage();
  console.log(
    `  [MEM ${label}] RSS=${(m.rss / 1048576).toFixed(1)} MB  ` +
    `Heap=${(m.heapUsed / 1048576).toFixed(1)}/${(m.heapTotal / 1048576).toFixed(1)} MB`
  );
}

/**
 * Return elapsed time string since `startMs` in seconds.
 */
function since(startMs) {
  return `${((Date.now() - startMs) / 1000).toFixed(1)}s`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  const globalStart = Date.now();

  console.log('==========================================================');
  console.log('    Village API — Production Bulk Importer (Final)        ');
  console.log('==========================================================');
  console.log(`Dataset dir  : ${DATASET_DIR}`);
  console.log(`Batch size   : ${VILLAGE_BATCH_SIZE} villages / DB call`);
  console.log('');

  // ── Validate dataset directory ─────────────────────────────────────────
  if (!fs.existsSync(DATASET_DIR)) {
    console.error(`ERROR: Dataset directory not found: ${DATASET_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(DATASET_DIR)
    .filter(f => f.endsWith('.xls'))
    .sort();

  if (files.length === 0) {
    console.error(`ERROR: No .xls files found in ${DATASET_DIR}`);
    process.exit(1);
  }

  console.log(`Found ${files.length} XLS files.\n`);

  // ═══════════════════════════════════════════════════════════════════════
  // PASS 1 — Pure in-memory build (zero DB calls)
  // ═══════════════════════════════════════════════════════════════════════
  console.log('──────────────────────────────────────────────────────────');
  console.log('PASS 1 — Reading all dataset files into memory');
  console.log('──────────────────────────────────────────────────────────');

  const pass1Start = Date.now();
  logMemory('start');

  // Four in-memory collections
  const statesMap       = new Map(); // stateCode → { stateCode, name }
  const districtsMap    = new Map(); // districtCode → { districtCode, name, stateCode }
  const subDistrictsMap = new Map(); // `${districtCode}_${subdt}` → { subDistrictCode, name, districtCode, stateCode }
  const villagesArray   = [];        // { villageCode, name, fullAddress, _stateCode, _districtCode, _subDtKey }

  for (let fi = 0; fi < files.length; fi++) {
    const file     = files[fi];
    const filePath = path.join(DATASET_DIR, file);
    const fileStart = Date.now();

    process.stdout.write(`[${fi + 1}/${files.length}] ${file} ... `);

    // Load worksheet
    const workbook  = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      console.log('(no worksheets — skipped)');
      continue;
    }

    // Parse rows; defval:'' ensures missing cells are empty string, not undefined
    const rows = XLSX.utils.sheet_to_json(
      workbook.Sheets[sheetName],
      { defval: '' }
    );

    let fileStates = 0, fileDistricts = 0, fileSDs = 0, fileVillages = 0;

    // Active hierarchy pointers — reset per file
    let curState       = null; // { stateCode, name }
    let curDistrict    = null; // { districtCode, name }
    let curSubDistrict = null; // { key, name }  key = `${districtCode}_${subdt}`

    for (const row of rows) {
      // Normalize all MDDS code fields with padStart
      // padLength: STC=2, DTC=3, Sub_DT=5, PLCN=6
      const stc   = normalizeCode(row['MDDS STC'],    2);
      const dtc   = normalizeCode(row['MDDS DTC'],    3);
      const subdt = normalizeCode(row['MDDS Sub_DT'], 5);
      const plcn  = normalizeCode(row['MDDS PLCN'],   6);

      // ── State row: PLCN=000000 AND DTC=000 AND Sub_DT=00000 ──────────
      if (plcn === '000000' && dtc === '000' && subdt === '00000') {
        if (!statesMap.has(stc)) {
          const name = toTitleCase(row['STATE NAME']);
          statesMap.set(stc, { stateCode: stc, name });
          fileStates++;
        }
        curState       = statesMap.get(stc);
        curDistrict    = null;
        curSubDistrict = null;

      // ── District row: PLCN=000000 AND Sub_DT=00000 AND DTC≠000 ──────
      } else if (plcn === '000000' && subdt === '00000' && dtc !== '000') {
        if (!curState) continue; // malformed file — guard
        if (!districtsMap.has(dtc)) {
          const name = toTitleCase(row['DISTRICT NAME']);
          districtsMap.set(dtc, { districtCode: dtc, name, stateCode: curState.stateCode });
          fileDistricts++;
        }
        curDistrict    = districtsMap.get(dtc);
        curSubDistrict = null;

      // ── SubDistrict row: PLCN=000000 AND Sub_DT≠00000 ───────────────
      } else if (plcn === '000000' && subdt !== '00000') {
        if (!curState || !curDistrict) continue; // malformed file — guard

        // Composite cache key: districtCode_subDistrictCode
        // This correctly separates sentinel 99999 across different districts.
        const sdKey = `${curDistrict.districtCode}_${subdt}`;

        if (!subDistrictsMap.has(sdKey)) {
          const name = toTitleCase(row['SUB-DISTRICT NAME']);
          subDistrictsMap.set(sdKey, {
            subDistrictCode: subdt,
            name,
            districtCode: curDistrict.districtCode,
            stateCode:    curState.stateCode,
          });
          fileSDs++;
        }
        curSubDistrict = {
          key:  sdKey,
          name: subDistrictsMap.get(sdKey).name,
        };

      // ── Village row: PLCN≠000000 ─────────────────────────────────────
      } else if (plcn !== '000000') {
        if (!curState || !curDistrict || !curSubDistrict) continue; // guard

        const name = toTitleCase(row['Area Name']);
        const fullAddress =
          `${name}, ${curSubDistrict.name}, ${curDistrict.name}, ${curState.name}, India`;

        villagesArray.push({
          villageCode:   plcn,
          name,
          fullAddress,
          _stateCode:    curState.stateCode,
          _districtCode: curDistrict.districtCode,
          _subDtKey:     curSubDistrict.key,
        });
        fileVillages++;
      }
    }

    console.log(
      `States:${fileStates}  Districts:${fileDistricts}  ` +
      `SubDistricts:${fileSDs}  Villages:${fileVillages.toLocaleString()}  [${since(fileStart)}]`
    );
  }

  const pass1End = Date.now();
  logMemory('after parse');

  console.log(`\nPASS 1 complete in ${since(pass1Start)}`);
  console.log(`  Unique States       : ${statesMap.size}`);
  console.log(`  Unique Districts    : ${districtsMap.size}`);
  console.log(`  Unique SubDistricts : ${subDistrictsMap.size}`);
  console.log(`  Total Villages      : ${villagesArray.length.toLocaleString()}`);

  // ═══════════════════════════════════════════════════════════════════════
  // PASS 2 — Bulk database writes
  // ═══════════════════════════════════════════════════════════════════════
  console.log('\n──────────────────────────────────────────────────────────');
  console.log('PASS 2 — Bulk database writes');
  console.log('──────────────────────────────────────────────────────────\n');

  const pass2Start = Date.now();

  try {

    // ── [1/10] Country ────────────────────────────────────────────────────
    console.log('[1/10] Country — upsert India...');
    const india = await withRetry(p => p.country.upsert({
      where:  { code: 'IN' },
      update: {},
      create: { code: 'IN', name: 'India' },
    }));
    console.log(`  Country ID: ${india.id}\n`);

    // ── [2/10] States — createMany ────────────────────────────────────────
    console.log(`[2/10] States — createMany (${statesMap.size} records, skipDuplicates)...`);
    const stateData = [...statesMap.values()].map(s => ({
      stateCode: s.stateCode,
      name:      s.name,
      countryId: india.id,
    }));
    const stateResult = await withRetry(p => p.state.createMany({
      data:           stateData,
      skipDuplicates: true,
    }));
    console.log(`  New States inserted: ${stateResult.count}\n`);

    // ── [3/10] Resolve State IDs ──────────────────────────────────────────
    console.log('[3/10] States — findMany to resolve IDs...');
    const stateIdMap = new Map(); // stateCode → DB id
    (await withRetry(p => p.state.findMany()))
      .forEach(s => stateIdMap.set(s.stateCode, s.id));
    console.log(`  Resolved ${stateIdMap.size} State IDs\n`);

    // ── [4/10] Districts — createMany ─────────────────────────────────────
    console.log(`[4/10] Districts — createMany (${districtsMap.size} records, skipDuplicates)...`);
    const districtData = [...districtsMap.values()].map(d => ({
      districtCode: d.districtCode,
      name:         d.name,
      stateId:      stateIdMap.get(d.stateCode),
    }));
    const districtResult = await withRetry(p => p.district.createMany({
      data:           districtData,
      skipDuplicates: true,
    }));
    console.log(`  New Districts inserted: ${districtResult.count}\n`);

    // ── [5/10] Resolve District IDs ───────────────────────────────────────
    console.log('[5/10] Districts — findMany to resolve IDs...');
    const districtIdMap = new Map(); // districtCode → DB id
    (await withRetry(p => p.district.findMany()))
      .forEach(d => districtIdMap.set(d.districtCode, d.id));
    console.log(`  Resolved ${districtIdMap.size} District IDs\n`);

    // ── [6/10] SubDistricts — createMany ─────────────────────────────────
    console.log(`[6/10] SubDistricts — createMany (${subDistrictsMap.size} records, skipDuplicates)...`);
    const subDistrictData = [...subDistrictsMap.values()].map(sd => ({
      subDistrictCode: sd.subDistrictCode,
      name:            sd.name,
      stateId:         stateIdMap.get(sd.stateCode),
      districtId:      districtIdMap.get(sd.districtCode),
    }));
    const subDistrictResult = await withRetry(p => p.subDistrict.createMany({
      data:           subDistrictData,
      skipDuplicates: true,
    }));
    console.log(`  New SubDistricts inserted: ${subDistrictResult.count}\n`);

    // ── [7/10] Resolve SubDistrict IDs (composite key) ───────────────────
    // SubDistrict unique constraint: @@unique([districtId, subDistrictCode])
    // Sentinel code 99999 appears in 5 states — composite key separates them correctly.
    // Must JOIN with district to reconstruct the `${districtCode}_${subdt}` cache key.
    console.log('[7/10] SubDistricts — findMany (include district) to resolve composite IDs...');
    const subDistrictIdMap = new Map(); // `${districtCode}_${subdt}` → DB id
    (await withRetry(p => p.subDistrict.findMany({
      include: { district: { select: { districtCode: true } } },
    }))).forEach(sd => {
      const key = `${sd.district.districtCode}_${sd.subDistrictCode}`;
      subDistrictIdMap.set(key, sd.id);
    });
    console.log(`  Resolved ${subDistrictIdMap.size} SubDistrict IDs\n`);

    // ── [8/10] DB ping — wake Neon before village bulk writes ─────────────
    // XLS parsing (Pass 1) can take 2–5 minutes with zero DB activity.
    // Neon free tier auto-suspends after 5 minutes idle.
    // A lightweight ping here ensures the connection is active before bulk writes.
    console.log('[8/10] DB ping — ensuring active connection before village writes...');
    await withRetry(p => p.$queryRaw`SELECT 1 AS ping`);
    console.log('  Connection active.\n');

    // ── [9/10] Villages — batched createMany ─────────────────────────────
    logMemory('before village writes');
    console.log(`\n[9/10] Villages — resolving IDs and batching ${villagesArray.length.toLocaleString()} records...`);

    // Resolve DB IDs for every village (pure in-memory, zero DB calls)
    const finalVillages  = [];
    const unmappedCount  = { value: 0 };

    for (const v of villagesArray) {
      const stateId       = stateIdMap.get(v._stateCode);
      const districtId    = districtIdMap.get(v._districtCode);
      const subDistrictId = subDistrictIdMap.get(v._subDtKey);

      if (stateId === undefined || districtId === undefined || subDistrictId === undefined) {
        // Should never occur with a well-formed dataset and correct hierarchy traversal.
        // If it does, log and skip rather than crash the entire import.
        unmappedCount.value++;
        continue;
      }

      finalVillages.push({
        villageCode:   v.villageCode,
        name:          v.name,
        fullAddress:   v.fullAddress,
        stateId,
        districtId,
        subDistrictId,
      });
    }

    if (unmappedCount.value > 0) {
      console.warn(
        `  ⚠  WARNING: ${unmappedCount.value} villages had unresolvable IDs and were skipped.`
      );
    }

    const batches     = chunk(finalVillages, VILLAGE_BATCH_SIZE);
    const villageStart = Date.now();
    let newVillagesInserted = 0;

    console.log(`  Batches to process  : ${batches.length}`);
    console.log(`  Records to insert   : ${finalVillages.length.toLocaleString()}`);
    console.log('');

    for (let bi = 0; bi < batches.length; bi++) {
      const result = await withRetry(p => p.village.createMany({
        data:           batches[bi],
        skipDuplicates: true,
      }));
      newVillagesInserted += result.count;

      // Progress log every 20 batches (~40,000 villages) and at completion
      if ((bi + 1) % 20 === 0 || bi === batches.length - 1) {
        const pct = (((bi + 1) / batches.length) * 100).toFixed(1);
        console.log(
          `  Batch ${String(bi + 1).padStart(4)} / ${batches.length}  ` +
          `(${pct}%)  New: ${newVillagesInserted.toLocaleString()}  [${since(villageStart)}]`
        );
        logMemory(`batch ${bi + 1}`);
      }
    }

    // ── [10/10] Verification — final counts from DB ───────────────────────
    console.log('\n──────────────────────────────────────────────────────────');
    console.log('[10/10] Verification — querying final record counts...');
    console.log('──────────────────────────────────────────────────────────');

    const [countries, states, districts, subDistricts, villages] = await Promise.all([
      withRetry(p => p.country.count()),
      withRetry(p => p.state.count()),
      withRetry(p => p.district.count()),
      withRetry(p => p.subDistrict.count()),
      withRetry(p => p.village.count()),
    ]);

    console.log(`  Countries    : ${countries}`);
    console.log(`  States       : ${states}`);
    console.log(`  Districts    : ${districts}`);
    console.log(`  SubDistricts : ${subDistricts}`);
    console.log(`  Villages     : ${villages.toLocaleString()}`);

    // Sample village to confirm fullAddress and hierarchy links
    const sample = await withRetry(p => p.village.findFirst({
      include: {
        state:       { select: { name: true } },
        district:    { select: { name: true } },
        subDistrict: { select: { name: true } },
      },
    }));
    if (sample) {
      console.log('\n  Sample Village (first row):');
      console.log(`    villageCode : ${sample.villageCode}`);
      console.log(`    name        : ${sample.name}`);
      console.log(`    subDistrict : ${sample.subDistrict.name}`);
      console.log(`    district    : ${sample.district.name}`);
      console.log(`    state       : ${sample.state.name}`);
      console.log(`    fullAddress : ${sample.fullAddress}`);
    }

    // ── Final summary ─────────────────────────────────────────────────────
    const pass1DurationMs = pass1End - pass1Start;
    const pass2DurationMs = Date.now() - pass2Start;
    const totalDurationMs = Date.now() - globalStart;

    console.log('\n==========================================================');
    console.log('IMPORT COMPLETE');
    console.log('==========================================================');
    console.log(`  New Villages inserted : ${newVillagesInserted.toLocaleString()}`);
    console.log(`  Unmapped (skipped)    : ${unmappedCount.value}`);
    console.log('');
    console.log(`  Pass 1 — XLS parse   : ${(pass1DurationMs / 1000).toFixed(1)}s`);
    console.log(`  Pass 2 — DB writes   : ${(pass2DurationMs / 1000).toFixed(1)}s`);
    console.log(`  Total elapsed        : ${(totalDurationMs / 1000).toFixed(1)}s`);
    console.log('==========================================================');

  } catch (err) {
    console.error('\nIMPORT FAILED:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
}

main();
